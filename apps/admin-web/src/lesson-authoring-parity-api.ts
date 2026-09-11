import { adminApiRequest } from "./admin-api";

export type LessonHistorySource = "all" | "curriculum" | "question_bank" | "ai";

export interface LessonAuthoringExportBundle {
  filenameBase: string;
  contentCsv: string;
  historyCsv: string;
  printHtml: string;
  counts: {
    lessons: number;
    questions: number;
    historyEvents: number;
  };
}

export async function updateLessonSummary(lessonId: string, summary: string | null): Promise<void> {
  await adminApiRequest<void>(`/v1/admin/curriculum/lessons/${lessonId}`, {
    method: "PATCH",
    body: JSON.stringify({ summary }),
  });
}

export function exportLessonAuthoring(input: {
  lessonIds: string[];
  historySource?: LessonHistorySource;
  eventType?: string;
  from?: string;
  to?: string;
}): Promise<LessonAuthoringExportBundle> {
  return adminApiRequest<LessonAuthoringExportBundle>("/v1/admin/curriculum/lesson-authoring-export", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
