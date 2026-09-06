import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { validateDevicePublicKey } from "../../src/auth/device-crypto.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";
import { createTestDeviceKey, type TestDeviceKey } from "../device-test-key.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for access integration tests");

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

test("code generation, renewal, idempotency, no-waste and concurrent redemption", async () => {
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
    "insert into profiles (role, display_name) values ('admin', 'مدير الوصول') returning id",
  );
  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب أول') returning id",
  );
  const secondRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب ثان') returning id",
  );
  const classRows = await db.query<{ id: string }>(
    "insert into classes (slug, name) values ('stage7-class', 'الصف التجريبي') returning id",
  );
  const adminId = adminRows[0]?.id;
  const studentId = studentRows[0]?.id;
  const secondId = secondRows[0]?.id;
  const classId = classRows[0]?.id;
  assert.ok(adminId && studentId && secondId && classId);

  await auth.createCredential(adminId, "stage7-admin", "AdminAccess123!");
  await auth.createCredential(studentId, "stage7-student-1", "StudentAccess123!");
  await auth.createCredential(secondId, "stage7-student-2", "StudentAccess456!");

  async function registerDevice(profileId: string, key: TestDeviceKey): Promise<void> {
    const validated = validateDevicePublicKey(key.publicKeySpki);
    await db.query(
      `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
       values ($1, $2, $3, 'stage7-integration')`,
      [profileId, validated.publicKeySpki, validated.fingerprintSha256],
    );
  }

  const firstDevice = createTestDeviceKey();
  const secondDevice = createTestDeviceKey();
  await registerDevice(studentId, firstDevice);
  await registerDevice(secondId, secondDevice);

  const app = buildApp({ config, database: db });

  async function adminLogin(identifier: string, password: string): Promise<string> {
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { identifier, password },
    });
    assert.equal(response.statusCode, 200);
    return cookieFrom(response);
  }

  async function studentLogin(
    identifier: string,
    password: string,
    device: TestDeviceKey,
  ): Promise<string> {
    const start = await app.inject({
      method: "POST",
      url: "/v1/student/login/start",
      headers: { origin },
      payload: { identifier, password },
    });
    assert.equal(start.statusCode, 200);
    assert.equal(start.json().purpose, "login");
    const challengeToken = start.json().challengeToken as string;
    const complete = await app.inject({
      method: "POST",
      url: "/v1/student/login/complete",
      headers: { origin },
      payload: {
        challengeToken,
        signature: device.signChallenge("login", challengeToken),
      },
    });
    assert.equal(complete.statusCode, 200);
    return cookieFrom(complete);
  }

  const adminCookie = await adminLogin("stage7-admin", "AdminAccess123!");
  const studentCookie = await studentLogin("stage7-student-1", "StudentAccess123!", firstDevice);
  const secondCookie = await studentLogin("stage7-student-2", "StudentAccess456!", secondDevice);

  const generatedClass = await app.inject({
    method: "POST",
    url: "/v1/admin/access/class-codes",
    headers: { origin, cookie: adminCookie },
    payload: { classId, count: 2, durationDays: 30 },
  });
  assert.equal(generatedClass.statusCode, 200);
  const classCodes = generatedClass.json().codes as string[];
  assert.equal(classCodes.length, 2);
  assert.match(classCodes[0] ?? "", /^\d{7}$/);
  assert.match(classCodes[1] ?? "", /^\d{7}$/);

  const firstRedeem = await app.inject({
    method: "POST",
    url: "/v1/student/access/redeem",
    headers: { origin, cookie: studentCookie },
    payload: { code: toArabicDigits(classCodes[0] ?? ""), idempotencyKey: "stage7-class-redeem-0001" },
  });
  assert.equal(firstRedeem.statusCode, 200);
  const firstEntitlement = firstRedeem.json().entitlement;
  assert.equal(firstEntitlement.scope, "class");
  assert.equal(firstEntitlement.classId, classId);

  const replay = await app.inject({
    method: "POST",
    url: "/v1/student/access/redeem",
    headers: { origin, cookie: studentCookie },
    payload: { code: classCodes[0], idempotencyKey: "stage7-class-redeem-0001" },
  });
  assert.equal(replay.statusCode, 200);
  assert.equal(replay.json().entitlement.id, firstEntitlement.id);

  const beforeExpiry = new Date(firstEntitlement.expiresAt).getTime();
  const renewal = await app.inject({
    method: "POST",
    url: "/v1/student/access/redeem",
    headers: { origin, cookie: studentCookie },
    payload: { code: classCodes[1], idempotencyKey: "stage7-class-renew-0002" },
  });
  assert.equal(renewal.statusCode, 200);
  assert.equal(renewal.json().entitlement.id, firstEntitlement.id);
  const renewedExpiry = new Date(renewal.json().entitlement.expiresAt).getTime();
  assert.ok(renewedExpiry - beforeExpiry > 29 * 24 * 60 * 60 * 1000);

  const fullBatch = await app.inject({
    method: "POST",
    url: "/v1/admin/access/full-codes",
    headers: { origin, cookie: adminCookie },
    payload: { count: 2, durationDays: 45 },
  });
  assert.equal(fullBatch.statusCode, 200);
  const fullCodes = fullBatch.json().codes as string[];
  assert.match(fullCodes[0] ?? "", /^\d{6}$/);

  const raceCode = fullCodes[0] ?? "";
  const [raceOne, raceTwo] = await Promise.all([
    app.inject({
      method: "POST",
      url: "/v1/student/access/redeem",
      headers: { origin, cookie: studentCookie },
      payload: { code: raceCode, idempotencyKey: "stage7-race-student-one" },
    }),
    app.inject({
      method: "POST",
      url: "/v1/student/access/redeem",
      headers: { origin, cookie: secondCookie },
      payload: { code: raceCode, idempotencyKey: "stage7-race-student-two" },
    }),
  ]);
  assert.deepEqual([raceOne.statusCode, raceTwo.statusCode].sort(), [200, 409]);

  const winnerCookie = raceOne.statusCode === 200 ? studentCookie : secondCookie;
  const winnerId = raceOne.statusCode === 200 ? studentId : secondId;

  const redundantClass = await app.inject({
    method: "POST",
    url: "/v1/admin/access/class-codes",
    headers: { origin, cookie: adminCookie },
    payload: { classId, count: 1, durationDays: 20 },
  });
  assert.equal(redundantClass.statusCode, 200);
  const redundantCode = (redundantClass.json().codes as string[])[0] ?? "";
  const noWaste = await app.inject({
    method: "POST",
    url: "/v1/student/access/redeem",
    headers: { origin, cookie: winnerCookie },
    payload: { code: redundantCode, idempotencyKey: "stage7-no-waste-class" },
  });
  assert.equal(noWaste.statusCode, 409);
  const codeState = await db.query<{ status: string; redeemed_by_profile_id: string | null }>(
    "select status, redeemed_by_profile_id from class_access_codes where code = $1",
    [redundantCode],
  );
  assert.equal(codeState[0]?.status, "active");
  assert.equal(codeState[0]?.redeemed_by_profile_id, null);

  const winnerEntitlements = await app.inject({
    method: "GET",
    url: "/v1/student/access/entitlements",
    headers: { cookie: winnerCookie },
  });
  assert.equal(winnerEntitlements.statusCode, 200);
  const allContent = (winnerEntitlements.json().entitlements as Array<{ id: string; scope: string }>).find(
    (entitlement) => entitlement.scope === "all_content",
  );
  assert.ok(allContent);

  const revoke = await app.inject({
    method: "POST",
    url: `/v1/admin/access/entitlements/${allContent.id}/revoke`,
    headers: { origin, cookie: adminCookie },
  });
  assert.equal(revoke.statusCode, 204);
  const revoked = await db.query<{ status: string; revoked_at: Date | null }>(
    "select status, revoked_at from student_entitlements where id = $1 and profile_id = $2",
    [allContent.id, winnerId],
  );
  assert.equal(revoked[0]?.status, "revoked");
  assert.ok(revoked[0]?.revoked_at);

  const redemptionCount = await db.query<{ count: string }>(
    "select count(*)::text as count from access_redemptions where profile_id in ($1, $2)",
    [studentId, secondId],
  );
  assert.equal(Number(redemptionCount[0]?.count), 3);

  await app.close();
});
