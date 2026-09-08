import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { aiGenerationOutputSchema } from "../../src/ai/contracts.js";
import { createDatabase, type QueryExecutor } from "../../src/db.js";
import { AI_GOLDEN_FIXTURES } from "./ai-golden.js";

const databaseUrl = process.env.DATABASE_URL;
const happyJobType = process.env.STAGE13E_E2E_JOB_TYPE?.trim();
const raceJobType = process.env.STAGE13E_E2E_RACE_JOB_TYPE?.trim();

if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage13E E2E fixture seeding");
if (!happyJobType) throw new Error("STAGE13E_E2E_JOB_TYPE is required for Stage13E E2E fixture seeding");
if (!raceJobType) throw new Error("STAGE13E_E2E_RACE_JOB_TYPE is required for Stage13E E2E fixture seeding");
if (happyJobType === raceJobType) throw new Error("Stage13E happy and race job types must be different");

const fixture = AI_GOLDEN_FIXTURES.find((candidate) => candidate.id === "science-mcq-valid-formula-digits");
if (!fixture) throw new Error("Stage13E E2E golden fixture is missing");
const request = fixture.request;
const output = aiGenerationOutputSchema.parse(fixture.output);

async function insertJob(
  tx: QueryExecutor,
  jobType: string,
  status: "queued" | "completed",
  totalUnits: number,
  completedUnits: number,
): Promise<string> {
  const rows = await tx.query<{ id: string }>(
    `insert into ai_jobs (
       job_type, status, prompt_key, prompt_version, requested_model,
       priority, total_units, completed_units, failed_units, idempotency_key,
       started_at, completed_at
     ) values (
       $1, $2::ai_job_status, 'stage13e-e2e', '1', 'provider-neutral',
       5, $3, $4, 0, $5,
       case when $2 = 'completed' then now() else null end,
       case when $2 = 'completed' then now() else null end
     ) returning id`,
    [jobType, status, totalUnits, completedUnits, `stage13e-e2e-${randomUUID()}`],
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
    [jobId, unitKey, position, status, JSON.stringify(request)],
  );
  const id = rows[0]?.id;
  assert.ok(id);
  return id;
}

async function insertOutput(tx: QueryExecutor, unitId: string): Promise<string> {
  const rows = await tx.query<{ id: string }>(
    `insert into ai_outputs (
       job_unit_id, validation_status, raw_response, normalized_output,
       validation_errors, semantic_warnings
     ) values (
       $1, 'valid', '{"fixture":"stage13e-e2e"}'::jsonb, $2::jsonb,
       '[]'::jsonb, '[]'::jsonb
     ) returning id`,
    [unitId, JSON.stringify(output)],
  );
  const id = rows[0]?.id;
  assert.ok(id);
  return id;
}

const database = createDatabase(databaseUrl);
try {
  const seeded = await database.transaction(async (tx) => {
    const existing = await tx.query<{ job_type: string }>(
      "select job_type from ai_jobs where job_type = any($1::text[])",
      [[happyJobType, raceJobType]],
    );
    if (existing.length > 0) {
      throw new Error(`Stage13E E2E fixture job types already exist: ${existing.map((row) => row.job_type).join(", ")}`);
    }

    // Happy fixture: deliberately non-terminal so pause/resume are real server actions,
    // with one open review output plus one queued unit so the job remains active.
    const happyJobId = await insertJob(tx, happyJobType, "queued", 2, 1);
    const happyReviewUnitId = await insertUnit(tx, happyJobId, `${happyJobType}-review`, 0, "review_required");
    await insertOutput(tx, happyReviewUnitId);
    await insertUnit(tx, happyJobId, `${happyJobType}-queued`, 1, "queued");

    // Race fixture: terminal execution with an intentionally open review output.
    // This disables normal non-terminal polling while keeping approve server-authorized,
    // making the stale-action race deterministic without sleeps or mocks.
    const raceJobId = await insertJob(tx, raceJobType, "completed", 1, 1);
    const raceUnitId = await insertUnit(tx, raceJobId, `${raceJobType}-review`, 0, "review_required");
    const raceOutputId = await insertOutput(tx, raceUnitId);

    return { happyJobId, raceJobId, raceOutputId };
  });

  console.log(JSON.stringify({
    happyJobType,
    raceJobType,
    ...seeded,
  }));
} finally {
  await database.close();
}
