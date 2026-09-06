import type { QueryExecutor } from "../db.js";
import type { AiGenerationRequest } from "./contracts.js";
import { type AiModelRoute, resolveRouteCapacity } from "./router.js";
import type { AiValidationResult, AiValidationStatus } from "./validators.js";

export type AiExecutableUnitStatus =
  | "queued"
  | "running"
  | "retrying"
  | "completed"
  | "failed"
  | "cancelled"
  | "review_required";

export interface AiJobRecord {
  id: string;
  status: "queued" | "running" | "retrying" | "completed" | "failed" | "cancelled";
  job_type: string;
  prompt_key: string;
  prompt_version: string;
  input_manifest: Record<string, unknown>;
  total_units: number;
  completed_units: number;
  failed_units: number;
  cancel_requested_at: Date | null;
}

export interface AiClaimedUnit {
  id: string;
  job_id: string;
  unit_key: string;
  position: number;
  status: "running";
  input_payload: AiGenerationRequest;
  attempt_count: number;
  max_attempts: number;
  lease_token: string;
  lease_expires_at: Date;
  resume_route_key: string | null;
  capacity_deferred_count: number;
}

export interface AiPlanUnitRecord {
  unitKey: string;
  position: number;
  request: AiGenerationRequest;
}

export interface CreateAiPlanInput {
  createdByProfileId?: string;
  jobType: string;
  promptKey: string;
  promptVersion: string;
  priority: number;
  idempotencyKey: string;
  planFingerprint: string;
  maxAttempts: number;
  units: readonly AiPlanUnitRecord[];
}

export interface AiProviderUsageRecord {
  inputTokens?: number;
  outputTokens?: number;
  estimatedCostUsd?: number;
}

export type AiCapacityDimension = "global" | "provider" | "project" | "model";

export interface AiCapacityBlock {
  started: false;
  dimension: AiCapacityDimension;
  current: number;
  limit: number;
}

export interface AiStartedAttempt {
  started: true;
  id: string;
  attemptNumber: number;
}

export type AiAttemptStartResult = AiCapacityBlock | AiStartedAttempt;

function json(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export class AiExecutionRepository {
  async createPlan(
    executor: QueryExecutor,
    input: CreateAiPlanInput,
  ): Promise<{ job: AiJobRecord; replayed: boolean }> {
    const inserted = await executor.query<AiJobRecord>(
      `insert into ai_jobs (
         created_by_profile_id, job_type, status, prompt_key, prompt_version,
         input_manifest, priority, total_units, idempotency_key
       ) values ($1, $2, 'queued', $3, $4, $5::jsonb, $6, $7, $8)
       on conflict (idempotency_key) do nothing
       returning id, status, job_type, prompt_key, prompt_version, input_manifest,
                 total_units, completed_units, failed_units, cancel_requested_at`,
      [
        input.createdByProfileId ?? null,
        input.jobType,
        input.promptKey,
        input.promptVersion,
        json({ planFingerprint: input.planFingerprint }),
        input.priority,
        input.units.length,
        input.idempotencyKey,
      ],
    );

    let job = inserted[0];
    const replayed = !job;
    if (!job) {
      const existing = await executor.query<AiJobRecord>(
        `select id, status, job_type, prompt_key, prompt_version, input_manifest,
                total_units, completed_units, failed_units, cancel_requested_at
         from ai_jobs where idempotency_key = $1`,
        [input.idempotencyKey],
      );
      job = existing[0];
      if (!job) throw new Error("ai_plan_insert_lost");
      if (job.input_manifest.planFingerprint !== input.planFingerprint) {
        throw new Error("ai_idempotency_conflict");
      }
      return { job, replayed: true };
    }

    await executor.query(
      `insert into ai_job_units (job_id, unit_key, position, input_payload, max_attempts)
       select $1, x.unit_key, x.position, x.input_payload, $2
       from jsonb_to_recordset($3::jsonb) as x(unit_key text, position integer, input_payload jsonb)`,
      [
        job.id,
        input.maxAttempts,
        json(
          input.units.map((unit) => ({
            unit_key: unit.unitKey,
            position: unit.position,
            input_payload: unit.request,
          })),
        ),
      ],
    );

    return { job, replayed };
  }

  async reconcileExpiredAttempts(executor: QueryExecutor): Promise<readonly string[]> {
    const rows = await executor.query<{ job_id: string }>(
      `with expired_units as (
         select id, job_id
         from ai_job_units
         where status = 'running' and lease_expires_at <= now()
       ), closed_attempts as (
         update ai_execution_attempts a
         set status = 'failed', completed_at = now(), retryable = true,
             error_code = coalesce(error_code, 'lease_expired'),
             error_message = coalesce(error_message, 'worker lease expired before attempt completion')
         from expired_units e
         where a.job_unit_id = e.id and a.status = 'running'
         returning e.job_id
       )
       select distinct job_id from closed_attempts`,
    );
    return rows.map((row) => row.job_id);
  }

  async finalizeExpiredExhausted(executor: QueryExecutor): Promise<readonly string[]> {
    const rows = await executor.query<{ job_id: string }>(
      `update ai_job_units
       set status = 'failed', lease_token = null, lease_expires_at = null,
           resume_route_key = null,
           last_error_code = 'lease_expired_max_attempts',
           last_error_message = 'worker lease expired after maximum execution attempts',
           completed_at = now()
       where status = 'running'
         and lease_expires_at <= now()
         and attempt_count >= max_attempts
         and resume_route_key is null
       returning job_id`,
    );
    return [...new Set(rows.map((row) => row.job_id))];
  }

  async claimNext(executor: QueryExecutor, leaseSeconds: number): Promise<AiClaimedUnit | null> {
    const rows = await executor.query<AiClaimedUnit>(
      `with candidate as (
         select u.id
         from ai_job_units u
         join ai_jobs j on j.id = u.job_id
         where j.cancel_requested_at is null
           and j.status in ('queued', 'running', 'retrying')
           and (u.attempt_count < u.max_attempts or u.resume_route_key is not null)
           and (
             u.status = 'queued'
             or (u.status = 'retrying' and (u.next_attempt_at is null or u.next_attempt_at <= now()))
             or (u.status = 'running' and u.lease_expires_at <= now())
           )
         order by j.priority asc, j.created_at asc, u.position asc
         for update of u skip locked
         limit 1
       )
       update ai_job_units u
       set status = 'running',
           attempt_count = u.attempt_count + case when u.resume_route_key is null then 1 else 0 end,
           next_attempt_at = null,
           lease_token = gen_random_uuid(),
           lease_expires_at = now() + make_interval(secs => $1::int),
           started_at = coalesce(u.started_at, now()),
           completed_at = null
       from candidate c
       where u.id = c.id
       returning u.id, u.job_id, u.unit_key, u.position, u.status,
                 u.input_payload, u.attempt_count, u.max_attempts,
                 u.lease_token, u.lease_expires_at,
                 u.resume_route_key, u.capacity_deferred_count`,
      [leaseSeconds],
    );
    const claimed = rows[0] ?? null;
    if (claimed) {
      await executor.query(
        `update ai_jobs
         set status = 'running', started_at = coalesce(started_at, now()), completed_at = null
         where id = $1 and cancel_requested_at is null`,
        [claimed.job_id],
      );
    }
    return claimed;
  }

  private async assertActiveLease(
    executor: QueryExecutor,
    unit: Pick<AiClaimedUnit, "id" | "lease_token">,
  ): Promise<void> {
    const locked = await executor.query<{ id: string }>(
      `select id from ai_job_units
       where id = $1 and status = 'running' and lease_token = $2 and lease_expires_at > now()
       for update`,
      [unit.id, unit.lease_token],
    );
    if (!locked[0]) throw new Error("ai_lease_lost");
  }

  async startAttempt(
    executor: QueryExecutor,
    unit: Pick<AiClaimedUnit, "id" | "lease_token">,
    route: AiModelRoute,
    globalMaxConcurrent: number,
  ): Promise<AiAttemptStartResult> {
    await this.assertActiveLease(executor, unit);

    // Serialize only the short capacity-check + attempt-insert critical section
    // across worker processes. Provider calls happen after this transaction commits.
    await executor.query("select pg_advisory_xact_lock(9412, 12)");

    const capacity = resolveRouteCapacity(route);
    const countsRows = await executor.query<{
      global_running: number;
      provider_running: number;
      project_running: number;
      model_running: number;
    }>(
      `select
         count(*)::int as global_running,
         count(*) filter (where provider_key = $1)::int as provider_running,
         count(*) filter (
           where $3::text is not null
             and provider_key = $1
             and provider_project_alias = $3
         )::int as project_running,
         count(*) filter (where provider_key = $1 and model_used = $2)::int as model_running
       from ai_execution_attempts
       where status = 'running'`,
      [route.providerKey, route.modelKey, route.projectAlias ?? null],
    );
    const counts = countsRows[0];
    if (!counts) throw new Error("ai_capacity_count_failed");

    if (counts.global_running >= globalMaxConcurrent) {
      return {
        started: false,
        dimension: "global",
        current: counts.global_running,
        limit: globalMaxConcurrent,
      };
    }
    if (counts.provider_running >= capacity.providerMaxConcurrent) {
      return {
        started: false,
        dimension: "provider",
        current: counts.provider_running,
        limit: capacity.providerMaxConcurrent,
      };
    }
    if (capacity.projectMaxConcurrent !== null && counts.project_running >= capacity.projectMaxConcurrent) {
      return {
        started: false,
        dimension: "project",
        current: counts.project_running,
        limit: capacity.projectMaxConcurrent,
      };
    }
    if (counts.model_running >= capacity.modelMaxConcurrent) {
      return {
        started: false,
        dimension: "model",
        current: counts.model_running,
        limit: capacity.modelMaxConcurrent,
      };
    }

    const next = await executor.query<{ attempt_number: number }>(
      `select coalesce(max(attempt_number), 0)::int + 1 as attempt_number
       from ai_execution_attempts where job_unit_id = $1`,
      [unit.id],
    );
    const attemptNumber = next[0]?.attempt_number ?? 1;
    const inserted = await executor.query<{ id: string }>(
      `insert into ai_execution_attempts (
         job_unit_id, attempt_number, provider_key, provider_project_alias,
         credential_alias, model_used, route_key, benchmark_version
       ) values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id`,
      [
        unit.id,
        attemptNumber,
        route.providerKey,
        route.projectAlias ?? null,
        route.credentialAlias ?? null,
        route.modelKey,
        route.routeKey,
        route.benchmarkVersion,
      ],
    );
    await executor.query(
      `update ai_job_units
       set provider_project_alias = $2, credential_alias = $3, model_used = $4,
           resume_route_key = null
       where id = $1`,
      [unit.id, route.projectAlias ?? null, route.credentialAlias ?? null, route.modelKey],
    );
    const id = inserted[0]?.id;
    if (!id) throw new Error("ai_attempt_insert_failed");
    return { started: true, id, attemptNumber };
  }

  async deferForCapacity(
    executor: QueryExecutor,
    unit: Pick<AiClaimedUnit, "id" | "lease_token">,
    routeKey: string,
    nextAttemptAt: Date,
    dimension: AiCapacityDimension,
    current: number,
    limit: number,
  ): Promise<void> {
    const rows = await executor.query<{ id: string }>(
      `update ai_job_units
       set status = 'retrying',
           next_attempt_at = $4,
           lease_token = null,
           lease_expires_at = null,
           resume_route_key = $3,
           capacity_deferred_count = capacity_deferred_count + 1,
           last_error_code = 'capacity_backpressure',
           last_error_message = $5,
           completed_at = null
       where id = $1 and status = 'running' and lease_token = $2 and lease_expires_at > now()
       returning id`,
      [
        unit.id,
        unit.lease_token,
        routeKey,
        nextAttemptAt,
        `capacity ${dimension} ${current}/${limit}; resume route ${routeKey}`,
      ],
    );
    if (!rows[0]) throw new Error("ai_lease_lost");
  }

  async finishAttemptSuccess(
    executor: QueryExecutor,
    unit: Pick<AiClaimedUnit, "id" | "lease_token">,
    attemptId: string,
    validationStatus: AiValidationStatus,
    latencyMs: number,
    usage: AiProviderUsageRecord,
    providerRequestId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.assertActiveLease(executor, unit);

    const costMicros =
      usage.estimatedCostUsd === undefined
        ? null
        : Math.max(0, Math.round(usage.estimatedCostUsd * 1_000_000));
    const rows = await executor.query<{ id: string }>(
      `update ai_execution_attempts
       set status = 'completed', validation_status = $2::ai_output_validation_status,
           retryable = false, provider_request_id = $3,
           input_tokens = $4, output_tokens = $5, latency_ms = $6,
           estimated_cost_usd_micros = $7, provider_metadata = $8::jsonb,
           completed_at = now()
       where id = $1 and status = 'running'
       returning id`,
      [
        attemptId,
        validationStatus,
        providerRequestId ?? null,
        usage.inputTokens ?? null,
        usage.outputTokens ?? null,
        Math.max(0, Math.round(latencyMs)),
        costMicros,
        json(metadata ?? {}),
      ],
    );
    if (!rows[0]) throw new Error("ai_attempt_not_running");
  }

  async finishAttemptFailure(
    executor: QueryExecutor,
    unit: Pick<AiClaimedUnit, "id" | "lease_token">,
    attemptId: string,
    error: { code: string; message: string; retryable: boolean },
    latencyMs: number,
  ): Promise<void> {
    await this.assertActiveLease(executor, unit);

    const rows = await executor.query<{ id: string }>(
      `update ai_execution_attempts
       set status = 'failed', retryable = $2, error_code = $3, error_message = $4,
           latency_ms = $5, completed_at = now()
       where id = $1 and status = 'running'
       returning id`,
      [attemptId, error.retryable, error.code, error.message, Math.max(0, Math.round(latencyMs))],
    );
    if (!rows[0]) throw new Error("ai_attempt_not_running");
  }

  async persistOutputOutcome(
    executor: QueryExecutor,
    unit: Pick<AiClaimedUnit, "id" | "lease_token">,
    output: unknown,
    validation: AiValidationResult,
    status: "completed" | "review_required" | "retrying" | "failed",
    nextAttemptAt: Date | null,
  ): Promise<void> {
    const terminal = status === "completed" || status === "review_required" || status === "failed";
    const rows = await executor.query<{ id: string }>(
      `update ai_job_units
       set status = $3::ai_unit_status,
           next_attempt_at = $4,
           lease_token = null,
           lease_expires_at = null,
           resume_route_key = null,
           last_error_code = case when $3 = 'retrying' or $3 = 'failed' then 'validation_invalid' else null end,
           last_error_message = case when $3 = 'retrying' or $3 = 'failed' then 'provider output failed Stage11 validation' else null end,
           completed_at = case when $5 then now() else null end
       where id = $1 and status = 'running' and lease_token = $2 and lease_expires_at > now()
       returning id`,
      [unit.id, unit.lease_token, status, nextAttemptAt, terminal],
    );
    if (!rows[0]) throw new Error("ai_lease_lost");

    const validationErrors = validation.issues.filter((issue) => issue.severity === "error");
    const semanticWarnings = validation.issues.filter((issue) => issue.severity !== "error");
    await executor.query(
      `insert into ai_outputs (
         job_unit_id, validation_status, raw_response, normalized_output,
         validation_errors, semantic_warnings
       ) values ($1, $2::ai_output_validation_status, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb)
       on conflict (job_unit_id) do update
       set validation_status = excluded.validation_status,
           raw_response = excluded.raw_response,
           normalized_output = excluded.normalized_output,
           validation_errors = excluded.validation_errors,
           semantic_warnings = excluded.semantic_warnings,
           reviewed_by_profile_id = null,
           reviewed_at = null`,
      [
        unit.id,
        validation.status,
        json(output),
        json(validation.output ?? null),
        json(validationErrors),
        json(semanticWarnings),
      ],
    );
  }

  async persistProviderFailure(
    executor: QueryExecutor,
    unit: Pick<AiClaimedUnit, "id" | "lease_token">,
    error: { code: string; message: string },
    status: "retrying" | "failed",
    nextAttemptAt: Date | null,
  ): Promise<void> {
    const rows = await executor.query<{ id: string }>(
      `update ai_job_units
       set status = $3::ai_unit_status,
           next_attempt_at = $4,
           lease_token = null,
           lease_expires_at = null,
           resume_route_key = null,
           last_error_code = $5,
           last_error_message = $6,
           completed_at = case when $3 = 'failed' then now() else null end
       where id = $1 and status = 'running' and lease_token = $2 and lease_expires_at > now()
       returning id`,
      [unit.id, unit.lease_token, status, nextAttemptAt, error.code, error.message],
    );
    if (!rows[0]) throw new Error("ai_lease_lost");
  }

  async refreshJob(executor: QueryExecutor, jobId: string): Promise<AiJobRecord> {
    const statsRows = await executor.query<{
      total: number;
      completed: number;
      review_required: number;
      failed: number;
      cancelled: number;
      queued: number;
      running: number;
      retrying: number;
      started_at: Date | null;
      cancel_requested_at: Date | null;
    }>(
      `select
         count(*)::int as total,
         count(*) filter (where u.status = 'completed')::int as completed,
         count(*) filter (where u.status = 'review_required')::int as review_required,
         count(*) filter (where u.status = 'failed')::int as failed,
         count(*) filter (where u.status = 'cancelled')::int as cancelled,
         count(*) filter (where u.status = 'queued')::int as queued,
         count(*) filter (where u.status = 'running')::int as running,
         count(*) filter (where u.status = 'retrying')::int as retrying,
         j.started_at,
         j.cancel_requested_at
       from ai_jobs j
       join ai_job_units u on u.job_id = j.id
       where j.id = $1
       group by j.id`,
      [jobId],
    );
    const stats = statsRows[0];
    if (!stats) throw new Error("ai_job_not_found");

    const accepted = stats.completed + stats.review_required;
    const terminal = accepted + stats.failed + stats.cancelled === stats.total;
    let status: AiJobRecord["status"];
    if (stats.cancel_requested_at) status = "cancelled";
    else if (stats.running > 0) status = "running";
    else if (stats.retrying > 0) status = "retrying";
    else if (stats.queued > 0) status = stats.started_at ? "running" : "queued";
    else if (terminal && accepted > 0) status = "completed";
    else if (terminal) status = "failed";
    else status = "running";

    const updated = await executor.query<AiJobRecord>(
      `update ai_jobs
       set status = $2::ai_job_status,
           total_units = $3,
           completed_units = $4,
           failed_units = $5,
           completed_at = case when $6 then coalesce(completed_at, now()) else null end
       where id = $1
       returning id, status, job_type, prompt_key, prompt_version, input_manifest,
                 total_units, completed_units, failed_units, cancel_requested_at`,
      [jobId, status, stats.total, accepted, stats.failed, terminal || status === "cancelled"],
    );
    const job = updated[0];
    if (!job) throw new Error("ai_job_not_found");
    return job;
  }

  async requestCancel(executor: QueryExecutor, jobId: string): Promise<AiJobRecord> {
    const jobs = await executor.query<{ id: string }>(
      `update ai_jobs
       set cancel_requested_at = coalesce(cancel_requested_at, now()), status = 'cancelled', completed_at = now()
       where id = $1
       returning id`,
      [jobId],
    );
    if (!jobs[0]) throw new Error("ai_job_not_found");

    await executor.query(
      `update ai_job_units
       set status = 'cancelled', lease_token = null, lease_expires_at = null,
           next_attempt_at = null, resume_route_key = null, completed_at = now(),
           last_error_code = 'job_cancelled', last_error_message = 'job cancelled'
       where job_id = $1 and status in ('queued', 'running', 'retrying')`,
      [jobId],
    );
    await executor.query(
      `update ai_execution_attempts a
       set status = 'cancelled', completed_at = now(), retryable = false,
           error_code = coalesce(error_code, 'job_cancelled'),
           error_message = coalesce(error_message, 'job cancelled while provider attempt was running')
       from ai_job_units u
       where u.job_id = $1 and a.job_unit_id = u.id and a.status = 'running'`,
      [jobId],
    );
    return this.refreshJob(executor, jobId);
  }
}
