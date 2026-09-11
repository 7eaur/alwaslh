import { adminApiRequest } from "./admin-api";

export type AiAuthoringSubjectDomain =
  | "general"
  | "arabic_language"
  | "religious"
  | "mathematics"
  | "physics"
  | "chemistry"
  | "biology"
  | "history"
  | "geography"
  | "other";

export type LessonGenerationMode =
  | "lesson_summary"
  | "question_generation"
  | "comprehensive_lesson_content"
  | "exact_question_extraction"
  | "replica_question_extraction";

export type QuizGenerationMode =
  | "question_generation"
  | "exact_question_extraction"
  | "exact_exam_extraction"
  | "replica_question_extraction";

export interface AiQuestionTarget {
  multipleChoice: number;
  trueFalse: number;
  direct: number;
}

export interface AuthoringPlanResult {
  jobId: string;
  status: string;
  totalUnits: number;
  replayed: boolean;
}

export interface LessonApplyResult {
  lessonId: string;
  summaryApplied: boolean;
  summaryReplayed: boolean;
  questionBankItemIds: string[];
  questionImportReplayed: boolean;
}

export interface QuizApplyResult {
  quizId: string;
  versionKey: string;
  questionBankItemIds: string[];
  questionImportReplayed: boolean;
  readyForVersion: boolean;
  versionId: string | null;
  versionReplayed: boolean;
}

export type QuizPrintVariant =
  | "questions_options"
  | "questions_only"
  | "questions_answers"
  | "answers_explanations"
  | "answer_key"
  | "lesson_names"
  | "lesson_images";

export interface SpecializedExportBundle {
  filenameBase: string;
  csv: string;
  printHtml: string;
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export function enqueueLessonGeneration(input: {
  lessonIds: string[];
  mode: LessonGenerationMode;
  subjectDomain: AiAuthoringSubjectDomain;
  target?: AiQuestionTarget;
  expectedQuestionCount?: number;
  clientRequestId: string;
}): Promise<AuthoringPlanResult> {
  return adminApiRequest<AuthoringPlanResult>("/v1/admin/authoring/lessons/generate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function applyApprovedLessonOutput(outputId: string): Promise<LessonApplyResult> {
  return adminApiRequest<LessonApplyResult>(`/v1/admin/authoring/outputs/${outputId}/apply-lesson`, {
    method: "POST",
  });
}

export function applyApprovedQuizOutput(outputId: string): Promise<QuizApplyResult> {
  return adminApiRequest<QuizApplyResult>(`/v1/admin/authoring/outputs/${outputId}/apply-quiz`, {
    method: "POST",
  });
}

export function enqueueQuizGeneration(
  quizId: string,
  input: {
    mode: QuizGenerationMode;
    subjectDomain: AiAuthoringSubjectDomain;
    versions: Array<{
      key: string;
      label: string;
      lessonIds: string[];
      shuffleOptions: boolean;
      target?: AiQuestionTarget;
      expectedQuestionCount?: number;
    }>;
    clientRequestId: string;
  },
): Promise<AuthoringPlanResult> {
  return adminApiRequest<AuthoringPlanResult>(`/v1/admin/quizzes/${quizId}/generate`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function enqueueQuestionRegeneration(
  itemId: string,
  input: { clientRequestId: string; subjectDomain: AiAuthoringSubjectDomain },
): Promise<AuthoringPlanResult> {
  return adminApiRequest<AuthoringPlanResult>(`/v1/admin/authoring/question-bank/${itemId}/regenerate`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function archiveQuestionBankItem(itemId: string): Promise<{ replayed: boolean }> {
  return adminApiRequest<{ replayed: boolean }>(`/v1/admin/authoring/question-bank/${itemId}/archive`, {
    method: "POST",
  });
}

export function fetchSpecializedQuizExport(
  quizId: string,
  versionIds: string[],
  variant: QuizPrintVariant,
): Promise<SpecializedExportBundle> {
  const params = new URLSearchParams({ versionIds: versionIds.join(","), variant });
  return adminApiRequest<SpecializedExportBundle>(
    `/v1/admin/quizzes/${quizId}/specialized-export?${params.toString()}`,
  );
}

export function specializedQuizPrintUrl(
  quizId: string,
  versionIds: string[],
  variant: QuizPrintVariant,
): string {
  const params = new URLSearchParams({ versionIds: versionIds.join(","), variant });
  return `${apiBaseUrl}/v1/admin/quizzes/${encodeURIComponent(quizId)}/specialized-print?${params.toString()}`;
}
