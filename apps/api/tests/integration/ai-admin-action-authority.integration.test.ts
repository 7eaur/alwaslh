import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { aiGenerationOutputSchema } from "../../src/ai/contracts.js";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase, type Database } from "../../src/db.js";
import { AI_GOLDEN_FIXTURES } from "../fixtures/ai-golden.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage13E action-authority integration tests");

const fixture = AI_GOLDEN_FIXTURES.find((candidate) => candidate.id === "science-mcq-valid-formula-digits");
if (!fixture) throw new Error("Stage13E action-authority golden fixture is missing");
const request = fixture.request;
const validOutput = aiGenerationOutputSchema.parse(fixture.output);
const origin = "http://localhost:5173";

type JobStatus = "queued" | "retrying" | "completed" | "failed";
type UnitStatus = "queued" | "retrying" | "review_required" | "failed";

interface JobFixture {
  jobId: string;
  unitId: string;
  outputId?: string;
}

async function insertJob(
  db: Database,
  suffix: string,
  name: string,
  status: JobStatus,
  unitStatus: UnitStatus,
  options: { attemptCount?: number; withOutput?: boolean } = {},
): Promise<JobFixture> {
  const attemptCount = options.attemptCount ?? (unitStatus === "queued" ? 0 : 1);
  const accepted = unitStatus === "review_required" ? 1 : 0;
  const failed = unitStatus === "failed" ? 1 : 0;
  const jobs = await db.query<{ id: string }>(
    `insert into ai_jobs (
       job_type, status, prompt_key, prompt_version, requested_model,
       priority, total_units, completed_units, failed_units, idempotency_key,
       started_at, completed_at
     ) values (
       'question_generation', $1::ai_job_status, 'stage13e-action-test', '1', 'provider-neutral',
       5, 1, $2, $3, $4,
       case when $1 = 'queued' then null else now() end,
       case when $1 in ('completed','failed') then now() else null end
     ) returning id`,
    [status, accepted, failed, `stage13e-action-${suffix}-${name}`],
  );
  const jobId = jobs[0]?.id;
  assert.ok(jobId);

  const units = await db.query<{ id: string }>(
    `insert into ai_job_units (
       job_id, unit_key, position, status, input_payload, attempt_count, max_attempts,
       started_at, completed_at
     ) values (
       $1, $2, 0, $3::ai_unit_status, $4::jsonb, $5, $6,
       case when $3 = 'queued' then null else now() end,
       case when $3 in ('review_required','failed') then now() else null end
     ) returning id`,
    [jobId, `${name}-unit`, unitStatus, JSON.stringify(request), attemptCount, Math.max(1, attemptCount)],
  );
  const unitId = units[0]?.id;
  assert.ok(unitId);

  if (!options.withOutput) return { jobId, unitId };
  const outputs = await db.query<{ id: string }>(
    `insert into ai_outputs (
       job_unit_id, validation_status, raw_response, normalized_output,
       validation_errors, semantic_warnings
     ) values ($1, 'valid', '{}'::jsonb, $2::jsonb, '[]'::jsonb, '[]'::jsonb)
     returning id`,
    [unitId, JSON.stringify(validOutput)],
  );
  const outputId = outputs[0]?.id;
  assert.ok(outputId);
  return { jobId, unitId, outputId };
}

function cookie(name: string, token: string): string {
  return `${name}=${encodeURIComponent(token)}`;
}

async function getJson(app: ReturnType<typeof buildApp>, sessionCookie: string, url: string) {
  const response = await app.inject({ method: "GET", url, headers: { cookie: sessionCookie } });
  assert.equal(response.statusCode, 200);
  return response.json();
}

test("Stage13E exposes authoritative job/review actions and strict review bodies", async () => {
  const suffix = randomUUID();
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);

  const profiles = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'Stage13E Action Admin') returning id",
  );
  const adminId = profiles[0]?.id;
  assert.ok(adminId);
  const identifier = `stage13e-action-${suffix}`;
  const password = "Stage13EActionTest42!";
  await auth.createCredential(adminId, identifier, password);
  const session = await auth.login(identifier, password);
  const sessionCookie = cookie(config.SESSION_COOKIE_NAME, session.token);

  const active = await insertJob(db, suffix, "active", "queued", "queued");
  const retryable = await insertJob(db, suffix, "retryable", "failed", "failed", { attemptCount: 1 });
  const exhausted = await insertJob(db, suffix, "exhausted", "failed", "failed", { attemptCount: 20 });
  const noFailedUnits = await insertJob(db, suffix, "no-failed-units", "failed", "review_required");
  const cancelRequested = await insertJob(db, suffix, "cancel-requested", "failed", "failed", {
    attemptCount: 1,
  });
  await db.query("update ai_jobs set cancel_requested_at = now() where id = $1", [cancelRequested.jobId]);
  const review = await insertJob(db, suffix, "review", "completed", "review_required", { withOutput: true });
  const reject = await insertJob(db, suffix, "reject", "completed", "review_required", { withOutput: true });
  const strict = await insertJob(db, suffix, "strict", "completed", "review_required", { withOutput: true });
  const failedOutput = await insertJob(db, suffix, "failed-output", "failed", "failed", {
    attemptCount: 1,
    withOutput: true,
  });
  const retryingOutput = await insertJob(db, suffix, "retrying-output", "retrying", "retrying", {
    attemptCount: 1,
    withOutput: true,
  });
  assert.ok(
    review.outputId && reject.outputId && strict.outputId && failedOutput.outputId && retryingOutput.outputId,
  );

  const app = buildApp({ config, database: db });
  try {
    const activeDetail = await getJson(app, sessionCookie, `/v1/admin/ai/jobs/${active.jobId}`);
    assert.deepEqual(activeDetail.job.allowedActions, ["pause", "cancel"]);

    const retryableDetail = await getJson(app, sessionCookie, `/v1/admin/ai/jobs/${retryable.jobId}`);
    assert.deepEqual(retryableDetail.job.allowedActions, ["retry"]);

    const exhaustedDetail = await getJson(app, sessionCookie, `/v1/admin/ai/jobs/${exhausted.jobId}`);
    assert.deepEqual(exhaustedDetail.job.allowedActions, []);

    const noFailedDetail = await getJson(app, sessionCookie, `/v1/admin/ai/jobs/${noFailedUnits.jobId}`);
    assert.deepEqual(noFailedDetail.job.allowedActions, []);

    const cancelRequestedDetail = await getJson(
      app,
      sessionCookie,
      `/v1/admin/ai/jobs/${cancelRequested.jobId}`,
    );
    assert.deepEqual(cancelRequestedDetail.job.allowedActions, []);

    const paused = await app.inject({
      method: "POST",
      url: `/v1/admin/ai/jobs/${active.jobId}/pause`,
      headers: { cookie: sessionCookie, origin },
    });
    assert.equal(paused.statusCode, 200);
    const pausedDetail = await getJson(app, sessionCookie, `/v1/admin/ai/jobs/${active.jobId}`);
    assert.deepEqual(pausedDetail.job.allowedActions, ["resume", "cancel"]);

    const resumed = await app.inject({
      method: "POST",
      url: `/v1/admin/ai/jobs/${active.jobId}/resume`,
      headers: { cookie: sessionCookie, origin },
    });
    assert.equal(resumed.statusCode, 200);
    const resumedDetail = await getJson(app, sessionCookie, `/v1/admin/ai/jobs/${active.jobId}`);
    assert.deepEqual(resumedDetail.job.allowedActions, ["pause", "cancel"]);

    const cancelled = await app.inject({
      method: "POST",
      url: `/v1/admin/ai/jobs/${active.jobId}/cancel`,
      headers: { cookie: sessionCookie, origin },
    });
    assert.equal(cancelled.statusCode, 200);
    const cancelledDetail = await getJson(app, sessionCookie, `/v1/admin/ai/jobs/${active.jobId}`);
    assert.deepEqual(cancelledDetail.job.allowedActions, []);

    const pendingOutput = await getJson(app, sessionCookie, `/v1/admin/ai/outputs/${review.outputId}`);
    assert.deepEqual(pendingOutput.output.allowedReviewActions, ["edit", "approve", "reject"]);

    const failedOutputDetail = await getJson(
      app,
      sessionCookie,
      `/v1/admin/ai/outputs/${failedOutput.outputId}`,
    );
    assert.deepEqual(failedOutputDetail.output.allowedReviewActions, []);

    const retryingOutputDetail = await getJson(
      app,
      sessionCookie,
      `/v1/admin/ai/outputs/${retryingOutput.outputId}`,
    );
    assert.deepEqual(retryingOutputDetail.output.allowedReviewActions, []);

    const failedApprove = await app.inject({
      method: "PATCH",
      url: `/v1/admin/ai/outputs/${failedOutput.outputId}/review`,
      headers: { cookie: sessionCookie, origin },
      payload: { action: "approve" },
    });
    assert.equal(failedApprove.statusCode, 409);

    const retryingReject = await app.inject({
      method: "PATCH",
      url: `/v1/admin/ai/outputs/${retryingOutput.outputId}/review`,
      headers: { cookie: sessionCookie, origin },
      payload: { action: "reject", note: "Execution is still retrying" },
    });
    assert.equal(retryingReject.statusCode, 409);

    const unstableEvents = await db.query<{ count: string }>(
      "select count(*) from ai_output_review_events where ai_output_id = any($1::uuid[])",
      [[failedOutput.outputId, retryingOutput.outputId]],
    );
    assert.equal(Number(unstableEvents[0]?.count), 0);

    const approved = await app.inject({
      method: "PATCH",
      url: `/v1/admin/ai/outputs/${review.outputId}/review`,
      headers: { cookie: sessionCookie, origin },
      payload: { action: "approve" },
    });
    assert.equal(approved.statusCode, 200);
    assert.deepEqual(approved.json().output.allowedReviewActions, []);

    const rejected = await app.inject({
      method: "PATCH",
      url: `/v1/admin/ai/outputs/${reject.outputId}/review`,
      headers: { cookie: sessionCookie, origin },
      payload: { action: "reject", note: "Needs regeneration" },
    });
    assert.equal(rejected.statusCode, 200);
    assert.deepEqual(rejected.json().output.allowedReviewActions, []);

    const strictUrl = `/v1/admin/ai/outputs/${strict.outputId}/review`;
    const approveWithEditedOutput = await app.inject({
      method: "PATCH",
      url: strictUrl,
      headers: { cookie: sessionCookie, origin },
      payload: { action: "approve", editedOutput: validOutput },
    });
    assert.equal(approveWithEditedOutput.statusCode, 400);

    const editWithoutOutput = await app.inject({
      method: "PATCH",
      url: strictUrl,
      headers: { cookie: sessionCookie, origin },
      payload: { action: "edit" },
    });
    assert.equal(editWithoutOutput.statusCode, 400);

    const rejectWithoutReason = await app.inject({
      method: "PATCH",
      url: strictUrl,
      headers: { cookie: sessionCookie, origin },
      payload: { action: "reject" },
    });
    assert.equal(rejectWithoutReason.statusCode, 400);

    const rejectWithBlankReason = await app.inject({
      method: "PATCH",
      url: strictUrl,
      headers: { cookie: sessionCookie, origin },
      payload: { action: "reject", note: "   " },
    });
    assert.equal(rejectWithBlankReason.statusCode, 400);

    const unknownField = await app.inject({
      method: "PATCH",
      url: strictUrl,
      headers: { cookie: sessionCookie, origin },
      payload: { action: "approve", unexpected: true },
    });
    assert.equal(unknownField.statusCode, 400);

    await assert.rejects(
      db.query(
        `insert into ai_output_review_events (
           ai_output_id, revision, action, actor_profile_id, reviewed_output, note
         ) values ($1, 1, 'reject', $2, null, null)`,
        [strict.outputId, adminId],
      ),
      /ai_output_review_events_reject_note_required/,
    );
    await assert.rejects(
      db.query(
        `insert into ai_output_review_events (
           ai_output_id, revision, action, actor_profile_id, reviewed_output, note
         ) values ($1, 1, 'reject', $2, null, '   ')`,
        [strict.outputId, adminId],
      ),
      /ai_output_review_events_reject_note_required/,
    );

    const strictEvents = await db.query<{ count: string }>(
      "select count(*) from ai_output_review_events where ai_output_id = $1",
      [strict.outputId],
    );
    assert.equal(Number(strictEvents[0]?.count), 0);
  } finally {
    await app.close();
  }
});
