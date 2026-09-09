import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { AdminAiOperationsService } from "../../src/ai/admin-operations.js";
import { aiGenerationOutputSchema, aiGenerationRequestSchema } from "../../src/ai/contracts.js";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";
import { AppError } from "../../src/errors.js";
import { QuestionBankService } from "../../src/question-bank/service.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage13F integration tests");

const origin = "http://localhost:5173";
const checksum = "a".repeat(64);

function isAppError(code: AppError["code"]) {
  return (error: unknown): boolean => error instanceof AppError && error.code === code;
}

function cookie(name: string, token: string): string {
  return `${name}=${encodeURIComponent(token)}`;
}

test("Stage13F Question Bank imports approved direct questions idempotently and preserves publish history", async () => {
  const suffix = randomUUID();
  const db = createDatabase(databaseUrl);
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
  });
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);
  const aiOperations = new AdminAiOperationsService(db);
  const questionBank = new QuestionBankService(db);

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير Stage13F') returning id",
  );
  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب Stage13F') returning id",
  );
  const adminId = adminRows[0]?.id;
  const studentId = studentRows[0]?.id;
  assert.ok(adminId && studentId);
  await auth.createCredential(adminId, `stage13f-admin-${suffix}`, "AdminPass123!");

  const classRows = await db.query<{ id: string }>(
    "insert into classes (slug, name) values ($1, 'الصف التجريبي') returning id",
    [`stage13f-class-${suffix}`],
  );
  const subjectRows = await db.query<{ id: string }>(
    "insert into subjects (slug, name) values ($1, 'المادة التجريبية') returning id",
    [`stage13f-subject-${suffix}`],
  );
  const classId = classRows[0]?.id;
  const subjectId = subjectRows[0]?.id;
  assert.ok(classId && subjectId);
  await db.query("insert into subject_class_links (class_id, subject_id) values ($1, $2)", [classId, subjectId]);
  const lessonRows = await db.query<{ id: string }>(
    `insert into lessons (class_id, subject_id, slug, title)
     values ($1, $2, $3, 'درس Stage13F') returning id`,
    [classId, subjectId, `stage13f-lesson-${suffix}`],
  );
  const lessonId = lessonRows[0]?.id;
  assert.ok(lessonId);

  const mediaRows = await db.query<{ id: string }>(
    `insert into media_assets (
       idempotency_key, source_position, source_filename, source_mime_type,
       source_page_number, source_checksum_sha256, source_byte_size, status
     ) values ($1, 0, 'stage13f.png', 'image/png', 1, $2, 128, 'ready') returning id`,
    [`stage13f-media-${suffix}`, checksum],
  );
  const mediaAssetId = mediaRows[0]?.id;
  assert.ok(mediaAssetId);

  const request = aiGenerationRequestSchema.parse({
    mode: "question_generation",
    language: "ar",
    subjectDomain: "general",
    sourceSensitivity: "standard",
    notationPolicy: "preserve_source_exactly",
    sourceChunks: [
      {
        mediaAssetId,
        pageNumber: 1,
        inputChecksumSha256: checksum,
        inputKind: "vision_fallback",
        ocrExtractionId: null,
        approvedText: null,
        ocrReviewStatus: null,
        contentSourceAssetId: null,
      },
    ],
    target: { multipleChoice: 0, trueFalse: 0, direct: 1 },
  });
  const approvedOutput = aiGenerationOutputSchema.parse({
    kind: "question_set",
    questions: [
      {
        prompt: "ما المقصود بالمفهوم الموضح في المصدر؟",
        type: "direct",
        options: [],
        correctOptionIndex: null,
        answerText: "هو المفهوم التعليمي المعتمد في المصدر",
        answerStatus: "known",
        difficulty: "easy",
        explanation: "الإجابة مثبتة في المادة التعليمية التي راجعها المدير.",
        method: null,
        sourceEvidence: [{ mediaAssetId, pageNumber: 1, quote: "المفهوم التعليمي" }],
      },
    ],
  });

  const jobRows = await db.query<{ id: string }>(
    `insert into ai_jobs (
       created_by_profile_id, job_type, status, prompt_key, prompt_version,
       total_units, completed_units, idempotency_key, started_at, completed_at
     ) values ($1, 'question_generation', 'completed', 'stage13f-question-generation', '1',
               1, 1, $2, now(), now()) returning id`,
    [adminId, `stage13f-job-${suffix}`],
  );
  const jobId = jobRows[0]?.id;
  assert.ok(jobId);
  const unitRows = await db.query<{ id: string }>(
    `insert into ai_job_units (
       job_id, unit_key, position, status, input_payload, attempt_count, max_attempts,
       started_at, completed_at
     ) values ($1, 'direct-unit', 0, 'review_required', $2::jsonb, 1, 4, now(), now()) returning id`,
    [jobId, JSON.stringify(request)],
  );
  const unitId = unitRows[0]?.id;
  assert.ok(unitId);
  const outputRows = await db.query<{ id: string }>(
    `insert into ai_outputs (
       job_unit_id, validation_status, normalized_output, validation_errors, semantic_warnings
     ) values ($1, 'review_required', $2::jsonb, '[]'::jsonb, '[]'::jsonb) returning id`,
    [unitId, JSON.stringify(approvedOutput)],
  );
  const outputId = outputRows[0]?.id;
  assert.ok(outputId);

  await assert.rejects(
    () =>
      questionBank.importApprovedAiOutput(adminId, {
        outputId,
        classId,
        subjectId,
        lessonIds: [lessonId],
      }),
    isAppError("CONFLICT"),
  );

  const reviewed = await aiOperations.reviewOutput(adminId, outputId, { action: "approve" });
  assert.equal(reviewed.reviewStatus, "approved");

  const concurrent = await Promise.all([
    questionBank.importApprovedAiOutput(adminId, {
      outputId,
      classId,
      subjectId,
      lessonIds: [lessonId],
    }),
    questionBank.importApprovedAiOutput(adminId, {
      outputId,
      classId,
      subjectId,
      lessonIds: [lessonId],
    }),
  ]);
  assert.deepEqual(
    concurrent.map((result) => result.replayed).sort(),
    [false, true],
  );
  assert.equal(concurrent[0]?.imports.length, 1);
  assert.equal(concurrent[1]?.imports.length, 1);
  const imported = concurrent[0]?.imports[0] ?? concurrent[1]?.imports[0];
  assert.ok(imported);

  const importCountRows = await db.query<{ count: string }>(
    "select count(*) from question_bank_ai_imports where ai_output_id = $1",
    [outputId],
  );
  assert.equal(Number(importCountRows[0]?.count ?? 0), 1);
  const directRows = await db.query<{
    type: string;
    answer_text: string | null;
    answer_status: string;
    status: string;
  }>(
    `select type::text, answer_text, answer_status::text, status::text
     from question_bank_revisions where item_id = $1`,
    [imported.itemId],
  );
  assert.equal(directRows.length, 1);
  assert.equal(directRows[0]?.type, "direct");
  assert.equal(directRows[0]?.answer_text, approvedOutput.kind === "question_set" ? approvedOutput.questions[0]?.answerText : null);
  assert.equal(directRows[0]?.status, "draft");

  const sourceRows = await db.query<{
    media_asset_id: string;
    page_number: number;
    input_checksum_sha256: string;
  }>(
    `select media_asset_id, page_number, input_checksum_sha256
     from question_bank_revision_sources where revision_id = $1`,
    [imported.revisionId],
  );
  assert.equal(sourceRows.length, 1);
  assert.equal(sourceRows[0]?.media_asset_id, mediaAssetId);
  assert.equal(sourceRows[0]?.page_number, 1);
  assert.equal(sourceRows[0]?.input_checksum_sha256, checksum);

  await questionBank.submitForReview(adminId, imported.itemId);
  await questionBank.publish(adminId, imported.itemId);
  let detail = await questionBank.itemDetail(imported.itemId);
  assert.equal(detail.item.currentRevision?.status, "published");
  assert.equal(detail.revisions[0]?.question.type, "direct");

  const editedPrompt = "ما تعريف المفهوم التعليمي بعد المراجعة الجديدة؟";
  await questionBank.editItem(adminId, imported.itemId, {
    ...detail.revisions[0]!.question,
    prompt: editedPrompt,
  });
  const beforeReplacementPublish = await db.query<{ status: string; prompt: string }>(
    `select status::text, prompt from question_bank_revisions
     where item_id = $1 order by revision_number`,
    [imported.itemId],
  );
  assert.deepEqual(
    beforeReplacementPublish.map((row) => row.status),
    ["published", "draft"],
  );
  assert.equal(beforeReplacementPublish[1]?.prompt, editedPrompt);

  await questionBank.submitForReview(adminId, imported.itemId);
  await questionBank.publish(adminId, imported.itemId);
  const afterReplacementPublish = await db.query<{ revision_number: number; status: string }>(
    `select revision_number, status::text from question_bank_revisions
     where item_id = $1 order by revision_number`,
    [imported.itemId],
  );
  assert.deepEqual(
    afterReplacementPublish.map((row) => row.status),
    ["archived", "published"],
  );

  const uncertain = await questionBank.createManual(adminId, {
    classId,
    subjectId,
    lessonIds: [lessonId],
    question: {
      prompt: "سؤال مباشر يحتاج حسم الإجابة قبل النشر",
      type: "direct",
      options: [],
      correctOptionIndex: null,
      answerText: null,
      answerStatus: "review_required",
      difficulty: "medium",
      explanation: null,
      method: null,
    },
  });
  await questionBank.submitForReview(adminId, uncertain.itemId);
  await assert.rejects(() => questionBank.publish(adminId, uncertain.itemId), isAppError("CONFLICT"));
  await questionBank.rejectReview(adminId, uncertain.itemId, "الإجابة تحتاج تدقيقًا بشريًا");

  await assert.rejects(
    () =>
      questionBank.createManual(adminId, {
        classId,
        subjectId,
        lessonIds: [randomUUID()],
        question: {
          prompt: "سؤال بسياق منهجي غير صالح",
          type: "direct",
          options: [],
          correctOptionIndex: null,
          answerText: "إجابة",
          answerStatus: "known",
          difficulty: "easy",
          explanation: "شرح",
          method: null,
        },
      }),
    isAppError("BAD_REQUEST"),
  );

  const deviceRows = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'stage13f-test') returning id`,
    [studentId, `stage13f-public-key-${"x".repeat(100)}`, "d".repeat(64)],
  );
  const deviceId = deviceRows[0]?.id;
  assert.ok(deviceId);
  const adminSession = await auth.login(`stage13f-admin-${suffix}`, "AdminPass123!");
  const studentSession = await auth.createStudentSession(studentId, deviceId);
  const adminCookie = cookie(config.SESSION_COOKIE_NAME, adminSession.token);
  const studentCookie = cookie(config.SESSION_COOKIE_NAME, studentSession.token);
  const app = buildApp({ config, database: db });

  const anonymous = await app.inject({ method: "GET", url: "/v1/admin/question-bank" });
  assert.equal(anonymous.statusCode, 401);
  const forbidden = await app.inject({
    method: "GET",
    url: "/v1/admin/question-bank",
    headers: { cookie: studentCookie },
  });
  assert.equal(forbidden.statusCode, 403);
  const unsafeOffset = await app.inject({
    method: "GET",
    url: "/v1/admin/question-bank?offset=9007199254740992",
    headers: { cookie: adminCookie },
  });
  assert.equal(unsafeOffset.statusCode, 400);
  const listResponse = await app.inject({
    method: "GET",
    url: `/v1/admin/question-bank?classId=${classId}&subjectId=${subjectId}`,
    headers: { cookie: adminCookie },
  });
  assert.equal(listResponse.statusCode, 200);
  const listBody = listResponse.json<{ items: Array<{ id: string }>; pagination: { total: number } }>();
  assert.ok(listBody.items.some((item) => item.id === imported.itemId));
  assert.ok(listBody.pagination.total >= 2);

  const invalidDirect = await app.inject({
    method: "POST",
    url: "/v1/admin/question-bank/manual",
    headers: { cookie: adminCookie, origin },
    payload: {
      classId,
      subjectId,
      lessonIds: [lessonId],
      question: {
        prompt: "سؤال مباشر بخيارات غير مسموحة",
        type: "direct",
        options: ["خيار"],
        correctOptionIndex: null,
        answerText: "إجابة",
        answerStatus: "known",
        difficulty: "easy",
        explanation: null,
        method: null,
      },
    },
  });
  assert.equal(invalidDirect.statusCode, 400);

  await app.close();
});
