import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for activation integration tests");

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

async function countProfiles(db: ReturnType<typeof createDatabase>): Promise<number> {
  const rows = await db.query<{ count: string }>("select count(*)::text as count from profiles");
  return Number(rows[0]?.count ?? 0);
}

test("student activation is atomic, idempotent, authenticated and race-safe", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);
  const app = buildApp({ config, database: db });

  await db.query(
    `insert into full_access_codes (code, entitlement_duration_days)
     values ('123456', 45), ('234567', 30), ('345678', 20), ('456789', 25), ('567890', 15), ('678901', 60)`,
  );
  await db.query(
    `insert into full_access_codes (code, status, entitlement_duration_days)
     values ('777777', 'revoked', 30)`,
  );
  await db.query(
    `insert into full_access_codes (code, status, valid_from, expires_at, entitlement_duration_days)
     values ('888888', 'active', now() - interval '2 days', now() - interval '1 day', 30)`,
  );

  const beforeInvalid = await countProfiles(db);
  const missing = await app.inject({
    method: "POST",
    url: "/v1/student/activate",
    headers: { origin },
    payload: {
      code: "999998",
      password: "MissingPass123!",
      idempotencyKey: "stage8-missing-code-0001",
    },
  });
  assert.equal(missing.statusCode, 404);
  assert.equal(await countProfiles(db), beforeInvalid);

  const revoked = await app.inject({
    method: "POST",
    url: "/v1/student/activate",
    headers: { origin },
    payload: {
      code: "777777",
      password: "RevokedPass123!",
      idempotencyKey: "stage8-revoked-code-0002",
    },
  });
  assert.equal(revoked.statusCode, 409);
  assert.equal(await countProfiles(db), beforeInvalid);

  const expired = await app.inject({
    method: "POST",
    url: "/v1/student/activate",
    headers: { origin },
    payload: {
      code: "888888",
      password: "ExpiredPass123!",
      idempotencyKey: "stage8-expired-code-0003",
    },
  });
  assert.equal(expired.statusCode, 409);
  assert.equal(await countProfiles(db), beforeInvalid);

  const activation = await app.inject({
    method: "POST",
    url: "/v1/student/activate",
    headers: { origin, "user-agent": "stage8-first-device" },
    payload: {
      code: toArabicDigits("123456"),
      password: "StudentPass123!",
      idempotencyKey: "stage8-first-activation-0004",
    },
  });
  assert.equal(activation.statusCode, 201);
  const activationBody = activation.json();
  assert.equal(activationBody.accountIdentifier, "123456");
  assert.equal(activationBody.replayed, false);
  assert.equal(activationBody.profile.role, "student");
  assert.equal(activationBody.entitlement.scope, "all_content");
  assert.equal(activationBody.entitlement.status, "active");
  const studentId = activationBody.profile.id as string;
  const entitlementId = activationBody.entitlement.id as string;
  assert.match(studentId, /^[0-9a-f-]{36}$/);

  const firstCookie = cookieFrom(activation);
  const me = await app.inject({
    method: "GET",
    url: "/v1/student/me",
    headers: { cookie: firstCookie },
  });
  assert.equal(me.statusCode, 200);
  assert.equal(me.json().profile.id, studentId);

  const entitlements = await app.inject({
    method: "GET",
    url: "/v1/student/access/entitlements",
    headers: { cookie: firstCookie },
  });
  assert.equal(entitlements.statusCode, 200);
  assert.equal(entitlements.json().entitlements.length, 1);
  assert.equal(entitlements.json().entitlements[0].id, entitlementId);

  const persisted = await db.query<{
    identifier: string;
    password_hash: string;
    code_status: string;
    redeemed_by_profile_id: string;
    redemption_count: string;
  }>(
    `select c.normalized_identifier as identifier,
            c.password_hash,
            f.status as code_status,
            f.redeemed_by_profile_id,
            (select count(*)::text from access_redemptions r where r.full_access_code_id = f.id) as redemption_count
     from auth_credentials c
     join full_access_codes f on f.redeemed_by_profile_id = c.profile_id
     where c.profile_id = $1 and f.code = '123456'`,
    [studentId],
  );
  assert.equal(persisted[0]?.identifier, "123456");
  assert.match(persisted[0]?.password_hash ?? "", /^scrypt\$/);
  assert.equal(persisted[0]?.code_status, "redeemed");
  assert.equal(persisted[0]?.redeemed_by_profile_id, studentId);
  assert.equal(Number(persisted[0]?.redemption_count), 1);

  const authAudit = await db.query<{ event_type: string }>(
    "select event_type from auth_events where profile_id = $1 order by id",
    [studentId],
  );
  assert.ok(authAudit.some((event) => event.event_type === "account_activated"));
  assert.ok(authAudit.some((event) => event.event_type === "login_success"));

  const wrongReplay = await app.inject({
    method: "POST",
    url: "/v1/student/activate",
    headers: { origin },
    payload: {
      code: "123456",
      password: "WrongPass123!",
      idempotencyKey: "stage8-first-activation-0004",
    },
  });
  assert.equal(wrongReplay.statusCode, 401);
  assert.equal(await countProfiles(db), beforeInvalid + 1);

  const replay = await app.inject({
    method: "POST",
    url: "/v1/student/activate",
    headers: { origin, "user-agent": "stage8-retry-device" },
    payload: {
      code: "123456",
      password: "StudentPass123!",
      idempotencyKey: "stage8-first-activation-0004",
    },
  });
  assert.equal(replay.statusCode, 200);
  assert.equal(replay.json().replayed, true);
  assert.equal(replay.json().profile.id, studentId);
  assert.equal(replay.json().entitlement.id, entitlementId);
  assert.equal(await countProfiles(db), beforeInvalid + 1);

  const keyReuseDifferentCode = await app.inject({
    method: "POST",
    url: "/v1/student/activate",
    headers: { origin },
    payload: {
      code: "234567",
      password: "DifferentPass123!",
      idempotencyKey: "stage8-first-activation-0004",
    },
  });
  assert.equal(keyReuseDifferentCode.statusCode, 409);
  const untouchedDifferentCode = await db.query<{ status: string }>(
    "select status from full_access_codes where code = '234567'",
  );
  assert.equal(untouchedDifferentCode[0]?.status, "active");

  const usedWithNewKey = await app.inject({
    method: "POST",
    url: "/v1/student/activate",
    headers: { origin },
    payload: {
      code: "123456",
      password: "StudentPass123!",
      idempotencyKey: "stage8-used-code-new-key-0005",
    },
  });
  assert.equal(usedWithNewKey.statusCode, 409);
  assert.equal(await countProfiles(db), beforeInvalid + 1);

  const logout = await app.inject({
    method: "POST",
    url: "/v1/auth/logout",
    headers: { origin, cookie: firstCookie },
  });
  assert.equal(logout.statusCode, 204);

  const returningLogin = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    headers: { origin },
    payload: { identifier: toArabicDigits("123456"), password: "StudentPass123!" },
  });
  assert.equal(returningLogin.statusCode, 200);
  assert.equal(returningLogin.json().profile.id, studentId);
  const returningCookie = cookieFrom(returningLogin);
  const returningMe = await app.inject({
    method: "GET",
    url: "/v1/student/me",
    headers: { cookie: returningCookie },
  });
  assert.equal(returningMe.statusCode, 200);

  const raceBefore = await countProfiles(db);
  const [raceA, raceB] = await Promise.all([
    app.inject({
      method: "POST",
      url: "/v1/student/activate",
      headers: { origin },
      payload: {
        code: "345678",
        password: "RaceWinnerA123!",
        idempotencyKey: "stage8-race-activation-a",
      },
    }),
    app.inject({
      method: "POST",
      url: "/v1/student/activate",
      headers: { origin },
      payload: {
        code: "345678",
        password: "RaceWinnerB123!",
        idempotencyKey: "stage8-race-activation-b",
      },
    }),
  ]);
  assert.deepEqual([raceA.statusCode, raceB.statusCode].sort(), [201, 409]);
  assert.equal(await countProfiles(db), raceBefore + 1);
  const raceWinner = raceA.statusCode === 201 ? raceA.json().profile.id : raceB.json().profile.id;
  const raceCode = await db.query<{ redeemed_by_profile_id: string; count: string }>(
    `select f.redeemed_by_profile_id,
            (select count(*)::text from access_redemptions r where r.full_access_code_id = f.id) as count
     from full_access_codes f where f.code = '345678'`,
  );
  assert.equal(raceCode[0]?.redeemed_by_profile_id, raceWinner);
  assert.equal(Number(raceCode[0]?.count), 1);

  const conflictProfileRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'حساب تعارض') returning id",
  );
  const conflictProfileId = conflictProfileRows[0]?.id;
  assert.ok(conflictProfileId);
  await auth.createCredential(conflictProfileId, "456789", "ExistingCredential123!");
  const beforeConflict = await countProfiles(db);

  const credentialConflict = await app.inject({
    method: "POST",
    url: "/v1/student/activate",
    headers: { origin },
    payload: {
      code: "456789",
      password: "NewCredential123!",
      idempotencyKey: "stage8-credential-conflict",
    },
  });
  assert.equal(credentialConflict.statusCode, 409);
  assert.equal(await countProfiles(db), beforeConflict);
  const conflictCode = await db.query<{ status: string; redeemed_by_profile_id: string | null }>(
    "select status, redeemed_by_profile_id from full_access_codes where code = '456789'",
  );
  assert.equal(conflictCode[0]?.status, "active");
  assert.equal(conflictCode[0]?.redeemed_by_profile_id, null);
  const conflictRedemptions = await db.query<{ count: string }>(
    `select count(*)::text as count
     from access_redemptions r
     join full_access_codes f on f.id = r.full_access_code_id
     where f.code = '456789'`,
  );
  assert.equal(Number(conflictRedemptions[0]?.count), 0);

  await app.close();
});
