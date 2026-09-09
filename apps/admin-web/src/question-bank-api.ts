import { ApiRequestError, adminApiRequest } from "./admin-api";

export type QuestionBankOrigin = "manual" | "ai";
export type QuestionBankStatus = "draft" | "review" | "published" | "archived";
export type QuestionBankQuestionType = "multiple_choice" | "true_false" | "direct";
export type QuestionBankAnswerStatus = "known" | "unknown" | "review_required";
export type QuestionBankDifficulty = "easy" | "medium" | "hard";

export interface QuestionBankQuestionInput {
  prompt: string;
  type: QuestionBankQuestionType;
  options: string[];
  correctOptionIndex: number | null;
  answerText: string | null;
  answerStatus: QuestionBankAnswerStatus;
  difficulty: QuestionBankDifficulty;
  explanation: string | null;
  method: string | null;
}

export interface QuestionBankCurrentRevision {
  id: string;
  revisionNumber: number;
  status: QuestionBankStatus;
  type: QuestionBankQuestionType;
  prompt: string;
  difficulty: QuestionBankDifficulty;
  answerStatus: QuestionBankAnswerStatus;
}

export interface QuestionBankListItem {
  id: string;
  classId: string;
  subjectId: string;
  origin: QuestionBankOrigin;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  currentRevision: QuestionBankCurrentRevision | null;
}

export interface QuestionBankSource {
  position: number;
  mediaAssetId: string;
  pageNumber: number;
  inputChecksumSha256: string;
  ocrExtractionId: string | null;
  contentSourceAssetId: string | null;
  quote: string | null;
}

export interface QuestionBankRevision {
  id: string;
  revisionNumber: number;
  status: QuestionBankStatus;
  question: QuestionBankQuestionInput;
  lessonIds: string[];
  sources: QuestionBankSource[];
  createdByProfileId: string;
  submittedForReviewByProfileId: string | null;
  submittedForReviewAt: string | null;
  publishedByProfileId: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export type QuestionBankEventAction =
  | "create"
  | "import"
  | "edit"
  | "submit_review"
  | "reject"
  | "publish"
  | "archive";

export interface QuestionBankEvent {
  id: number;
  revisionId: string | null;
  action: QuestionBankEventAction;
  actorProfileId: string;
  note: string | null;
  createdAt: string;
}

export interface QuestionBankAiImport {
  aiOutputId: string;
  approvedReviewRevision: number;
  questionLocator: string;
  itemId: string;
  revisionId: string;
  promptKey: string;
  promptVersion: string;
  generationMode: string;
  importedByProfileId: string;
  importedAt: string;
}

export interface QuestionBankListResponse {
  items: QuestionBankListItem[];
  pagination: { total: number; limit: number; offset: number };
}

export interface QuestionBankDetailResponse {
  item: QuestionBankListItem;
  revisions: QuestionBankRevision[];
  revisionPagination: { total: number; limit: number; offset: number };
  events: QuestionBankEvent[];
  eventPagination: { total: number; limit: number; offset: number };
  aiImports: QuestionBankAiImport[];
}

export interface QuestionBankScopeInput {
  classId: string;
  subjectId: string;
  lessonIds: string[];
}

export interface QuestionBankListFilters {
  classId?: string;
  subjectId?: string;
  origin?: QuestionBankOrigin;
  status?: Exclude<QuestionBankStatus, "archived">;
  search?: string;
  limit?: number;
  offset?: number;
}

function withQuery(path: string, values: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export function fetchQuestionBank(filters: QuestionBankListFilters = {}): Promise<QuestionBankListResponse> {
  return adminApiRequest<QuestionBankListResponse>(
    withQuery("/v1/admin/question-bank", {
      classId: filters.classId,
      subjectId: filters.subjectId,
      origin: filters.origin,
      status: filters.status,
      search: filters.search?.trim() || undefined,
      limit: filters.limit,
      offset: filters.offset,
    }),
  );
}

export function fetchQuestionBankItem(
  itemId: string,
  options: { revisionLimit?: number; revisionOffset?: number; eventLimit?: number; eventOffset?: number } = {},
): Promise<QuestionBankDetailResponse> {
  return adminApiRequest<QuestionBankDetailResponse>(
    withQuery(`/v1/admin/question-bank/${itemId}`, {
      revisionLimit: options.revisionLimit,
      revisionOffset: options.revisionOffset,
      eventLimit: options.eventLimit,
      eventOffset: options.eventOffset,
    }),
  );
}

export function createManualQuestion(
  input: QuestionBankScopeInput & { question: QuestionBankQuestionInput },
): Promise<{ itemId: string; revisionId: string }> {
  return adminApiRequest<{ itemId: string; revisionId: string }>("/v1/admin/question-bank/manual", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function importApprovedAiQuestions(
  outputId: string,
  scope: QuestionBankScopeInput,
): Promise<{ imports: QuestionBankAiImport[]; replayed: boolean }> {
  return adminApiRequest<{ imports: QuestionBankAiImport[]; replayed: boolean }>(
    `/v1/admin/question-bank/import-ai/${outputId}`,
    { method: "POST", body: JSON.stringify(scope) },
  );
}

export function editQuestionBankItem(
  itemId: string,
  question: QuestionBankQuestionInput,
): Promise<{ revisionId: string }> {
  return adminApiRequest<{ revisionId: string }>(`/v1/admin/question-bank/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ question }),
  });
}

export async function submitQuestionForReview(itemId: string): Promise<void> {
  await adminApiRequest<void>(`/v1/admin/question-bank/${itemId}/submit-review`, { method: "POST" });
}

export async function rejectQuestionReview(itemId: string, note: string): Promise<void> {
  await adminApiRequest<void>(`/v1/admin/question-bank/${itemId}/reject`, {
    method: "POST",
    body: JSON.stringify({ note: note.trim() }),
  });
}

export async function publishQuestion(itemId: string): Promise<void> {
  await adminApiRequest<void>(`/v1/admin/question-bank/${itemId}/publish`, { method: "POST" });
}

export function isQuestionBankConflict(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError && error.code === "CONFLICT" && error.status === 409;
}
