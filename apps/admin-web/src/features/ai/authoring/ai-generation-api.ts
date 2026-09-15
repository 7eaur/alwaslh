import { adminApiRequest } from "../../../shared/api/client";

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
