import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage13G admin access integration tests");

const origin = "http://localhost:5173";

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

function toArabicDigits(code: string): string {
  const arabic = "٠١٢٣٤٥٦٧٨٩";
  return [...code].map((digit) => arabic[Number(digit)] ?? digit).join("");
}

test("Stage13G Admin access inventory and Student read model preserve canonical access/auth authority", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير Stage13G') returning id",
  );
  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب Stage13G') returning id",
  );
  const classRows = await db.query<{ id: string }>(
    "insert into classes (slug, name) values ('stage13g-class', 'صف Stage13G') returning id",
  );
  const adminId = adminRows[0]?.id;
  const studentId = studentRows[0]?.id;
  const classId = classRows[0]?.id;
  assert.ok(adminId && studentId && classId);

  await auth.createCredential(adminId, "stage13g-admin", "Stage13gAdminPass123!");
  await auth.createCredential(studentId, "stage13g-student", "Stage13gStudentPass123!");

  await db.query(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'جهاز الطالب')`,
    [studentId, `synthetic-${"x".repeat(90)}`, "a".repeat(64)],
  );
  await db.query(
    `insert into auth_events (profile_id, event_type, actor_profile_id)
     values ($1, 'login_success', null)`,
    [studentId],
  );

  const app = buildApp({ config, database: db });
  const login = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    headers: { origin },
    payload: { identifier: "stage13g-admin", password: "Stage13gAdminPass123!" },
  });
  assert.equal(login.statusCode, 200);
  const adminCookie = cookieFrom(login);

  const fullBatch = await app.inject({
    method: "POST",
    url: "/v1/admin/access/full-codes",
    headers: { origin, cookie: adminCookie },
    payload: { count: 3, durationDays: 60 },
  });
  assert.equal(fullBatch.statusCode, 200);
  const fullCodes = fullBatch.json().codes as string[];
  assert.equal(fullCodes.length, 3);

  const fullRows = await db.query<{ id: string; code: string }>(
    "select id, code from full_access_codes where code = any($1::text[]) order by code",
    [fullCodes],
  );
  assert.equal(fullRows.length, 3);
  const unused = fullRows[0];
  const redeemed = fullRows[1];
  const elapsed = fullRows[2];
  assert.ok(unused && redeemed && elapsed);

  await db.query(
    `update full_access_codes
     set valid_from = now() - interval '2 days', expires_at = now() - interval '1 day'
     where id = $1`,
    [elapsed.id],
  );

  const entitlementRows = await db.query<{ id: string }>(
    `insert into student_entitlements (
       profile_id, scope, source, source_id, starts_at, expires_at
     ) values ($1, 'all_content', 'full_code', $2, now(), now() + interval '30 days')
     returning id`,
    [studentId, redeemed.id],
  );
  const entitlementId = entitlementRows[0]?.id;
  assert.ok(entitlementId);
  await db.query(
    `update full_access_codes
     set status = 'redeemed', redeemed_at = now(), redeemed_by_profile_id = $2
     where id = $1`,
    [redeemed.id, studentId],
  );
  await db.query(
    `insert into access_redemptions (
       profile_id, code_type, full_access_code_id, entitlement_id, idempotency_key
     ) values ($1, 'full_access', $2, $3, 'stage13g-admin-read-redemption')`,
    [studentId, redeemed.id, entitlementId],
  );
  await db.query(
    `insert into access_events (
       event_type, subject_profile_id, code_type, full_access_code_id, entitlement_id
     ) values ('code_redeemed', $1, 'full_access', $2, $3)`,
    [studentId, redeemed.id, entitlementId],
  );

  const firstPage = await app.inject({
    method: "GET",
    url: "/v1/admin/access/codes?type=full_access&sort=code&direction=asc&limit=2&offset=0",
    headers: { cookie: adminCookie },
  });
  assert.equal(firstPage.statusCode, 200);
  assert.equal(firstPage.json().page.total, 3);
  assert.equal((firstPage.json().codes as unknown[]).length, 2);

  const searched = await app.inject({
    method: "GET",
    url: `/v1/admin/access/codes?type=full_access&search=${encodeURIComponent(toArabicDigits(redeemed.code))}`,
    headers: { cookie: adminCookie },
  });
  assert.equal(searched.statusCode, 200);
  assert.equal(searched.json().page.total, 1);
  assert.equal(searched.json().codes[0].code, redeemed.code);
  assert.equal(searched.json().codes[0].redeemedByIdentifier, "stage13g-student");

  const expired = await app.inject({
    method: "GET",
    url: "/v1/admin/access/codes?type=full_access&status=expired",
    headers: { cookie: adminCookie },
  });
  assert.equal(expired.statusCode, 200);
  assert.equal(expired.json().page.total, 1);
  assert.equal(expired.json().codes[0].id, elapsed.id);
  assert.equal(expired.json().codes[0].status, "expired");

  const revoke = await app.inject({
    method: "POST",
    url: "/v1/admin/access/codes/revoke",
    headers: { origin, cookie: adminCookie },
    payload: { type: "full_access", codeIds: [unused.id, redeemed.id] },
  });
  assert.equal(revoke.statusCode, 200);
  assert.deepEqual(revoke.json().revokedIds, [unused.id]);
  assert.deepEqual(revoke.json().blockedIds, [redeemed.id]);
  const states = await db.query<{ id: string; status: string }>(
    "select id, status::text as status from full_access_codes where id = any($1::uuid[]) order by id",
    [[unused.id, redeemed.id]],
  );
  assert.equal(states.find((row) => row.id === unused.id)?.status, "revoked");
  assert.equal(states.find((row) => row.id === redeemed.id)?.status, "redeemed");
  const revokeEvents = await db.query<{ count: string }>(
    "select count(*)::text as count from access_events where event_type = 'code_revoked' and full_access_code_id = $1",
    [unused.id],
  );
  assert.equal(Number(revokeEvents[0]?.count), 1);

  const students = await app.inject({
    method: "GET",
    url: "/v1/admin/students?search=stage13g-student&sort=identifier&direction=asc",
    headers: { cookie: adminCookie },
  });
  assert.equal(students.statusCode, 200);
  assert.equal(students.json().page.total, 1);
  assert.equal(students.json().students[0].id, studentId);
  assert.equal(students.json().students[0].activeEntitlementCount, 1);
  assert.equal(students.json().students[0].hasAllContent, true);
  assert.equal(students.json().students[0].hasActiveDevice, true);
  assert.ok(students.json().students[0].lastLoginAt);

  const detail = await app.inject({
    method: "GET",
    url: `/v1/admin/students/${studentId}?historyLimit=10&historyOffset=0`,
    headers: { cookie: adminCookie },
  });
  assert.equal(detail.statusCode, 200);
  assert.equal(detail.json().student.identifier, "stage13g-student");
  assert.equal(detail.json().student.entitlements.length, 1);
  assert.equal(detail.json().student.redemptions[0].code, redeemed.code);
  assert.equal(detail.json().student.devices.length, 1);
  assert.equal(detail.json().student.devices[0].label, "جهاز الطالب");
  assert.equal("publicKeySpki" in detail.json().student.devices[0], false);
  assert.equal("publicKeySha256" in detail.json().student.devices[0], false);
  assert.ok(detail.json().student.activityTotal >= 2);

  const anonymous = await app.inject({
    method: "GET",
    url: "/v1/admin/students",
  });
  assert.equal(anonymous.statusCode, 401);

  const unsafeOffset = await app.inject({
    method: "GET",
    url: "/v1/admin/students?offset=9007199254740992",
    headers: { cookie: adminCookie },
  });
  assert.equal(unsafeOffset.statusCode, 400);

  await app.close();
});
