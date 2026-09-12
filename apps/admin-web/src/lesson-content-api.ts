import { adminApiRequest } from "./admin-api";

export type LessonContentPublicationAction = "submit_review" | "return_to_draft" | "publish";

export interface AdminLessonContentState {
  lessonId: string;
  lessonTitle: string;
  lessonStatus: "active" | "inactive" | "archived";
  publishedAt: string | null;
  counts: {
    total: number;
    draft: number;
    review: number;
    published: number;
    reviewReady: number;
    reviewBlocked: number;
  };
}

export function fetchLessonContentState(lessonId: string): Promise<AdminLessonContentState> {
  return adminApiRequest<{ content: AdminLessonContentState }>(`/v1/admin/lesson-content/${lessonId}`).then(
    (result) => result.content,
  );
}

export function transitionLessonContentPublication(
  lessonId: string,
  action: LessonContentPublicationAction,
): Promise<AdminLessonContentState> {
  return adminApiRequest<{ content: AdminLessonContentState }>(
    `/v1/admin/lesson-content/${lessonId}/publication`,
    {
      method: "PATCH",
      body: JSON.stringify({ action }),
    },
  ).then((result) => result.content);
}
