import { createHash } from "node:crypto";
import { hashToken } from "../../api/src/auth/crypto.js";
import { loadConfig } from "../../api/src/config.js";
import { CurriculumService } from "../../api/src/curriculum/service.js";
import { createDatabase } from "../../api/src/db.js";
import { FileSystemMediaStorage } from "../../api/src/media/storage.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Student Reader browser fixture");

const config = loadConfig(process.env);
const db = createDatabase(databaseUrl);
const storage = new FileSystemMediaStorage(config.MEDIA_STORAGE_ROOT);
const imageBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=",
  "base64",
);
const imageChecksum = createHash("sha256").update(imageBytes).digest("hex");

try {
  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'Stage14 Reader browser fixture') returning id",
  );
  const adminId = adminRows[0]?.id;
  if (!adminId) throw new Error("failed to create Reader browser Admin fixture");

  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب قارئ Stage14') returning id",
  );
  const studentId = studentRows[0]?.id;
  if (!studentId) throw new Error("failed to create Reader browser Student fixture");

  const deviceMaterial = `stage14-reader-browser-${crypto.randomUUID()}`;
  const deviceRows = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'Stage14 Reader browser device')
     returning id`,
    [studentId, `fixture-${deviceMaterial}`.padEnd(96, "x"), hashToken(deviceMaterial)],
  );
  const deviceId = deviceRows[0]?.id;
  if (!deviceId) throw new Error("failed to create Reader browser device");

  const sessionToken = `stage14-reader-session-${crypto.randomUUID()}-${crypto.randomUUID()}`;
  await db.query(
    `insert into auth_sessions (profile_id, token_hash_sha256, device_id, expires_at)
     values ($1, $2, $3, now() + interval '1 hour')`,
    [studentId, hashToken(sessionToken), deviceId],
  );

  const curriculum = new CurriculumService(db);
  const classRecord = await curriculum.createClass(adminId, {
    slug: `stage14-reader-class-${crypto.randomUUID()}`,
    name: "صف القارئ التجريبي",
    description: "صف مخصص لاختبار Reader الحقيقي",
    position: 0,
    status: "active",
  });
  const subject = await curriculum.createSubject(adminId, {
    slug: `stage14-reader-subject-${crypto.randomUUID()}`,
    name: "العلوم التجريبية",
    description: "مادة Reader للاختبار",
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
    title: "قراءة الحركة والقوة",
    summary: "درس منشور للتحقق من تجربة القراءة.",
    position: 0,
    status: "active",
  });
  await db.query("update lessons set published_at = now() - interval '1 minute' where id = $1", [lesson.id]);
  await db.query(
    `insert into student_entitlements (profile_id, scope, class_id, source, starts_at, expires_at)
     values ($1, 'class', $2, 'admin', now() - interval '1 day', now() + interval '30 days')`,
    [studentId, classRecord.id],
  );

  const storageKey = `stage14-reader-browser/${studentId}/${crypto.randomUUID()}.png`;
  await storage.put(storageKey, imageBytes);
  const mediaRows = await db.query<{ id: string }>(
    `insert into media_assets (
       idempotency_key, source_position, source_filename, source_mime_type,
       source_checksum_sha256, source_byte_size, status, attempt_count
     ) values ($1, 0, 'reader-page.png', 'image/png', $2, $3, 'ready', 1)
     returning id`,
    [`stage14-reader-browser-${crypto.randomUUID()}`, imageChecksum, imageBytes.byteLength],
  );
  const mediaId = mediaRows[0]?.id;
  if (!mediaId) throw new Error("failed to create Reader browser media");

  const variantRows = await db.query<{ id: string }>(
    `insert into media_variants (
       media_asset_id, kind, profile_version, storage_key, mime_type,
       byte_size, width, height, checksum_sha256
     ) values ($1, 'display', 'stage14-browser-v1', $2, 'image/png', $3, 1, 1, $4)
     returning id`,
    [mediaId, storageKey, imageBytes.byteLength, imageChecksum],
  );
  const variantId = variantRows[0]?.id;
  if (!variantId) throw new Error("failed to create Reader browser variant");

  const assetRows = await db.query<{ id: string }>(
    `insert into lesson_assets (
       lesson_id, kind, position, storage_key, mime_type, byte_size, width, height,
       checksum_sha256, source_page_number, media_asset_id, publication_status,
       submitted_for_review_by_profile_id, submitted_for_review_at,
       published_by_profile_id, asset_published_at
     ) values (
       $1, 'image', 0, $2, 'image/png', $3, 1, 1, $4, 1, $5, 'published',
       $6, now() - interval '2 minutes', $6, now() - interval '1 minute'
     ) returning id`,
    [lesson.id, storageKey, imageBytes.byteLength, imageChecksum, mediaId, adminId],
  );
  const assetId = assetRows[0]?.id;
  if (!assetId) throw new Error("failed to create Reader browser lesson asset");

  const approvedText = "الحركة تتغير عندما تؤثر قوة محصلة في الجسم وفق الملاحظة والتجربة.";
  const pendingText = "نص داخلي قيد المراجعة لا يجوز عرضه للطالب";
  await db.query(
    `insert into ocr_extractions (
       input_media_variant_id, input_checksum_sha256, provider_key, provider_version, profile_key,
       status, attempt_count, max_attempts, raw_text, normalized_text, mean_confidence,
       review_status, reviewed_by_profile_id, reviewed_at, idempotency_key, completed_at
     ) values (
       $1, $2, 'stage14-browser-approved', 'v1', 'student-reader', 'completed', 1, 3,
       $3, $3, 99, 'approved', $4, now(), $5, now()
     )`,
    [variantId, imageChecksum, approvedText, adminId, `stage14-reader-approved-${crypto.randomUUID()}`],
  );
  await db.query(
    `insert into ocr_extractions (
       input_media_variant_id, input_checksum_sha256, provider_key, provider_version, profile_key,
       status, attempt_count, max_attempts, raw_text, normalized_text, mean_confidence,
       review_status, idempotency_key, completed_at
     ) values (
       $1, $2, 'stage14-browser-pending', 'v1', 'student-reader', 'completed', 1, 3,
       $3, $3, 50, 'pending', $4, now()
     )`,
    [variantId, imageChecksum, pendingText, `stage14-reader-pending-${crypto.randomUUID()}`],
  );

  process.stdout.write(
    JSON.stringify({
      sessionCookieName: config.SESSION_COOKIE_NAME,
      sessionToken,
      className: classRecord.name,
      subjectName: subject.name,
      lessonTitle: lesson.title,
      assetId,
      approvedText,
      pendingText,
    }),
  );
} finally {
  await db.close();
}
