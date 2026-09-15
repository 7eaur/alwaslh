import type {
  AiAttemptApi,
  AiGenerationOutputApi,
  AiJobDetailResponse,
  AiJobListItemApi,
  AiOutputDetailApi,
  AiSourceEvidenceApi,
  AiSourceProvenanceApi,
  AiUnitApi,
} from "./ai-operations-api";
import type {
  AiAttemptView,
  AiGenerationOutputView,
  AiJobDetailView,
  AiJobSummaryView,
  AiPaginationView,
  AiReviewOutputView,
  AiSourceEvidenceView,
  AiSourceProvenanceView,
  AiUnitStatus,
  AiUnitView,
  AiValidationIssueView,
} from "./ai-operations-view-model";

function sourceEvidence(source: AiSourceEvidenceApi): AiSourceEvidenceView {
  return {
    mediaAssetId: source.mediaAssetId,
    pageNumber: source.pageNumber,
    ocrExtractionId: source.ocrExtractionId ?? null,
    quote: source.quote ?? null,
  };
}

function sourceProvenance(source: AiSourceProvenanceApi): AiSourceProvenanceView {
  return {
    mediaAssetId: source.mediaAssetId,
    pageNumber: source.pageNumber,
    inputChecksumSha256: source.inputChecksumSha256,
    inputKind: source.inputKind,
    ocrExtractionId: source.ocrExtractionId,
    contentSourceAssetId: source.contentSourceAssetId,
  };
}

function question(questionValue: Extract<AiGenerationOutputApi, { kind: "question_set" }>["questions"][number]) {
  return {
    prompt: questionValue.prompt,
    type: questionValue.type,
    options: questionValue.options,
    correctOptionIndex: questionValue.correctOptionIndex,
    answerText: questionValue.answerText,
    answerStatus: questionValue.answerStatus,
    difficulty: questionValue.difficulty,
    explanation: questionValue.explanation,
    method: questionValue.method,
    sourceEvidence: questionValue.sourceEvidence.map(sourceEvidence),
  };
}

export function mapGenerationOutput(output: AiGenerationOutputApi): AiGenerationOutputView {
  if (output.kind === "summary") {
    return { kind: output.kind, summary: output.summary, sourceEvidence: output.sourceEvidence.map(sourceEvidence) };
  }
  if (output.kind === "question_set") {
    return { kind: output.kind, questions: output.questions.map(question) };
  }
  if (output.kind === "multi_version_quiz") {
    return {
      kind: output.kind,
      versions: output.versions.map((version) => ({ label: version.label, questions: version.questions.map(question) })),
    };
  }
  if (output.kind === "lesson_content") {
    return {
      kind: output.kind,
      summary: output.summary,
      summaryEvidence: output.summaryEvidence.map(sourceEvidence),
      questions: output.questions.map(question),
    };
  }
  return {
    kind: output.kind,
    title: output.title,
    pageNumber: output.pageNumber,
    contentPreview: output.contentPreview,
    sourceEvidence: output.sourceEvidence.map(sourceEvidence),
  };
}

function unitStatus(value: string): AiUnitStatus {
  if (
    value === "queued" ||
    value === "running" ||
    value === "retrying" ||
    value === "completed" ||
    value === "failed" ||
    value === "cancelled" ||
    value === "review_required"
  ) return value;
  throw new Error(`unsupported_ai_unit_status:${value}`);
}

export function mapAiAttempt(attempt: AiAttemptApi): AiAttemptView {
  return {
    id: attempt.id,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    providerKey: attempt.providerKey,
    projectAlias: attempt.providerProjectAlias,
    modelUsed: attempt.modelUsed,
    routeKey: attempt.routeKey,
    benchmarkVersion: attempt.benchmarkVersion,
    validationStatus: attempt.validationStatus,
    retryable: attempt.retryable,
    inputTokens: attempt.inputTokens,
    outputTokens: attempt.outputTokens,
    latencyMs: attempt.latencyMs,
    estimatedCostUsd: attempt.estimatedCostUsdMicros === null ? null : attempt.estimatedCostUsdMicros / 1_000_000,
    errorCode: attempt.errorCode,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
  };
}

function issueSeverity(value: unknown): AiValidationIssueView["severity"] {
  if (value === "error" || value === "review" || value === "warning") return value;
  return "warning";
}

export function mapValidationIssues(value: unknown): AiValidationIssueView[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate, index) => {
    if (!candidate || typeof candidate !== "object") return [];
    const record = candidate as Record<string, unknown>;
    return [{
      code: typeof record.code === "string" ? record.code : `issue_${index + 1}`,
      severity: issueSeverity(record.severity),
      path: typeof record.path === "string" ? record.path : "",
      message: typeof record.message === "string" ? record.message : "ملاحظة تحقق مسجلة في الخادم",
    }];
  });
}

export function mapAiOutputDetail(output: AiOutputDetailApi): AiReviewOutputView {
  return {
    id: output.id,
    validationStatus: output.validationStatus,
    reviewStatus: output.reviewStatus,
    normalizedOutput: output.normalizedOutput ? mapGenerationOutput(output.normalizedOutput) : null,
    effectiveReviewedOutput: output.effectiveReviewedOutput ? mapGenerationOutput(output.effectiveReviewedOutput) : null,
    hasRawResponse: output.hasRawResponse,
    validationIssues: mapValidationIssues(output.validationErrors),
    semanticWarnings: mapValidationIssues(output.semanticWarnings),
    reviewedBy: output.reviewedByProfileId,
    reviewedAt: output.reviewedAt,
    sourceProvenance: output.sourceProvenance.map(sourceProvenance),
    reviewHistory: output.reviewHistory.map((event) => ({
      id: event.id,
      revision: event.revision,
      action: event.action,
      actorProfileId: event.actorProfileId,
      actorDisplayName: event.actorDisplayName,
      note: event.note,
      createdAt: event.createdAt,
    })),
    reviewPagination: { ...output.reviewPagination },
    allowedReviewActions: [...output.allowedReviewActions],
    application: null,
  };
}

function progress(job: AiJobListItemApi) {
  return {
    jobId: job.id,
    status: job.status,
    executionStatus: job.executionStatus,
    pausedAt: job.pausedAt,
    ...job.progress,
  };
}

export function mapAiJobSummary(job: AiJobListItemApi): AiJobSummaryView {
  return {
    id: job.id,
    jobType: job.jobType,
    promptKey: job.promptKey,
    promptVersion: job.promptVersion,
    createdAt: job.createdAt,
    progress: progress(job),
  };
}

function mapUnit(
  unit: AiUnitApi,
  attempts: readonly AiAttemptApi[] = [],
  attemptPagination: AiPaginationView | null = null,
): AiUnitView {
  return {
    id: unit.id,
    unitKey: unit.unitKey,
    position: unit.position,
    mode: unit.mode,
    subjectDomain: unit.subjectDomain,
    status: unitStatus(unit.status),
    attemptCount: unit.attemptCount,
    maxAttempts: unit.maxAttempts,
    nextAttemptAt: unit.nextAttemptAt,
    leaseExpiresAt: unit.leaseExpiresAt,
    lastErrorCode: unit.lastErrorCode,
    sourceProvenance: unit.sourceProvenance.map(sourceProvenance),
    attempts: attempts.map(mapAiAttempt),
    attemptPagination,
    output: null,
  };
}

export function mapAiJobDetail(response: AiJobDetailResponse): AiJobDetailView {
  return {
    ...mapAiJobSummary(response.job),
    allowedActions: [...response.job.allowedActions],
    units: response.units.map((unit) => mapUnit(unit, unit.latestAttempt ? [unit.latestAttempt] : [])),
    unitPagination: { ...response.pagination },
  };
}

export function enrichAiUnit(
  unit: AiUnitApi,
  attempts: readonly AiAttemptApi[],
  output: AiReviewOutputView | null,
  attemptPagination: AiPaginationView,
): AiUnitView {
  return { ...mapUnit(unit, attempts, { ...attemptPagination }), output };
}
