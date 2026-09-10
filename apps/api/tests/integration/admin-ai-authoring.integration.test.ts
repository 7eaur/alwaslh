import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for G-D authoring integration tests");
const origin = "http://localhost:5173";
const mediaRoot = "/tmp/alwaslh-stage13g-gd-media";

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

async function seedLessonMedia(
  db: ReturnType<typeof createDatabase>,
  actorId: string,
  lessonId: string,
  marker: string,
) {
  const mediaRows = await db.query<{ id: string }>(
    `insert into media_assets (
       idempotency_key, source_position, source_filename, source_mime_type,
       source_page_number, source_checksum_sha256, source_byte_size, status
     ) values ($1, 0, $2, 'image/png', 1, $3, 8, 'ready') returning id`,
    [`gd-media-${marker}-${randomUUID()}`, `${marker}.png`, "a".repeat(64)],
  );
  const mediaId = mediaRows[0]?.id;
  assert.ok(mediaId);
  const aiVariantRows = await db.query<{ id: string }>(
    `insert into media_variants (
       media_asset_id, kind, profile_version, storage_key, mime_type, byte_size, width, height, checksum_sha256
     ) values ($1, 'ai', 'gd-v1', $2, 'image/png', 8, 10, 10, $3) returning id`,
    [mediaId, `gd/${marker}-ai.png`, "b".repeat(64)],
  );
  const aiVariantId = aiVariantRows[0]?.id;
  assert.ok(aiVariantId);
  const displayKey = `gd/${marker}-display.png`;
  await db.query(
    `insert into media_variants (
       media_asset_id, kind, profile_version, storage_key, mime_type, byte_size, width, height, checksum_sha256
     ) values ($1, 'display', 'gd-v1', $2, 'image/png', 8, 10, 10, $3)`,
    [mediaId, displayKey, "c".repeat(64)],
  );
  await mkdir(join(mediaRoot, "gd"), { recursive: true });
  await writeFile(join(mediaRoot, displayKey), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  await db.query(
    `insert into ocr_extractions (
       input_media_variant_id, input_checksum_sha256, provider_key, provider_version, profile_key,
       status, attempt_count, raw_text, normalized_text, review_status, reviewed_by_profile_id,
       reviewed_at, idempotency_key, completed_at
     ) values ($1, $2, 'fixture-ocr', '1', 'gd', 'completed', 1, $3, $3, 'approved', $4, now(), $5, now())`,
    [aiVariantId, "b".repeat(64), `نص مصدر موثق ${marker}`, actorId, `gd-ocr-${marker}-${randomUUID()}`],
  );
  const assetRows = await db.query<{ id: string }>(
    `insert into lesson_assets (
       lesson_id, kind, position, storage_key, mime_type, byte_size, media_asset_id,
       publication_status, submitted_for_review_by_profile_id, submitted_for_review_at,
       published_by_profile_id, asset_published_at, source_page_number
     ) values ($1, 'image', 0, $2, 'image/png', 8, $3, 'published', $4, now(), $4, now(), 1)
     returning id`,
    [lessonId, `gd/${marker}-lesson.png`, mediaId, actorId],
  );
  return { mediaId, assetId: assetRows[0]?.id, displayKey };
}

async function completeApprovedOutput(
  db: ReturnType<typeof createDatabase>,
  actorId: string,
  unitId: string,
  output: unknown,
): Promise<string> {
  await db.query("update ai_job_units set status = 'completed', completed_at = now() where id = $1", [unitId]);
  const outputRows = await db.query<{ id: string }>(
    `insert into ai_outputs (job_unit_id, validation_status, normalized_output)
     values ($1, 'valid', $2::jsonb) returning id`,
    [unitId, JSON.stringify(output)],
  );
  const outputId = outputRows[0]?.id;
  assert.ok(outputId);
  await db.query(
    `insert into ai_output_review_events (ai_output_id, revision, action, actor_profile_id, reviewed_output)
     values ($1, 1, 'approve', $2, $3::jsonb)`,
    [outputId, actorId, JSON.stringify(output)],
  );
  return outputId;
}

test("G-D orchestrates lesson/quiz authoring through canonical AI jobs and preserves review/provenance boundaries", async () => {
  await rm(mediaRoot, { recursive: true, force: true });
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    MEDIA_STORAGE_ROOT: mediaRoot,
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);
  const suffix = randomUUID().slice(0, 8);

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير G-D') returning id",
  );
  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب G-D') returning id",
  );
  const adminId = adminRows[0]?.id;
  const studentId = studentRows[0]?.id;
  assert.ok(adminId && studentId);
  const adminIdentifier = `stage13g-gd-admin-${suffix}`;
  await auth.createCredential(adminId, adminIdentifier, "Stage13gGdAdmin123!");
  await auth.createCredential(studentId, `stage13g-gd-student-${suffix}`, "Stage13gGdStudent123!");
  const deviceRows = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'gd-device') returning id`,
    [studentId, "x".repeat(100), "d".repeat(64)],
  );
  const studentSession = await auth.createStudentSession(studentId, deviceRows[0]?.id ?? "", "gd-test");

  const classRows = await db.query<{ id: string }>(
    "insert into classes (slug, name) values ($1, 'صف G-D') returning id",
    [`stage13g-gd-class-${suffix}`],
  );
  const subjectRows = await db.query<{ id: string }>(
    "insert into subjects (slug, name) values ($1, 'مادة G-D') returning id",
    [`stage13g-gd-subject-${suffix}`],
  );
  const classId = classRows[0]?.id;
  const subjectId = subjectRows[0]?.id;
  assert.ok(classId && subjectId);
  await db.query("insert into subject_class_links (class_id, subject_id) values ($1, $2)", [classId, subjectId]);
  const lessonRows = await db.query<{ id: string; title: string }>(
    `insert into lessons (class_id, subject_id, slug, title, position)
     values ($1, $2, $3, 'درس G-D الأول', 0), ($1, $2, $4, 'درس G-D الثاني', 1)
     returning id, title`,
    [classId, subjectId, `gd-l1-${suffix}`, `gd-l2-${suffix}`],
  );
  const lessonOne = lessonRows.find((row) => row.title.includes("الأول"));
  const lessonTwo = lessonRows.find((row) => row.title.includes("الثاني"));
  assert.ok(lessonOne && lessonTwo);
  const mediaOne = await seedLessonMedia(db, adminId, lessonOne.id, `one-${suffix}`);
  const mediaTwo = await seedLessonMedia(db, adminId, lessonTwo.id, `two-${suffix}`);
  assert.ok(mediaOne.assetId && mediaTwo.assetId);

  const app = buildApp({ config, database: db });
  try {
    const login = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { identifier: adminIdentifier, password: "Stage13gGdAdmin123!" },
    });
    assert.equal(login.statusCode, 200);
    const adminCookie = cookieFrom(login);
    const studentCookie = `${config.SESSION_COOKIE_NAME}=${studentSession.token}`;

    const summaryRequestId = randomUUID();
    const summaryPayload = {
      lessonIds: [lessonOne.id, lessonTwo.id],
      mode: "lesson_summary",
      subjectDomain: "general",
      clientRequestId: summaryRequestId,
    };
    const summaryPlan = await app.inject({
      method: "POST",
      url: "/v1/admin/authoring/lessons/generate",
      headers: { cookie: adminCookie, origin },
      payload: summaryPayload,
    });
    assert.equal(summaryPlan.statusCode, 202);
    const summaryJobId = summaryPlan.json().jobId as string;
    assert.equal(summaryPlan.json().totalUnits, 2);
    assert.equal(summaryPlan.json().replayed, false);
    const replay = await app.inject({
      method: "POST",
      url: "/v1/admin/authoring/lessons/generate",
      headers: { cookie: adminCookie, origin },
      payload: summaryPayload,
    });
    assert.equal(replay.statusCode, 200);
    assert.equal(replay.json().jobId, summaryJobId);
    assert.equal(replay.json().replayed, true);

    const summaryUnits = await db.query<{ id: string; unit_key: string; input_payload: any }>(
      "select id, unit_key, input_payload from ai_job_units where job_id = $1 order by position",
      [summaryJobId],
    );
    assert.equal(summaryUnits.length, 2);
    assert.deepEqual(summaryUnits.map((unit) => unit.unit_key), [`lesson:${lessonOne.id}`, `lesson:${lessonTwo.id}`]);
    assert.ok(summaryUnits.every((unit) => unit.input_payload.sourceChunks.length === 1));
    assert.ok(summaryUnits.every((unit) => unit.input_payload.sourceChunks[0].inputKind === "approved_ocr"));

    const firstSummaryUnit = summaryUnits[0];
    assert.ok(firstSummaryUnit);
    const firstSource = firstSummaryUnit.input_payload.sourceChunks[0];
    const summaryOutput = {
      kind: "summary",
      summary: "ملخص G-D المعتمد",
      sourceEvidence: [{ mediaAssetId: firstSource.mediaAssetId, pageNumber: firstSource.pageNumber }],
    };
    const summaryOutputId = await completeApprovedOutput(db, adminId, firstSummaryUnit.id, summaryOutput);
    const applySummary = await app.inject({
      method: "POST",
      url: `/v1/admin/authoring/outputs/${summaryOutputId}/apply-lesson`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(applySummary.statusCode, 200);
    assert.equal(applySummary.json().summaryApplied, true);
    assert.equal(applySummary.json().summaryReplayed, false);
    const applySummaryReplay = await app.inject({
      method: "POST",
      url: `/v1/admin/authoring/outputs/${summaryOutputId}/apply-lesson`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(applySummaryReplay.statusCode, 200);
    assert.equal(applySummaryReplay.json().summaryReplayed, true);
    const lessonState = await db.query<{ summary: string | null; content_revision: string }>(
      "select summary, content_revision::text from lessons where id = $1",
      [lessonOne.id],
    );
    assert.equal(lessonState[0]?.summary, "ملخص G-D المعتمد");
    assert.equal(Number(lessonState[0]?.content_revision), 2);

    const questionPlan = await app.inject({
      method: "POST",
      url: "/v1/admin/authoring/lessons/generate",
      headers: { cookie: adminCookie, origin },
      payload: {
        lessonIds: [lessonOne.id],
        mode: "question_generation",
        subjectDomain: "general",
        target: { multipleChoice: 1, trueFalse: 0, direct: 0 },
        clientRequestId: randomUUID(),
      },
    });
    assert.equal(questionPlan.statusCode, 202);
    const questionUnits = await db.query<{ id: string; input_payload: any }>(
      "select id, input_payload from ai_job_units where job_id = $1",
      [questionPlan.json().jobId],
    );
    const questionUnit = questionUnits[0];
    assert.ok(questionUnit);
    const questionSource = questionUnit.input_payload.sourceChunks[0];
    const questionOutput = {
      kind: "question_set",
      questions: [
        {
          prompt: "=G-D formula-safe prompt",
          type: "multiple_choice",
          options: ["الإجابة الصحيحة", "خيار ٢", "خيار ٣", "خيار ٤"],
          correctOptionIndex: 0,
          answerText: "الإجابة الصحيحة",
          answerStatus: "known",
          difficulty: "medium",
          explanation: "شرح موثق",
          method: "طريقة موثقة",
          sourceEvidence: [{ mediaAssetId: questionSource.mediaAssetId, pageNumber: questionSource.pageNumber }],
        },
      ],
    };
    const questionOutputId = await completeApprovedOutput(db, adminId, questionUnit.id, questionOutput);
    const applyQuestion = await app.inject({
      method: "POST",
      url: `/v1/admin/authoring/outputs/${questionOutputId}/apply-lesson`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(applyQuestion.statusCode, 200);
    assert.equal(applyQuestion.json().questionBankItemIds.length, 1);
    assert.equal(applyQuestion.json().questionImportReplayed, false);
    const questionItemId = applyQuestion.json().questionBankItemIds[0] as string;
    const applyQuestionReplay = await app.inject({
      method: "POST",
      url: `/v1/admin/authoring/outputs/${questionOutputId}/apply-lesson`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(applyQuestionReplay.json().questionImportReplayed, true);

    const submitQuestion = await app.inject({
      method: "POST",
      url: `/v1/admin/question-bank/${questionItemId}/submit-review`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(submitQuestion.statusCode, 204);
    const publishQuestion = await app.inject({
      method: "POST",
      url: `/v1/admin/question-bank/${questionItemId}/publish`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(publishQuestion.statusCode, 204);
    const publishedRevisionRows = await db.query<{ id: string }>(
      "select id from question_bank_revisions where item_id = $1 and status = 'published'",
      [questionItemId],
    );
    const publishedRevisionId = publishedRevisionRows[0]?.id;
    assert.ok(publishedRevisionId);

    const regeneratePlan = await app.inject({
      method: "POST",
      url: `/v1/admin/authoring/question-bank/${questionItemId}/regenerate`,
      headers: { cookie: adminCookie, origin },
      payload: { clientRequestId: randomUUID(), subjectDomain: "general" },
    });
    assert.equal(regeneratePlan.statusCode, 202);
    const regenerateUnits = await db.query<{ input_payload: any }>(
      "select input_payload from ai_job_units where job_id = $1",
      [regeneratePlan.json().jobId],
    );
    assert.equal(regenerateUnits[0]?.input_payload.mode, "regenerate_question");
    assert.equal(regenerateUnits[0]?.input_payload.originalQuestion.prompt, "=G-D formula-safe prompt");

    const createQuiz = await app.inject({
      method: "POST",
      url: "/v1/admin/quizzes",
      headers: { cookie: adminCookie, origin },
      payload: {
        classId,
        subjectId,
        lessonIds: [lessonOne.id, lessonTwo.id],
        title: "اختبار G-D",
        shuffleVersions: true,
      },
    });
    assert.equal(createQuiz.statusCode, 201);
    const quizId = createQuiz.json().quizId as string;
    const quizPlan = await app.inject({
      method: "POST",
      url: `/v1/admin/quizzes/${quizId}/generate`,
      headers: { cookie: adminCookie, origin },
      payload: {
        mode: "question_generation",
        subjectDomain: "general",
        clientRequestId: randomUUID(),
        versions: [
          {
            key: "a",
            label: "النموذج أ",
            lessonIds: [lessonOne.id],
            shuffleOptions: true,
            target: { multipleChoice: 1, trueFalse: 0, direct: 0 },
          },
          {
            key: "b",
            label: "النموذج ب",
            lessonIds: [lessonTwo.id],
            shuffleOptions: false,
            target: { multipleChoice: 0, trueFalse: 1, direct: 0 },
          },
        ],
      },
    });
    assert.equal(quizPlan.statusCode, 202);
    assert.equal(quizPlan.json().totalUnits, 2);
    const quizUnits = await db.query<{ unit_key: string; input_payload: any }>(
      "select unit_key, input_payload from ai_job_units where job_id = $1 order by position",
      [quizPlan.json().jobId],
    );
    assert.deepEqual(quizUnits.map((unit) => unit.unit_key), ["quiz-version:a", "quiz-version:b"]);
    assert.equal(quizUnits[0]?.input_payload.sourceChunks[0].mediaAssetId, mediaOne.mediaId);
    assert.equal(quizUnits[1]?.input_payload.sourceChunks[0].mediaAssetId, mediaTwo.mediaId);

    const addVersion = await app.inject({
      method: "POST",
      url: `/v1/admin/quizzes/${quizId}/versions`,
      headers: { cookie: adminCookie, origin },
      payload: {
        label: "النموذج المنشور",
        shuffleOptions: true,
        questions: [{ questionBankItemId: questionItemId, questionBankRevisionId: publishedRevisionId }],
      },
    });
    assert.equal(addVersion.statusCode, 201);
    const versionId = addVersion.json().versionId as string;
    const submitQuiz = await app.inject({
      method: "POST",
      url: `/v1/admin/quizzes/${quizId}/submit-review`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(submitQuiz.statusCode, 204);

    for (const variant of [
      "questions_options",
      "questions_only",
      "questions_answers",
      "answers_explanations",
      "answer_key",
      "lesson_names",
      "lesson_images",
    ]) {
      const exportResponse = await app.inject({
        method: "GET",
        url: `/v1/admin/quizzes/${quizId}/specialized-export?versionIds=${versionId}&variant=${variant}`,
        headers: { cookie: adminCookie },
      });
      assert.equal(exportResponse.statusCode, 200, variant);
      assert.match(exportResponse.json().csv, /'\=G-D formula-safe prompt/);
      assert.ok(exportResponse.json().printHtml.length > 100);
    }
    const questionsOnly = await app.inject({
      method: "GET",
      url: `/v1/admin/quizzes/${quizId}/specialized-export?versionIds=${versionId}&variant=questions_only`,
      headers: { cookie: adminCookie },
    });
    assert.ok(questionsOnly.json().printHtml.includes("=G-D formula-safe prompt"));
    assert.equal(questionsOnly.json().printHtml.includes("الإجابة الصحيحة"), false);
    const assetResponse = await app.inject({
      method: "GET",
      url: `/v1/admin/quizzes/${quizId}/export-assets/${mediaOne.assetId}`,
      headers: { cookie: adminCookie },
    });
    assert.equal(assetResponse.statusCode, 200);
    assert.equal(assetResponse.headers["content-type"], "image/png");

    const publishQuiz = await app.inject({
      method: "POST",
      url: `/v1/admin/quizzes/${quizId}/publish`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(publishQuiz.statusCode, 204);
    const archiveQuiz = await app.inject({
      method: "POST",
      url: `/v1/admin/quizzes/${quizId}/archive`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(archiveQuiz.statusCode, 204);
    const quizArchiveEvents = await db.query<{ count: string }>(
      "select count(*)::text from quiz_builder_events where quiz_id = $1 and action = 'archive'",
      [quizId],
    );
    assert.equal(Number(quizArchiveEvents[0]?.count), 1);

    const archiveQuestion = await app.inject({
      method: "POST",
      url: `/v1/admin/authoring/question-bank/${questionItemId}/archive`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(archiveQuestion.statusCode, 200);
    assert.equal(archiveQuestion.json().replayed, false);
    const archiveQuestionReplay = await app.inject({
      method: "POST",
      url: `/v1/admin/authoring/question-bank/${questionItemId}/archive`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(archiveQuestionReplay.json().replayed, true);
    const archived = await db.query<{ archived_at: Date | null; event_count: string }>(
      `select i.archived_at,
              (select count(*)::text from question_bank_events e where e.item_id = i.id and e.action = 'archive') as event_count
       from question_bank_items i where i.id = $1`,
      [questionItemId],
    );
    assert.ok(archived[0]?.archived_at);
    assert.equal(Number(archived[0]?.event_count), 1);

    const anonymous = await app.inject({ method: "POST", url: "/v1/admin/authoring/lessons/generate", payload: summaryPayload });
    assert.equal(anonymous.statusCode, 401);
    const studentForbidden = await app.inject({
      method: "POST",
      url: "/v1/admin/authoring/lessons/generate",
      headers: { cookie: studentCookie, origin },
      payload: { ...summaryPayload, clientRequestId: randomUUID() },
    });
    assert.equal(studentForbidden.statusCode, 403);
  } finally {
    await app.close();
    await rm(mediaRoot, { recursive: true, force: true });
  }
});
