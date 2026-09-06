import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { hashToken } from "../../src/auth/crypto.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";
import { createTestDeviceKey } from "../device-test-key.js";

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

test("two-step activation verifies without consumption then commits account, device and access atomically", async () => {
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
     values ('123456', 45), ('234567', 30), ('345678', 20), ('456789', 25)`,
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
  for (const [code, expectedStatus] of [
    ["999998", 404],
    ["777777", 409],
    ["888888", 409],
  ] as const) {
    const response = await app.inject({
      method: "POST",
      url: "/v1/student/activation/verify",
      headers: { origin },
      payload: { code },
    });
    assert.equal(response.statusCode, expectedStatus);
  }
  assert.equal(await countProfiles(db), beforeInvalid);

  const verify = await app.inject({
    method: "POST",
    url: "/v1/student/activation/verify",
    headers: { origin },
    payload: { code: toArabicDigits("123456") },
  });
  assert.equal(verify.statusCode, 200);
  assert.equal(verify.json().accountIdentifier, "123456");
  assert.equal(verify.json().expiresInSeconds, 600);
  const activationTicket = verify.json().activationTicket as string;
  assert.ok(activationTicket.length >= 32);
  assert.equal(await countProfiles(db), beforeInvalid);

  const verifiedCode = await db.query<{ status: string; redeemed_by_profile_id: string | null }>(
    "select status, redeemed_by_profile_id from full_access_codes where code = '123456'",
  );
  assert.equal(verifiedCode[0]?.status, "active");
  assert.equal(verifiedCode[0]?.redeemed_by_profile_id, null);

  const ticketRows = await db.query<{ token_hash_sha256: string; used_at: Date | null }>(
    `select token_hash_sha256, used_at
     from student_activation_tickets
     where full_access_code_id = (select id from full_access_codes where code = '123456')`,
  );
  assert.equal(ticketRows.length, 1);
  assert.equal(ticketRows[0]?.token_hash_sha256, hashToken(activationTicket));
  assert.notEqual(ticketRows[0]?.token_hash_sha256, activationTicket);
  assert.equal(ticketRows[0]?.used_at, null);

  const primaryDevice = createTestDeviceKey();
  const wrongDevice = createTestDeviceKey();
  const invalidProof = await app.inject({
    method: "POST",
    url: "/v1/student/activation/complete",
    headers: { origin },
    payload: {
      activationTicket,
      password: "StudentPass123!",
      idempotencyKey: "stage8-first-activation-0001",
      devicePublicKeySpki: primaryDevice.publicKeySpki,
      deviceProof: wrongDevice.signChallenge("activation", activationTicket),
    },
  });
  assert.equal(invalidProof.statusCode, 401);
  assert.equal(await countProfiles(db), beforeInvalid);
  const afterInvalidProof = await db.query<{ code_status: string; used_at: Date | null }>(
    `select f.status as code_status, t.used_at
     from student_activation_tickets t
     join full_access_codes f on f.id = t.full_access_code_id
     where t.token_hash_sha256 = $1`,
    [hashToken(activationTicket)],
  );
  assert.equal(afterInvalidProof[0]?.code_status, "active");
  assert.equal(afterInvalidProof[0]?.used_at, null);

  const activation = await app.inject({
    method: "POST",
    url: "/v1/student/activation/complete",
    headers: { origin, "user-agent": "stage8-first-device" },
    payload: {
      activationTicket,
      password: "StudentPass123!",
      idempotencyKey: "stage8-first-activation-0001",
      devicePublicKeySpki: primaryDevice.publicKeySpki,
      deviceProof: primaryDevice.signChallenge("activation", activationTicket),
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
  const deviceId = activationBody.deviceId as string;
  assert.match(studentId, /^[0-9a-f-]{36}$/);
  assert.match(deviceId, /^[0-9a-f-]{36}$/);

  const firstCookie = cookieFrom(activation);
  const me = await app.inject({
    method: "GET",
    url: "/v1/student/me",
    headers: { cookie: firstCookie },
  });
  assert.equal(me.statusCode, 200);
  assert.equal(me.json().profile.id, studentId);

  const persisted = await db.query<{
    identifier: string;
    password_hash: string;
    code_status: string;
    redeemed_by_profile_id: string;
    redemption_count: string;
    device_count: string;
    session_device_id: string | null;
    ticket_used_at: Date | null;
  }>(
    `select c.normalized_identifier as identifier,
            c.password_hash,
            f.status as code_status,
            f.redeemed_by_profile_id,
            (select count(*)::text from access_redemptions r where r.full_access_code_id = f.id) as redemption_count,
            (select count(*)::text from student_devices d where d.profile_id = c.profile_id and d.revoked_at is null) as device_count,
            (select s.device_id from auth_sessions s where s.profile_id = c.profile_id and s.revoked_at is null order by s.created_at desc limit 1) as session_device_id,
            (select t.used_at from student_activation_tickets t where t.full_access_code_id = f.id order by t.created_at limit 1) as ticket_used_at
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
  assert.equal(Number(persisted[0]?.device_count), 1);
  assert.equal(persisted[0]?.session_device_id, deviceId);
  assert.ok(persisted[0]?.ticket_used_at);

  const authAudit = await db.query<{ event_type: string }>(
    "select event_type from auth_events where profile_id = $1 order by id",
    [studentId],
  );
  assert.ok(authAudit.some((event) => event.event_type === "account_activated"));
  assert.ok(authAudit.some((event) => event.event_type === "device_registered"));
  assert.ok(authAudit.some((event) => event.event_type === "login_success"));

  const wrongReplayPassword = await app.inject({
    method: "POST",
    url: "/v1/student/activation/complete",
    headers: { origin },
    payload: {
      activationTicket,
      password: "WrongPass123!",
      idempotencyKey: "stage8-first-activation-0001",
      devicePublicKeySpki: primaryDevice.publicKeySpki,
      deviceProof: primaryDevice.signChallenge("activation", activationTicket),
    },
  });
  assert.equal(wrongReplayPassword.statusCode, 401);

  const wrongReplayDevice = createTestDeviceKey();
  const wrongReplay = await app.inject({
    method: "POST",
    url: "/v1/student/activation/complete",
    headers: { origin },
    payload: {
      activationTicket,
      password: "StudentPass123!",
      idempotencyKey: "stage8-first-activation-0001",
      devicePublicKeySpki: wrongReplayDevice.publicKeySpki,
      deviceProof: wrongReplayDevice.signChallenge("activation", activationTicket),
    },
  });
  assert.equal(wrongReplay.statusCode, 409);

  const replay = await app.inject({
    method: "POST",
    url: "/v1/student/activation/complete",
    headers: { origin, "user-agent": "stage8-retry-device" },
    payload: {
      activationTicket,
      password: "StudentPass123!",
      idempotencyKey: "stage8-first-activation-0001",
      devicePublicKeySpki: primaryDevice.publicKeySpki,
      deviceProof: primaryDevice.signChallenge("activation", activationTicket),
    },
  });
  assert.equal(replay.statusCode, 200);
  assert.equal(replay.json().replayed, true);
  assert.equal(replay.json().profile.id, studentId);
  assert.equal(replay.json().entitlement.id, entitlementId);
  assert.equal(replay.json().accountIdentifier, "123456");
  assert.equal(await countProfiles(db), beforeInvalid + 1);

  const passwordOnlyLogin = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    headers: { origin },
    payload: { identifier: "123456", password: "StudentPass123!" },
  });
  assert.equal(passwordOnlyLogin.statusCode, 401);

  const logout = await app.inject({
    method: "POST",
    url: "/v1/auth/logout",
    headers: { origin, cookie: firstCookie },
  });
  assert.equal(logout.statusCode, 204);

  const returningStart = await app.inject({
    method: "POST",
    url: "/v1/student/login/start",
    headers: { origin },
    payload: { identifier: toArabicDigits("123456"), password: "StudentPass123!" },
  });
  assert.equal(returningStart.statusCode, 200);
  assert.equal(returningStart.json().purpose, "login");
  const returningChallenge = returningStart.json().challengeToken as string;

  const badReturningProof = await app.inject({
    method: "POST",
    url: "/v1/student/login/complete",
    headers: { origin },
    payload: {
      challengeToken: returningChallenge,
      signature: wrongDevice.signChallenge("login", returningChallenge),
    },
  });
  assert.equal(badReturningProof.statusCode, 401);

  const returningLogin = await app.inject({
    method: "POST",
    url: "/v1/student/login/complete",
    headers: { origin },
    payload: {
      challengeToken: returningChallenge,
      signature: primaryDevice.signChallenge("login", returningChallenge),
    },
  });
  assert.equal(returningLogin.statusCode, 200);
  const returningMe = await app.inject({
    method: "GET",
    url: "/v1/student/me",
    headers: { cookie: cookieFrom(returningLogin) },
  });
  assert.equal(returningMe.statusCode, 200);

  const raceBefore = await countProfiles(db);
  const raceVerifyA = await app.inject({
    method: "POST",
    url: "/v1/student/activation/verify",
    headers: { origin },
    payload: { code: "345678" },
  });
  const raceVerifyB = await app.inject({
    method: "POST",
    url: "/v1/student/activation/verify",
    headers: { origin },
    payload: { code: "345678" },
  });
  assert.equal(raceVerifyA.statusCode, 200);
  assert.equal(raceVerifyB.statusCode, 200);
  const raceTicketA = raceVerifyA.json().activationTicket as string;
  const raceTicketB = raceVerifyB.json().activationTicket as string;
  const raceDeviceA = createTestDeviceKey();
  const raceDeviceB = createTestDeviceKey();

  const [raceA, raceB] = await Promise.all([
    app.inject({
      method: "POST",
      url: "/v1/student/activation/complete",
      headers: { origin },
      payload: {
        activationTicket: raceTicketA,
        password: "RaceWinnerA123!",
        idempotencyKey: "stage8-race-activation-a",
        devicePublicKeySpki: raceDeviceA.publicKeySpki,
        deviceProof: raceDeviceA.signChallenge("activation", raceTicketA),
      },
    }),
    app.inject({
      method: "POST",
      url: "/v1/student/activation/complete",
      headers: { origin },
      payload: {
        activationTicket: raceTicketB,
        password: "RaceWinnerB123!",
        idempotencyKey: "stage8-race-activation-b",
        devicePublicKeySpki: raceDeviceB.publicKeySpki,
        deviceProof: raceDeviceB.signChallenge("activation", raceTicketB),
      },
    }),
  ]);
  assert.deepEqual([raceA.statusCode, raceB.statusCode].sort(), [201, 409]);
  assert.equal(await countProfiles(db), raceBefore + 1);
  const raceWinner = raceA.statusCode === 201 ? raceA.json().profile.id : raceB.json().profile.id;
  const raceCode = await db.query<{ redeemed_by_profile_id: string; count: string; used_tickets: string }>(
    `select f.redeemed_by_profile_id,
            (select count(*)::text from access_redemptions r where r.full_access_code_id = f.id) as count,
            (select count(*)::text from student_activation_tickets t where t.full_access_code_id = f.id and t.used_at is not null) as used_tickets
     from full_access_codes f where f.code = '345678'`,
  );
  assert.equal(raceCode[0]?.redeemed_by_profile_id, raceWinner);
  assert.equal(Number(raceCode[0]?.count), 1);
  assert.equal(Number(raceCode[0]?.used_tickets), 1);

  const conflictProfileRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'حساب تعارض') returning id",
  );
  const conflictProfileId = conflictProfileRows[0]?.id;
  assert.ok(conflictProfileId);
  await auth.createCredential(conflictProfileId, "456789", "ExistingCredential123!");
  const beforeConflict = await countProfiles(db);

  const conflictVerify = await app.inject({
    method: "POST",
    url: "/v1/student/activation/verify",
    headers: { origin },
    payload: { code: "456789" },
  });
  assert.equal(conflictVerify.statusCode, 200);
  const conflictTicket = conflictVerify.json().activationTicket as string;
  const conflictDevice = createTestDeviceKey();
  const credentialConflict = await app.inject({
    method: "POST",
    url: "/v1/student/activation/complete",
    headers: { origin },
    payload: {
      activationTicket: conflictTicket,
      password: "NewCredential123!",
      idempotencyKey: "stage8-credential-conflict",
      devicePublicKeySpki: conflictDevice.publicKeySpki,
      deviceProof: conflictDevice.signChallenge("activation", conflictTicket),
    },
  });
  assert.equal(credentialConflict.statusCode, 409);
  assert.equal(await countProfiles(db), beforeConflict);
  const conflictCode = await db.query<{ status: string; redeemed_by_profile_id: string | null }>(
    "select status, redeemed_by_profile_id from full_access_codes where code = '456789'",
  );
  assert.equal(conflictCode[0]?.status, "active");
  assert.equal(conflictCode[0]?.redeemed_by_profile_id, null);
  const conflictState = await db.query<{ redemption_count: string; used_at: Date | null }>(
    `select (select count(*)::text from access_redemptions r where r.full_access_code_id = f.id) as redemption_count,
            (select t.used_at from student_activation_tickets t where t.token_hash_sha256 = $1) as used_at
     from full_access_codes f where f.code = '456789'`,
    [hashToken(conflictTicket)],
  );
  assert.equal(Number(conflictState[0]?.redemption_count), 0);
  assert.equal(conflictState[0]?.used_at, null);

  await app.close();
});
