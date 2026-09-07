import type { QueryExecutor } from "../db.js";
import type { AiGenerationRequest } from "./contracts.js";

export type AiJobExecutionStatus = "queued" | "running" | "retrying" | "completed" | "failed" | "cancelled";
export type AiJobLifecycleStatus = AiJobExecutionStatus | "paused";

export interface AiLifecycleClaimedUnit {
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
  control_deferred_count: number;
}

export interface AiJobProgress {
  jobId: string;
  status: AiJobLifecycleStatus;
  executionStatus: AiJobExecutionStatus;
  pausedAt: Date | null;
  totalUnits: number;
  acceptedUnits: number;
  completedUnits: number;
  reviewRequiredUnits: number;
  failedUnits: number;
  cancelledUnits: number;
  queuedUnits: number;
  runningUnits: number;
  retryingUnits: number;
  settledUnits: number;
  remainingUnits: number;
  progressPercent: number;
}

interface AiJobLifecycleRow {
  id: string;
  status: AiJobExecutionStatus;
  paused_at: Date | null;
  cancel_requested_at: Date | null;
}

const TERMINAL_JOB_STATUSES = new Set<AiJobExecutionStatus>(["completed", "failed", "cancelled"]);

export class AiJobLifecycleRepository {
  async reconcileExpiredAttempts(executor: QueryExecutor): Promise<readonly string[]> {
    const rows = await executor.query<{ job_id: string }>(
      `with expired_units as (
         select id, job_id, attempt_count, max_attempts
         from ai_job_units
         where status = 'running' and lease_expires_at <= now()
         for update
       ), closed_attempts as (
         update ai_execution_attempts a
         set status = 'failed', completed_at = now(), retryable = true,
             error_code = coalesce(error_code, 'lease_expired'),
             error_message = coalesce(error_message, 'worker lease expired before attempt completion')
         from expired_units e
         where a.job_unit_id = e.id and a.status = 'running'
         returning e.job_id
       ), released_units as (
         update ai_job_units u
         set status = 'retrying',
             next_attempt_at = coalesce(u.next_attempt_at, now()),
             lease_token = null,
             lease_expires_at = null,
             last_error_code = 'lease_expired',
             last_error_message = 'worker lease expired before unit completion',
             completed_at = null
         from expired_units e
         where u.id = e.id and e.attempt_count < e.max_attempts
         returning e.job_id
       ), touched as (
         select job_id from closed_attempts
         union
         select job_id from released_units
       )
       select distinct job_id from touched`,
    );
    return rows.map((row) => row.job_id);
  }

  async claimNext(executor: QueryExecutor, leaseSeconds: number): Promise<AiLifecycleClaimedUnit | null> {
    const rows = await executor.query<AiLifecycleClaimedUnit>(
      `with candidate as (
         select u.id
         from ai_job_units u
         join ai_jobs j on j.id = u.job_id
         where j.cancel_requested_at is null
           and j.paused_at is null
           and j.status in ('queued', 'running', 'retrying')
           and (u.attempt_count < u.max_attempts or u.resume_route_key is not null)
           and (
             u.status = 'queued'
             or (u.status = 'retrying' and (u.next_attempt_at is null or u.next_attempt_at <= now()))
             or (u.status = 'running' and u.lease_expires_at <= now())
           )
         order by j.priority asc, j.created_at asc, u.position asc
         for update of j, u skip locked
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
                 u.resume_route_key, u.capacity_deferred_count, u.control_deferred_count`,
      [leaseSeconds],
    );
    const claimed = rows[0] ?? null;
    if (!claimed) return null;

    const updatedJob = await executor.query<{ id: string }>(
      `update ai_jobs
       set status = 'running', started_at = coalesce(started_at, now()), completed_at = null
       where id = $1 and cancel_requested_at is null and paused_at is null
       returning id`,
      [claimed.job_id],
    );
    if (!updatedJob[0]) throw new Error("ai_job_claim_gate_lost");
    return claimed;
  }

  async requestPause(executor: QueryExecutor, jobId: string): Promise<AiJobProgress> {
    const job = await this.lockJob(executor, jobId);
    if (TERMINAL_JOB_STATUSES.has(job.status)) throw new Error(`ai_job_not_pauseable:${job.status}`);

    if (!job.paused_at) {
      await executor.query("update ai_jobs set paused_at = now() where id = $1", [jobId]);
    }
    return this.getProgress(executor, jobId);
  }

  async requestResume(executor: QueryExecutor, jobId: string): Promise<AiJobProgress> {
    const job = await this.lockJob(executor, jobId);
    if (TERMINAL_JOB_STATUSES.has(job.status)) throw new Error(`ai_job_not_resumable:${job.status}`);

    if (job.paused_at) {
      await executor.query("update ai_jobs set paused_at = null where id = $1", [jobId]);
    }
    return this.getProgress(executor, jobId);
  }

  async clearPause(executor: QueryExecutor, jobId: string): Promise<void> {
    await executor.query("update ai_jobs set paused_at = null where id = $1 and paused_at is not null", [jobId]);
  }

  async getProgress(executor: QueryExecutor, jobId: string): Promise<AiJobProgress> {
    const rows = await executor.query<{
      id: string;
      status: AiJobExecutionStatus;
      paused_at: Date | null;
      total: number;
      completed: number;
      review_required: number;
      failed: number;
      cancelled: number;
      queued: number;
      running: number;
      retrying: number;
    }>(
      `select j.id, j.status, j.paused_at,
              count(u.id)::int as total,
              count(*) filter (where u.status = 'completed')::int as completed,
              count(*) filter (where u.status = 'review_required')::int as review_required,
              count(*) filter (where u.status = 'failed')::int as failed,
              count(*) filter (where u.status = 'cancelled')::int as cancelled,
              count(*) filter (where u.status = 'queued')::int as queued,
              count(*) filter (where u.status = 'running')::int as running,
              count(*) filter (where u.status = 'retrying')::int as retrying
       from ai_jobs j
       left join ai_job_units u on u.job_id = j.id
       where j.id = $1
       group by j.id`,
      [jobId],
    );
    const row = rows[0];
    if (!row) throw new Error("ai_job_not_found");

    const accepted = row.completed + row.review_required;
    const settled = accepted + row.failed + row.cancelled;
    const remaining = Math.max(0, row.total - settled);
    const terminal = TERMINAL_JOB_STATUSES.has(row.status);
    const status: AiJobLifecycleStatus = !terminal && row.paused_at ? "paused" : row.status;
    const progressPercent = row.total === 0 ? 100 : Math.min(100, Math.floor((settled * 100) / row.total));

    return {
      jobId: row.id,
      status,
      executionStatus: row.status,
      pausedAt: row.paused_at,
      totalUnits: row.total,
      acceptedUnits: accepted,
      completedUnits: row.completed,
      reviewRequiredUnits: row.review_required,
      failedUnits: row.failed,
      cancelledUnits: row.cancelled,
      queuedUnits: row.queued,
      runningUnits: row.running,
      retryingUnits: row.retrying,
      settledUnits: settled,
      remainingUnits: remaining,
      progressPercent,
    };
  }

  private async lockJob(executor: QueryExecutor, jobId: string): Promise<AiJobLifecycleRow> {
    const rows = await executor.query<AiJobLifecycleRow>(
      `select id, status, paused_at, cancel_requested_at
       from ai_jobs where id = $1
       for update`,
      [jobId],
    );
    const job = rows[0];
    if (!job) throw new Error("ai_job_not_found");
    return job;
  }
}
