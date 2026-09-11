import assert from "node:assert/strict";
import { createDatabase } from "../../src/db.js";
import { QuestionBankService } from "../../src/question-bank/service.js";
import { QuizBuilderService } from "../../src/quiz-builder/service.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage13G G-D E2E seed");

const adminIdentifier = process.env.STAGE13G_ADMIN_IDENTIFIER ?? "stage13g-admin-ui";
const db = createDatabase(databaseUrl);
const questionBank = new QuestionBankService(db);
const quizzes = new QuizBuilderService(db);

async function seedLessonSource(adminId: string, lessonId: string, marker: string): Promise<string> {
  const mediaId = (
    await db.query<{ id: string }>(
      `insert into media_assets (
         idempotency_key, source_position, source_filename, source_mime_type,
         source_page_number, source_checksum_sha256, source_byte_size, status
       ) values ($1, 0, $2, 'image/png', 1, $3, 8, 'ready') returning id`,
      [`stage13g-authoring-media-${marker}`, `${marker}.png`, "a".repeat(64)],
    )
  )[0]?.id;
  assert.ok(mediaId);

  const aiVariantId = (
    await db.query<{ id: string }>(
      `insert into media_variants (
         media_asset_id, kind, profile_version, storage_key, mime_type,
         byte_size, width, height, checksum_sha256
       ) values ($1, 'ai', 'stage13g-gd-v1', $2, 'image/png', 8, 10, 10, $3)
       returning id`,
      [mediaId, `stage13g-authoring/${marker}-ai.png`, "b".repeat(64)],
    )
  )[0]?.id;
  assert.ok(aiVariantId);

  await db.query(
    `insert into ocr_extractions (
       input_media_variant_id, input_checksum_sha256, provider_key, provider_version,
       profile_key, status, attempt_count, raw_text, normalized_text, review_status,
       reviewed_by_profile_id, reviewed_at, idempotency_key, completed_at
     ) values ($1, $2, 'fixture-ocr', '1', 'stage13g-gd', 'completed', 1, $3, $3,
               'approved', $4, now(), $5, now())`,
    [
      aiVariantId,
      "b".repeat(64),
      `نص عربي معتمد لمصدر ${marker}`,
      adminId,
      `stage13g-authoring-ocr-${marker}`,
    ],
  );

  await db.query(
    `insert into lesson_assets (
       lesson_id, kind, position, storage_key, mime_type, byte_size, media_asset_id,
       publication_status, submitted_for_review_by_profile_id, submitted_for_review_at,
       published_by_profile_id, asset_published_at, source_page_number
     ) values ($1, 'image', 0, $2, 'image/png', 8, $3, 'published', $4, now(), $4, now(), 1)`,
    [lessonId, `stage13g-authoring/${marker}-lesson.png`, mediaId, adminId],
  );

  return mediaId;
}

try {
  const adminId = (
    await db.query<{ id: string }>(
      `select p.id
       from profiles p
       join auth_credentials c on c.profile_id = p.id
       where p.role = 'admin' and c.normalized_identifier = lower(btrim($1))
       limit 1`,
      [adminIdentifier],
    )
  )[0]?.id;
  assert.ok(adminId, `Admin fixture ${adminIdentifier} must exist before G-D seed`);

  const classId = (
    await db.query<{ id: string }>(
      `insert into classes (slug, name, position)
       values ('stage13g-ai-authoring-class', 'صف التوليد G-D', 20)
       returning id`,
    )
  )[0]?.id;
  const subjectId = (
    await db.query<{ id: string }>(
      `insert into subjects (slug, name)
       values ('stage13g-ai-authoring-subject', 'مادة التوليد G-D')
       returning id`,
    )
  )[0]?.id;
  assert.ok(classId && subjectId);
  await db.query("insert into subject_class_links (class_id, subject_id) values ($1, $2)", [
    classId,
    subjectId,
  ]);

  const lessonRows = await db.query<{ id: string; title: string }>(
    `insert into lessons (class_id, subject_id, slug, title, position)
     values
       ($1, $2, 'stage13g-ai-authoring-lesson-one', 'درس التوليد الأول', 0),
       ($1, $2, 'stage13g-ai-authoring-lesson-two', 'درس التوليد الثاني', 1)
     returning id, title`,
    [classId, subjectId],
  );
  const lessonOne = lessonRows.find((lesson) => lesson.title === "درس التوليد الأول");
  const lessonTwo = lessonRows.find((lesson) => lesson.title === "درس التوليد الثاني");
  assert.ok(lessonOne && lessonTwo);
  await seedLessonSource(adminId, lessonOne.id, "lesson-one");
  await seedLessonSource(adminId, lessonTwo.id, "lesson-two");

  const publishedQuestion = await questionBank.createManual(adminId, {
    classId,
    subjectId,
    lessonIds: [lessonOne.id],
    question: {
      prompt: "ما الفكرة الأساسية في درس التوليد الأول؟",
      type: "multiple_choice",
      options: ["الفكرة الصحيحة", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
      correctOptionIndex: 0,
      answerText: "الفكرة الصحيحة",
      answerStatus: "known",
      difficulty: "medium",
      explanation: "سؤال ثابت لاختبار واجهة التصدير.",
      method: "مراجعة المحتوى",
    },
  });
  await questionBank.submitForReview(adminId, publishedQuestion.itemId);
  await questionBank.publish(adminId, publishedQuestion.itemId);

  const authoringQuiz = await quizzes.create(adminId, {
    classId,
    subjectId,
    lessonIds: [lessonOne.id, lessonTwo.id],
    title: "اختبار التوليد G-D",
  });

  const exportQuiz = await quizzes.create(adminId, {
    classId,
    subjectId,
    lessonIds: [lessonOne.id],
    title: "اختبار التصدير G-D",
  });
  const exportVersion = await quizzes.addVersion(adminId, exportQuiz.quizId, {
    label: "النموذج المنشور للتصدير",
    shuffleOptions: true,
    questions: [
      {
        questionBankItemId: publishedQuestion.itemId,
        questionBankRevisionId: publishedQuestion.revisionId,
      },
    ],
  });
  await quizzes.submitForReview(adminId, exportQuiz.quizId);

  console.log(
    JSON.stringify({
      classId,
      subjectId,
      lessonIds: [lessonOne.id, lessonTwo.id],
      authoringQuizId: authoringQuiz.quizId,
      exportQuizId: exportQuiz.quizId,
      exportVersionId: exportVersion.versionId,
      publishedQuestionItemId: publishedQuestion.itemId,
    }),
  );
} finally {
  await db.close();
}
