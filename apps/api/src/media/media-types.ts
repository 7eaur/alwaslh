export type MediaVariantKind = "source" | "display" | "thumbnail" | "ai";

export interface MediaInput {
  idempotencyKey: string;
  sourcePosition: number;
  sourceFilename: string;
  sourceMimeType: string;
  sourcePageNumber?: number;
  contentSourceAssetId?: string;
  bytes: Buffer;
  signal?: AbortSignal;
}

export interface PdfMediaInput {
  idempotencyKey: string;
  sourcePositionStart: number;
  sourceFilename: string;
  sourceMimeType: "application/pdf";
  bytes: Buffer;
  concurrency?: number;
  signal?: AbortSignal;
}

export interface PreparedVariant {
  kind: MediaVariantKind;
  profileVersion: string;
  extension: string;
  mimeType: string;
  bytes: Buffer;
  width?: number;
  height?: number;
  checksumSha256: string;
}

export interface ProcessedMediaAsset {
  mediaAssetId: string;
  idempotencyKey: string;
  sourcePosition: number;
  sourceFilename: string;
  sourceMimeType: string;
  sourcePageNumber?: number;
  contentSourceAssetId?: string;
  replayed: boolean;
  variants: readonly PreparedVariant[];
}
