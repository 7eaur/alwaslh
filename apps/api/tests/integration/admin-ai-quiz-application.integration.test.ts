import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for G-D quiz application integration tests");
const origin = "http://localhost:5173";

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

async function seedSource(
  db: ReturnType<typeof createDatabase>,
  actorId: string,
  lessonId: string,
  suffix: string,
): Promise<string> {
  const mediaId = (
    await db.query<{ id: string }>(
      `insert into media_assets (
         idempotency_key, source_position, source_filename, source_mime_type,
         source_page_number, source_checksum_sha256, source_byte_size, status
       ) values ($1, 0, $2, 'image/png', 1, $3, 8, 'ready') returning id`,
      [`gd-quiz-media-${suffix}`, `${suffix}.png`, "a".repeat(64)],
    )
  )[0]?.id;
  assert.ok(mediaId);
  const variantId = (
    await db.query<{ id: string }>(
      `insert into media_variants (
         media_asset_id, kind, profile_version, storage_key, mime_type,
         byte_size, width, height, checksum_sha256
       ) values ($1, 'ai', 'gd-v1', $2, 'image/png', 8, 10, 10, $3) returning id`,
      [mediaId, `gd/${suffix}-ai.png`, "b".repeat(64)],
    )
  )[0]?.id;
  assert.ok(variantId);
  await db.query(
    `insert into ocr_extractions (
       input_media_variant_id, input_checksum_sha256, provider_key, provider_version,
       profile_key, status, attempt_count, raw_text, normalized_text, review_status,
       reviewed_by_profile_id, reviewed_at, idempotency_key, completed_at
     ) values ($1, $2, 'fixture-ocr', '1', 'gd', 'completed', 1, $3, $3,
               'approved', $4, now(), $5, now())`,
    [variantId, "b".repeat(64), "مصدر عربي معتمد لنموذج الاختبار", actorId, `gd-quiz-ocr-${suffix}`],
  );
  await db.query(
    `insert into lesson_assets (
       lesson_id, kind, position, storage_key, mime_type, byte_size, media_asset_id,
       publication_status, submitted_for_review_by_profile_id, submitted_for_review_at,
       published_by_profile_id, asset_published_at, source_page_number
     ) values ($1, 'image', 0, $2, 'image/png', 8, $3, 'published', $4, now(), $4, now(), 1)`,
    [lessonId, `gd/${suffix}-lesson.png`, mediaId, actorId],
  );
  return mediaId;
}

test("approved quiz AI output waits for Question Bank publication then materializes once", async () => {
  const suffix = randomUUID().slice(0, 8);
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    MEDIA_STORAGE_ROOT: `/tmp/alwaslh-stage13g-gd-quiz-${suffix}`,
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);
  const adminId = (
    await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('admin', 'مدير تطبيق G-D') returning id",
    )
  )[0]?.id;
  assert.ok(adminId);
  const identifier = `stage13g-gd-quiz-${suffix}`;
  await auth.createCredential(adminId, identifier, "Stage13gGdQuiz123!");
  const classId = (
    await db.query<{ id: string }>(
      "insert into classes (slug, name) values ($1, 'صف تطبيق G-D') returning id",
      [`gd-quiz-class-${suffix}`],
    )
  )[0]?.id;
  const subjectId = (
    await db.query<{ id: string }>(
      "insert into subjects (slug, name) values ($1, 'مادة تطبيق G-D') returning id",
      [`gd-quiz-subject-${suffix}`],
    )
  )[0]?.id;
  assert.ok(classId && subjectId);
  await db.query("insert into subject_class_links (class_id, subject_id) values ($1, $2)", [
    classId,
    subjectId,
  ]);
  const lessonId = (
    await db.query<{ id: string }>(
      `insert into lessons (class_id, subject_id, slug, title, position)
       values ($1, $2, $3, 'درس تطبيق النموذج', 0) returning id`,
      [classId, subjectId, `gd-quiz-lesson-${suffix}`],
    )
  )[0]?.id;
  assert.ok(lessonId);
  const mediaId = await seedSource(db, adminId, lessonId, suffix);

  const app = buildApp({ config, database: db });
  try {
    const login = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { identifier, password: "Stage13gGdQuiz123!" },
    });
    assert.equal(login.statusCode, 200);
    const cookie = cookieFrom(login);
    const quizResponse = await app.inject({
      method: "POST",
      url: "/v1/admin/quizzes",
      headers: { cookie, origin },
      payload: { classId, subjectId, lessonIds: [lessonId], title: "اختبار تطبيق G-D" },
    });
    assert.equal(quizResponse.statusCode, 201);
    const quizId = quizResponse.json().quizId as string;
    const plan = await app.inject({
      method: "POST",
      url: `/v1/admin/quizzes/${quizId}/generate`,
      headers: { cookie, origin },
      payload: {
        mode: "question_generation",
        subjectDomain: "general",
        clientRequestId: randomUUID(),
        versions: [
          {
            key: "a",
            label: "النموذج أ",
            lessonIds: [lessonId],
            shuffleOptions: true,
            target: { multipleChoice: 1, trueFalse: 0, direct: 0 },
          },
        ],
      },
    });
    assert.equal(plan.statusCode, 202);
    const unit = (
      await db.query<{ id: string }>("select id from ai_job_units where job_id = $1", [plan.json().jobId])
    )[0];
    assert.ok(unit);
    await db.query("update ai_job_units set status = 'completed', completed_at = now() where id = $1", [
      unit.id,
    ]);
    const outputId = (
      await db.query<{ id: string }>(
        `insert into ai_outputs (job_unit_id, validation_status, normalized_output)
         values ($1, 'valid', $2::jsonb) returning id`,
        [
          unit.id,
          JSON.stringify({
            kind: "question_set",
            questions: [
              {
                prompt: "ما الفكرة الأساسية في المصدر المعتمد؟",
                type: "multiple_choice",
                options: ["الفكرة الصحيحة", "خيار ثان", "خيار ثالث", "خيار رابع"],
                correctOptionIndex: 0,
                answerText: "الفكرة الصحيحة",
                answerStatus: "known",
                difficulty: "medium",
                explanation: "الإجابة مثبتة في المصدر.",
                method: "قراءة المصدر",
                sourceEvidence: [{ mediaAssetId: mediaId, pageNumber: 1 }],
              },
            ],
          }),
        ],
      )
    )[0]?.id;
    assert.ok(outputId);
    await db.query(
      `insert into ai_output_review_events (ai_output_id, revision, action, actor_profile_id, reviewed_output)
       select id, 1, 'approve', $2, normalized_output from ai_outputs where id = $1`,
      [outputId, adminId],
    );

    const firstApply = await app.inject({
      method: "POST",
      url: `/v1/admin/authoring/outputs/${outputId}/apply-quiz`,
      headers: { cookie, origin },
    });
    assert.equal(firstApply.statusCode, 200);
    assert.equal(firstApply.json().readyForVersion, false);
    assert.equal(firstApply.json().versionId, null);
    assert.equal(firstApply.json().questionBankItemIds.length, 1);
    const itemId = firstApply.json().questionBankItemIds[0] as string;

    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: `/v1/admin/question-bank/${itemId}/submit-review`,
          headers: { cookie, origin },
        })
      ).statusCode,
      204,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: `/v1/admin/question-bank/${itemId}/publish`,
          headers: { cookie, origin },
        })
      ).statusCode,
      204,
    );

    const secondApply = await app.inject({
      method: "POST",
      url: `/v1/admin/authoring/outputs/${outputId}/apply-quiz`,
      headers: { cookie, origin },
    });
    assert.equal(secondApply.statusCode, 200);
    assert.equal(secondApply.json().readyForVersion, true);
    assert.ok(secondApply.json().versionId);
    assert.equal(secondApply.json().versionReplayed, false);
    const versionId = secondApply.json().versionId as string;

    const replay = await app.inject({
      method: "POST",
      url: `/v1/admin/authoring/outputs/${outputId}/apply-quiz`,
      headers: { cookie, origin },
    });
    assert.equal(replay.statusCode, 200);
    assert.equal(replay.json().versionId, versionId);
    assert.equal(replay.json().versionReplayed, true);
    const counts = await db.query<{ versions: string; events: string }>(
      `select
         (select count(*)::text from quiz_versions where quiz_id = $1) as versions,
         (select count(*)::text from quiz_builder_events
          where quiz_id = $1 and action = 'version_add' and note = $2) as events`,
      [quizId, `ai_output:${outputId}:review:1`],
    );
    assert.equal(Number(counts[0]?.versions), 1);
    assert.equal(Number(counts[0]?.events), 1);
  } finally {
    await app.close();
  }
});
