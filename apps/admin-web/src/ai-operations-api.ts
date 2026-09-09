import { ApiRequestError, adminApiRequest } from "./admin-api";
import type {
  AiAnswerStatus,
  AiDifficulty,
  AiGenerationMode,
  AiJobAction,
  AiJobExecutionStatus,
  AiJobLifecycleStatus,
  AiQuestionType,
  AiReviewAction,
  AiReviewStatus,
  AiValidationStatus,
} from "./ai-operations-view-model";

export interface AiSourceEvidenceApi {
  mediaAssetId: string;
  pageNumber: number;
  ocrExtractionId?: string | null;
  quote?: string;
}

export interface AiQuestionApi {
  prompt: string;
  type: AiQuestionType;
  options: string[];
  correctOptionIndex: number | null;
  answerText: string | null;
  answerStatus: AiAnswerStatus;
  difficulty: AiDifficulty;
  explanation: string | null;
  method: string | null;
  sourceEvidence: AiSourceEvidenceApi[];
}

export type AiGenerationOutputApi =
  | { kind: "summary"; summary: string; sourceEvidence: AiSourceEvidenceApi[] }
  | { kind: "question_set"; questions: AiQuestionApi[] }
  | { kind: "multi_version_quiz"; versions: Array<{ label: string; questions: AiQuestionApi[] }> }
  | { kind: "lesson_content"; summary: string; summaryEvidence: AiSourceEvidenceApi[]; questions: AiQuestionApi[] }
  | { kind: "page_detection"; title: string; pageNumber: number | null; contentPreview: string; sourceEvidence: AiSourceEvidenceApi[] };

export interface AiSourceProvenanceApi {
  mediaAssetId: string;
  pageNumber: number;
  inputChecksumSha256: string;
  inputKind: "approved_ocr" | "vision_fallback";
  ocrExtractionId: string | null;
  contentSourceAssetId: string | null;
}

export interface AiJobProgressCountsApi {
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

export interface AiJobProgressApi extends AiJobProgressCountsApi {
  jobId: string;
  status: AiJobLifecycleStatus;
  executionStatus: AiJobExecutionStatus;
  pausedAt: string | null;
}

export interface AiJobListItemApi {
  id: string;
  jobType: string;
  status: AiJobLifecycleStatus;
  executionStatus: AiJobExecutionStatus;
  promptKey: string;
  promptVersion: string;
  requestedModel: string | null;
  priority: number;
  createdByProfileId: string | null;
  cancelRequestedAt: string | null;
  pausedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  progress: AiJobProgressCountsApi;
}

export interface AiJobDetailItemApi extends AiJobListItemApi {
  allowedActions: AiJobAction[];
}

export interface AiAttemptApi {
  id: string;
  attemptNumber: number;
  providerKey: string;
  providerProjectAlias: string | null;
  modelUsed: string;
  routeKey: string;
  benchmarkVersion: string;
  status: "running" | "completed" | "failed" | "cancelled";
  validationStatus: AiValidationStatus | null;
  retryable: boolean | null;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number | null;
  estimatedCostUsdMicros: number | null;
  errorCode: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface AiUnitApi {
  id: string;
  jobId: string;
  unitKey: string;
  position: number;
  status: string;
  mode: AiGenerationMode;
  subjectDomain: string;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string | null;
  leaseExpiresAt: string | null;
  lastErrorCode: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sourceProvenance: AiSourceProvenanceApi[];
  latestAttempt: AiAttemptApi | null;
  output: null | {
    id: string;
    validationStatus: AiValidationStatus;
    reviewStatus: AiReviewStatus;
    updatedAt: string;
  };
}

export interface AiReviewEventApi {
  id: string;
  revision: number;
  action: AiReviewAction;
  actorProfileId: string;
  actorDisplayName: string | null;
  reviewedOutput: AiGenerationOutputApi | null;
  note: string | null;
  createdAt: string;
}

export interface AiOutputDetailApi {
  id: string;
  jobId: string;
  jobUnitId: string;
  unitKey: string;
  validationStatus: AiValidationStatus;
  normalizedOutput: AiGenerationOutputApi | null;
  validationErrors: unknown;
  semanticWarnings: unknown;
  hasRawResponse: boolean;
  reviewStatus: AiReviewStatus;
  allowedReviewActions: AiReviewAction[];
  effectiveReviewedOutput: AiGenerationOutputApi | null;
  reviewedByProfileId: string | null;
  reviewedAt: string | null;
  sourceProvenance: AiSourceProvenanceApi[];
  reviewHistory: AiReviewEventApi[];
  reviewPagination: { total: number; limit: number; offset: number };
  createdAt: string;
  updatedAt: string;
}

export interface AiJobsResponse {
  jobs: AiJobListItemApi[];
  pagination: { total: number; limit: number; offset: number };
}

export interface AiJobDetailResponse {
  job: AiJobDetailItemApi;
  units: AiUnitApi[];
  pagination: { total: number; limit: number; offset: number };
}

export interface AiUnitDetailResponse {
  unit: AiUnitApi;
  attempts: AiAttemptApi[];
  attemptPagination: { total: number; limit: number; offset: number };
}

export interface AiOutputDetailResponse { output: AiOutputDetailApi }

export interface AiJobFilters {
  status?: AiJobLifecycleStatus;
  jobType?: string;
  limit?: number;
  offset?: number;
}

export type AiReviewMutationInput =
  | { action: "edit"; editedOutput: AiGenerationOutputApi; note?: string }
  | { action: "approve"; note?: string }
  | { action: "reject"; note: string };

function withQuery(path: string, values: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

function reviewBody(input: AiReviewMutationInput): string {
  return JSON.stringify(input, (key, value) => key === "quote" && value === null ? undefined : value);
}

export function fetchAiJobs(filters: AiJobFilters = {}): Promise<AiJobsResponse> {
  return adminApiRequest<AiJobsResponse>(withQuery("/v1/admin/ai/jobs", {
    status: filters.status,
    jobType: filters.jobType?.trim() || undefined,
    limit: filters.limit,
    offset: filters.offset,
  }));
}

export function fetchAiJobDetail(jobId: string, unitLimit = 50, unitOffset = 0): Promise<AiJobDetailResponse> {
  return adminApiRequest<AiJobDetailResponse>(withQuery(`/v1/admin/ai/jobs/${jobId}`, { unitLimit, unitOffset }));
}

export function fetchAiUnitDetail(unitId: string, attemptLimit = 50, attemptOffset = 0): Promise<AiUnitDetailResponse> {
  return adminApiRequest<AiUnitDetailResponse>(withQuery(`/v1/admin/ai/units/${unitId}`, { attemptLimit, attemptOffset }));
}

export function fetchAiOutputDetail(outputId: string, reviewLimit = 50, reviewOffset = 0): Promise<AiOutputDetailApi> {
  return adminApiRequest<AiOutputDetailResponse>(withQuery(`/v1/admin/ai/outputs/${outputId}`, {
    reviewLimit,
    reviewOffset,
  })).then((result) => result.output);
}

export function mutateAiJob(jobId: string, action: AiJobAction): Promise<AiJobProgressApi> {
  return adminApiRequest<{ progress: AiJobProgressApi }>(`/v1/admin/ai/jobs/${jobId}/${action}`, { method: "POST" }).then((result) => result.progress);
}

export function reviewAiOutput(outputId: string, input: AiReviewMutationInput): Promise<AiOutputDetailApi> {
  return adminApiRequest<AiOutputDetailResponse>(`/v1/admin/ai/outputs/${outputId}/review`, {
    method: "PATCH",
    body: reviewBody(input),
  }).then((result) => result.output);
}

export function isAiConflictError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError && error.code === "CONFLICT" && error.status === 409;
}
