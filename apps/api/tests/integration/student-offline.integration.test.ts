import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { hashToken } from "../../src/auth/crypto.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";
import { MAX_OFFLINE_LEASE_HOURS } from "../../src/offline/service.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Student offline integration tests");

const origin = "http://127.0.0.1:5174";
type TestDatabase = ReturnType<typeof createDatabase>;

async function createStudent(db: TestDatabase, label: string): Promise<{ profileId: string; deviceId: string }> {
  const profiles = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', $1) returning id",
    [label],
  );
  const profileId = profiles[0]?.id;
  assert.ok(profileId);

  const keyMaterial = `stage16-offline-device-${crypto.randomUUID()}`;
  const devices = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'Stage16 offline integration fixture')
     returning id`,
    [profileId, `fixture-${keyMaterial}`.padEnd(96, "x"), hashToken(keyMaterial)],
  );
  const deviceId = devices[0]?.id;
  assert.ok(deviceId);
  return { profileId, deviceId };
}

async function createSession(
  db: TestDatabase,
  input: { profileId: string; deviceId: string; expiresInHours: number },
): Promise<{ cookie: string; token: string }> {
  const token = `stage16-offline-${crypto.randomUUID()}-${crypto.randomUUID()}`;
  await db.query(
    `insert into auth_sessions (profile_id, token_hash_sha256, device_id, expires_at)
     values ($1, $2, $3, now() + ($4::double precision * interval '1 hour'))`,
    [input.profileId, hashToken(token), input.deviceId, input.expiresInHours],
  );
  return { cookie: `alwaslh_session=${encodeURIComponent(token)}`, token };
}

function milliseconds(value: string): number {
  return new Date(value).getTime();
}

test("Student offline lease is session/device-bound, bounded and entitlement-safe", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "168",
  });
  const db = createDatabase(databaseUrl);
  const app = buildApp({ config, database: db });

  const unauthorized = await app.inject({ method: "GET", url: "/v1/student/offline/lease" });
  assert.equal(unauthorized.statusCode, 401);

  const longSessionStudent = await createStudent(db, "طالب Stage16 lease طويل");
  const longSession = await createSession(db, {
    profileId: longSessionStudent.profileId,
    deviceId: longSessionStudent.deviceId,
    expiresInHours: 36,
  });

  const activeEntitlements = await db.query<{ id: string }>(
    `insert into student_entitlements (
       profile_id, scope, source, status, starts_at, expires_at
     ) values (
       $1, 'all_content', 'admin', 'active', now() - interval '1 minute', now() + interval '30 minutes'
     ) returning id`,
    [longSessionStudent.profileId],
  );
  const activeEntitlementId = activeEntitlements[0]?.id;
  assert.ok(activeEntitlementId);

  await db.query(
    `insert into student_entitlements (
       profile_id, scope, source, status, starts_at, expires_at
     ) values (
       $1, 'all_content', 'admin', 'expired', now() - interval '2 hours', now() - interval '1 hour'
     )`,
    [longSessionStudent.profileId],
  );
  await db.query(
    `insert into student_entitlements (
       profile_id, scope, source, status, starts_at, expires_at, revoked_at
     ) values (
       $1, 'all_content', 'admin', 'revoked', now() - interval '1 hour', now() + interval '1 day', now()
     )`,
    [longSessionStudent.profileId],
  );

  const response = await app.inject({
    method: "GET",
    url: "/v1/student/offline/lease",
    headers: { cookie: longSession.cookie },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["cache-control"], "private, no-store");
  assert.equal(response.headers.pragma, "no-cache");

  const payload = response.json<{
    lease: {
      version: number;
      profileId: string;
      deviceId: string;
      issuedAt: string;
      expiresAt: string;
      grants: Array<{
        entitlementId: string;
        scope: string;
        classId: string | null;
        expiresAt: string;
      }>;
    };
  }>();
  assert.equal(payload.lease.version, 1);
  assert.equal(payload.lease.profileId, longSessionStudent.profileId);
  assert.equal(payload.lease.deviceId, longSessionStudent.deviceId);
  assert.equal(payload.lease.grants.length, 1);
  assert.equal(payload.lease.grants[0]?.entitlementId, activeEntitlementId);
  assert.equal(payload.lease.grants[0]?.scope, "all_content");
  assert.equal(payload.lease.grants[0]?.classId, null);

  const leaseDuration = milliseconds(payload.lease.expiresAt) - milliseconds(payload.lease.issuedAt);
  assert.ok(leaseDuration > 0);
  assert.ok(leaseDuration <= MAX_OFFLINE_LEASE_HOURS * 60 * 60 * 1000 + 1_000);
  const grantDuration = milliseconds(payload.lease.grants[0]?.expiresAt ?? "") - milliseconds(payload.lease.issuedAt);
  assert.ok(grantDuration > 0);
  assert.ok(grantDuration <= 30 * 60 * 1000 + 1_000);

  const shortSessionStudent = await createStudent(db, "طالب Stage16 lease قصير");
  const shortSession = await createSession(db, {
    profileId: shortSessionStudent.profileId,
    deviceId: shortSessionStudent.deviceId,
    expiresInHours: 2,
  });
  await db.query(
    `insert into student_entitlements (profile_id, scope, source, status, starts_at)
     values ($1, 'all_content', 'admin', 'active', now() - interval '1 minute')`,
    [shortSessionStudent.profileId],
  );

  const shortResponse = await app.inject({
    method: "GET",
    url: "/v1/student/offline/lease",
    headers: { cookie: shortSession.cookie },
  });
  assert.equal(shortResponse.statusCode, 200);
  const shortPayload = shortResponse.json<{ lease: { issuedAt: string; expiresAt: string; grants: Array<{ expiresAt: string }> } }>();
  const shortDuration = milliseconds(shortPayload.lease.expiresAt) - milliseconds(shortPayload.lease.issuedAt);
  assert.ok(shortDuration > 0);
  assert.ok(shortDuration <= 2 * 60 * 60 * 1000 + 1_000);
  assert.equal(shortPayload.lease.grants[0]?.expiresAt, shortPayload.lease.expiresAt);

  await db.query("update student_devices set revoked_at = now() where id = $1", [longSessionStudent.deviceId]);
  const revokedDevice = await app.inject({
    method: "GET",
    url: "/v1/student/offline/lease",
    headers: { cookie: longSession.cookie },
  });
  assert.equal(revokedDevice.statusCode, 401);

  await app.close();
});
