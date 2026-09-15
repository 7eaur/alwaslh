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
export { fetchSpecializedQuizExport, specializedQuizPrintUrl } from "./features/quizzes/public";
export type { QuizPrintVariant, SpecializedExportBundle } from "./features/quizzes/public";
