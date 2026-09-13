import assert from "node:assert/strict";
import { AdminAiOperationsService } from "../../src/ai/admin-operations.js";
import { aiGenerationOutputSchema, aiGenerationRequestSchema } from "../../src/ai/contracts.js";
import { createDatabase } from "../../src/db.js";
import { type QuestionBankQuestionInput, QuestionBankService } from "../../src/question-bank/service.js";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for Stage13F browser seed`);
  return value;
}

const databaseUrl = requiredEnv("DATABASE_URL");
const adminIdentifier = process.env.STAGE13F_ADMIN_IDENTIFIER ?? "stage13f-admin-ui";
const outputId = process.env.STAGE13F_E2E_OUTPUT_ID ?? "13000000-0000-4000-8000-000000000004";
const regenerationOutputId =
  process.env.STAGE13F_E2E_REGEN_OUTPUT_ID ?? "13000000-0000-4000-8000-000000000007";
const mediaAssetId = "13000000-0000-4000-8000-000000000001";
const jobId = "13000000-0000-4000-8000-000000000002";
const unitId = "13000000-0000-4000-8000-000000000003";
const regenerationJobId = "13000000-0000-4000-8000-000000000005";
const regenerationUnitId = "13000000-0000-4000-8000-000000000006";
const checksum = "e".repeat(64);

function directQuestion(prompt: string, answer: string): QuestionBankQuestionInput {
  return {
    prompt,
    type: "direct",
    options: [],
    correctOptionIndex: null,
    answerText: answer,
    answerStatus: "known",
    difficulty: "medium",
    explanation: "شرح مثبت للاختبار المتكامل لبنك الأسئلة.",
    method: null,
  };
}

async function main() {
  const db = createDatabase(databaseUrl);
  try {
    const adminRows = await db.query<{ id: string }>(
      `select p.id
       from profiles p
       join auth_credentials c on c.profile_id = p.id
       where p.role = 'admin' and p.status = 'active' and c.normalized_identifier = $1
       limit 1`,
      [adminIdentifier],
    );
    const adminId = adminRows[0]?.id;
    assert.ok(adminId, "Stage13F E2E Admin must exist before seeding");

    const classRows = await db.query<{ id: string }>(
      `insert into classes (slug, name, status)
       values ('stage13f-e2e-grade', 'الصف التجريبي لبنك الأسئلة', 'active')
       returning id`,
    );
    const subjectRows = await db.query<{ id: string }>(
      `insert into subjects (slug, name, status)
       values ('stage13f-e2e-science', 'العلوم التجريبية', 'active')
       returning id`,
    );
    const classId = classRows[0]?.id;
    const subjectId = subjectRows[0]?.id;
    assert.ok(classId && subjectId);
    await db.query(
      `insert into subject_class_links (class_id, subject_id, position, status)
       values ($1, $2, 0, 'active')`,
      [classId, subjectId],
    );
    const lessonRows = await db.query<{ id: string }>(
      `insert into lessons (class_id, subject_id, slug, title, status)
       values ($1, $2, 'stage13f-e2e-energy', 'درس الطاقة التجريبي', 'active')
       returning id`,
      [classId, subjectId],
    );
    const lessonId = lessonRows[0]?.id;
    assert.ok(lessonId);

    const questionBank = new QuestionBankService(db);
    const scope = { classId, subjectId, lessonIds: [lessonId] };

    // Create the oldest marker first so pagination must reach the second page.
    await questionBank.createManual(adminId, {
      ...scope,
      question: directQuestion("سؤال الصفحة الثانية في بنك الأسئلة", "إجابة الصفحة الثانية"),
    });

    let regenerationItemId: string | null = null;
    for (let index = 1; index <= 30; index += 1) {
      const created = await questionBank.createManual(adminId, {
        ...scope,
        question: directQuestion(`سؤال تجريبي رقم ${index} لملء الصفحة الأولى`, `إجابة تجريبية ${index}`),
      });
      if (index === 30) {
        regenerationItemId = created.itemId;
        await questionBank.submitForReview(adminId, created.itemId);
        await questionBank.publish(adminId, created.itemId);
      }
    }
    assert.ok(regenerationItemId);

    const reviewItem = await questionBank.createManual(adminId, {
      ...scope,
      question: {
        prompt: "أي الخيارات يمثل وحدة قياس الطاقة؟",
        type: "multiple_choice",
        options: ["الجول", "المتر", "الثانية", "الأمبير"],
        correctOptionIndex: 0,
        answerText: "الجول",
        answerStatus: "known",
        difficulty: "easy",
        explanation: "الجول هو وحدة قياس الطاقة في النظام الدولي.",
        method: null,
      },
    });
    await questionBank.submitForReview(adminId, reviewItem.itemId);

    const publishedItem = await questionBank.createManual(adminId, {
      ...scope,
      question: directQuestion("ما تعريف الطاقة في هذا الاختبار؟", "القدرة على بذل شغل"),
    });
    await questionBank.submitForReview(adminId, publishedItem.itemId);
    await questionBank.publish(adminId, publishedItem.itemId);

    await db.query(
      `insert into media_assets (
         id, idempotency_key, source_position, source_filename, source_mime_type,
         source_page_number, source_checksum_sha256, source_byte_size, status
       ) values ($1, 'stage13f-e2e-media-source', 0, 'stage13f-energy.png', 'image/png',
                 1, $2, 256, 'ready')`,
      [mediaAssetId, checksum],
    );

    const regenerationRevisionRows = await db.query<{ id: string }>(
      `select id
       from question_bank_revisions
       where item_id = $1 and status = 'published'
       limit 1`,
      [regenerationItemId],
    );
    const regenerationPublishedRevisionId = regenerationRevisionRows[0]?.id;
    assert.ok(regenerationPublishedRevisionId);
    await db.query(
      `insert into question_bank_revision_sources (
         revision_id, position, media_asset_id, page_number, input_checksum_sha256, source_quote
       ) values ($1, 0, $2, 1, $3, 'إجابة تجريبية 30')`,
      [regenerationPublishedRevisionId, mediaAssetId, checksum],
    );

    const sourceChunk = {
      mediaAssetId,
      pageNumber: 1,
      inputChecksumSha256: checksum,
      inputKind: "vision_fallback" as const,
      ocrExtractionId: null,
      approvedText: null,
      ocrReviewStatus: null,
      contentSourceAssetId: null,
    };

    const request = aiGenerationRequestSchema.parse({
      mode: "question_generation",
      language: "ar",
      subjectDomain: "general",
      sourceSensitivity: "standard",
      notationPolicy: "preserve_source_exactly",
      sourceChunks: [sourceChunk],
      target: { multipleChoice: 0, trueFalse: 0, direct: 1 },
    });
    const approvedOutput = aiGenerationOutputSchema.parse({
      kind: "question_set",
      questions: [
        {
          prompt: "ما التحول الرئيس للطاقة الموضح في المصدر؟",
          type: "direct",
          options: [],
          correctOptionIndex: null,
          answerText: "تحول الطاقة من صورة إلى أخرى مع بقاء المجموع محفوظًا",
          answerStatus: "known",
          difficulty: "medium",
          explanation: "المخرج التجريبي معتمد بشريًا قبل دخوله بنك الأسئلة.",
          method: null,
          sourceEvidence: [{ mediaAssetId, pageNumber: 1, quote: "تحول الطاقة" }],
        },
      ],
    });

    await db.query(
      `insert into ai_jobs (
         id, created_by_profile_id, job_type, status, prompt_key, prompt_version,
         total_units, completed_units, idempotency_key, started_at, completed_at
       ) values ($1, $2, 'stage13f_e2e_question_generation', 'completed',
                 'stage13f-question-generation', '1', 1, 1,
                 'stage13f-e2e-approved-output', now(), now())`,
      [jobId, adminId],
    );
    await db.query(
      `insert into ai_job_units (
         id, job_id, unit_key, position, status, input_payload, attempt_count, max_attempts,
         started_at, completed_at
       ) values ($1, $2, 'stage13f-e2e-unit', 0, 'review_required', $3::jsonb, 1, 4, now(), now())`,
      [unitId, jobId, JSON.stringify(request)],
    );
    await db.query(
      `insert into ai_outputs (
         id, job_unit_id, validation_status, normalized_output, validation_errors, semantic_warnings
       ) values ($1, $2, 'review_required', $3::jsonb, '[]'::jsonb, '[]'::jsonb)`,
      [outputId, unitId, JSON.stringify(approvedOutput)],
    );

    const regenerationRequest = aiGenerationRequestSchema.parse({
      mode: "regenerate_question",
      language: "ar",
      subjectDomain: "general",
      sourceSensitivity: "standard",
      notationPolicy: "preserve_source_exactly",
      sourceChunks: [sourceChunk],
      originalQuestion: {
        prompt: "سؤال تجريبي رقم 30 لملء الصفحة الأولى",
        type: "direct",
        difficulty: "medium",
      },
    });
    const regenerationOutput = aiGenerationOutputSchema.parse({
      kind: "question_set",
      questions: [
        {
          prompt: "كيف يمكن صياغة السؤال التجريبي رقم 30 بصورة بديلة؟",
          type: "direct",
          options: [],
          correctOptionIndex: null,
          answerText: "إجابة تجريبية 30",
          answerStatus: "known",
          difficulty: "medium",
          explanation: "صياغة بديلة مثبتة لنفس المصدر.",
          method: null,
          sourceEvidence: [{ mediaAssetId, pageNumber: 1, quote: "إجابة تجريبية 30" }],
        },
      ],
    });
    await db.query(
      `insert into ai_jobs (
         id, created_by_profile_id, job_type, status, prompt_key, prompt_version,
         total_units, completed_units, idempotency_key, started_at, completed_at
       ) values ($1, $2, 'regenerate_question', 'completed', 'question.regenerate', '1.0.0',
                 1, 1, 'stage13f-e2e-approved-regeneration', now(), now())`,
      [regenerationJobId, adminId],
    );
    await db.query(
      `insert into ai_job_units (
         id, job_id, unit_key, position, status, input_payload, attempt_count, max_attempts,
         started_at, completed_at
       ) values ($1, $2, 'stage13f-e2e-regeneration-unit', 0, 'review_required', $3::jsonb, 1, 4, now(), now())`,
      [regenerationUnitId, regenerationJobId, JSON.stringify(regenerationRequest)],
    );
    await db.query(
      `insert into ai_outputs (
         id, job_unit_id, validation_status, normalized_output, validation_errors, semantic_warnings
       ) values ($1, $2, 'review_required', $3::jsonb, '[]'::jsonb, '[]'::jsonb)`,
      [regenerationOutputId, regenerationUnitId, JSON.stringify(regenerationOutput)],
    );

    const aiOperations = new AdminAiOperationsService(db);
    const reviewed = await aiOperations.reviewOutput(adminId, outputId, {
      action: "approve",
      note: "اعتماد fixture Stage13F للاستيراد الحقيقي",
    });
    assert.equal(reviewed.reviewStatus, "approved");
    const reviewedRegeneration = await aiOperations.reviewOutput(adminId, regenerationOutputId, {
      action: "approve",
      note: "اعتماد fixture Stage13F لإعادة التوليد من المسار الجديد",
    });
    assert.equal(reviewedRegeneration.reviewStatus, "approved");

    console.log(
      JSON.stringify({
        classId,
        subjectId,
        lessonId,
        outputId,
        regenerationOutputId,
        regenerationItemId,
        reviewItemId: reviewItem.itemId,
        publishedItemId: publishedItem.itemId,
      }),
    );
  } finally {
    await db.close();
  }
}

await main();
