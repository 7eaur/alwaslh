import { adminApiBlobRequest, adminApiRequest } from "./admin-api";

export type ContentDocumentKind = "textbook" | "government_exam";
export type MediaStatus = "processing" | "ready" | "failed";
export type OcrStatus = "queued" | "running" | "retrying" | "completed" | "failed";
export type OcrReviewStatus = "not_required" | "pending" | "approved" | "rejected";

export interface ContentFacet {
  slug: string;
  name: string;
}

export interface ContentOperationsSummary {
  documentCount: number;
  assetCount: number;
  mediaCount: number;
  readyMediaCount: number;
  failedMediaCount: number;
  pendingOcrCount: number;
}

export interface ContentOperationsDocument {
  id: string;
  sourcePath: string;
  classSlug: string;
  className: string;
  subjectSlug: string;
  subjectName: string;
  kind: ContentDocumentKind;
  title: string;
  hijriYear: number | null;
  examTrack: string | null;
  position: number;
  assetCount: number;
  mediaCount: number;
  readyMediaCount: number;
  failedMediaCount: number;
  pendingOcrCount: number;
  updatedAt: string;
}

export interface ContentOperationsOverview {
  summary: ContentOperationsSummary;
  facets: {
    classes: ContentFacet[];
    subjects: ContentFacet[];
  };
  documents: ContentOperationsDocument[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface OcrMetadata {
  id: string;
  inputMediaVariantId: string;
  providerKey: string;
  providerVersion: string;
  profileKey: string;
  status: OcrStatus;
  attemptCount: number;
  maxAttempts: number;
  meanConfidence: number | null;
  reviewStatus: OcrReviewStatus;
  reviewReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentSourceAsset {
  id: string;
  sourcePath: string;
  filename: string;
  position: number;
  mimeType: string;
  byteSize: number;
  checksumSha256: string | null;
  namingFamily: string;
  sourceNumber: number;
  titleHint: string | null;
  media: null | {
    id: string;
    status: MediaStatus;
    sourcePageNumber: number | null;
    attemptCount: number;
    lastErrorCode: string | null;
    lastErrorMessage: string | null;
    variants: Array<{
      id: string;
      kind: "source" | "display" | "thumbnail" | "ai";
      profileVersion: string;
      mimeType: string;
      byteSize: number;
      width: number | null;
      height: number | null;
      checksumSha256: string;
    }>;
    ocrExtractions: OcrMetadata[];
  };
}

export interface ContentDocumentDetail {
  document: Omit<
    ContentOperationsDocument,
    "assetCount" | "mediaCount" | "readyMediaCount" | "failedMediaCount" | "pendingOcrCount"
  >;
  assets: ContentSourceAsset[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface OcrExtractionDetail extends OcrMetadata {
  rawText: string | null;
  normalizedText: string | null;
  reviewedAt: string | null;
  reviewedByProfileId: string | null;
  reviewedByDisplayName: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  source: {
    documentId: string | null;
    documentTitle: string | null;
    sourceAssetId: string | null;
    filename: string | null;
    sourcePosition: number;
    sourcePageNumber: number | null;
    mediaAssetId: string;
  };
}

export interface ContentOperationsFilters {
  classSlug?: string;
  subjectSlug?: string;
  kind?: ContentDocumentKind;
  query?: string;
  limit?: number;
  offset?: number;
}

export function fetchContentOperations(filters: ContentOperationsFilters = {}): Promise<ContentOperationsOverview> {
  const params = new URLSearchParams();
  if (filters.classSlug) params.set("classSlug", filters.classSlug);
  if (filters.subjectSlug) params.set("subjectSlug", filters.subjectSlug);
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.query) params.set("q", filters.query);
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  return adminApiRequest<{ operations: ContentOperationsOverview }>(
    `/v1/admin/content-operations${suffix}`,
  ).then((result) => result.operations);
}

export function fetchContentDocument(
  documentId: string,
  limit = 50,
  offset = 0,
): Promise<ContentDocumentDetail> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return adminApiRequest<{ detail: ContentDocumentDetail }>(
    `/v1/admin/content-operations/documents/${documentId}?${params.toString()}`,
  ).then((result) => result.detail);
}

export function fetchOcrExtraction(extractionId: string): Promise<OcrExtractionDetail> {
  return adminApiRequest<{ extraction: OcrExtractionDetail }>(
    `/v1/admin/content-operations/ocr/${extractionId}`,
  ).then((result) => result.extraction);
}

export function fetchOcrSourcePreview(extractionId: string): Promise<Blob> {
  return adminApiBlobRequest(`/v1/admin/content-operations/ocr/${extractionId}/preview`);
}

export function reviewOcrExtraction(
  extractionId: string,
  decision: "approved" | "rejected",
  replacementText?: string,
): Promise<OcrExtractionDetail> {
  return adminApiRequest<{ extraction: OcrExtractionDetail }>(
    `/v1/admin/content-operations/ocr/${extractionId}/review`,
    {
      method: "PATCH",
      body: JSON.stringify({
        decision,
        ...(replacementText === undefined ? {} : { replacementText }),
      }),
    },
  ).then((result) => result.extraction);
}
