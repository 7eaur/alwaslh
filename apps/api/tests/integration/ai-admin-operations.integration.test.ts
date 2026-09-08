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
if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage13E integration tests");

const fixture = AI_GOLDEN_FIXTURES.find((candidate) => candidate.id === "science-mcq-valid-formula-digits");
if (!fixture) throw new Error("Stage13E golden fixture is missing");
const request = fixture.request;
const validOutput = aiGenerationOutputSchema.parse(fixture.output);
const origin = "http://localhost:5173";

interface FixtureIds {
  jobId: string;
  unitId: string;
  outputId?: string;
}

async function insertJob(
  db: Database,
  suffix: string,
  name: string,
  status: "queued" | "completed" | "failed",
  unitStatus: "queued" | "review_required" | "failed",
  options: { attemptCount?: number; maxAttempts?: number; withOutput?: boolean } = {},
): Promise<FixtureIds> {
  const attemptCount = options.attemptCount ?? (unitStatus === "queued" ? 0 : 1);
  const maxAttempts = options.maxAttempts ?? 4;
  const accepted = unitStatus === "review_required" ? 1 : 0;
  const failed = unitStatus === "failed" ? 1 : 0;
  const jobRows = await db.query<{ id: string }>(
    `insert into ai_jobs (
       job_type, status, prompt_key, prompt_version, requested_model,
       priority, total_units, completed_units, failed_units, idempotency_key,
       started_at, completed_at
     ) values (
       'question_generation', $1::ai_job_status, 'stage13e-test', '1', 'provider-neutral',
       5, 1, $2, $3, $4,
       case when $1 = 'queued' then null else now() end,
       case when $1 in ('completed','failed') then now() else null end
     ) returning id`,
    [status, accepted, failed, `stage13e-${suffix}-${name}`],
  );
  const jobId = jobRows[0]?.id;
  assert.ok(jobId);
  const unitRows = await db.query<{ id: string }>(
    `insert into ai_job_units (
       job_id, unit_key, position, status, input_payload, attempt_count, max_attempts,
       last_error_code, last_error_message, started_at, completed_at
     ) values (
       $1, $2, 0, $3::ai_unit_status, $4::jsonb, $5, $6,
       case when $3 = 'failed' then 'provider_rejected' else null end,
       case when $3 = 'failed' then 'fixture failure' else null end,
       case when $3 = 'queued' then null else now() end,
       case when $3 in ('review_required','failed') then now() else null end
     ) returning id`,
    [jobId, `${name}-unit`, unitStatus, JSON.stringify(request), attemptCount, maxAttempts],
  );
  const unitId = unitRows[0]?.id;
  assert.ok(unitId);

  if (attemptCount > 0) {
    const attemptStatus = unitStatus === "failed" ? "failed" : "completed";
    await db.query(
      `insert into ai_execution_attempts (
         job_unit_id, attempt_number, provider_key, provider_project_alias, credential_alias,
         model_used, route_key, benchmark_version, status, validation_status, retryable,
         input_tokens, output_tokens, latency_ms, estimated_cost_usd_micros,
         error_code, error_message, provider_metadata, completed_at
       ) values (
         $1, $2, 'fixture-provider', 'project-stage13e', 'credential-stage13e-secret',
         'fixture-model', 'fixture-route', 'stage13e-v1', $3::ai_execution_attempt_status,
         $4::ai_output_validation_status, $5, 120, 48, 42, 700,
         $6, $7, '{"providerMetadataSecret":"must-not-leak"}'::jsonb, now()
       )`,
      [
        unitId,
        attemptCount,
        attemptStatus,
        unitStatus === "failed" ? "invalid" : "valid",
        unitStatus === "failed",
        unitStatus === "failed" ? "provider_rejected" : null,
        unitStatus === "failed" ? "provider internal detail" : null,
      ],
    );
  }

  if (!options.withOutput) return { jobId, unitId };
  const outputRows = await db.query<{ id: string }>(
    `insert into ai_outputs (
       job_unit_id, validation_status, raw_response, normalized_output,
       validation_errors, semantic_warnings
     ) values (
       $1, 'valid', $2::jsonb, $3::jsonb, '[]'::jsonb, '[]'::jsonb
     ) returning id`,
    [
      unitId,
      JSON.stringify({ providerRawSecret: "raw-stage13e-secret", payload: validOutput }),
      JSON.stringify(validOutput),
    ],
  );
  const outputId = outputRows[0]?.id;
  assert.ok(outputId);
  return { jobId, unitId, outputId };
}

function cookie(name: string, token: string): string {
  return `${name}=${encodeURIComponent(token)}`;
}

test("Stage13E Admin AI operations are durable, authorized, secret-safe and race-safe", async () => {
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

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير Stage13E') returning id",
  );
  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب Stage13E') returning id",
  );
  const adminId = adminRows[0]?.id;
  const studentId = studentRows[0]?.id;
  assert.ok(adminId && studentId);
  await auth.createCredential(adminId, `admin-${suffix}`, "AdminPass123!");
  await auth.createCredential(studentId, `student-${suffix}`, "StudentPass123!");

  const deviceRows = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'stage13e-test') returning id`,
    [studentId, `stage13e-public-key-${"x".repeat(100)}`, "c".repeat(64)],
  );
  const deviceId = deviceRows[0]?.id;
  assert.ok(deviceId);
  const adminSession = await auth.login(`admin-${suffix}`, "AdminPass123!");
  const studentSession = await auth.createStudentSession(studentId, deviceId);
  const adminCookie = cookie(config.SESSION_COOKIE_NAME, adminSession.token);
  const studentCookie = cookie(config.SESSION_COOKIE_NAME, studentSession.token);

  const review = await insertJob(db, suffix, "review", "completed", "review_required", { withOutput: true });
  const reject = await insertJob(db, suffix, "reject", "completed", "review_required", { withOutput: true });
  const race = await insertJob(db, suffix, "race", "completed", "review_required", { withOutput: true });
  const history = await insertJob(db, suffix, "history", "completed", "review_required", { withOutput: true });
  const failed = await insertJob(db, suffix, "failed", "failed", "failed", {
    attemptCount: 1,
    maxAttempts: 1,
  });
  const exhausted = await insertJob(db, suffix, "exhausted", "failed", "failed", {
    attemptCount: 20,
    maxAttempts: 20,
  });
  const control = await insertJob(db, suffix, "control", "queued", "queued");
  const pausedCancel = await insertJob(db, suffix, "paused-cancel", "queued", "queued");
  assert.ok(review.outputId && reject.outputId && race.outputId && history.outputId);

  const historyLatestOutput = structuredClone(validOutput);
  if (historyLatestOutput.kind !== "question_set" || !historyLatestOutput.questions[0]) {
    throw new Error("Stage13E fixture must be a non-empty question_set");
  }
  historyLatestOutput.questions[0] = {
    ...historyLatestOutput.questions[0],
    prompt: "أحدث مراجعة يجب أن تبقى authority حتى عند فتح صفحة قديمة",
  };
  await db.query(
    `insert into ai_output_review_events (
       ai_output_id, revision, action, actor_profile_id, reviewed_output, note
     )
     select $1, series.revision, 'edit'::ai_output_review_action, $2, $3::jsonb,
            'history-revision-' || series.revision::text
     from generate_series(1, 104) as series(revision)`,
    [history.outputId, adminId, JSON.stringify(validOutput)],
  );
  await db.query(
    `insert into ai_output_review_events (
       ai_output_id, revision, action, actor_profile_id, reviewed_output, note
     ) values ($1, 105, 'approve', $2, $3::jsonb, 'canonical-latest-review')`,
    [history.outputId, adminId, JSON.stringify(historyLatestOutput)],
  );
  await db.query(
    "update ai_outputs set reviewed_by_profile_id = $2, reviewed_at = now() where id = $1",
    [history.outputId, adminId],
  );

  const app = buildApp({ config, database: db });
  try {
    const anonymous = await app.inject({ method: "GET", url: "/v1/admin/ai/jobs" });
    assert.equal(anonymous.statusCode, 401);
    const forbidden = await app.inject({
      method: "GET",
      url: "/v1/admin/ai/jobs",
      headers: { cookie: studentCookie },
    });
    assert.equal(forbidden.statusCode, 403);

    const invalidPage = await app.inject({
      method: "GET",
      url: "/v1/admin/ai/jobs?limit=101",
      headers: { cookie: adminCookie },
    });
    assert.equal(invalidPage.statusCode, 400);

    const list = await app.inject({
      method: "GET",
      url: "/v1/admin/ai/jobs?jobType=question_generation&limit=100",
      headers: { cookie: adminCookie },
    });
    assert.equal(list.statusCode, 200);
    const listJson = list.json();
    assert.ok(listJson.jobs.some((job: { id: string }) => job.id === review.jobId));
    assert.ok(listJson.jobs.some((job: { id: string }) => job.id === failed.jobId));
    assert.equal(JSON.stringify(listJson).includes("credential-stage13e-secret"), false);

    const unit = await app.inject({
      method: "GET",
      url: `/v1/admin/ai/units/${review.unitId}`,
      headers: { cookie: adminCookie },
    });
    assert.equal(unit.statusCode, 200);
    const unitJson = unit.json();
    assert.equal(unitJson.unit.latestAttempt.providerKey, "fixture-provider");
    assert.equal(unitJson.unit.latestAttempt.providerProjectAlias, "project-stage13e");
    assert.equal(unitJson.unit.latestAttempt.modelUsed, "fixture-model");
    assert.equal(unitJson.unit.sourceProvenance[0].pageNumber, 12);
    assert.equal(unitJson.unit.sourceProvenance[0].inputChecksumSha256, "a".repeat(64));
    const serializedUnit = JSON.stringify(unitJson);
    assert.equal(serializedUnit.includes("credential-stage13e-secret"), false);
    assert.equal(serializedUnit.includes("providerMetadataSecret"), false);
    assert.equal(serializedUnit.includes("provider internal detail"), false);

    const outputBefore = await app.inject({
      method: "GET",
      url: `/v1/admin/ai/outputs/${review.outputId}`,
      headers: { cookie: adminCookie },
    });
    assert.equal(outputBefore.statusCode, 200);
    assert.equal(outputBefore.json().output.reviewStatus, "pending");
    assert.equal(outputBefore.json().output.hasRawResponse, true);
    assert.deepEqual(outputBefore.json().output.reviewPagination, { total: 0, limit: 100, offset: 0 });
    assert.equal(JSON.stringify(outputBefore.json()).includes("raw-stage13e-secret"), false);

    const invalidReviewPage = await app.inject({
      method: "GET",
      url: `/v1/admin/ai/outputs/${history.outputId}?reviewLimit=101&reviewOffset=0`,
      headers: { cookie: adminCookie },
    });
    assert.equal(invalidReviewPage.statusCode, 400);

    const oldHistoryPage = await app.inject({
      method: "GET",
      url: `/v1/admin/ai/outputs/${history.outputId}?reviewLimit=50&reviewOffset=100`,
      headers: { cookie: adminCookie },
    });
    assert.equal(oldHistoryPage.statusCode, 200);
    const oldHistoryJson = oldHistoryPage.json().output;
    assert.deepEqual(oldHistoryJson.reviewPagination, { total: 105, limit: 50, offset: 100 });
    assert.deepEqual(
      oldHistoryJson.reviewHistory.map((event: { revision: number }) => event.revision),
      [5, 4, 3, 2, 1],
    );
    assert.equal(oldHistoryJson.reviewStatus, "approved");
    assert.deepEqual(oldHistoryJson.allowedReviewActions, []);
    assert.equal(
      oldHistoryJson.effectiveReviewedOutput.questions[0].prompt,
      historyLatestOutput.questions[0].prompt,
    );

    const editedOutput = structuredClone(validOutput);
    if (editedOutput.kind !== "question_set" || !editedOutput.questions[0]) {
      throw new Error("Stage13E fixture must be a non-empty question_set");
    }
    editedOutput.questions[0] = {
      ...editedOutput.questions[0],
      prompt: "ما الصيغة الكيميائية للماء؟ — مراجعة إدارية",
    };
    const edited = await app.inject({
      method: "PATCH",
      url: `/v1/admin/ai/outputs/${review.outputId}/review`,
      headers: { cookie: adminCookie, origin },
      payload: { action: "edit", editedOutput, note: "تصحيح صياغة فقط" },
    });
    assert.equal(edited.statusCode, 200);
    assert.equal(edited.json().output.reviewStatus, "edited");
    assert.equal(edited.json().output.reviewHistory[0].revision, 1);
    assert.equal(
      edited.json().output.effectiveReviewedOutput.questions[0].prompt,
      editedOutput.questions[0].prompt,
    );

    const storedAfterEdit = await db.query<{ raw_response: unknown; normalized_output: unknown }>(
      "select raw_response, normalized_output from ai_outputs where id = $1",
      [review.outputId],
    );
    assert.deepEqual(storedAfterEdit[0]?.normalized_output, validOutput);
    assert.deepEqual(storedAfterEdit[0]?.raw_response, {
      providerRawSecret: "raw-stage13e-secret",
      payload: validOutput,
    });

    const approved = await app.inject({
      method: "PATCH",
      url: `/v1/admin/ai/outputs/${review.outputId}/review`,
      headers: { cookie: adminCookie, origin },
      payload: { action: "approve", note: "اعتماد المراجعة" },
    });
    assert.equal(approved.statusCode, 200);
    assert.equal(approved.json().output.reviewStatus, "approved");
    assert.deepEqual(
      approved.json().output.reviewHistory.map((event: { revision: number }) => event.revision),
      [2, 1],
    );
    const afterTerminal = await app.inject({
      method: "PATCH",
      url: `/v1/admin/ai/outputs/${review.outputId}/review`,
      headers: { cookie: adminCookie, origin },
      payload: { action: "edit", editedOutput },
    });
    assert.equal(afterTerminal.statusCode, 409);

    const rejectWithoutReason = await app.inject({
      method: "PATCH",
      url: `/v1/admin/ai/outputs/${reject.outputId}/review`,
      headers: { cookie: adminCookie, origin },
      payload: { action: "reject" },
    });
    assert.equal(rejectWithoutReason.statusCode, 400);
    const rejected = await app.inject({
      method: "PATCH",
      url: `/v1/admin/ai/outputs/${reject.outputId}/review`,
      headers: { cookie: adminCookie, origin },
      payload: { action: "reject", note: "المحتوى يحتاج إعادة توليد" },
    });
    assert.equal(rejected.statusCode, 200);
    assert.equal(rejected.json().output.reviewStatus, "rejected");
    assert.equal(rejected.json().output.effectiveReviewedOutput, null);

    const [raceA, raceB] = await Promise.all([
      app.inject({
        method: "PATCH",
        url: `/v1/admin/ai/outputs/${race.outputId}/review`,
        headers: { cookie: adminCookie, origin },
        payload: { action: "approve", note: "race-a" },
      }),
      app.inject({
        method: "PATCH",
        url: `/v1/admin/ai/outputs/${race.outputId}/review`,
        headers: { cookie: adminCookie, origin },
        payload: { action: "approve", note: "race-b" },
      }),
    ]);
    assert.deepEqual(
      [raceA.statusCode, raceB.statusCode].sort((a, b) => a - b),
      [200, 409],
    );
    const raceEvents = await db.query<{ count: string }>(
      "select count(*) from ai_output_review_events where ai_output_id = $1",
      [race.outputId],
    );
    assert.equal(Number(raceEvents[0]?.count), 1);

    const retried = await app.inject({
      method: "POST",
      url: `/v1/admin/ai/jobs/${failed.jobId}/retry`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(retried.statusCode, 200);
    assert.equal(retried.json().progress.status, "retrying");
    const retryUnit = await db.query<{ status: string; attempt_count: number; max_attempts: number }>(
      "select status, attempt_count, max_attempts from ai_job_units where id = $1",
      [failed.unitId],
    );
    assert.deepEqual(retryUnit[0], { status: "retrying", attempt_count: 1, max_attempts: 2 });
    const preservedAttempts = await db.query<{ count: string }>(
      "select count(*) from ai_execution_attempts where job_unit_id = $1",
      [failed.unitId],
    );
    assert.equal(Number(preservedAttempts[0]?.count), 1);

    const exhaustedRetry = await app.inject({
      method: "POST",
      url: `/v1/admin/ai/jobs/${exhausted.jobId}/retry`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(exhaustedRetry.statusCode, 409);
    const exhaustedState = await db.query<{ status: string; attempt_count: number; max_attempts: number }>(
      "select status, attempt_count, max_attempts from ai_job_units where id = $1",
      [exhausted.unitId],
    );
    assert.deepEqual(exhaustedState[0], { status: "failed", attempt_count: 20, max_attempts: 20 });

    const paused = await app.inject({
      method: "POST",
      url: `/v1/admin/ai/jobs/${control.jobId}/pause`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(paused.statusCode, 200);
    assert.equal(paused.json().progress.status, "paused");
    const pausedList = await app.inject({
      method: "GET",
      url: "/v1/admin/ai/jobs?status=paused&limit=100",
      headers: { cookie: adminCookie },
    });
    assert.equal(pausedList.statusCode, 200);
    assert.ok(pausedList.json().jobs.some((job: { id: string }) => job.id === control.jobId));

    const resumed = await app.inject({
      method: "POST",
      url: `/v1/admin/ai/jobs/${control.jobId}/resume`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(resumed.statusCode, 200);
    assert.equal(resumed.json().progress.status, "queued");
    const cancelled = await app.inject({
      method: "POST",
      url: `/v1/admin/ai/jobs/${control.jobId}/cancel`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(cancelled.statusCode, 200);
    assert.equal(cancelled.json().progress.status, "cancelled");
    const secondCancel = await app.inject({
      method: "POST",
      url: `/v1/admin/ai/jobs/${control.jobId}/cancel`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(secondCancel.statusCode, 409);

    const pausedBeforeCancel = await app.inject({
      method: "POST",
      url: `/v1/admin/ai/jobs/${pausedCancel.jobId}/pause`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(pausedBeforeCancel.statusCode, 200);
    assert.equal(pausedBeforeCancel.json().progress.status, "paused");
    const cancelledWhilePaused = await app.inject({
      method: "POST",
      url: `/v1/admin/ai/jobs/${pausedCancel.jobId}/cancel`,
      headers: { cookie: adminCookie, origin },
    });
    assert.equal(cancelledWhilePaused.statusCode, 200);
    assert.equal(cancelledWhilePaused.json().progress.status, "cancelled");
    assert.equal(cancelledWhilePaused.json().progress.pausedAt, null);
    const cancelledPauseState = await db.query<{ status: string; paused_at: Date | null }>(
      "select status, paused_at from ai_jobs where id = $1",
      [pausedCancel.jobId],
    );
    assert.deepEqual(cancelledPauseState[0], { status: "cancelled", paused_at: null });
  } finally {
    await app.close();
  }
});
