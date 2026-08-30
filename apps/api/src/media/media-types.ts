export type MediaVariantKind = "source" | "display" | "thumbnail" | "ai";

export interface MediaInput {
  idempotencyKey: string;
  sourcePosition: number;
  sourceFilename: string;
  sourceMimeType: string;
  sourcePageNumber?: number;
  contentSourceAssetId?: string;
  bytes: Buffer;
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
  variants: readonly PreparedVariant[];
}
