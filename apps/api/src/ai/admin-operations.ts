import type { Database, QueryExecutor } from "../db.js";
import { AppError } from "../errors.js";
import { type AiGenerationOutput, aiGenerationOutputSchema, aiGenerationRequestSchema } from "./contracts.js";
import { AiExecutionRepository } from "./execution-repository.js";
import {
  type AiJobAllowedAction,
  type AiJobExecutionStatus,
  AiJobLifecycleRepository,
  type AiJobLifecycleStatus,
  type AiJobProgress,
} from "./job-lifecycle.js";
import {
  isAdminApprovalCandidateAllowed,
  validateAdminApprovalOutput,
  validateAdminEditedOutput,
} from "./review-validation.js";

export type AiOutputReviewAction = "edit" | "approve" | "reject";
export type AiOutputReviewStatus = "pending" | "edited" | "approved" | "rejected";
export type AiOutputAllowedReviewAction = AiOutputReviewAction;

export interface AdminAiJobFilters {
  status?: AiJobLifecycleStatus;
  jobType?: string;
  limit: number;
  offset: number;
}

export interface AdminAiJobListItem {
  id: string;
  jobType: string;
  status: AiJobLifecycleStatus;
  executionStatus: AiJobExecutionStatus;
  promptKey: string;
  promptVersion: string;
  requestedModel: string | null;
  priority: number;
  createdByProfileId: string | null;
  cancelRequestedAt: Date | null;
  pausedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  progress: Omit<AiJobProgress, "jobId" | "status" | "executionStatus" | "pausedAt">;
}

export interface AdminAiJobDetailItem extends AdminAiJobListItem {
  allowedActions: AiJobAllowedAction[];
}

export interface AdminAiSourceProvenance {
  mediaAssetId: string;
  pageNumber: number;
  inputChecksumSha256: string;
  inputKind: "approved_ocr" | "vision_fallback";
  ocrExtractionId: string | null;
  contentSourceAssetId: string | null;
}

export interface AdminAiAttemptView {
  id: string;
  attemptNumber: number;
  providerKey: string;
  providerProjectAlias: string | null;
  modelUsed: string;
  routeKey: string;
  benchmarkVersion: string;
  status: "running" | "completed" | "failed" | "cancelled";
  validationStatus: "pending" | "valid" | "invalid" | "review_required" | null;
  retryable: boolean | null;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number | null;
  estimatedCostUsdMicros: number | null;
  errorCode: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface AdminAiUnitView {
  id: string;
  jobId: string;
  unitKey: string;
  position: number;
  status: string;
  mode: string;
  subjectDomain: string;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: Date | null;
  leaseExpiresAt: Date | null;
  lastErrorCode: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  sourceProvenance: AdminAiSourceProvenance[];
  latestAttempt: AdminAiAttemptView | null;
  output: null | {
    id: string;
    validationStatus: string;
    reviewStatus: AiOutputReviewStatus;
    updatedAt: Date;
  };
}

export interface AdminAiOutputReviewEvent {
  id: string;
  revision: number;
  action: AiOutputReviewAction;
  actorProfileId: string;
  actorDisplayName: string | null;
  reviewedOutput: AiGenerationOutput | null;
  note: string | null;
  createdAt: Date;
}

export interface AdminAiOutputDetail {
  id: string;
  jobId: string;
  jobUnitId: string;
  unitKey: string;
  validationStatus: string;
  normalizedOutput: AiGenerationOutput | null;
  validationErrors: unknown;
  semanticWarnings: unknown;
  hasRawResponse: boolean;
  reviewStatus: AiOutputReviewStatus;
  allowedReviewActions: AiOutputAllowedReviewAction[];
  effectiveReviewedOutput: AiGenerationOutput | null;
  reviewedByProfileId: string | null;
  reviewedAt: Date | null;
  sourceProvenance: AdminAiSourceProvenance[];
  reviewHistory: AdminAiOutputReviewEvent[];
  createdAt: Date;
  updatedAt: Date;
}

interface JobRow {
  id: string;
  job_type: string;
  status: AiJobExecutionStatus;
  prompt_key: string;
  prompt_version: string;
  requested_model: string | null;
  priority: number;
  created_by_profile_id: string | null;
  cancel_requested_at: Date | null;
  paused_at: Date | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  total: number;
  completed: number;
  review_required: number;
  failed: number;
  cancelled: number;
  queued: number;
  running: number;
  retrying: number;
}

interface UnitRow {
  id: string;
  job_id: string;
  unit_key: string;
  position: number;
  status: string;
  input_payload: unknown;
  attempt_count: number;
  max_attempts: number;
  next_attempt_at: Date | null;
  lease_expires_at: Date | null;
  last_error_code: string | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  output_id: string | null;
  output_validation_status: string | null;
  output_updated_at: Date | null;
  latest_review_action: AiOutputReviewAction | null;
  attempt_id: string | null;
  attempt_number: number | null;
  attempt_provider_key: string | null;
  attempt_provider_project_alias: string | null;
  attempt_model_used: string | null;
  attempt_route_key: string | null;
  attempt_benchmark_version: string | null;
  attempt_status: AdminAiAttemptView["status"] | null;
  attempt_validation_status: AdminAiAttemptView["validationStatus"];
  attempt_retryable: boolean | null;
  attempt_input_tokens: number | null;
  attempt_output_tokens: number | null;
  attempt_latency_ms: number | null;
  attempt_estimated_cost_usd_micros: string | null;
  attempt_error_code: string | null;
  attempt_started_at: Date | null;
  attempt_completed_at: Date | null;
}

interface AttemptRow {
  id: string;
  attempt_number: number;
  provider_key: string;
  provider_project_alias: string | null;
  model_used: string;
  route_key: string;
  benchmark_version: string;
  status: AdminAiAttemptView["status"];
  validation_status: AdminAiAttemptView["validationStatus"];
  retryable: boolean | null;
  input_tokens: number | null;
  output_tokens: number | null;
  latency_ms: number | null;
  estimated_cost_usd_micros: string | null;
  error_code: string | null;
  started_at: Date;
  completed_at: Date | null;
}

interface OutputRow {
  id: string;
  job_unit_id: string;
  validation_status: string;
  raw_response: unknown;
  normalized_output: unknown;
  validation_errors: unknown;
  semantic_warnings: unknown;
  reviewed_by_profile_id: string | null;
  reviewed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  input_payload: unknown;
  unit_key: string;
  job_id: string;
}

interface ReviewEventRow {
  id: string;
  revision: number;
  action: AiOutputReviewAction;
  actor_profile_id: string;
  actor_display_name: string | null;
  reviewed_output: unknown;
  note: string | null;
  created_at: Date;
}

function lifecycleError(error: unknown): never {
  if (error instanceof AppError) throw error;
  const message = error instanceof Error ? error.message : "";
  if (message === "ai_job_not_found") {
    throw new AppError("NOT_FOUND", "مهمة الذكاء الاصطناعي غير موجودة", 404);
  }
  if (
    message.startsWith("ai_job_not_pauseable:") ||
    message.startsWith("ai_job_not_resumable:") ||
    message.startsWith("ai_job_not_retryable:") ||
    message === "ai_job_retry_no_failed_units"
  ) {
    throw new AppError("CONFLICT", "حالة المهمة الحالية لا تسمح بهذه العملية", 409);
  }
  throw error;
}

function reviewStatus(action: AiOutputReviewAction | null): AiOutputReviewStatus {
  if (action === "edit") return "edited";
  if (action === "approve") return "approved";
  if (action === "reject") return "rejected";
  return "pending";
}

function allowedReviewActions(
  latestAction: AiOutputReviewAction | null,
  requestInput: unknown,
  candidateInput: unknown,
): AiOutputAllowedReviewAction[] {
  if (latestAction === "approve" || latestAction === "reject") return [];
  const actions: AiOutputAllowedReviewAction[] = ["edit"];
  if (isAdminApprovalCandidateAllowed(requestInput, candidateInput)) actions.push("approve");
  actions.push("reject");
  return actions;
}

function progressFromRow(row: JobRow): AiJobProgress {
  const accepted = row.completed + row.review_required;
  const settled = accepted + row.failed + row.cancelled;
  const terminal = row.status === "completed" || row.status === "failed" || row.status === "cancelled";
  return {
    jobId: row.id,
    status: !terminal && row.paused_at ? "paused" : row.status,
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
    remainingUnits: Math.max(0, row.total - settled),
    progressPercent: row.total === 0 ? 100 : Math.min(100, Math.floor((settled * 100) / row.total)),
  };
}

function mapJob(row: JobRow): AdminAiJobListItem {
  const progress = progressFromRow(row);
  const { jobId: _jobId, status, executionStatus, pausedAt: _pausedAt, ...counts } = progress;
  return {
    id: row.id,
    jobType: row.job_type,
    status,
    executionStatus,
    promptKey: row.prompt_key,
    promptVersion: row.prompt_version,
    requestedModel: row.requested_model,
    priority: row.priority,
    createdByProfileId: row.created_by_profile_id,
    cancelRequestedAt: row.cancel_requested_at,
    pausedAt: row.paused_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    progress: counts,
  };
}

function sourceInfo(inputPayload: unknown): {
  mode: string;
  subjectDomain: string;
  sources: AdminAiSourceProvenance[];
} {
  const parsed = aiGenerationRequestSchema.safeParse(inputPayload);
  if (!parsed.success) {
    throw new AppError("INTERNAL_ERROR", "تعذر التحقق من مصدر مهمة الذكاء الاصطناعي", 500);
  }
  return {
    mode: parsed.data.mode,
    subjectDomain: parsed.data.subjectDomain,
    sources: parsed.data.sourceChunks.map((source) => ({
      mediaAssetId: source.mediaAssetId,
      pageNumber: source.pageNumber,
      inputChecksumSha256: source.inputChecksumSha256,
      inputKind: source.inputKind,
      ocrExtractionId: source.ocrExtractionId,
      contentSourceAssetId: source.contentSourceAssetId ?? null,
    })),
  };
}

function mapAttempt(row: AttemptRow): AdminAiAttemptView {
  return {
    id: row.id,
    attemptNumber: row.attempt_number,
    providerKey: row.provider_key,
    providerProjectAlias: row.provider_project_alias,
    modelUsed: row.model_used,
    routeKey: row.route_key,
    benchmarkVersion: row.benchmark_version,
    status: row.status,
    validationStatus: row.validation_status,
    retryable: row.retryable,
    inputTokens: row.input_tokens,
    outputTokens: row.output_tokens,
    latencyMs: row.latency_ms,
    estimatedCostUsdMicros:
      row.estimated_cost_usd_micros === null ? null : Number(row.estimated_cost_usd_micros),
    errorCode: row.error_code,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

function latestAttempt(row: UnitRow): AdminAiAttemptView | null {
  if (
    !row.attempt_id ||
    row.attempt_number === null ||
    !row.attempt_provider_key ||
    !row.attempt_model_used ||
    !row.attempt_route_key ||
    !row.attempt_benchmark_version ||
    !row.attempt_status ||
    !row.attempt_started_at
  )
    return null;
  return mapAttempt({
    id: row.attempt_id,
    attempt_number: row.attempt_number,
    provider_key: row.attempt_provider_key,
    provider_project_alias: row.attempt_provider_project_alias,
    model_used: row.attempt_model_used,
    route_key: row.attempt_route_key,
    benchmark_version: row.attempt_benchmark_version,
    status: row.attempt_status,
    validation_status: row.attempt_validation_status,
    retryable: row.attempt_retryable,
    input_tokens: row.attempt_input_tokens,
    output_tokens: row.attempt_output_tokens,
    latency_ms: row.attempt_latency_ms,
    estimated_cost_usd_micros: row.attempt_estimated_cost_usd_micros,
    error_code: row.attempt_error_code,
    started_at: row.attempt_started_at,
    completed_at: row.attempt_completed_at,
  });
}

function mapUnit(row: UnitRow): AdminAiUnitView {
  const source = sourceInfo(row.input_payload);
  return {
    id: row.id,
    jobId: row.job_id,
    unitKey: row.unit_key,
    position: row.position,
    status: row.status,
    mode: source.mode,
    subjectDomain: source.subjectDomain,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    nextAttemptAt: row.next_attempt_at,
    leaseExpiresAt: row.lease_expires_at,
    lastErrorCode: row.last_error_code,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sourceProvenance: source.sources,
    latestAttempt: latestAttempt(row),
    output:
      row.output_id && row.output_validation_status && row.output_updated_at
        ? {
            id: row.output_id,
            validationStatus: row.output_validation_status,
            reviewStatus: reviewStatus(row.latest_review_action),
            updatedAt: row.output_updated_at,
          }
        : null,
  };
}

const JOB_SELECT = `
  select j.id, j.job_type, j.status, j.prompt_key, j.prompt_version, j.requested_model,
         j.priority, j.created_by_profile_id, j.cancel_requested_at, j.paused_at,
         j.started_at, j.completed_at, j.created_at, j.updated_at,
         count(u.id)::int as total,
         count(*) filter (where u.status = 'completed')::int as completed,
         count(*) filter (where u.status = 'review_required')::int as review_required,
         count(*) filter (where u.status = 'failed')::int as failed,
         count(*) filter (where u.status = 'cancelled')::int as cancelled,
         count(*) filter (where u.status = 'queued')::int as queued,
         count(*) filter (where u.status = 'running')::int as running,
         count(*) filter (where u.status = 'retrying')::int as retrying
  from ai_jobs j
  left join ai_job_units u on u.job_id = j.id`;

const UNIT_SELECT = `
  select u.id, u.job_id, u.unit_key, u.position, u.status, u.input_payload,
         u.attempt_count, u.max_attempts, u.next_attempt_at, u.lease_expires_at,
         u.last_error_code, u.started_at, u.completed_at, u.created_at, u.updated_at,
         o.id as output_id, o.validation_status as output_validation_status,
         o.updated_at as output_updated_at, review.action as latest_review_action,
         attempt.id as attempt_id, attempt.attempt_number,
         attempt.provider_key as attempt_provider_key,
         attempt.provider_project_alias as attempt_provider_project_alias,
         attempt.model_used as attempt_model_used, attempt.route_key as attempt_route_key,
         attempt.benchmark_version as attempt_benchmark_version, attempt.status as attempt_status,
         attempt.validation_status as attempt_validation_status, attempt.retryable as attempt_retryable,
         attempt.input_tokens as attempt_input_tokens, attempt.output_tokens as attempt_output_tokens,
         attempt.latency_ms as attempt_latency_ms,
         attempt.estimated_cost_usd_micros as attempt_estimated_cost_usd_micros,
         attempt.error_code as attempt_error_code, attempt.started_at as attempt_started_at,
         attempt.completed_at as attempt_completed_at
  from ai_job_units u
  left join ai_outputs o on o.job_unit_id = u.id
  left join lateral (
    select e.action from ai_output_review_events e
    where e.ai_output_id = o.id order by e.revision desc limit 1
  ) review on true
  left join lateral (
    select a.id, a.attempt_number, a.provider_key, a.provider_project_alias, a.model_used,
           a.route_key, a.benchmark_version, a.status, a.validation_status, a.retryable,
           a.input_tokens, a.output_tokens, a.latency_ms, a.estimated_cost_usd_micros,
           a.error_code, a.started_at, a.completed_at
    from ai_execution_attempts a
    where a.job_unit_id = u.id order by a.attempt_number desc limit 1
  ) attempt on true`;

export class AdminAiOperationsService {
  private readonly lifecycle = new AiJobLifecycleRepository();
  private readonly execution = new AiExecutionRepository();

  constructor(private readonly database: Database) {}

  async listJobs(filters: AdminAiJobFilters): Promise<{
    jobs: AdminAiJobListItem[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const status = filters.status ?? null;
    const jobType = filters.jobType?.trim() || null;
    const where = `(
      $1::text is null
      or ($1 = 'paused' and j.paused_at is not null and j.status not in ('completed','failed','cancelled'))
      or ($1 <> 'paused' and j.status::text = $1 and (j.status in ('completed','failed','cancelled') or j.paused_at is null))
    ) and ($2::text is null or j.job_type = $2)`;
    const rows = await this.database.query<JobRow>(
      `${JOB_SELECT}
       where ${where}
       group by j.id
       order by j.created_at desc, j.id desc
       limit $3 offset $4`,
      [status, jobType, filters.limit, filters.offset],
    );
    const totals = await this.database.query<{ count: string }>(
      `select count(*) from ai_jobs j where ${where}`,
      [status, jobType],
    );
    return {
      jobs: rows.map(mapJob),
      pagination: { total: Number(totals[0]?.count ?? 0), limit: filters.limit, offset: filters.offset },
    };
  }

  async jobDetail(
    jobId: string,
    unitLimit: number,
    unitOffset: number,
  ): Promise<{
    job: AdminAiJobDetailItem;
    units: AdminAiUnitView[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const jobs = await this.database.query<JobRow>(`${JOB_SELECT} where j.id = $1 group by j.id`, [jobId]);
    const job = jobs[0];
    if (!job) throw new AppError("NOT_FOUND", "مهمة الذكاء الاصطناعي غير موجودة", 404);
    const [units, allowedActions] = await Promise.all([
      this.database.query<UnitRow>(
        `${UNIT_SELECT} where u.job_id = $1 order by u.position, u.id limit $2 offset $3`,
        [jobId, unitLimit, unitOffset],
      ),
      this.database.transaction((tx) => this.lifecycle.getAllowedActions(tx, jobId)),
    ]);
    return {
      job: { ...mapJob(job), allowedActions },
      units: units.map(mapUnit),
      pagination: { total: job.total, limit: unitLimit, offset: unitOffset },
    };
  }

  async unitDetail(
    unitId: string,
    attemptLimit: number,
    attemptOffset: number,
  ): Promise<{
    unit: AdminAiUnitView;
    attempts: AdminAiAttemptView[];
    attemptPagination: { total: number; limit: number; offset: number };
  }> {
    const units = await this.database.query<UnitRow>(`${UNIT_SELECT} where u.id = $1`, [unitId]);
    const unit = units[0];
    if (!unit) throw new AppError("NOT_FOUND", "وحدة الذكاء الاصطناعي غير موجودة", 404);
    const [attempts, totals] = await Promise.all([
      this.database.query<AttemptRow>(
        `select id, attempt_number, provider_key, provider_project_alias, model_used,
                route_key, benchmark_version, status, validation_status, retryable,
                input_tokens, output_tokens, latency_ms, estimated_cost_usd_micros,
                error_code, started_at, completed_at
         from ai_execution_attempts
         where job_unit_id = $1 order by attempt_number desc limit $2 offset $3`,
        [unitId, attemptLimit, attemptOffset],
      ),
      this.database.query<{ count: string }>(
        "select count(*) from ai_execution_attempts where job_unit_id = $1",
        [unitId],
      ),
    ]);
    return {
      unit: mapUnit(unit),
      attempts: attempts.map(mapAttempt),
      attemptPagination: { total: Number(totals[0]?.count ?? 0), limit: attemptLimit, offset: attemptOffset },
    };
  }

  async outputDetail(outputId: string): Promise<AdminAiOutputDetail> {
    const rows = await this.database.query<OutputRow>(
      `select o.id, o.job_unit_id, o.validation_status, o.raw_response, o.normalized_output,
              o.validation_errors, o.semantic_warnings, o.reviewed_by_profile_id, o.reviewed_at,
              o.created_at, o.updated_at, u.input_payload, u.unit_key, u.job_id
       from ai_outputs o join ai_job_units u on u.id = o.job_unit_id where o.id = $1`,
      [outputId],
    );
    const output = rows[0];
    if (!output) throw new AppError("NOT_FOUND", "مخرج الذكاء الاصطناعي غير موجود", 404);

    const events = await this.database.query<ReviewEventRow>(
      `select e.id, e.revision, e.action, e.actor_profile_id,
              p.display_name as actor_display_name, e.reviewed_output, e.note, e.created_at
       from ai_output_review_events e
       left join profiles p on p.id = e.actor_profile_id
       where e.ai_output_id = $1 order by e.revision desc limit 100`,
      [outputId],
    );

    const normalized =
      output.normalized_output === null ? null : aiGenerationOutputSchema.safeParse(output.normalized_output);
    if (normalized && !normalized.success) {
      throw new AppError("INTERNAL_ERROR", "المخرج المخزن لا يطابق عقد الذكاء الاصطناعي", 500);
    }
    const history = events.map((event): AdminAiOutputReviewEvent => {
      const reviewed =
        event.reviewed_output === null ? null : aiGenerationOutputSchema.safeParse(event.reviewed_output);
      if (reviewed && !reviewed.success) {
        throw new AppError("INTERNAL_ERROR", "سجل المراجعة لا يطابق عقد الذكاء الاصطناعي", 500);
      }
      return {
        id: event.id,
        revision: event.revision,
        action: event.action,
        actorProfileId: event.actor_profile_id,
        actorDisplayName: event.actor_display_name,
        reviewedOutput: reviewed?.data ?? null,
        note: event.note,
        createdAt: event.created_at,
      };
    });
    const latest = history[0] ?? null;
    const source = sourceInfo(output.input_payload);
    const currentReviewCandidate = latest?.action === "edit" ? latest.reviewedOutput : normalized?.data ?? null;
    let effectiveReviewedOutput: AiGenerationOutput | null = normalized?.data ?? null;
    if (latest?.action === "edit" || latest?.action === "approve")
      effectiveReviewedOutput = latest.reviewedOutput;
    if (latest?.action === "reject") effectiveReviewedOutput = null;

    return {
      id: output.id,
      jobId: output.job_id,
      jobUnitId: output.job_unit_id,
      unitKey: output.unit_key,
      validationStatus: output.validation_status,
      normalizedOutput: normalized?.data ?? null,
      validationErrors: output.validation_errors,
      semanticWarnings: output.semantic_warnings,
      hasRawResponse: output.raw_response !== null,
      reviewStatus: reviewStatus(latest?.action ?? null),
      allowedReviewActions: allowedReviewActions(
        latest?.action ?? null,
        output.input_payload,
        currentReviewCandidate,
      ),
      effectiveReviewedOutput,
      reviewedByProfileId: output.reviewed_by_profile_id,
      reviewedAt: output.reviewed_at,
      sourceProvenance: source.sources,
      reviewHistory: history,
      createdAt: output.created_at,
      updatedAt: output.updated_at,
    };
  }

  async pauseJob(jobId: string): Promise<AiJobProgress> {
    try {
      return await this.database.transaction((tx) => this.lifecycle.requestPause(tx, jobId));
    } catch (error) {
      return lifecycleError(error);
    }
  }

  async resumeJob(jobId: string): Promise<AiJobProgress> {
    try {
      return await this.database.transaction((tx) => this.lifecycle.requestResume(tx, jobId));
    } catch (error) {
      return lifecycleError(error);
    }
  }

  async retryJob(jobId: string): Promise<AiJobProgress> {
    try {
      return await this.database.transaction((tx) => this.lifecycle.requestRetry(tx, jobId));
    } catch (error) {
      return lifecycleError(error);
    }
  }

  async cancelJob(jobId: string): Promise<AiJobProgress> {
    try {
      return await this.database.transaction(async (tx) => {
        const job = await this.lockJob(tx, jobId);
        if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
          throw new Error(`ai_job_not_cancelable:${job.status}`);
        }
        await this.execution.requestCancel(tx, jobId);
        return this.lifecycle.getProgress(tx, jobId);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.startsWith("ai_job_not_cancelable:")) {
        throw new AppError("CONFLICT", "حالة المهمة الحالية لا تسمح بالإلغاء", 409);
      }
      return lifecycleError(error);
    }
  }

  async reviewOutput(
    actorProfileId: string,
    outputId: string,
    input: { action: AiOutputReviewAction; editedOutput?: unknown; note?: string },
  ): Promise<AdminAiOutputDetail> {
    const note = input.note?.trim() || null;
    if (input.action === "reject" && !note) throw new AppError("BAD_REQUEST", "سبب الرفض مطلوب", 400);
    if (input.action === "edit" && input.editedOutput === undefined) {
      throw new AppError("BAD_REQUEST", "المخرج المعدل مطلوب", 400);
    }

    await this.database.transaction(async (tx) => {
      const outputs = await tx.query<{ id: string; normalized_output: unknown; input_payload: unknown }>(
        `select o.id, o.normalized_output, u.input_payload
         from ai_outputs o
         join ai_job_units u on u.id = o.job_unit_id
         where o.id = $1
         for update of o`,
        [outputId],
      );
      const output = outputs[0];
      if (!output) throw new AppError("NOT_FOUND", "مخرج الذكاء الاصطناعي غير موجود", 404);

      const latestRows = await tx.query<{
        revision: number;
        action: AiOutputReviewAction;
        reviewed_output: unknown;
      }>(
        `select revision, action, reviewed_output from ai_output_review_events
         where ai_output_id = $1 order by revision desc limit 1`,
        [outputId],
      );
      const latest = latestRows[0] ?? null;
      if (latest?.action === "approve" || latest?.action === "reject") {
        throw new AppError("CONFLICT", "تم إنهاء مراجعة هذا المخرج بالفعل", 409);
      }

      const normalized = aiGenerationOutputSchema.safeParse(output.normalized_output);
      const currentDraft = latest?.action === "edit" ? latest.reviewed_output : output.normalized_output;
      let reviewedOutput: AiGenerationOutput | null = null;

      if (input.action === "edit") {
        const edited = aiGenerationOutputSchema.safeParse(input.editedOutput);
        if (!edited.success)
          throw new AppError("BAD_REQUEST", "المخرج المعدل لا يطابق عقد الذكاء الاصطناعي", 400);
        if (normalized.success && edited.data.kind !== normalized.data.kind) {
          throw new AppError("BAD_REQUEST", "لا يمكن تغيير نوع مخرج الذكاء الاصطناعي أثناء المراجعة", 400);
        }
        reviewedOutput = validateAdminEditedOutput(output.input_payload, edited.data);
      } else if (input.action === "approve") {
        reviewedOutput = validateAdminApprovalOutput(output.input_payload, currentDraft);
      }

      await tx.query(
        `insert into ai_output_review_events (
           ai_output_id, revision, action, actor_profile_id, reviewed_output, note
         ) values ($1, $2, $3::ai_output_review_action, $4, $5::jsonb, $6)`,
        [
          outputId,
          (latest?.revision ?? 0) + 1,
          input.action,
          actorProfileId,
          reviewedOutput === null ? null : JSON.stringify(reviewedOutput),
          note,
        ],
      );
      await tx.query("update ai_outputs set reviewed_by_profile_id = $2, reviewed_at = now() where id = $1", [
        outputId,
        actorProfileId,
      ]);
    });
    return this.outputDetail(outputId);
  }

  private async lockJob(
    executor: QueryExecutor,
    jobId: string,
  ): Promise<{ id: string; status: AiJobExecutionStatus }> {
    const rows = await executor.query<{ id: string; status: AiJobExecutionStatus }>(
      "select id, status from ai_jobs where id = $1 for update",
      [jobId],
    );
    const job = rows[0];
    if (!job) throw new Error("ai_job_not_found");
    return job;
  }
}
