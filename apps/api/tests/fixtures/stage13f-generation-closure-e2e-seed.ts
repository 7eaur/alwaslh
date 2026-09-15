import assert from "node:assert/strict";
import { AdminAiOperationsService } from "../../src/ai/admin-operations.js";
import { aiGenerationOutputSchema, aiGenerationRequestSchema } from "../../src/ai/contracts.js";
import { createDatabase } from "../../src/db.js";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for the Stage13F generation-closure seed`);
  return value;
}

const databaseUrl = requiredEnv("DATABASE_URL");
const adminIdentifier = process.env.STAGE13F_ADMIN_IDENTIFIER ?? "stage13f-admin-ui";
const jobId = "13000000-0000-4000-8000-000000000008";
const unitId = "13000000-0000-4000-8000-000000000009";
const outputId = "13000000-0000-4000-8000-000000000010";
const mediaAssetId = "13000000-0000-4000-8000-000000000001";
const checksum = "e".repeat(64);

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

const output = aiGenerationOutputSchema.parse({
  kind: "question_set",
  questions: [
    {
      prompt: "ما الفكرة التي يثبتها مصدر إغلاق مسار التوليد؟",
      type: "direct",
      options: [],
      correctOptionIndex: null,
      answerText: "تحول الطاقة من صورة إلى أخرى مع بقاء مجموعها محفوظًا",
      answerStatus: "known",
      difficulty: "medium",
      explanation: "سؤال fixture مخصص لإثبات رحلة التوليد المعتمدة حتى بنك الأسئلة.",
      method: null,
      sourceEvidence: [{ mediaAssetId, pageNumber: 1, quote: "تحول الطاقة" }],
    },
  ],
});

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
  assert.ok(adminId, "Stage13F E2E Admin must exist before generation-closure seeding");

  const lessonRows = await db.query<{ id: string }>(
    "select id from lessons where slug = 'stage13f-e2e-energy' limit 1",
  );
  const lessonId = lessonRows[0]?.id;
  assert.ok(lessonId, "Stage13F question-bank lesson must exist before generation-closure seeding");

  const mediaRows = await db.query<{ id: string }>("select id from media_assets where id = $1", [mediaAssetId]);
  assert.equal(mediaRows.length, 1, "Stage13F source media must exist before generation-closure seeding");

  await db.query(
    `insert into ai_jobs (
       id, created_by_profile_id, job_type, status, prompt_key, prompt_version,
       total_units, completed_units, idempotency_key, started_at, completed_at
     ) values ($1, $2, 'stage13f_e2e_generation_closure', 'completed',
               'stage13f-generation-closure', '1', 1, 1,
               'stage13f-e2e-generation-closure', now(), now())`,
    [jobId, adminId],
  );
  await db.query(
    `insert into ai_job_units (
       id, job_id, unit_key, position, status, input_payload, attempt_count, max_attempts,
       started_at, completed_at
     ) values ($1, $2, $3, 0, 'review_required', $4::jsonb, 1, 4, now(), now())`,
    [unitId, jobId, `lesson:${lessonId}`, JSON.stringify(request)],
  );
  await db.query(
    `insert into ai_outputs (
       id, job_unit_id, validation_status, normalized_output, validation_errors, semantic_warnings
     ) values ($1, $2, 'review_required', $3::jsonb, '[]'::jsonb, '[]'::jsonb)`,
    [outputId, unitId, JSON.stringify(output)],
  );

  const operations = new AdminAiOperationsService(db);
  const reviewed = await operations.reviewOutput(adminId, outputId, {
    action: "approve",
    note: "اعتماد fixture إغلاق رحلة التوليد حتى بنك الأسئلة",
  });
  assert.equal(reviewed.reviewStatus, "approved");

  const importRows = await db.query<{ count: string }>(
    "select count(*)::text as count from question_bank_ai_imports where ai_output_id = $1",
    [outputId],
  );
  assert.equal(importRows[0]?.count, "0", "Generation-closure output must remain unapplied before Chromium");

  console.log(JSON.stringify({ jobId, unitId, outputId, lessonId, mediaAssetId }));
} finally {
  await db.close();
}
