export type AiJobExecutionStatus =
  | "queued"
  | "running"
  | "retrying"
  | "completed"
  | "failed"
  | "cancelled";

export type AiJobLifecycleStatus = AiJobExecutionStatus | "paused";
export type AiUnitStatus = AiJobExecutionStatus | "review_required";
export type AiAttemptStatus = "running" | "completed" | "failed" | "cancelled";
export type AiValidationStatus = "pending" | "valid" | "invalid" | "review_required";
export type AiValidationSeverity = "error" | "review" | "warning";
export type AiReviewStatus = "pending" | "edited" | "approved" | "rejected";

export type AiGenerationMode =
  | "lesson_summary"
  | "question_generation"
  | "comprehensive_lesson_content"
  | "multi_version_quiz"
  | "exact_question_extraction"
  | "exact_exam_extraction"
  | "replica_question_extraction"
  | "regenerate_question"
  | "page_detection";

export type AiQuestionType = "multiple_choice" | "true_false" | "direct";
export type AiDifficulty = "easy" | "medium" | "hard";
export type AiAnswerStatus = "known" | "unknown" | "review_required";
export type AiJobAction = "pause" | "resume" | "cancel" | "retry";
export type AiReviewAction = "edit" | "approve" | "reject";

export interface AiJobProgressView {
  jobId: string;
  status: AiJobLifecycleStatus;
  executionStatus: AiJobExecutionStatus;
  pausedAt: string | null;
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

export interface AiSourceEvidenceView {
  mediaAssetId: string;
  pageNumber: number;
  ocrExtractionId: string | null;
  quote: string | null;
}

export interface AiSourceProvenanceView {
  mediaAssetId: string;
  pageNumber: number;
  inputChecksumSha256: string;
  inputKind: "approved_ocr" | "vision_fallback";
  ocrExtractionId: string | null;
  contentSourceAssetId: string | null;
}

export interface AiQuestionView {
  prompt: string;
  type: AiQuestionType;
  options: readonly string[];
  correctOptionIndex: number | null;
  answerText: string | null;
  answerStatus: AiAnswerStatus;
  difficulty: AiDifficulty;
  explanation: string | null;
  method: string | null;
  sourceEvidence: readonly AiSourceEvidenceView[];
}

export type AiGenerationOutputView =
  | {
      kind: "summary";
      summary: string;
      sourceEvidence: readonly AiSourceEvidenceView[];
    }
  | {
      kind: "question_set";
      questions: readonly AiQuestionView[];
    }
  | {
      kind: "multi_version_quiz";
      versions: readonly {
        label: string;
        questions: readonly AiQuestionView[];
      }[];
    }
  | {
      kind: "lesson_content";
      summary: string;
      summaryEvidence: readonly AiSourceEvidenceView[];
      questions: readonly AiQuestionView[];
    }
  | {
      kind: "page_detection";
      title: string;
      pageNumber: number | null;
      contentPreview: string;
      sourceEvidence: readonly AiSourceEvidenceView[];
    };

export interface AiValidationIssueView {
  code: string;
  severity: AiValidationSeverity;
  path: string;
  message: string;
}

export interface AiReviewHistoryEventView {
  id: string;
  revision: number;
  action: AiReviewAction;
  actorProfileId: string;
  actorDisplayName: string | null;
  note: string | null;
  createdAt: string;
}

export interface AiReviewOutputView {
  id: string;
  validationStatus: AiValidationStatus;
  reviewStatus: AiReviewStatus;
  normalizedOutput: AiGenerationOutputView | null;
  effectiveReviewedOutput: AiGenerationOutputView | null;
  hasRawResponse: boolean;
  validationIssues: readonly AiValidationIssueView[];
  semanticWarnings: readonly AiValidationIssueView[];
  reviewedBy: string | null;
  reviewedAt: string | null;
  sourceProvenance: readonly AiSourceProvenanceView[];
  reviewHistory: readonly AiReviewHistoryEventView[];
  allowedReviewActions: readonly AiReviewAction[];
}

export interface AiAttemptView {
  id: string;
  attemptNumber: number;
  status: AiAttemptStatus;
  providerKey: string;
  projectAlias: string | null;
  modelUsed: string;
  routeKey: string;
  benchmarkVersion: string;
  validationStatus: AiValidationStatus | null;
  retryable: boolean | null;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number | null;
  estimatedCostUsd: number | null;
  errorCode: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface AiUnitView {
  id: string;
  unitKey: string;
  position: number;
  mode: AiGenerationMode;
  subjectDomain: string;
  status: AiUnitStatus;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string | null;
  leaseExpiresAt: string | null;
  lastErrorCode: string | null;
  sourceProvenance: readonly AiSourceProvenanceView[];
  attempts: readonly AiAttemptView[];
  output: AiReviewOutputView | null;
}

export interface AiJobSummaryView {
  id: string;
  jobType: string;
  promptKey: string;
  promptVersion: string;
  createdAt: string;
  progress: AiJobProgressView;
}

export interface AiJobDetailView extends AiJobSummaryView {
  allowedActions: readonly AiJobAction[];
  units: readonly AiUnitView[];
}

export interface AiOperationsFeedback {
  kind: "busy" | "success" | "error";
  message: string;
}

export interface AiOperationsWorkspaceModel {
  state: "loading" | "error" | "empty" | "ready";
  errorMessage: string | null;
  jobs: readonly AiJobSummaryView[];
  selectedJobId: string | null;
  selectedJobState: "idle" | "loading" | "error" | "ready";
  selectedJobError: string | null;
  selectedJob: AiJobDetailView | null;
  selectedUnitId: string | null;
  isRefreshing: boolean;
  feedback: AiOperationsFeedback | null;
}

export function jobStatusLabel(status: AiJobLifecycleStatus): string {
  switch (status) {
    case "queued": return "في الانتظار";
    case "running": return "قيد التنفيذ";
    case "retrying": return "إعادة محاولة";
    case "paused": return "متوقفة مؤقتًا";
    case "completed": return "مكتملة";
    case "failed": return "فشلت";
    case "cancelled": return "ملغاة";
  }
}

export function unitStatusLabel(status: AiUnitStatus): string {
  if (status === "review_required") return "تحتاج مراجعة";
  return jobStatusLabel(status);
}

export function validationStatusLabel(status: AiValidationStatus): string {
  switch (status) {
    case "pending": return "لم تُفحص بعد";
    case "valid": return "اجتازت التحقق";
    case "invalid": return "غير صالحة";
    case "review_required": return "تحتاج مراجعة بشرية";
  }
}

export function reviewStatusLabel(status: AiReviewStatus): string {
  if (status === "edited") return "معدّل بانتظار قرار نهائي";
  if (status === "approved") return "معتمد بعد المراجعة";
  if (status === "rejected") return "مرفوض";
  return "بانتظار المراجعة";
}

export function generationModeLabel(mode: AiGenerationMode): string {
  switch (mode) {
    case "lesson_summary": return "ملخص درس";
    case "question_generation": return "توليد أسئلة";
    case "comprehensive_lesson_content": return "محتوى درس شامل";
    case "multi_version_quiz": return "اختبار متعدد النماذج";
    case "exact_question_extraction": return "استخراج أسئلة مطابق للمصدر";
    case "exact_exam_extraction": return "استخراج اختبار مطابق للمصدر";
    case "replica_question_extraction": return "استخراج نسخة مطابقة";
    case "regenerate_question": return "إعادة توليد سؤال";
    case "page_detection": return "اكتشاف صفحة/حدود";
  }
}

export function questionTypeLabel(type: AiQuestionType): string {
  if (type === "multiple_choice") return "اختيار من متعدد";
  if (type === "true_false") return "صح/خطأ";
  return "إجابة مباشرة";
}

export function difficultyLabel(difficulty: AiDifficulty): string {
  if (difficulty === "easy") return "سهل";
  if (difficulty === "medium") return "متوسط";
  return "صعب";
}

export function answerStatusLabel(status: AiAnswerStatus): string {
  if (status === "known") return "الإجابة مثبتة";
  if (status === "unknown") return "الإجابة غير مثبتة من المصدر";
  return "الإجابة تحتاج مراجعة";
}

export function jobActionLabel(action: AiJobAction): string {
  if (action === "pause") return "إيقاف مؤقت";
  if (action === "resume") return "استئناف";
  if (action === "cancel") return "إلغاء المهمة";
  return "إعادة المحاولة";
}

export function reviewActionLabel(action: AiReviewAction): string {
  if (action === "edit") return "تحرير المخرَج";
  if (action === "approve") return "اعتماد بعد المراجعة";
  return "رفض المخرَج";
}

export function actionIsAllowed<TAction extends string>(actions: readonly TAction[], action: TAction): boolean {
  return actions.includes(action);
}

export function describeProgress(progress: AiJobProgressView): string {
  return `${progress.progressPercent}% · ${progress.settledUnits} من ${progress.totalUnits} وحدات مستقرة · ${progress.remainingUnits} متبقية`;
}

export function publicOperationalErrorLabel(code: string): string {
  switch (code) {
    case "capacity_backpressure": return "مؤجلة مؤقتًا بسبب سعة التشغيل";
    case "lease_expired": return "انتهت مهلة محاولة التنفيذ وسيعاد تقييمها من الخادم";
    case "lease_expired_max_attempts": return "انتهت مهلة التنفيذ بعد استنفاد المحاولات";
    case "validation_invalid": return "المخرج لم يجتز تحقق Stage11";
    case "job_cancelled": return "ألغيت المهمة من الإدارة";
    default: return "يوجد رمز خطأ تشغيلي مسجل في الخادم";
  }
}

export function formatLatency(latencyMs: number | null): string {
  if (latencyMs === null) return "—";
  if (latencyMs < 1_000) return `${latencyMs} مللي ثانية`;
  return `${(latencyMs / 1_000).toFixed(1)} ثانية`;
}

export function formatTokens(value: number | null): string {
  return value === null ? "—" : new Intl.NumberFormat("ar-YE").format(value);
}

export function formatCost(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 6,
  }).format(value);
}
