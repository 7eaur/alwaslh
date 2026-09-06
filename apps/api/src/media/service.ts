import { createHash } from "node:crypto";
import type { Database } from "../db.js";
import { prepareImageVariants } from "./image-processor.js";
import type { MediaInput, PdfMediaInput, PreparedVariant, ProcessedMediaAsset } from "./media-types.js";
import { mapWithConcurrencyOrdered } from "./ordered-concurrency.js";
import { extractPdfPages } from "./pdf-processor.js";
import { commitProcessedMedia, ensureMediaAsset, listMediaVariants, markMediaFailed } from "./repository.js";
import type { MediaStorage } from "./storage.js";

const REQUIRED_VARIANT_KINDS = ["source", "display", "thumbnail", "ai"] as const;

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error("aborted");
}

export function buildMediaStorageKey(
  assetId: string,
  variant: ProcessedMediaAsset["variants"][number],
): string {
  return `media/${assetId}/${variant.kind}/${variant.profileVersion}-${variant.checksumSha256}.${variant.extension}`;
}

function extensionFromStorageKey(key: string): string {
  const match = key.match(/\.([A-Za-z0-9]+)$/);
  if (!match?.[1]) throw new Error("media_storage_integrity_failed");
  return match[1].toLowerCase();
}

function errorCode(error: unknown): string {
  if (!(error instanceof Error)) return "transform_failed";
  const known = new Set([
    "unsupported_media",
    "image_decode_failed",
    "invalid_media_storage_key",
    "media_storage_root_required",
    "media_storage_integrity_failed",
    "storage_write_failed",
    "metadata_commit_failed",
    "aborted",
  ]);
  return known.has(error.message) ? error.message : "transform_failed";
}

export class MediaPipelineService {
  constructor(
    private readonly database: Database,
    private readonly storage: MediaStorage,
  ) {}

  private async loadReadyAsset(input: MediaInput, mediaAssetId: string): Promise<ProcessedMediaAsset> {
    const stored = await listMediaVariants(this.database, mediaAssetId);
    if (
      stored.length !== REQUIRED_VARIANT_KINDS.length ||
      stored.some((variant, index) => variant.kind !== REQUIRED_VARIANT_KINDS[index])
    ) {
      throw new Error("media_storage_integrity_failed");
    }

    const variants: PreparedVariant[] = [];
    for (const storedVariant of stored) {
      let bytes: Buffer;
      try {
        bytes = await this.storage.read(storedVariant.storage_key);
      } catch {
        throw new Error("media_storage_integrity_failed");
      }
      if (
        bytes.byteLength !== Number(storedVariant.byte_size) ||
        sha256(bytes) !== storedVariant.checksum_sha256
      ) {
        throw new Error("media_storage_integrity_failed");
      }

      variants.push({
        kind: storedVariant.kind,
        profileVersion: storedVariant.profile_version,
        extension: extensionFromStorageKey(storedVariant.storage_key),
        mimeType: storedVariant.mime_type,
        bytes,
        ...(storedVariant.width === null ? {} : { width: storedVariant.width }),
        ...(storedVariant.height === null ? {} : { height: storedVariant.height }),
        checksumSha256: storedVariant.checksum_sha256,
      });
    }

    return {
      mediaAssetId,
      idempotencyKey: input.idempotencyKey,
      sourcePosition: input.sourcePosition,
      sourceFilename: input.sourceFilename,
      sourceMimeType: input.sourceMimeType,
      ...(input.sourcePageNumber === undefined ? {} : { sourcePageNumber: input.sourcePageNumber }),
      ...(input.contentSourceAssetId === undefined
        ? {}
        : { contentSourceAssetId: input.contentSourceAssetId }),
      replayed: true,
      variants,
    };
  }

  async processImage(input: MediaInput): Promise<ProcessedMediaAsset> {
    if (!input.idempotencyKey.trim()) throw new Error("invalid_input");
    if (!Number.isInteger(input.sourcePosition) || input.sourcePosition < 0) throw new Error("invalid_input");
    if (!input.sourceFilename.trim() || !input.sourceMimeType.startsWith("image/"))
      throw new Error("invalid_input");
    if (input.bytes.byteLength === 0 || input.bytes.byteLength > 50 * 1024 * 1024)
      throw new Error("invalid_input");
    throwIfAborted(input.signal);

    const sourceChecksumSha256 = sha256(input.bytes);
    const mediaAsset = await this.database.transaction((tx) =>
      ensureMediaAsset(tx, {
        idempotencyKey: input.idempotencyKey,
        sourcePosition: input.sourcePosition,
        sourceFilename: input.sourceFilename,
        sourceMimeType: input.sourceMimeType,
        sourceChecksumSha256,
        sourceByteSize: input.bytes.byteLength,
        ...(input.sourcePageNumber === undefined ? {} : { sourcePageNumber: input.sourcePageNumber }),
        ...(input.contentSourceAssetId === undefined
          ? {}
          : { contentSourceAssetId: input.contentSourceAssetId }),
      }),
    );

    if (mediaAsset.status === "ready") {
      try {
        return await this.loadReadyAsset(input, mediaAsset.id);
      } catch (error) {
        await this.database
          .transaction((tx) =>
            markMediaFailed(
              tx,
              mediaAsset.id,
              "media_storage_integrity_failed",
              error instanceof Error ? error.message : String(error),
            ),
          )
          .catch(() => undefined);
      }
    }

    const storedKeys: string[] = [];
    try {
      throwIfAborted(input.signal);
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
        replayed: false,
        variants,
      };

      for (const variant of variants) {
        throwIfAborted(input.signal);
        const key = buildMediaStorageKey(mediaAsset.id, variant);
        try {
          await this.storage.put(key, variant.bytes);
        } catch (error) {
          throw new Error("storage_write_failed", { cause: error });
        }
        storedKeys.push(key);
      }

      throwIfAborted(input.signal);
      try {
        await this.database.transaction((tx) => commitProcessedMedia(tx, result));
      } catch (error) {
        throw new Error("metadata_commit_failed", { cause: error });
      }
      return result;
    } catch (error) {
      await Promise.allSettled(storedKeys.map((key) => this.storage.remove(key)));
      const code = errorCode(error);
      const message = error instanceof Error ? error.message : String(error);
      await this.database
        .transaction((tx) => markMediaFailed(tx, mediaAsset.id, code, message))
        .catch(() => undefined);
      throw error;
    }
  }

  async processPdf(input: PdfMediaInput): Promise<readonly ProcessedMediaAsset[]> {
    if (!input.idempotencyKey.trim() || !input.sourceFilename.trim()) throw new Error("invalid_input");
    if (!Number.isInteger(input.sourcePositionStart) || input.sourcePositionStart < 0)
      throw new Error("invalid_input");
    if (input.sourceMimeType !== "application/pdf") throw new Error("unsupported_media");
    throwIfAborted(input.signal);

    const pages = await extractPdfPages(input.bytes, input.signal);
    const concurrency = input.concurrency ?? 2;
    return mapWithConcurrencyOrdered(pages, concurrency, async (page) => {
      throwIfAborted(input.signal);
      return this.processImage({
        idempotencyKey: `${input.idempotencyKey}:page:${page.pageNumber}`,
        sourcePosition: input.sourcePositionStart + page.pageNumber - 1,
        sourceFilename: `${input.sourceFilename}#page-${page.pageNumber}`,
        sourceMimeType: page.mimeType,
        sourcePageNumber: page.pageNumber,
        bytes: page.bytes,
        ...(input.signal ? { signal: input.signal } : {}),
      });
    });
  }
}
