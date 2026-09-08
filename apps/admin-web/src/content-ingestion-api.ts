import { adminApiRequest } from "./admin-api";

export type ContentIngestionTaskStatus = "uploading" | "ready" | "processing" | "completed" | "failed";
export type ContentIngestionItemStatus =
  | "pending_upload"
  | "uploaded"
  | "processing"
  | "completed"
  | "failed";
export type LessonAssetPublicationStatus = "draft" | "review" | "published";

export interface ContentIngestionTaskSummary {
  id: string;
  lessonId: string;
  lessonTitle: string;
  createdByProfileId: string;
  clientRequestId: string;
  status: ContentIngestionTaskStatus;
  itemCount: number;
  uploadedCount: number;
  processedItemCount: number;
  mediaAssetCount: number;
  failedItemCount: number;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  linkedAt: string | null;
  completedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentIngestionItem {
  id: string;
  position: number;
  filename: string;
  mimeType: string;
  declaredByteSize: number;
  byteSize: number | null;
  sourceChecksumSha256: string | null;
  status: ContentIngestionItemStatus;
  outputCount: number;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  uploadedAt: string | null;
  processedAt: string | null;
}

export interface ContentIngestionMedia {
  itemId: string;
  mediaAssetId: string;
  sourcePosition: number;
  sourcePageNumber: number | null;
  mediaStatus: "processing" | "ready" | "failed";
}

export interface LessonAssetPublication {
  id: string;
  mediaAssetId: string | null;
  position: number;
  publicationStatus: LessonAssetPublicationStatus;
  submittedForReviewAt: string | null;
  assetPublishedAt: string | null;
}

export interface ContentIngestionTaskDetail extends ContentIngestionTaskSummary {
  items: ContentIngestionItem[];
  media: ContentIngestionMedia[];
  lessonAssets: LessonAssetPublication[];
}

export interface ContentIngestionHistory {
  tasks: ContentIngestionTaskSummary[];
  total: number;
}

export function fetchContentIngestionHistory(options: {
  lessonId?: string;
  status?: ContentIngestionTaskStatus;
  includeArchived?: boolean;
  limit?: number;
  offset?: number;
} = {}): Promise<ContentIngestionHistory> {
  const params = new URLSearchParams();
  if (options.lessonId) params.set("lessonId", options.lessonId);
  if (options.status) params.set("status", options.status);
  if (options.includeArchived) params.set("includeArchived", "true");
  params.set("limit", String(options.limit ?? 50));
  params.set("offset", String(options.offset ?? 0));
  return adminApiRequest<{ history: ContentIngestionHistory }>(
    `/v1/admin/content-ingestions?${params.toString()}`,
  ).then((result) => result.history);
}

export function fetchContentIngestionTask(taskId: string): Promise<ContentIngestionTaskDetail> {
  return adminApiRequest<{ task: ContentIngestionTaskDetail }>(`/v1/admin/content-ingestions/${taskId}`).then(
    (result) => result.task,
  );
}

export function createContentIngestionTask(input: {
  lessonId: string;
  clientRequestId: string;
  items: Array<{ filename: string; mimeType: string; byteSize: number }>;
}): Promise<ContentIngestionTaskDetail> {
  return adminApiRequest<{ task: ContentIngestionTaskDetail }>("/v1/admin/content-ingestions", {
    method: "POST",
    body: JSON.stringify(input),
  }).then((result) => result.task);
}

export function uploadContentIngestionItem(
  taskId: string,
  itemId: string,
  file: File,
): Promise<ContentIngestionTaskDetail> {
  return adminApiRequest<{ task: ContentIngestionTaskDetail }>(
    `/v1/admin/content-ingestions/${taskId}/items/${itemId}/content`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: file,
    },
  ).then((result) => result.task);
}

export function processContentIngestionTask(taskId: string): Promise<ContentIngestionTaskDetail> {
  return adminApiRequest<{ task: ContentIngestionTaskDetail }>(`/v1/admin/content-ingestions/${taskId}/process`, {
    method: "POST",
  }).then((result) => result.task);
}

export function linkContentIngestionTask(taskId: string): Promise<ContentIngestionTaskDetail> {
  return adminApiRequest<{ task: ContentIngestionTaskDetail }>(`/v1/admin/content-ingestions/${taskId}/link`, {
    method: "POST",
  }).then((result) => result.task);
}

export function transitionContentPublication(
  taskId: string,
  action: "submit_review" | "return_to_draft" | "publish",
): Promise<ContentIngestionTaskDetail> {
  return adminApiRequest<{ task: ContentIngestionTaskDetail }>(
    `/v1/admin/content-ingestions/${taskId}/publication`,
    {
      method: "PATCH",
      body: JSON.stringify({ action }),
    },
  ).then((result) => result.task);
}

export function archiveContentIngestionTask(taskId: string): Promise<ContentIngestionTaskDetail> {
  return adminApiRequest<{ task: ContentIngestionTaskDetail }>(`/v1/admin/content-ingestions/${taskId}/archive`, {
    method: "PATCH",
  }).then((result) => result.task);
}
