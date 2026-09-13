import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  type AiGenerationOutput,
  type AiGenerationRequest,
  aiGenerationOutputSchema,
  aiGenerationRequestSchema,
} from "../../src/ai/contracts.js";
import { createDatabase, type QueryExecutor } from "../../src/db.js";
import { AI_GOLDEN_FIXTURES } from "./ai-golden.js";

const databaseUrl = process.env.DATABASE_URL;
const happyJobType = process.env.STAGE13E_E2E_JOB_TYPE?.trim();
const raceJobType = process.env.STAGE13E_E2E_RACE_JOB_TYPE?.trim();
const paginationJobType = process.env.STAGE13E_E2E_PAGINATION_JOB_TYPE?.trim();
const adminIdentifier = process.env.STAGE13E_ADMIN_IDENTIFIER?.trim().toLowerCase();

if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage13E E2E fixture seeding");
if (!happyJobType) throw new Error("STAGE13E_E2E_JOB_TYPE is required for Stage13E E2E fixture seeding");
if (!raceJobType) throw new Error("STAGE13E_E2E_RACE_JOB_TYPE is required for Stage13E E2E fixture seeding");
if (!paginationJobType) {
  throw new Error("STAGE13E_E2E_PAGINATION_JOB_TYPE is required for Stage13E E2E fixture seeding");
}
if (!adminIdentifier) {
  throw new Error("STAGE13E_ADMIN_IDENTIFIER is required for Stage13E E2E review-history seeding");
}
if (new Set([happyJobType, raceJobType, paginationJobType]).size !== 3) {
  throw new Error("Stage13E happy, race and pagination fixture job types must be different");
}

const fixture = AI_GOLDEN_FIXTURES.find((candidate) => candidate.id === "science-mcq-valid-formula-digits");
if (!fixture) throw new Error("Stage13E E2E golden fixture is missing");
const request = fixture.request;
const output = aiGenerationOutputSchema.parse(fixture.output);

const applicationMediaAssetId = randomUUID();
const applicationOcrExtractionId = randomUUID();
const applicationApprovedText = "هذا نص مرجعي معتمد لدرس التطبيق المباشر من شاشة المراجعة.";
const applicationSummary = "ملخص درس معتمد عبر مراجعات AI";
const applicationRequest = aiGenerationRequestSchema.parse({
  language: "ar",
  subjectDomain: "general",
  sourceSensitivity: "standard",
  notationPolicy: "arabic_visible_numerals",
  sourceChunks: [
    {
      mediaAssetId: applicationMediaAssetId,
      pageNumber: 1,
      inputChecksumSha256: "c".repeat(64),
      inputKind: "approved_ocr",
      ocrExtractionId: applicationOcrExtractionId,
      approvedText: applicationApprovedText,
      ocrReviewStatus: "approved",
      contentSourceAssetId: null,
    },
  ],
  mode: "lesson_summary",
  lessonTitle: "درس تطبيق نتيجة AI",
});
const applicationOutput = aiGenerationOutputSchema.parse({
  kind: "summary",
  summary: applicationSummary,
  sourceEvidence: [
    {
      mediaAssetId: applicationMediaAssetId,
      pageNumber: 1,
      ocrExtractionId: applicationOcrExtractionId,
      quote: applicationApprovedText,
    },
  ],
});

async function insertJob(
  tx: QueryExecutor,
  jobType: string,
  status: "queued" | "completed",
  totalUnits: number,
  completedUnits: number,
  createdAt = new Date(),
): Promise<string> {
  const rows = await tx.query<{ id: string }>(
    `insert into ai_jobs (
       job_type, status, prompt_key, prompt_version, requested_model,
       priority, total_units, completed_units, failed_units, idempotency_key,
       started_at, completed_at, created_at, updated_at
     ) values (
       $1, $2::ai_job_status, 'stage13e-e2e', '1', 'provider-neutral',
       5, $3, $4, 0, $5,
       case when $2 = 'completed' then $6::timestamptz else null end,
       case when $2 = 'completed' then $6::timestamptz else null end,
       $6::timestamptz, $6::timestamptz
     ) returning id`,
    [jobType, status, totalUnits, completedUnits, `stage13e-e2e-${randomUUID()}`, createdAt],
  );
  const id = rows[0]?.id;
  assert.ok(id);
  return id;
}

async function insertUnit(
  tx: QueryExecutor,
  jobId: string,
  unitKey: string,
  position: number,
  status: "queued" | "review_required",
  inputPayload: AiGenerationRequest = request,
): Promise<string> {
  const rows = await tx.query<{ id: string }>(
    `insert into ai_job_units (
       job_id, unit_key, position, status, input_payload, attempt_count, max_attempts,
       started_at, completed_at
     ) values (
       $1, $2, $3, $4::ai_unit_status, $5::jsonb,
       case when $4 = 'review_required' then 1 else 0 end,
       4,
       case when $4 = 'review_required' then now() else null end,
       case when $4 = 'review_required' then now() else null end
     ) returning id`,
    [jobId, unitKey, position, status, JSON.stringify(inputPayload)],
  );
  const id = rows[0]?.id;
  assert.ok(id);
  return id;
}

async function insertQueuedUnits(
  tx: QueryExecutor,
  jobId: string,
  unitKeyPrefix: string,
  firstPosition: number,
  lastPosition: number,
): Promise<void> {
  await tx.query(
    `insert into ai_job_units (
       job_id, unit_key, position, status, input_payload, attempt_count, max_attempts
     )
     select $1, $2 || '-' || series.position::text, series.position,
            'queued'::ai_unit_status, $3::jsonb, 0, 4
     from generate_series($4::integer, $5::integer) as series(position)`,
    [jobId, unitKeyPrefix, JSON.stringify(request), firstPosition, lastPosition],
  );
}

async function insertOutput(
  tx: QueryExecutor,
  unitId: string,
  outputPayload: AiGenerationOutput = output,
): Promise<string> {
  const rows = await tx.query<{ id: string }>(
    `insert into ai_outputs (
       job_unit_id, validation_status, raw_response, normalized_output,
       validation_errors, semantic_warnings
     ) values (
       $1, 'valid', '{"fixture":"stage13e-e2e"}'::jsonb, $2::jsonb,
       '[]'::jsonb, '[]'::jsonb
     ) returning id`,
    [unitId, JSON.stringify(outputPayload)],
  );
  const id = rows[0]?.id;
  assert.ok(id);
  return id;
}

async function insertAttemptHistory(tx: QueryExecutor, unitId: string, count: number): Promise<void> {
  await tx.query(
    `insert into ai_execution_attempts (
       job_unit_id, attempt_number, provider_key, provider_project_alias,
       model_used, route_key, benchmark_version, status, validation_status,
       retryable, input_tokens, output_tokens, latency_ms, estimated_cost_usd_micros,
       provider_metadata, started_at, completed_at
     )
     select $1, series.attempt_number, 'fixture-provider', 'fixture-project',
            'fixture-model', 'fixture-route-' || series.attempt_number::text, 'fixture-benchmark',
            'completed'::ai_execution_attempt_status, 'valid'::ai_output_validation_status,
            false, 10, 5, 100, 10, '{}'::jsonb, now() - interval '1 second', now()
     from generate_series(1, $2::integer) as series(attempt_number)`,
    [unitId, count],
  );
  await tx.query("update ai_job_units set attempt_count = 20, max_attempts = 20 where id = $1", [unitId]);
}

async function insertReviewHistory(
  tx: QueryExecutor,
  outputId: string,
  actorProfileId: string,
  count: number,
): Promise<void> {
  await tx.query(
    `insert into ai_output_review_events (
       ai_output_id, revision, action, actor_profile_id, reviewed_output, note
     )
     select $1, series.revision, 'edit'::ai_output_review_action, $2, $3::jsonb,
            'stage13e-e2e-review-' || series.revision::text
     from generate_series(1, $4::integer) as series(revision)`,
    [outputId, actorProfileId, JSON.stringify(output), count],
  );
  await tx.query("update ai_outputs set reviewed_by_profile_id = $2, reviewed_at = now() where id = $1", [
    outputId,
    actorProfileId,
  ]);
}

async function insertApprovedApplicationFixture(
  tx: QueryExecutor,
  actorProfileId: string,
  createdAt: Date,
): Promise<{ lessonId: string; jobId: string; outputId: string }> {
  const classId = (
    await tx.query<{ id: string }>(
      `insert into classes (slug, name, position)
       values ('stage13e-ai-apply-class', 'صف تطبيق AI', 98)
       returning id`,
    )
  )[0]?.id;
  const subjectId = (
    await tx.query<{ id: string }>(
      `insert into subjects (slug, name)
       values ('stage13e-ai-apply-subject', 'مادة تطبيق AI')
       returning id`,
    )
  )[0]?.id;
  assert.ok(classId && subjectId);
  await tx.query("insert into subject_class_links (class_id, subject_id) values ($1, $2)", [
    classId,
    subjectId,
  ]);
  const lessonId = (
    await tx.query<{ id: string }>(
      `insert into lessons (class_id, subject_id, slug, title, position)
       values ($1, $2, 'stage13e-ai-apply-lesson', 'درس تطبيق نتيجة AI', 0)
       returning id`,
      [classId, subjectId],
    )
  )[0]?.id;
  assert.ok(lessonId);

  const jobId = await insertJob(tx, "lesson_summary", "completed", 1, 1, createdAt);
  const unitId = await insertUnit(tx, jobId, `lesson:${lessonId}`, 0, "review_required", applicationRequest);
  const outputId = await insertOutput(tx, unitId, applicationOutput);
  await tx.query(
    `insert into ai_output_review_events (
       ai_output_id, revision, action, actor_profile_id, reviewed_output, note
     ) values ($1, 1, 'approve', $2, $3::jsonb, 'stage13e-direct-application')`,
    [outputId, actorProfileId, JSON.stringify(applicationOutput)],
  );
  await tx.query("update ai_outputs set reviewed_by_profile_id = $2, reviewed_at = now() where id = $1", [
    outputId,
    actorProfileId,
  ]);
  return { lessonId, jobId, outputId };
}

const database = createDatabase(databaseUrl);
try {
  const seeded = await database.transaction(async (tx) => {
    const existing = await tx.query<{ job_type: string }>(
      "select job_type from ai_jobs where job_type = any($1::text[])",
      [[happyJobType, raceJobType, paginationJobType, "lesson_summary"]],
    );
    if (existing.length > 0) {
      throw new Error(
        `Stage13E E2E fixture job types already exist: ${existing.map((row) => row.job_type).join(", ")}`,
      );
    }
    const actorRows = await tx.query<{ profile_id: string }>(
      "select profile_id from auth_credentials where normalized_identifier = $1",
      [adminIdentifier],
    );
    const actorProfileId = actorRows[0]?.profile_id;
    if (!actorProfileId) {
      throw new Error(`Stage13E E2E Admin credential is missing for identifier: ${adminIdentifier}`);
    }

    const now = Date.now();

    // Direct-application fixture: a canonical approved lesson-summary output. Chromium
    // must apply it from the review surface, then the workflow verifies the real lesson row.
    const application = await insertApprovedApplicationFixture(tx, actorProfileId, new Date(now + 1_000));

    // Happy fixture: active server-owned lifecycle + open review output. It deliberately
    // has 51 units, 51 execution-attempt rows and 101 append-only review revisions so
    // real Chromium proves every durable operational/audit history remains reachable.
    const happyJobId = await insertJob(tx, happyJobType, "queued", 51, 1, new Date(now));
    const happyReviewUnitId = await insertUnit(
      tx,
      happyJobId,
      `${happyJobType}-review`,
      0,
      "review_required",
    );
    const happyOutputId = await insertOutput(tx, happyReviewUnitId);
    await insertAttemptHistory(tx, happyReviewUnitId, 51);
    await insertReviewHistory(tx, happyOutputId, actorProfileId, 101);
    await insertQueuedUnits(tx, happyJobId, `${happyJobType}-queued`, 1, 50);

    // Race fixture: terminal execution with an intentionally open review output.
    // This disables normal non-terminal polling while keeping approve server-authorized,
    // making the stale-action race deterministic without sleeps or mocks.
    const raceJobId = await insertJob(tx, raceJobType, "completed", 1, 1, new Date(now - 1_000));
    const raceUnitId = await insertUnit(tx, raceJobId, `${raceJobType}-review`, 0, "review_required");
    const raceOutputId = await insertOutput(tx, raceUnitId);

    // Job-list pagination fixture: one deliberately old marker plus 30 newer completed
    // filler jobs. Together with happy/race/application this guarantees the marker is only
    // reachable from the second server page while active review work stays on the first page.
    const paginationJobId = await insertJob(
      tx,
      paginationJobType,
      "completed",
      1,
      1,
      new Date(now - 60 * 24 * 60 * 60 * 1_000),
    );
    await insertUnit(tx, paginationJobId, `${paginationJobType}-review`, 0, "review_required");

    for (let index = 0; index < 30; index += 1) {
      const fillerType = `${paginationJobType}_filler_${String(index + 1).padStart(2, "0")}`;
      const fillerId = await insertJob(
        tx,
        fillerType,
        "completed",
        1,
        1,
        new Date(now - (index + 2) * 1_000),
      );
      await insertUnit(tx, fillerId, `${fillerType}-review`, 0, "review_required");
    }

    return {
      application,
      happyJobId,
      happyReviewUnitId,
      happyOutputId,
      raceJobId,
      raceOutputId,
      paginationJobId,
    };
  });

  console.log(
    JSON.stringify({
      happyJobType,
      raceJobType,
      paginationJobType,
      applicationSummary,
      ...seeded,
    }),
  );
} finally {
  await database.close();
}
