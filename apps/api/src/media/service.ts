import type { Database } from "../db.js";
import { prepareImageVariants } from "./image-processor.js";
import type { MediaInput, ProcessedMediaAsset } from "./media-types.js";
import { commitProcessedMedia, ensureMediaAsset, markMediaFailed } from "./repository.js";
import type { MediaStorage } from "./storage.js";

function storageKey(assetId: string, variant: ProcessedMediaAsset["variants"][number]): string {
  return `media/${assetId}/${variant.kind}/${variant.profileVersion}-${variant.checksumSha256}.${variant.extension}`;
}

function errorCode(error: unknown): string {
  if (!(error instanceof Error)) return "transform_failed";
  const known = new Set([
    "unsupported_media",
    "image_decode_failed",
    "invalid_media_storage_key",
    "media_storage_root_required",
  ]);
  return known.has(error.message) ? error.message : "transform_failed";
}

export class MediaPipelineService {
  constructor(
    private readonly database: Database,
    private readonly storage: MediaStorage,
  ) {}

  async processImage(input: MediaInput): Promise<ProcessedMediaAsset> {
    if (!input.idempotencyKey.trim()) throw new Error("invalid_input");
    if (!Number.isInteger(input.sourcePosition) || input.sourcePosition < 0) throw new Error("invalid_input");
    if (!input.sourceFilename.trim() || !input.sourceMimeType.startsWith("image/"))
      throw new Error("invalid_input");
    if (input.bytes.byteLength === 0 || input.bytes.byteLength > 50 * 1024 * 1024)
      throw new Error("invalid_input");

    const mediaAsset = await this.database.transaction((tx) => ensureMediaAsset(tx, input));

    try {
      const variants = await prepareImageVariants(input.bytes);
      const result: ProcessedMediaAsset = {
        mediaAssetId: mediaAsset.id,
        idempotencyKey: input.idempotencyKey,
        sourcePosition: input.sourcePosition,
        sourceFilename: input.sourceFilename,
        sourceMimeType: input.sourceMimeType,
        ...(input.sourcePageNumber === undefined ? {} : { sourcePageNumber: input.sourcePageNumber }),
        ...(input.contentSourceAssetId === undefined
          ? {}
          : { contentSourceAssetId: input.contentSourceAssetId }),
        variants,
      };

      for (const variant of variants) {
        await this.storage.put(storageKey(mediaAsset.id, variant), variant.bytes);
      }

      await this.database.transaction((tx) => commitProcessedMedia(tx, result));
      return result;
    } catch (error) {
      const code = errorCode(error);
      const message = error instanceof Error ? error.message : String(error);
      await this.database.transaction((tx) => markMediaFailed(tx, mediaAsset.id, code, message));
      throw error;
    }
  }
}
