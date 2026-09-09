import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { AdminAiOperationsService } from "../../src/ai/admin-operations.js";
import { aiGenerationOutputSchema, aiGenerationRequestSchema } from "../../src/ai/contracts.js";
import { createDatabase } from "../../src/db.js";
import { QuestionBankRegenerationService } from "../../src/question-bank/regeneration.js";
import { QuestionBankService } from "../../src/question-bank/service.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage13F regeneration integration tests");

const checksum = "e".repeat(64);

function databaseErrorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

test("Stage13F regeneration creates an approved draft revision under the same stable Question Bank item", async () => {
  const suffix = randomUUID();
  const db = createDatabase(databaseUrl);
  const aiOperations = new AdminAiOperationsService(db);
  const questionBank = new QuestionBankService(db);
  const regeneration = new QuestionBankRegenerationService(db);

  try {
    const adminRows = await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('admin', 'مدير إعادة التوليد') returning id",
    );
    const adminId = adminRows[0]?.id;
    assert.ok(adminId);

    const classRows = await db.query<{ id: string }>(
      "insert into classes (slug, name) values ($1, 'صف إعادة التوليد') returning id",
      [`stage13f-regen-class-${suffix}`],
    );
    const subjectRows = await db.query<{ id: string }>(
      "insert into subjects (slug, name) values ($1, 'مادة إعادة التوليد') returning id",
      [`stage13f-regen-subject-${suffix}`],
    );
    const classId = classRows[0]?.id;
    const subjectId = subjectRows[0]?.id;
    assert.ok(classId && subjectId);
    await db.query("insert into subject_class_links (class_id, subject_id) values ($1, $2)", [classId, subjectId]);
    const lessonRows = await db.query<{ id: string }>(
      `insert into lessons (class_id, subject_id, slug, title)
       values ($1, $2, $3, 'درس إعادة التوليد') returning id`,
      [classId, subjectId, `stage13f-regen-lesson-${suffix}`],
    );
    const lessonId = lessonRows[0]?.id;
    assert.ok(lessonId);

    const mediaRows = await db.query<{ id: string }>(
      `insert into media_assets (
         idempotency_key, source_position, source_filename, source_mime_type,
         source_page_number, source_checksum_sha256, source_byte_size, status
       ) values ($1, 0, 'regeneration.png', 'image/png', 1, $2, 128, 'ready') returning id`,
      [`stage13f-regen-media-${suffix}`, checksum],
    );
    const mediaAssetId = mediaRows[0]?.id;
    assert.ok(mediaAssetId);

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

    async function persistOutput(input: {
      jobType: "question_generation" | "regenerate_question";
      promptKey: string;
      request: unknown;
      output: unknown;
    }): Promise<string> {
      const jobs = await db.query<{ id: string }>(
        `insert into ai_jobs (
           created_by_profile_id, job_type, status, prompt_key, prompt_version,
           total_units, completed_units, idempotency_key, started_at, completed_at
         ) values ($1, $2, 'completed', $3, '1.0.0', 1, 1, $4, now(), now()) returning id`,
        [adminId, input.jobType, input.promptKey, `stage13f-regen-job-${randomUUID()}`],
      );
      const jobId = jobs[0]?.id;
      assert.ok(jobId);
      const units = await db.query<{ id: string }>(
        `insert into ai_job_units (
           job_id, unit_key, position, status, input_payload, attempt_count, max_attempts,
           started_at, completed_at
         ) values ($1, 'question', 0, 'review_required', $2::jsonb, 1, 4, now(), now()) returning id`,
        [jobId, JSON.stringify(input.request)],
      );
      const unitId = units[0]?.id;
      assert.ok(unitId);
      const outputs = await db.query<{ id: string }>(
        `insert into ai_outputs (
           job_unit_id, validation_status, normalized_output, validation_errors, semantic_warnings
         ) values ($1, 'review_required', $2::jsonb, '[]'::jsonb, '[]'::jsonb) returning id`,
        [unitId, JSON.stringify(input.output)],
      );
      const outputId = outputs[0]?.id;
      assert.ok(outputId);
      await aiOperations.reviewOutput(adminId, outputId, { action: "approve" });
      return outputId;
    }

    const initialRequest = aiGenerationRequestSchema.parse({
      mode: "question_generation",
      language: "ar",
      subjectDomain: "general",
      sourceSensitivity: "standard",
      notationPolicy: "preserve_source_exactly",
      sourceChunks: [sourceChunk],
      target: { multipleChoice: 0, trueFalse: 0, direct: 1 },
    });
    const initialOutput = aiGenerationOutputSchema.parse({
      kind: "question_set",
      questions: [
        {
          prompt: "ما تعريف الطاقة في المصدر؟",
          type: "direct",
          options: [],
          correctOptionIndex: null,
          answerText: "القدرة على بذل شغل",
          answerStatus: "known",
          difficulty: "medium",
          explanation: "تعريف مثبت في المصدر.",
          method: null,
          sourceEvidence: [{ mediaAssetId, pageNumber: 1, quote: "الطاقة هي القدرة على بذل شغل" }],
        },
      ],
    });
    const initialOutputId = await persistOutput({
      jobType: "question_generation",
      promptKey: "questions.generate",
      request: initialRequest,
      output: initialOutput,
    });
    const initialImport = await questionBank.importApprovedAiOutput(adminId, {
      outputId: initialOutputId,
      classId,
      subjectId,
      lessonIds: [lessonId],
    });
    const initial = initialImport.imports[0];
    assert.ok(initial);
    await questionBank.submitForReview(adminId, initial.itemId);
    await questionBank.publish(adminId, initial.itemId);

    const regenerateRequest = aiGenerationRequestSchema.parse({
      mode: "regenerate_question",
      language: "ar",
      subjectDomain: "general",
      sourceSensitivity: "standard",
      notationPolicy: "preserve_source_exactly",
      sourceChunks: [sourceChunk],
      originalQuestion: {
        prompt: "ما تعريف الطاقة في المصدر؟",
        type: "direct",
        difficulty: "medium",
      },
    });
    const regeneratedOutput = aiGenerationOutputSchema.parse({
      kind: "question_set",
      questions: [
        {
          prompt: "كيف يعرّف المصدر مفهوم الطاقة؟",
          type: "direct",
          options: [],
          correctOptionIndex: null,
          answerText: "القدرة على بذل شغل",
          answerStatus: "known",
          difficulty: "medium",
          explanation: "صياغة بديلة لنفس المفهوم والمصدر.",
          method: null,
          sourceEvidence: [{ mediaAssetId, pageNumber: 1, quote: "الطاقة هي القدرة على بذل شغل" }],
        },
      ],
    });
    const regenerateOutputId = await persistOutput({
      jobType: "regenerate_question",
      promptKey: "question.regenerate",
      request: regenerateRequest,
      output: regeneratedOutput,
    });

    const first = await regeneration.applyApprovedOutput(adminId, initial.itemId, regenerateOutputId);
    assert.equal(first.itemId, initial.itemId);
    assert.equal(first.replayed, false);
    const replay = await regeneration.applyApprovedOutput(adminId, initial.itemId, regenerateOutputId);
    assert.equal(replay.itemId, initial.itemId);
    assert.equal(replay.revisionId, first.revisionId);
    assert.equal(replay.replayed, true);

    const revisions = await db.query<{ revision_number: number; status: string; prompt: string }>(
      `select revision_number, status::text, prompt
       from question_bank_revisions
       where item_id = $1
       order by revision_number`,
      [initial.itemId],
    );
    assert.deepEqual(
      revisions.map((revision) => revision.revision_number),
      [1, 2],
    );
    assert.deepEqual(
      revisions.map((revision) => revision.status),
      ["published", "draft"],
    );
    assert.equal(revisions[1]?.prompt, "كيف يعرّف المصدر مفهوم الطاقة؟");

    const regenerationImports = await db.query<{ item_id: string; revision_id: string; generation_mode: string }>(
      `select item_id, revision_id, generation_mode
       from question_bank_ai_imports
       where ai_output_id = $1`,
      [regenerateOutputId],
    );
    assert.equal(regenerationImports.length, 1);
    assert.equal(regenerationImports[0]?.item_id, initial.itemId);
    assert.equal(regenerationImports[0]?.revision_id, first.revisionId);
    assert.equal(regenerationImports[0]?.generation_mode, "regenerate_question");

    await questionBank.submitForReview(adminId, initial.itemId);
    await questionBank.publish(adminId, initial.itemId);

    const secondRegenerationOutput = aiGenerationOutputSchema.parse({
      kind: "question_set",
      questions: [
        {
          prompt: "بأي عبارة أخرى يمكن تعريف الطاقة وفق المصدر؟",
          type: "direct",
          options: [],
          correctOptionIndex: null,
          answerText: "القدرة على بذل شغل",
          answerStatus: "known",
          difficulty: "medium",
          explanation: "صياغة ثالثة لنفس الحقيقة.",
          method: null,
          sourceEvidence: [{ mediaAssetId, pageNumber: 1, quote: "الطاقة هي القدرة على بذل شغل" }],
        },
      ],
    });
    const currentRegenerateRequest = aiGenerationRequestSchema.parse({
      ...regenerateRequest,
      originalQuestion: {
        prompt: "كيف يعرّف المصدر مفهوم الطاقة؟",
        type: "direct",
        difficulty: "medium",
      },
    });
    const secondOutputId = await persistOutput({
      jobType: "regenerate_question",
      promptKey: "question.regenerate",
      request: currentRegenerateRequest,
      output: secondRegenerationOutput,
    });

    await assert.rejects(
      () =>
        questionBank.importApprovedAiOutput(adminId, {
          outputId: secondOutputId,
          classId,
          subjectId,
          lessonIds: [lessonId],
        }),
      (error: unknown) => databaseErrorCode(error) === "23514",
    );
    const forbiddenStandaloneImports = await db.query<{ count: string }>(
      "select count(*) from question_bank_ai_imports where ai_output_id = $1",
      [secondOutputId],
    );
    assert.equal(Number(forbiddenStandaloneImports[0]?.count ?? 0), 0);
  } finally {
    await db.close();
  }
});
