import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { validateDevicePublicKey } from "../../src/auth/device-crypto.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";
import { createTestDeviceKey, type TestDeviceKey } from "../device-test-key.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for auth integration tests");

const origin = "http://localhost:5173";

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

test("student auth requires registered-device proof, forced password change and explicit rebind", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);

  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب اختبار') returning id",
  );
  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير اختبار') returning id",
  );
  const lockRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب قفل') returning id",
  );
  const studentId = studentRows[0]?.id;
  const adminId = adminRows[0]?.id;
  const lockId = lockRows[0]?.id;
  assert.ok(studentId && adminId && lockId);

  await auth.createCredential(studentId, "student-١٢٣", "StudentPass123!");
  await auth.createCredential(adminId, "admin-main", "AdminPass123!");
  await auth.createCredential(lockId, "lock-student", "LockPass123!");

  async function registerDevice(profileId: string, key: TestDeviceKey): Promise<string> {
    const validated = validateDevicePublicKey(key.publicKeySpki);
    const rows = await db.query<{ id: string }>(
      `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
       values ($1, $2, $3, 'integration-test')
       returning id`,
      [profileId, validated.publicKeySpki, validated.fingerprintSha256],
    );
    const id = rows[0]?.id;
    assert.ok(id);
    return id;
  }

  const studentDevice = createTestDeviceKey();
  const studentDeviceId = await registerDevice(studentId, studentDevice);
  const lockDevice = createTestDeviceKey();
  await registerDevice(lockId, lockDevice);

  const credential = await db.query<{ normalized_identifier: string; password_hash: string }>(
    "select normalized_identifier, password_hash from auth_credentials where profile_id = $1",
    [studentId],
  );
  assert.equal(credential[0]?.normalized_identifier, "student-123");
  assert.match(credential[0]?.password_hash ?? "", /^scrypt\$/);
  assert.equal(credential[0]?.password_hash.includes("StudentPass123!"), false);

  const app = buildApp({ config, database: db });

  const badOrigin = await app.inject({
    method: "POST",
    url: "/v1/student/login/start",
    headers: { origin: "https://attacker.invalid" },
    payload: { identifier: "student-123", password: "StudentPass123!" },
  });
  assert.equal(badOrigin.statusCode, 403);

  const wrongLogin = await app.inject({
    method: "POST",
    url: "/v1/student/login/start",
    headers: { origin },
    payload: { identifier: "student-123", password: "incorrect" },
  });
  assert.equal(wrongLogin.statusCode, 401);
  assert.equal(wrongLogin.json().error.message, "بيانات الدخول غير صحيحة");

  const passwordOnlyBypass = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    headers: { origin },
    payload: { identifier: "student-123", password: "StudentPass123!" },
  });
  assert.equal(passwordOnlyBypass.statusCode, 401);

  const loginStart = await app.inject({
    method: "POST",
    url: "/v1/student/login/start",
    headers: { origin },
    payload: { identifier: "student-١٢٣", password: "StudentPass123!" },
  });
  assert.equal(loginStart.statusCode, 200);
  assert.equal(loginStart.json().purpose, "login");
  assert.equal(loginStart.json().requiresDeviceRegistration, false);
  const firstChallenge = loginStart.json().challengeToken as string;

  const wrongDevice = createTestDeviceKey();
  const wrongProof = await app.inject({
    method: "POST",
    url: "/v1/student/login/complete",
    headers: { origin },
    payload: {
      challengeToken: firstChallenge,
      signature: wrongDevice.signChallenge("login", firstChallenge),
    },
  });
  assert.equal(wrongProof.statusCode, 401);

  const studentLogin = await app.inject({
    method: "POST",
    url: "/v1/student/login/complete",
    headers: { origin, "user-agent": "integration-test" },
    payload: {
      challengeToken: firstChallenge,
      signature: studentDevice.signChallenge("login", firstChallenge),
    },
  });
  assert.equal(studentLogin.statusCode, 200);
  assert.equal(studentLogin.json().profile.role, "student");
  assert.equal(studentLogin.json().deviceId, studentDeviceId);
  assert.equal(JSON.stringify(studentLogin.json()).includes("token"), false);
  const studentCookie = cookieFrom(studentLogin);
  assert.match(String(studentLogin.headers["set-cookie"]), /HttpOnly/);
  assert.match(String(studentLogin.headers["set-cookie"]), /SameSite=Lax/);

  const sessionToken = studentCookie.split("=", 2)[1] ?? "";
  const sessions = await db.query<{ token_hash_sha256: string; device_id: string | null }>(
    `select token_hash_sha256, device_id
     from auth_sessions
     where profile_id = $1 and revoked_at is null`,
    [studentId],
  );
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0]?.device_id, studentDeviceId);
  assert.notEqual(sessions[0]?.token_hash_sha256, sessionToken);
  assert.match(sessions[0]?.token_hash_sha256 ?? "", /^[0-9a-f]{64}$/);

  const studentMe = await app.inject({
    method: "GET",
    url: "/v1/student/me",
    headers: { cookie: studentCookie },
  });
  assert.equal(studentMe.statusCode, 200);
  assert.equal(studentMe.json().profile.id, studentId);

  const studentAdminAttempt = await app.inject({
    method: "GET",
    url: "/v1/admin/me",
    headers: { cookie: studentCookie },
  });
  assert.equal(studentAdminAttempt.statusCode, 403);

  const reusedChallenge = await app.inject({
    method: "POST",
    url: "/v1/student/login/complete",
    headers: { origin },
    payload: {
      challengeToken: firstChallenge,
      signature: studentDevice.signChallenge("login", firstChallenge),
    },
  });
  assert.equal(reusedChallenge.statusCode, 401);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await app.inject({
      method: "POST",
      url: "/v1/student/login/start",
      headers: { origin },
      payload: { identifier: "lock-student", password: "wrong-password" },
    });
    assert.equal(response.statusCode, 401);
  }
  const locked = await app.inject({
    method: "POST",
    url: "/v1/student/login/start",
    headers: { origin },
    payload: { identifier: "lock-student", password: "LockPass123!" },
  });
  assert.equal(locked.statusCode, 429);

  const adminLogin = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    headers: { origin },
    payload: { identifier: "admin-main", password: "AdminPass123!" },
  });
  assert.equal(adminLogin.statusCode, 200);
  const adminCookie = cookieFrom(adminLogin);

  const recovery = await app.inject({
    method: "POST",
    url: "/v1/admin/auth/temporary-password",
    headers: { origin, cookie: adminCookie },
    payload: { profileId: studentId },
  });
  assert.equal(recovery.statusCode, 200);
  const temporaryPassword = recovery.json().temporaryPassword as string;
  assert.ok(temporaryPassword.startsWith("Tmp-"));
  assert.equal(recovery.json().expiresInHours, 24);

  const oldSession = await app.inject({
    method: "GET",
    url: "/v1/auth/me",
    headers: { cookie: studentCookie },
  });
  assert.equal(oldSession.statusCode, 401);

  const oldPassword = await app.inject({
    method: "POST",
    url: "/v1/student/login/start",
    headers: { origin },
    payload: { identifier: "student-123", password: "StudentPass123!" },
  });
  assert.equal(oldPassword.statusCode, 401);

  const temporaryStart = await app.inject({
    method: "POST",
    url: "/v1/student/login/start",
    headers: { origin },
    payload: { identifier: "student-123", password: temporaryPassword },
  });
  assert.equal(temporaryStart.statusCode, 200);
  assert.equal(temporaryStart.json().purpose, "password_change");
  assert.equal(temporaryStart.json().mustChangePassword, true);
  const passwordChangeChallenge = temporaryStart.json().challengeToken as string;

  const missingPrivatePassword = await app.inject({
    method: "POST",
    url: "/v1/student/login/complete",
    headers: { origin },
    payload: {
      challengeToken: passwordChangeChallenge,
      signature: studentDevice.signChallenge("password_change", passwordChangeChallenge),
    },
  });
  assert.equal(missingPrivatePassword.statusCode, 400);

  const changed = await app.inject({
    method: "POST",
    url: "/v1/student/login/complete",
    headers: { origin },
    payload: {
      challengeToken: passwordChangeChallenge,
      signature: studentDevice.signChallenge("password_change", passwordChangeChallenge),
      newPassword: "PrivateStudentPass456!",
    },
  });
  assert.equal(changed.statusCode, 200);
  const changedCookie = cookieFrom(changed);

  const temporaryReused = await app.inject({
    method: "POST",
    url: "/v1/student/login/start",
    headers: { origin },
    payload: { identifier: "student-123", password: temporaryPassword },
  });
  assert.equal(temporaryReused.statusCode, 401);

  const privateStart = await app.inject({
    method: "POST",
    url: "/v1/student/login/start",
    headers: { origin },
    payload: { identifier: "student-123", password: "PrivateStudentPass456!" },
  });
  assert.equal(privateStart.statusCode, 200);
  assert.equal(privateStart.json().purpose, "login");
  const privateChallenge = privateStart.json().challengeToken as string;
  const privateLogin = await app.inject({
    method: "POST",
    url: "/v1/student/login/complete",
    headers: { origin },
    payload: {
      challengeToken: privateChallenge,
      signature: studentDevice.signChallenge("login", privateChallenge),
    },
  });
  assert.equal(privateLogin.statusCode, 200);

  const resetDevice = await app.inject({
    method: "POST",
    url: "/v1/admin/auth/device-rebind",
    headers: { origin, cookie: adminCookie },
    payload: { profileId: studentId },
  });
  assert.equal(resetDevice.statusCode, 200);

  for (const staleCookie of [changedCookie, cookieFrom(privateLogin)]) {
    const staleSession = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { cookie: staleCookie },
    });
    assert.equal(staleSession.statusCode, 401);
  }

  const rebindStart = await app.inject({
    method: "POST",
    url: "/v1/student/login/start",
    headers: { origin },
    payload: { identifier: "student-123", password: "PrivateStudentPass456!" },
  });
  assert.equal(rebindStart.statusCode, 200);
  assert.equal(rebindStart.json().purpose, "device_rebind");
  assert.equal(rebindStart.json().requiresDeviceRegistration, true);
  const rebindChallenge = rebindStart.json().challengeToken as string;

  const historicalKeyRejected = await app.inject({
    method: "POST",
    url: "/v1/student/login/complete",
    headers: { origin },
    payload: {
      challengeToken: rebindChallenge,
      publicKeySpki: studentDevice.publicKeySpki,
      signature: studentDevice.signChallenge("device_rebind", rebindChallenge),
    },
  });
  assert.equal(historicalKeyRejected.statusCode, 409);

  const newDevice = createTestDeviceKey();
  const rebound = await app.inject({
    method: "POST",
    url: "/v1/student/login/complete",
    headers: { origin },
    payload: {
      challengeToken: rebindChallenge,
      publicKeySpki: newDevice.publicKeySpki,
      signature: newDevice.signChallenge("device_rebind", rebindChallenge),
    },
  });
  assert.equal(rebound.statusCode, 200);
  const newDeviceId = rebound.json().deviceId as string;
  assert.notEqual(newDeviceId, studentDeviceId);

  const deviceState = await db.query<{
    id: string;
    revoked_at: Date | null;
    device_rebind_allowed: boolean;
  }>(
    `select d.id, d.revoked_at, c.device_rebind_allowed
     from student_devices d
     join auth_credentials c on c.profile_id = d.profile_id
     where d.profile_id = $1
     order by d.registered_at`,
    [studentId],
  );
  assert.equal(deviceState.length, 2);
  assert.ok(deviceState.find((row) => row.id === studentDeviceId)?.revoked_at);
  assert.equal(deviceState.find((row) => row.id === newDeviceId)?.revoked_at, null);
  assert.equal(deviceState[0]?.device_rebind_allowed, false);

  const newDeviceStart = await app.inject({
    method: "POST",
    url: "/v1/student/login/start",
    headers: { origin },
    payload: { identifier: "student-123", password: "PrivateStudentPass456!" },
  });
  assert.equal(newDeviceStart.statusCode, 200);
  const newDeviceChallenge = newDeviceStart.json().challengeToken as string;

  const oldKeyCannotLogin = await app.inject({
    method: "POST",
    url: "/v1/student/login/complete",
    headers: { origin },
    payload: {
      challengeToken: newDeviceChallenge,
      signature: studentDevice.signChallenge("login", newDeviceChallenge),
    },
  });
  assert.equal(oldKeyCannotLogin.statusCode, 401);

  const newKeyCanLogin = await app.inject({
    method: "POST",
    url: "/v1/student/login/complete",
    headers: { origin },
    payload: {
      challengeToken: newDeviceChallenge,
      signature: newDevice.signChallenge("login", newDeviceChallenge),
    },
  });
  assert.equal(newKeyCanLogin.statusCode, 200);

  await app.close();
});
