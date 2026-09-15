import { adminApiRequest } from "./admin-api";

export { applyApprovedLessonOutput, applyApprovedQuizOutput } from "./features/ai/operations/admin-ai-authoring-api";
export type { LessonApplyResult, QuizApplyResult } from "./features/ai/operations/admin-ai-authoring-api";
export { enqueueLessonGeneration, enqueueQuizGeneration } from "./features/ai/authoring/ai-generation-api";
export type {
  AiAuthoringSubjectDomain,
  AiQuestionTarget,
  AuthoringPlanResult,
  LessonGenerationMode,
  QuizGenerationMode,
} from "./features/ai/authoring/ai-generation-api";
export { archiveQuestionBankItem, enqueueQuestionRegeneration } from "./features/questions/public";

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
