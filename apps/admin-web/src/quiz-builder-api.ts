import { adminApiRequest } from "./admin-api";

export type QuizBuilderStatus = "draft" | "review" | "published" | "archived";
export type QuizBuilderQuestionType = "multiple_choice" | "true_false" | "direct";

export interface QuizBuilderListItem {
  id: string;
  classId: string | null;
  subjectId: string | null;
  title: string;
  description: string | null;
  status: QuizBuilderStatus;
  shuffleVersions: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuizBuilderQuestion {
  id: string;
  position: number;
  lessonId: string | null;
  type: QuizBuilderQuestionType;
  prompt: string;
  options: Array<{ key: string; text: string; isCorrect: boolean; position: number }>;
  answerText: string | null;
  explanation: string | null;
  difficulty: number | null;
  sourcePage: number | null;
  sourceReference: string | null;
  questionBankItemId: string | null;
  questionBankRevisionId: string | null;
  metadata: unknown;
}

export interface QuizBuilderVersion {
  id: string;
  versionNumber: number;
  label: string;
  shuffleOptions: boolean;
  questions: QuizBuilderQuestion[];
}

export interface QuizBuilderDetail {
  quiz: QuizBuilderListItem & {
    submittedForReviewByProfileId: string | null;
    submittedForReviewAt: string | null;
    publishedByProfileId: string | null;
  };
  lessons: Array<{ id: string; title: string; position: number }>;
  versions: QuizBuilderVersion[];
  events: Array<{
    id: number;
    versionId: string | null;
    action: string;
    actorProfileId: string;
    note: string | null;
    createdAt: string;
  }>;
}

export interface QuizVersionQuestionRef {
  questionBankItemId: string;
  questionBankRevisionId: string;
}

export interface QuizBuilderListResponse {
  items: QuizBuilderListItem[];
  pagination: { total: number; limit: number; offset: number };
}

function withQuery(path: string, values: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export function fetchQuizzes(
  filters: {
    classId?: string;
    subjectId?: string;
    status?: QuizBuilderStatus;
    search?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<QuizBuilderListResponse> {
  return adminApiRequest<QuizBuilderListResponse>(
    withQuery("/v1/admin/quizzes", {
      classId: filters.classId,
      subjectId: filters.subjectId,
      status: filters.status,
      search: filters.search?.trim() || undefined,
      limit: filters.limit,
      offset: filters.offset,
    }),
  );
}

export function fetchQuiz(quizId: string): Promise<QuizBuilderDetail> {
  return adminApiRequest<QuizBuilderDetail>(`/v1/admin/quizzes/${quizId}`);
}

export function createQuiz(input: {
  classId: string;
  subjectId: string;
  lessonIds: string[];
  title: string;
  description?: string | null;
  shuffleVersions?: boolean;
}): Promise<{ quizId: string }> {
  return adminApiRequest<{ quizId: string }>("/v1/admin/quizzes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateQuiz(
  quizId: string,
  input: { title: string; description?: string | null; shuffleVersions?: boolean },
): Promise<void> {
  await adminApiRequest<void>(`/v1/admin/quizzes/${quizId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function addQuizVersion(
  quizId: string,
  input: { label: string; shuffleOptions?: boolean; questions: QuizVersionQuestionRef[] },
): Promise<{ versionId: string }> {
  return adminApiRequest<{ versionId: string }>(`/v1/admin/quizzes/${quizId}/versions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function replaceQuizVersionQuestions(
  quizId: string,
  versionId: string,
  questions: QuizVersionQuestionRef[],
): Promise<void> {
  await adminApiRequest<void>(`/v1/admin/quizzes/${quizId}/versions/${versionId}/questions`, {
    method: "PUT",
    body: JSON.stringify({ questions }),
  });
}

export async function removeQuizVersion(quizId: string, versionId: string): Promise<void> {
  await adminApiRequest<void>(`/v1/admin/quizzes/${quizId}/versions/${versionId}`, { method: "DELETE" });
}

export async function submitQuizForReview(quizId: string): Promise<void> {
  await adminApiRequest<void>(`/v1/admin/quizzes/${quizId}/submit-review`, { method: "POST" });
}

export async function rejectQuizReview(quizId: string, note: string): Promise<void> {
  await adminApiRequest<void>(`/v1/admin/quizzes/${quizId}/reject`, {
    method: "POST",
    body: JSON.stringify({ note: note.trim() }),
  });
}

export async function publishQuiz(quizId: string): Promise<void> {
  await adminApiRequest<void>(`/v1/admin/quizzes/${quizId}/publish`, { method: "POST" });
}

export async function archiveQuiz(quizId: string): Promise<void> {
  await adminApiRequest<void>(`/v1/admin/quizzes/${quizId}/archive`, { method: "POST" });
}
