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
if (!databaseUrl) throw new Error("DATABASE_URL is required for Student Reader integration tests");

const origin = "http://127.0.0.1:5174";
const pngBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=",
  "base64",
);
const pngChecksum = createHash("sha256").update(pngBytes).digest("hex");

type TestDatabase = ReturnType<typeof createDatabase>;

async function createStudentDevice(db: TestDatabase, profileId: string): Promise<string> {
  const keyMaterial = `stage14-reader-device-${crypto.randomUUID()}`;
  const rows = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'Stage14 Reader integration fixture')
     returning id`,
    [profileId, `fixture-${keyMaterial}`.padEnd(96, "x"), hashToken(keyMaterial)],
  );
  const id = rows[0]?.id;
  assert.ok(id);
  return id;
}

async function sessionCookie(
  db: TestDatabase,
  cookieName: string,
  profileId: string,
  deviceId: string | null = null,
): Promise<string> {
  const token = `stage14-reader-${crypto.randomUUID()}-${crypto.randomUUID()}`;
  await db.query(
    `insert into auth_sessions (profile_id, token_hash_sha256, device_id, expires_at)
     values ($1, $2, $3, now() + interval '1 hour')`,
    [profileId, hashToken(token), deviceId],
  );
  return `${cookieName}=${encodeURIComponent(token)}`;
}

async function createMediaFixture(
  db: TestDatabase,
  input: { status: "ready" | "failed"; position: number; storageKey: string },
): Promise<{ mediaId: string; variantId: string }> {
  const mediaRows = await db.query<{ id: string }>(
    `insert into media_assets (
       idempotency_key, source_position, source_filename, source_mime_type,
       source_checksum_sha256, source_byte_size, status, attempt_count
     ) values ($1, $2, $3, 'image/png', $4, $5, $6, 1)
     returning id`,
    [
      `stage14-reader-${crypto.randomUUID()}`,
      input.position,
      `reader-${input.position}.png`,
      pngChecksum,
      pngBytes.byteLength,
      input.status,
    ],
  );
  const mediaId = mediaRows[0]?.id;
  assert.ok(mediaId);
  const variantRows = await db.query<{ id: string }>(
    `insert into media_variants (
       media_asset_id, kind, profile_version, storage_key, mime_type,
       byte_size, width, height, checksum_sha256
     ) values ($1, 'display', 'stage14-reader-v1', $2, 'image/png', $3, 1, 1, $4)
     returning id`,
    [mediaId, input.storageKey, pngBytes.byteLength, pngChecksum],
  );
  const variantId = variantRows[0]?.id;
  assert.ok(variantId);
  return { mediaId, variantId };
}

test("Student Reader enforces entitlement, publication, ready media and safe OCR", async () => {
  const mediaRoot = await mkdtemp(join(tmpdir(), "alwaslh-stage14-reader-"));
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

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'Stage14 Reader fixture') returning id",
  );
  const adminId = adminRows[0]?.id;
  assert.ok(adminId);

  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب Reader مخول') returning id",
  );
  const studentId = studentRows[0]?.id;
  assert.ok(studentId);

  const expiredRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب Reader منتهي') returning id",
  );
  const expiredStudentId = expiredRows[0]?.id;
  assert.ok(expiredStudentId);

  const curriculum = new CurriculumService(db);
  const classRecord = await curriculum.createClass(adminId, {
    slug: `stage14-reader-${crypto.randomUUID()}`,
    name: "صف Reader التجريبي",
    position: 0,
    status: "active",
  });
  const subject = await curriculum.createSubject(adminId, {
    slug: `stage14-reader-subject-${crypto.randomUUID()}`,
    name: "مادة Reader التجريبية",
    status: "active",
  });
  await curriculum.createOffering(adminId, {
    classId: classRecord.id,
    subjectId: subject.id,
    position: 0,
    status: "active",
  });
  const lesson = await curriculum.createLesson(adminId, {
    classId: classRecord.id,
    subjectId: subject.id,
    slug: `stage14-reader-lesson-${crypto.randomUUID()}`,
    title: "درس Reader المنشور",
    summary: "ملخص آمن للدرس المنشور",
    position: 0,
    status: "active",
  });
  const draftLesson = await curriculum.createLesson(adminId, {
    classId: classRecord.id,
    subjectId: subject.id,
    slug: `stage14-reader-draft-${crypto.randomUUID()}`,
    title: "درس Reader غير المنشور",
    position: 1,
    status: "active",
  });
  await db.query("update lessons set published_at = now() - interval '1 minute' where id = $1", [lesson.id]);

  await db.query(
    `insert into student_entitlements (profile_id, scope, class_id, source, starts_at, expires_at)
     values ($1, 'class', $2, 'admin', now() - interval '1 day', now() + interval '30 days')`,
    [studentId, classRecord.id],
  );
  await db.query(
    `insert into student_entitlements (profile_id, scope, class_id, source, starts_at, expires_at)
     values ($1, 'class', $2, 'admin', now() - interval '30 days', now() - interval '1 day')`,
    [expiredStudentId, classRecord.id],
  );

  const visibleKey = `stage14-reader/${crypto.randomUUID()}/visible.png`;
  const draftKey = `stage14-reader/${crypto.randomUUID()}/draft.png`;
  const failedKey = `stage14-reader/${crypto.randomUUID()}/failed.png`;
  await storage.put(visibleKey, pngBytes);

  const visibleMedia = await createMediaFixture(db, { status: "ready", position: 0, storageKey: visibleKey });
  const draftMedia = await createMediaFixture(db, { status: "ready", position: 1, storageKey: draftKey });
  const failedMedia = await createMediaFixture(db, { status: "failed", position: 2, storageKey: failedKey });

  const visibleAssetRows = await db.query<{ id: string }>(
    `insert into lesson_assets (
       lesson_id, kind, position, storage_key, mime_type, byte_size, width, height,
       checksum_sha256, media_asset_id, publication_status,
       submitted_for_review_by_profile_id, submitted_for_review_at,
       published_by_profile_id, asset_published_at
     ) values (
       $1, 'image', 0, $2, 'image/png', $3, 1, 1, $4, $5, 'published',
       $6, now() - interval '2 minutes', $6, now() - interval '1 minute'
     ) returning id`,
    [lesson.id, visibleKey, pngBytes.byteLength, pngChecksum, visibleMedia.mediaId, adminId],
  );
  const visibleAssetId = visibleAssetRows[0]?.id;
  assert.ok(visibleAssetId);

  await db.query(
    `insert into lesson_assets (
       lesson_id, kind, position, storage_key, mime_type, byte_size, width, height,
       checksum_sha256, media_asset_id, publication_status
     ) values ($1, 'image', 1, $2, 'image/png', $3, 1, 1, $4, $5, 'draft')`,
    [lesson.id, draftKey, pngBytes.byteLength, pngChecksum, draftMedia.mediaId],
  );
  await db.query(
    `insert into lesson_assets (
       lesson_id, kind, position, storage_key, mime_type, byte_size, width, height,
       checksum_sha256, media_asset_id, publication_status,
       submitted_for_review_by_profile_id, submitted_for_review_at,
       published_by_profile_id, asset_published_at
     ) values (
       $1, 'image', 2, $2, 'image/png', $3, 1, 1, $4, $5, 'published',
       $6, now() - interval '2 minutes', $6, now() - interval '1 minute'
     )`,
    [lesson.id, failedKey, pngBytes.byteLength, pngChecksum, failedMedia.mediaId, adminId],
  );

  await db.query(
    `insert into ocr_extractions (
       input_media_variant_id, input_checksum_sha256, provider_key, provider_version, profile_key,
       status, attempt_count, max_attempts, raw_text, normalized_text, mean_confidence,
       review_status, reviewed_by_profile_id, reviewed_at, idempotency_key, completed_at
     ) values (
       $1, $2, 'stage14-approved', 'v1', 'reader', 'completed', 1, 3,
       'نص خام معتمد', 'نص معتمد للطالب', 99, 'approved', $3, now(), $4, now()
     )`,
    [visibleMedia.variantId, pngChecksum, adminId, `stage14-approved-${crypto.randomUUID()}`],
  );
  await db.query(
    `insert into ocr_extractions (
       input_media_variant_id, input_checksum_sha256, provider_key, provider_version, profile_key,
       status, attempt_count, max_attempts, raw_text, normalized_text, mean_confidence,
       review_status, idempotency_key, completed_at
     ) values (
       $1, $2, 'stage14-pending', 'v1', 'reader', 'completed', 1, 3,
       'نص خام قيد المراجعة', 'نص قيد المراجعة يجب ألا يظهر', 50, 'pending', $3, now()
     )`,
    [visibleMedia.variantId, pngChecksum, `stage14-pending-${crypto.randomUUID()}`],
  );

  const studentDeviceId = await createStudentDevice(db, studentId);
  const expiredDeviceId = await createStudentDevice(db, expiredStudentId);
  const studentCookie = await sessionCookie(db, config.SESSION_COOKIE_NAME, studentId, studentDeviceId);
  const expiredCookie = await sessionCookie(
    db,
    config.SESSION_COOKIE_NAME,
    expiredStudentId,
    expiredDeviceId,
  );
  const adminCookie = await sessionCookie(db, config.SESSION_COOKIE_NAME, adminId);
  const app = buildApp({ config, database: db });

  try {
    const unauthenticated = await app.inject({
      method: "GET",
      url: `/v1/student/lessons/${lesson.id}/reader`,
    });
    assert.equal(unauthenticated.statusCode, 401);

    const adminRejected = await app.inject({
      method: "GET",
      url: `/v1/student/lessons/${lesson.id}/reader`,
      headers: { cookie: adminCookie },
    });
    assert.equal(adminRejected.statusCode, 403);

    const expiredRejected = await app.inject({
      method: "GET",
      url: `/v1/student/lessons/${lesson.id}/reader`,
      headers: { cookie: expiredCookie },
    });
    assert.equal(expiredRejected.statusCode, 404);

    const draftRejected = await app.inject({
      method: "GET",
      url: `/v1/student/lessons/${draftLesson.id}/reader`,
      headers: { cookie: studentCookie },
    });
    assert.equal(draftRejected.statusCode, 404);

    const readerResponse = await app.inject({
      method: "GET",
      url: `/v1/student/lessons/${lesson.id}/reader`,
      headers: { cookie: studentCookie },
    });
    assert.equal(readerResponse.statusCode, 200);
    const payload = readerResponse.json() as {
      reader: {
        lesson: { id: string; title: string; summary: string | null };
        assets: Array<{ id: string; text: string | null; mimeType: string }>;
      };
    };
    assert.equal(payload.reader.lesson.id, lesson.id);
    assert.equal(payload.reader.lesson.title, lesson.title);
    assert.equal(payload.reader.lesson.summary, lesson.summary);
    assert.deepEqual(
      payload.reader.assets.map((asset) => asset.id),
      [visibleAssetId],
    );
    assert.equal(payload.reader.assets[0]?.text, "نص معتمد للطالب");
    assert.equal(JSON.stringify(payload).includes("storage_key"), false);
    assert.equal(JSON.stringify(payload).includes(visibleKey), false);
    assert.equal(JSON.stringify(payload).includes("نص قيد المراجعة يجب ألا يظهر"), false);

    const contentResponse = await app.inject({
      method: "GET",
      url: `/v1/student/lesson-assets/${visibleAssetId}/content`,
      headers: { cookie: studentCookie },
    });
    assert.equal(contentResponse.statusCode, 200);
    assert.equal(contentResponse.headers["content-type"], "image/png");
    assert.equal(contentResponse.headers["cache-control"], "private, no-store");
    assert.equal(contentResponse.headers["x-content-type-options"], "nosniff");
    assert.equal(contentResponse.rawPayload.equals(pngBytes), true);

    const expiredContent = await app.inject({
      method: "GET",
      url: `/v1/student/lesson-assets/${visibleAssetId}/content`,
      headers: { cookie: expiredCookie },
    });
    assert.equal(expiredContent.statusCode, 404);

    await storage.put(visibleKey, Buffer.from("corrupt"));
    const corruptContent = await app.inject({
      method: "GET",
      url: `/v1/student/lesson-assets/${visibleAssetId}/content`,
      headers: { cookie: studentCookie },
    });
    assert.equal(corruptContent.statusCode, 503);
  } finally {
    await db.query("delete from student_entitlements where profile_id = any($1::uuid[])", [
      [studentId, expiredStudentId],
    ]);
    await db.query("delete from lessons where id = any($1::uuid[])", [[lesson.id, draftLesson.id]]);
    await db.query("delete from media_assets where id = any($1::uuid[])", [
      [visibleMedia.mediaId, draftMedia.mediaId, failedMedia.mediaId],
    ]);
    await db.query("delete from subject_class_links where class_id = $1 and subject_id = $2", [
      classRecord.id,
      subject.id,
    ]);
    await db.query("delete from classes where id = $1", [classRecord.id]);
    await db.query("delete from subjects where id = $1", [subject.id]);
    await db.query("delete from profiles where id = any($1::uuid[])", [
      [adminId, studentId, expiredStudentId],
    ]);
    await app.close();
    await rm(mediaRoot, { recursive: true, force: true });
  }
});
