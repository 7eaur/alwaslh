import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { hashToken } from "../../src/auth/crypto.js";
import { loadConfig } from "../../src/config.js";
import { CurriculumService } from "../../src/curriculum/service.js";
import { createDatabase } from "../../src/db.js";
import { FileSystemMediaStorage } from "../../src/media/storage.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Student offline download integration tests");

const origin = "http://127.0.0.1:5174";
const bytes = Buffer.from("stage16-explicit-protected-offline-asset", "utf8");
const checksum = createHash("sha256").update(bytes).digest("hex");
type TestDatabase = ReturnType<typeof createDatabase>;

async function createStudentDevice(db: TestDatabase, profileId: string): Promise<string> {
  const keyMaterial = `stage16-download-device-${crypto.randomUUID()}`;
  const rows = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'Stage16 download integration fixture')
     returning id`,
    [profileId, `fixture-${keyMaterial}`.padEnd(96, "x"), hashToken(keyMaterial)],
  );
  const deviceId = rows[0]?.id;
  assert.ok(deviceId);
  return deviceId;
}

async function createSession(db: TestDatabase, profileId: string, deviceId: string): Promise<string> {
  const token = `stage16-download-${crypto.randomUUID()}-${crypto.randomUUID()}`;
  await db.query(
    `insert into auth_sessions (profile_id, token_hash_sha256, device_id, expires_at)
     values ($1, $2, $3, now() + interval '6 hours')`,
    [profileId, hashToken(token), deviceId],
  );
  return `alwaslh_session=${encodeURIComponent(token)}`;
}

test("Student offline lesson manifest is device-bound, publication-safe and revision-bound", async () => {
  const mediaRoot = await mkdtemp(join(tmpdir(), "alwaslh-stage16-download-"));
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
    MEDIA_STORAGE_ROOT: mediaRoot,
  });
  const db = createDatabase(databaseUrl);
  const storage = new FileSystemMediaStorage(mediaRoot);
  const curriculum = new CurriculumService(db);
  const app = buildApp({ config, database: db });

  try {
    const adminRows = await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('admin', 'Stage16 download admin') returning id",
    );
    const adminId = adminRows[0]?.id;
    assert.ok(adminId);
    const studentRows = await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('student', 'طالب Stage16 تنزيل') returning id",
    );
    const studentId = studentRows[0]?.id;
    assert.ok(studentId);

    const classRecord = await curriculum.createClass(adminId, {
      slug: `stage16-download-${crypto.randomUUID()}`,
      name: "صف Stage16 تنزيل",
      status: "active",
    });
    const subject = await curriculum.createSubject(adminId, {
      slug: `stage16-download-subject-${crypto.randomUUID()}`,
      name: "مادة Stage16 تنزيل",
      status: "active",
    });
    await curriculum.createOffering(adminId, {
      classId: classRecord.id,
      subjectId: subject.id,
      status: "active",
    });
    const lesson = await curriculum.createLesson(adminId, {
      classId: classRecord.id,
      subjectId: subject.id,
      slug: `stage16-download-lesson-${crypto.randomUUID()}`,
      title: "درس Stage16 المحمي",
      summary: "ملخص صالح للتنزيل الصريح",
      status: "active",
    });
    const contentRevision = 7;
    await db.query(
      "update lessons set content_revision = $2, published_at = now() - interval '1 minute' where id = $1",
      [lesson.id, contentRevision],
    );

    await db.query(
      `insert into student_entitlements (
         profile_id, scope, class_id, source, status, starts_at, expires_at
       ) values ($1, 'class', $2, 'admin', 'active', now() - interval '1 minute', now() + interval '2 hours')`,
      [studentId, classRecord.id],
    );

    const storageKey = `stage16-download/${crypto.randomUUID()}/display.bin`;
    await storage.put(storageKey, bytes);
    const mediaRows = await db.query<{ id: string }>(
      `insert into media_assets (
         idempotency_key, source_position, source_filename, source_mime_type,
         source_checksum_sha256, source_byte_size, status, attempt_count
       ) values ($1, 0, 'protected.bin', 'application/octet-stream', $2, $3, 'ready', 1)
       returning id`,
      [`stage16-download-${crypto.randomUUID()}`, checksum, bytes.byteLength],
    );
    const mediaId = mediaRows[0]?.id;
    assert.ok(mediaId);
    const assetRows = await db.query<{ id: string }>(
      `insert into lesson_assets (
         lesson_id, kind, position, storage_key, mime_type, byte_size, checksum_sha256,
         media_asset_id, publication_status, submitted_for_review_by_profile_id,
         submitted_for_review_at, published_by_profile_id, asset_published_at
       ) values (
         $1, 'document', 0, $2, 'application/octet-stream', $3, $4, $5, 'published',
         $6, now() - interval '2 minutes', $6, now() - interval '1 minute'
       ) returning id`,
      [lesson.id, storageKey, bytes.byteLength, checksum, mediaId, adminId],
    );
    const assetId = assetRows[0]?.id;
    assert.ok(assetId);

    const deviceId = await createStudentDevice(db, studentId);
    const cookie = await createSession(db, studentId, deviceId);

    const unauthenticated = await app.inject({
      method: "GET",
      url: `/v1/student/offline/lessons/${lesson.id}/manifest`,
    });
    assert.equal(unauthenticated.statusCode, 401);

    const manifestResponse = await app.inject({
      method: "GET",
      url: `/v1/student/offline/lessons/${lesson.id}/manifest`,
      headers: { cookie },
    });
    assert.equal(manifestResponse.statusCode, 200);
    assert.equal(manifestResponse.headers["cache-control"], "private, no-store");
    assert.equal(manifestResponse.headers.pragma, "no-cache");
    const payload = manifestResponse.json<{
      manifest: {
        version: number;
        profileId: string;
        deviceId: string;
        issuedAt: string;
        leaseExpiresAt: string;
        authorizationExpiresAt: string;
        lesson: {
          id: string;
          classId: string;
          title: string;
          contentRevision: number;
        };
        totalByteSize: number;
        assets: Array<{
          id: string;
          byteSize: number;
          checksumSha256: string;
          downloadPath: string;
        }>;
      };
    }>();
    assert.equal(payload.manifest.version, 1);
    assert.equal(payload.manifest.profileId, studentId);
    assert.equal(payload.manifest.deviceId, deviceId);
    assert.equal(payload.manifest.lesson.id, lesson.id);
    assert.equal(payload.manifest.lesson.classId, classRecord.id);
    assert.equal(payload.manifest.lesson.contentRevision, contentRevision);
    assert.equal(payload.manifest.totalByteSize, bytes.byteLength);
    assert.equal(payload.manifest.assets.length, 1);
    assert.equal(payload.manifest.assets[0]?.id, assetId);
    assert.equal(payload.manifest.assets[0]?.byteSize, bytes.byteLength);
    assert.equal(payload.manifest.assets[0]?.checksumSha256, checksum);
    assert.equal(
      payload.manifest.assets[0]?.downloadPath,
      `/v1/student/offline/lessons/${lesson.id}/assets/${assetId}?revision=${contentRevision}`,
    );
    assert.ok(new Date(payload.manifest.authorizationExpiresAt).getTime() > Date.now());
    assert.ok(
      new Date(payload.manifest.authorizationExpiresAt).getTime() <=
        new Date(payload.manifest.leaseExpiresAt).getTime(),
    );
    assert.equal(JSON.stringify(payload).includes("storage_key"), false);
    assert.equal(JSON.stringify(payload).includes(storageKey), false);

    const assetResponse = await app.inject({
      method: "GET",
      url: payload.manifest.assets[0]?.downloadPath,
      headers: { cookie },
    });
    assert.equal(assetResponse.statusCode, 200);
    assert.equal(assetResponse.headers["cache-control"], "private, no-store");
    assert.equal(assetResponse.headers["x-content-type-options"], "nosniff");
    assert.equal(assetResponse.headers["x-alwaslh-content-revision"], String(contentRevision));
    assert.equal(assetResponse.headers.etag, `"${checksum}"`);
    assert.equal(assetResponse.rawPayload.equals(bytes), true);

    const staleRevision = await app.inject({
      method: "GET",
      url: `/v1/student/offline/lessons/${lesson.id}/assets/${assetId}?revision=${contentRevision - 1}`,
      headers: { cookie },
    });
    assert.equal(staleRevision.statusCode, 404);

    await db.query("update lessons set status = 'inactive' where id = $1", [lesson.id]);
    const unpublishedManifest = await app.inject({
      method: "GET",
      url: `/v1/student/offline/lessons/${lesson.id}/manifest`,
      headers: { cookie },
    });
    assert.equal(unpublishedManifest.statusCode, 404);
    await db.query("update lessons set status = 'active' where id = $1", [lesson.id]);

    await db.query("update student_devices set revoked_at = now() where id = $1", [deviceId]);
    const revokedDevice = await app.inject({
      method: "GET",
      url: `/v1/student/offline/lessons/${lesson.id}/manifest`,
      headers: { cookie },
    });
    assert.equal(revokedDevice.statusCode, 401);
  } finally {
    await app.close();
    await rm(mediaRoot, { recursive: true, force: true });
  }
});
