import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for auth integration tests");

const origin = "http://localhost:5173";

function cookieFrom(response: { headers: Record<string, string | string[] | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

test("auth lifecycle, role isolation, lockout and recovery", async () => {
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
    url: "/v1/auth/login",
    headers: { origin: "https://attacker.invalid" },
    payload: { identifier: "student-123", password: "StudentPass123!" },
  });
  assert.equal(badOrigin.statusCode, 403);

  const wrongLogin = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    headers: { origin },
    payload: { identifier: "student-123", password: "incorrect" },
  });
  assert.equal(wrongLogin.statusCode, 401);
  assert.equal(wrongLogin.json().error.message, "بيانات الدخول غير صحيحة");

  const studentLogin = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    headers: { origin, "user-agent": "integration-test" },
    payload: { identifier: "student-١٢٣", password: "StudentPass123!" },
  });
  assert.equal(studentLogin.statusCode, 200);
  assert.equal(studentLogin.json().profile.role, "student");
  assert.equal(JSON.stringify(studentLogin.json()).includes("token"), false);
  const studentCookie = cookieFrom(studentLogin);
  const fullCookieHeader = studentLogin.headers["set-cookie"];
  assert.match(String(fullCookieHeader), /HttpOnly/);
  assert.match(String(fullCookieHeader), /SameSite=Lax/);

  const sessionToken = studentCookie.split("=", 2)[1] ?? "";
  const sessions = await db.query<{ token_hash_sha256: string }>(
    "select token_hash_sha256 from auth_sessions where profile_id = $1 and revoked_at is null",
    [studentId],
  );
  assert.equal(sessions.length, 1);
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

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { identifier: "lock-student", password: "wrong-password" },
    });
    assert.equal(response.statusCode, 401);
  }
  const locked = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
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
    url: "/v1/admin/auth/recovery-token",
    headers: { origin, cookie: adminCookie },
    payload: { profileId: studentId },
  });
  assert.equal(recovery.statusCode, 200);
  const recoveryToken = recovery.json().recoveryToken as string;
  assert.ok(recoveryToken.length >= 32);

  const reset = await app.inject({
    method: "POST",
    url: "/v1/auth/reset-password",
    headers: { origin },
    payload: { token: recoveryToken, newPassword: "NewStudentPass456!" },
  });
  assert.equal(reset.statusCode, 200);

  const oldSession = await app.inject({
    method: "GET",
    url: "/v1/auth/me",
    headers: { cookie: studentCookie },
  });
  assert.equal(oldSession.statusCode, 401);

  const oldPassword = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    headers: { origin },
    payload: { identifier: "student-123", password: "StudentPass123!" },
  });
  assert.equal(oldPassword.statusCode, 401);

  const newPassword = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    headers: { origin },
    payload: { identifier: "student-123", password: "NewStudentPass456!" },
  });
  assert.equal(newPassword.statusCode, 200);

  const reusedRecovery = await app.inject({
    method: "POST",
    url: "/v1/auth/reset-password",
    headers: { origin },
    payload: { token: recoveryToken, newPassword: "AnotherPass789!" },
  });
  assert.equal(reusedRecovery.statusCode, 401);

  const logout = await app.inject({
    method: "POST",
    url: "/v1/auth/logout",
    headers: { origin, cookie: cookieFrom(newPassword) },
  });
  assert.equal(logout.statusCode, 204);

  await app.close();
});
