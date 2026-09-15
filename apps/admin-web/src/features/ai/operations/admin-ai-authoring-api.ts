import { adminApiRequest } from "../../../shared/api/client";

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
