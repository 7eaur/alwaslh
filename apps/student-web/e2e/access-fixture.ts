import { createHash } from "node:crypto";
import { AccessService } from "../../api/src/access/service.js";
import { CurriculumService } from "../../api/src/curriculum/service.js";
import { createDatabase } from "../../api/src/db.js";
import { FileSystemMediaStorage } from "../../api/src/media/storage.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Student access fixture");

const [action, targetProfileId] = process.argv.slice(2);
if (action !== "prepare-class-access" || !targetProfileId) {
  throw new Error("usage: access-fixture prepare-class-access <profile-id>");
}

const db = createDatabase(databaseUrl);
const mediaStorage = new FileSystemMediaStorage(process.env.MEDIA_STORAGE_ROOT ?? "./.media-storage");
const readerBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=",
  "base64",
);
const readerChecksum = createHash("sha256").update(readerBytes).digest("hex");

try {
  const actorRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'Stage14 Student access fixture') returning id",
  );
  const actorId = actorRows[0]?.id;
  if (!actorId) throw new Error("failed to create Student access fixture actor");

  await db.query(
    `update student_entitlements
        set expires_at = now() - interval '1 second'
      where profile_id = $1 and scope = 'all_content' and status = 'active'`,
    [targetProfileId],
  );

  const curriculum = new CurriculumService(db);
  const classRecord = await curriculum.createClass(actorId, {
    slug: `stage14-browser-${targetProfileId.slice(0, 8)}`,
    name: "الصف التجريبي لمسار الطالب",
    description: "صف مخصص لاختبار مسار الدراسة الحقيقي للطالب",
    position: 0,
    status: "active",
  });
  const subject = await curriculum.createSubject(actorId, {
    slug: `stage14-physics-${targetProfileId.slice(0, 8)}`,
    name: "الفيزياء",
    description: "مادة تجريبية مرتبة من authority المنهج",
    status: "active",
  });
  await curriculum.createOffering(actorId, {
    classId: classRecord.id,
    subjectId: subject.id,
    position: 0,
    status: "active",
  });
  const section = await curriculum.createSection(actorId, {
    classId: classRecord.id,
    subjectId: subject.id,
    slug: `stage14-motion-${targetProfileId.slice(0, 8)}`,
    title: "الحركة والقوى",
    description: "وحدة منشورة لاختبار ترتيب الدروس",
    position: 1,
    status: "active",
  });
  const introLesson = await curriculum.createLesson(actorId, {
    classId: classRecord.id,
    subjectId: subject.id,
    slug: `stage14-intro-${targetProfileId.slice(0, 8)}`,
    title: "مدخل إلى الفيزياء",
    summary: "مقدمة قصيرة قبل بدء الوحدة.",
    position: 0,
    status: "active",
  });
  const motionLesson = await curriculum.createLesson(actorId, {
    classId: classRecord.id,
    subjectId: subject.id,
    sectionId: section.id,
    slug: `stage14-motion-lesson-${targetProfileId.slice(0, 8)}`,
    title: "القوة والحركة",
    summary: "مفاهيم القوة وتأثيرها في حركة الأجسام.",
    position: 0,
    status: "active",
  });
  const newtonLesson = await curriculum.createLesson(actorId, {
    classId: classRecord.id,
    subjectId: subject.id,
    sectionId: section.id,
    slug: `stage14-newton-${targetProfileId.slice(0, 8)}`,
    title: "قوانين نيوتن",
    summary: "ترتيب القوانين الأساسية بعد درس القوة والحركة.",
    position: 1,
    status: "active",
  });
  await curriculum.createLesson(actorId, {
    classId: classRecord.id,
    subjectId: subject.id,
    sectionId: section.id,
    slug: `stage14-hidden-draft-${targetProfileId.slice(0, 8)}`,
    title: "درس غير منشور يجب ألا يظهر",
    summary: "هذا الدرس fixture سلبي فقط.",
    position: 2,
    status: "active",
  });

  await db.query(
    `update lessons
        set published_at = now() - interval '1 minute'
      where id = any($1::uuid[])`,
    [[introLesson.id, motionLesson.id, newtonLesson.id]],
  );

  const readerStorageKey = `stage14-browser/${targetProfileId}/${crypto.randomUUID()}.png`;
  await mediaStorage.put(readerStorageKey, readerBytes);
  const mediaRows = await db.query<{ id: string }>(
    `insert into media_assets (
       idempotency_key, source_position, source_filename, source_mime_type,
       source_checksum_sha256, source_byte_size, status, attempt_count
     ) values ($1, 0, 'stage14-reader.png', 'image/png', $2, $3, 'ready', 1)
     returning id`,
    [`stage14-browser-reader-${crypto.randomUUID()}`, readerChecksum, readerBytes.byteLength],
  );
  const mediaId = mediaRows[0]?.id;
  if (!mediaId) throw new Error("failed to create Reader media fixture");

  const variantRows = await db.query<{ id: string }>(
    `insert into media_variants (
       media_asset_id, kind, profile_version, storage_key, mime_type,
       byte_size, width, height, checksum_sha256
     ) values ($1, 'display', 'stage14-browser-v1', $2, 'image/png', $3, 1, 1, $4)
     returning id`,
    [mediaId, readerStorageKey, readerBytes.byteLength, readerChecksum],
  );
  const variantId = variantRows[0]?.id;
  if (!variantId) throw new Error("failed to create Reader variant fixture");

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
    [introLesson.id, readerStorageKey, readerBytes.byteLength, readerChecksum, mediaId, actorId],
  );
  const readerAssetId = assetRows[0]?.id;
  if (!readerAssetId) throw new Error("failed to create Reader lesson asset fixture");

  const readerText = "الفيزياء تفسر الحركة والقوة من خلال ملاحظات وتجارب منظمة.";
  const pendingText = "نص قيد المراجعة لا يجوز أن يظهر للطالب";
  await db.query(
    `insert into ocr_extractions (
       input_media_variant_id, input_checksum_sha256, provider_key, provider_version, profile_key,
       status, attempt_count, max_attempts, raw_text, normalized_text, mean_confidence,
       review_status, reviewed_by_profile_id, reviewed_at, idempotency_key, completed_at
     ) values (
       $1, $2, 'stage14-browser-approved', 'v1', 'student-reader', 'completed', 1, 3,
       $3, $3, 99, 'approved', $4, now(), $5, now()
     )`,
    [variantId, readerChecksum, readerText, actorId, `stage14-reader-approved-${crypto.randomUUID()}`],
  );
  await db.query(
    `insert into ocr_extractions (
       input_media_variant_id, input_checksum_sha256, provider_key, provider_version, profile_key,
       status, attempt_count, max_attempts, raw_text, normalized_text, mean_confidence,
       review_status, idempotency_key, completed_at
     ) values (
       $1, $2, 'stage14-browser-pending', 'v1', 'student-reader', 'completed', 1, 3,
       $3, $3, 60, 'pending', $4, now()
     )`,
    [variantId, readerChecksum, pendingText, `stage14-reader-pending-${crypto.randomUUID()}`],
  );

  const access = new AccessService(db);
  const codes = await access.generateClassCodes(actorId, classRecord.id, 1, 30);
  const code = codes[0];
  if (!code) throw new Error("failed to generate Student class code");

  process.stdout.write(
    JSON.stringify({
      code,
      classId: classRecord.id,
      className: classRecord.name,
      subjectName: subject.name,
      sectionTitle: section.title,
      lessonTitles: [introLesson.title, motionLesson.title, newtonLesson.title],
      readerLessonTitle: introLesson.title,
      readerAssetId,
      readerText,
      pendingText,
    }),
  );
} finally {
  await db.close();
}
