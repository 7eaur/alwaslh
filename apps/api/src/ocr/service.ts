import { createHash } from "node:crypto";
import type { SessionProfile } from "../auth/service.js";
import type { Database } from "../db.js";
import { AppError } from "../errors.js";
import type { MediaStorage } from "../media/storage.js";
import { normalizeOcrText } from "./normalize.js";
import { type OcrProvider, OcrProviderError } from "./provider.js";
import {
  claimNextOcrExtraction,
  completeOcrExtraction,
  ensureOcrExtraction,
  failOcrExtraction,
  getOcrExtraction,
  loadClaimedOcrInput,
  loadOcrInputVariant,
  type OcrExtractionRow,
  reviewOcrExtraction,
  searchApprovedOcrText,
} from "./repository.js";

export interface OcrExtractionProfile {
  key: string;
  inputVariantProfileVersion: string;
  languageHints: readonly string[];
  reviewConfidenceThreshold: number;
  requiresReview?: boolean;
  maxAttempts: number;
  leaseSeconds: number;
}

export interface OcrEnqueueResult {
  extraction: OcrExtractionRow;
  replayed: boolean;
}

export interface OcrProcessedResult {
  extraction: OcrExtractionRow;
  mediaAssetId: string;
  sourcePageNumber: number | null;
}

function sha256(value: Uint8Array | string): string {
  return createHash("sha256").update(value).digest("hex");
}

function assertProfile(profile: OcrExtractionProfile): void {
  if (!profile.key.trim() || profile.key.length > 120) throw new Error("ocr_profile_invalid");
  if (!profile.inputVariantProfileVersion.trim() || profile.inputVariantProfileVersion.length > 120) {
    throw new Error("ocr_profile_invalid");
  }
  if (profile.languageHints.length === 0 || profile.languageHints.some((value) => !value.trim())) {
    throw new Error("ocr_profile_invalid");
  }
  if (
    !Number.isFinite(profile.reviewConfidenceThreshold) ||
    profile.reviewConfidenceThreshold < 0 ||
    profile.reviewConfidenceThreshold > 100
  ) {
    throw new Error("ocr_profile_invalid");
  }
  if (profile.requiresReview !== undefined && typeof profile.requiresReview !== "boolean") {
    throw new Error("ocr_profile_invalid");
  }
  if (!Number.isInteger(profile.maxAttempts) || profile.maxAttempts < 1 || profile.maxAttempts > 10) {
    throw new Error("ocr_profile_invalid");
  }
  if (!Number.isInteger(profile.leaseSeconds) || profile.leaseSeconds < 15 || profile.leaseSeconds > 900) {
    throw new Error("ocr_profile_invalid");
  }
}

function assertProvider(provider: OcrProvider): void {
  if (!provider.key.trim() || provider.key.length > 120) throw new Error("ocr_provider_invalid");
  if (!provider.version.trim() || provider.version.length > 120) throw new Error("ocr_provider_invalid");
}

function buildIdempotencyKey(
  variantId: string,
  checksum: string,
  provider: OcrProvider,
  profile: OcrExtractionProfile,
): string {
  return `ocr-v1-${sha256([variantId, checksum, provider.key, provider.version, profile.key].join("\n"))}`;
}

function retryDelaySeconds(attemptCount: number): number {
  return Math.min(15 * 60, 30 * 2 ** Math.max(0, attemptCount - 1));
}

function classifyError(error: unknown): { code: string; message: string; retryable: boolean } {
  if (error instanceof OcrProviderError) {
    return { code: error.code, message: error.message, retryable: error.retryable };
  }
  if (error instanceof Error) {
    if (error.message === "ocr_input_integrity_failed" || error.message === "ocr_provider_invalid_output") {
      return { code: error.message, message: error.message, retryable: false };
    }
    if (error.message === "ocr_lease_lost") {
      return { code: error.message, message: error.message, retryable: false };
    }
    return { code: "ocr_processing_failed", message: error.message, retryable: true };
  }
  return { code: "ocr_processing_failed", message: String(error), retryable: true };
}

export class OcrExtractionService {
  constructor(
    private readonly database: Database,
    private readonly storage: MediaStorage,
  ) {}

  async enqueue(
    mediaAssetId: string,
    provider: OcrProvider,
    profile: OcrExtractionProfile,
  ): Promise<OcrEnqueueResult> {
    assertProvider(provider);
    assertProfile(profile);
    const variant = await loadOcrInputVariant(
      this.database,
      mediaAssetId,
      profile.inputVariantProfileVersion,
    );
    if (!variant) {
      throw new AppError("CONFLICT", "وسائط الصفحة غير جاهزة لاستخراج النص", 409);
    }

    const idempotencyKey = buildIdempotencyKey(variant.id, variant.checksum_sha256, provider, profile);
    return this.database.transaction((tx) =>
      ensureOcrExtraction(tx, {
        inputMediaVariantId: variant.id,
        inputChecksumSha256: variant.checksum_sha256,
        providerKey: provider.key,
        providerVersion: provider.version,
        profileKey: profile.key,
        maxAttempts: profile.maxAttempts,
        idempotencyKey,
      }),
    );
  }

  async processNext(
    provider: OcrProvider,
    profile: OcrExtractionProfile,
    signal?: AbortSignal,
  ): Promise<OcrProcessedResult | null> {
    assertProvider(provider);
    assertProfile(profile);
    const claimed = await this.database.transaction((tx) =>
      claimNextOcrExtraction(tx, provider.key, provider.version, profile.key, profile.leaseSeconds),
    );
    if (!claimed) return null;

    try {
      const input = await loadClaimedOcrInput(this.database, claimed.id, claimed.lease_token);
      if (!input) throw new Error("ocr_input_integrity_failed");

      let bytes: Buffer;
      try {
        bytes = await this.storage.read(input.storage_key);
      } catch (error) {
        throw new OcrProviderError("ocr_storage_read_failed", "تعذر قراءة صورة OCR من التخزين", true, {
          cause: error,
        });
      }
      if (
        bytes.byteLength !== Number(input.byte_size) ||
        sha256(bytes) !== claimed.input_checksum_sha256 ||
        input.checksum_sha256 !== claimed.input_checksum_sha256
      ) {
        throw new Error("ocr_input_integrity_failed");
      }

      const providerResult = await provider.extract({
        bytes,
        mimeType: input.mime_type,
        languageHints: profile.languageHints,
        ...(signal ? { signal } : {}),
      });
      const confidence = providerResult.meanConfidence;
      if (confidence !== null && (!Number.isFinite(confidence) || confidence < 0 || confidence > 100)) {
        throw new Error("ocr_provider_invalid_output");
      }
      if (typeof providerResult.rawText !== "string") {
        throw new Error("ocr_provider_invalid_output");
      }

      const normalizedText = normalizeOcrText(providerResult.rawText);
      const reviewReason =
        normalizedText.length === 0
          ? "empty_text"
          : profile.requiresReview
            ? "profile_requires_review"
            : confidence === null
              ? "provider_confidence_unavailable"
              : confidence < profile.reviewConfidenceThreshold
                ? "low_confidence"
                : undefined;
      const reviewStatus = reviewReason ? "pending" : "not_required";
      const extraction = await this.database.transaction((tx) =>
        completeOcrExtraction(tx, {
          extractionId: claimed.id,
          leaseToken: claimed.lease_token,
          rawText: providerResult.rawText,
          normalizedText,
          meanConfidence: confidence,
          providerMetadata: providerResult.metadata ?? {},
          reviewStatus,
          ...(reviewReason ? { reviewReason } : {}),
        }),
      );
      return {
        extraction,
        mediaAssetId: input.media_asset_id,
        sourcePageNumber: input.source_page_number,
      };
    } catch (error) {
      if (error instanceof Error && error.message === "ocr_lease_lost") throw error;
      const classified = classifyError(error);
      await this.database.transaction((tx) =>
        failOcrExtraction(tx, {
          extractionId: claimed.id,
          leaseToken: claimed.lease_token,
          retryable: classified.retryable,
          retryDelaySeconds: retryDelaySeconds(claimed.attempt_count),
          errorCode: classified.code,
          errorMessage: classified.message,
        }),
      );
      throw error;
    }
  }

  async review(
    actor: SessionProfile,
    extractionId: string,
    decision: "approved" | "rejected",
    replacementText?: string,
  ): Promise<OcrExtractionRow> {
    if (actor.role !== "admin") throw new AppError("FORBIDDEN", "مراجعة OCR للمدير فقط", 403);
    const replacementNormalizedText =
      replacementText === undefined ? undefined : normalizeOcrText(replacementText);
    return this.database.transaction((tx) =>
      reviewOcrExtraction(tx, {
        extractionId,
        actorProfileId: actor.id,
        decision,
        ...(replacementNormalizedText === undefined ? {} : { replacementNormalizedText }),
      }),
    );
  }

  async searchApproved(queryInput: string, limit = 20) {
    const query = queryInput.trim();
    if (!query) return [];
    const boundedLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
    return searchApprovedOcrText(this.database, query, boundedLimit);
  }

  get(extractionId: string) {
    return getOcrExtraction(this.database, extractionId);
  }
}
