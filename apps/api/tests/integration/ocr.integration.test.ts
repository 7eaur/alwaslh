import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import sharp from "sharp";
import { createDatabase } from "../../src/db.js";
import { MediaPipelineService } from "../../src/media/service.js";
import { FileSystemMediaStorage } from "../../src/media/storage.js";
import type { OcrProvider, OcrProviderInput, OcrProviderResult } from "../../src/ocr/provider.js";
import { OcrProviderError } from "../../src/ocr/provider.js";
import { type OcrExtractionProfile, OcrExtractionService } from "../../src/ocr/service.js";
import { TesseractOcrProvider } from "../../src/ocr/tesseract-provider.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for OCR integration tests");

const profile: OcrExtractionProfile = {
  key: "book-page-arabic-v1",
  inputVariantProfileVersion: "v1",
  languageHints: ["ara", "eng"],
  reviewConfidenceThreshold: 80,
  maxAttempts: 3,
  leaseSeconds: 60,
};

class SequenceOcrProvider implements OcrProvider {
  private position = 0;

  constructor(
    readonly key: string,
    readonly version: string,
    private readonly sequence: readonly (OcrProviderResult | OcrProviderError)[],
    private readonly delayMs = 0,
  ) {}

  async extract(_input: OcrProviderInput): Promise<OcrProviderResult> {
    if (this.delayMs > 0) await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    const value = this.sequence[this.position];
    this.position += 1;
    if (!value) throw new Error("fake_ocr_sequence_exhausted");
    if (value instanceof OcrProviderError) throw value;
    return value;
  }
}

class DeferredFailureOcrProvider implements OcrProvider {
  readonly started: Promise<void>;
  private releasePromise: Promise<void>;
  private resolveStarted!: () => void;
  private resolveRelease!: () => void;

  constructor(
    readonly key: string,
    readonly version: string,
  ) {
    this.started = new Promise((resolve) => {
      this.resolveStarted = resolve;
    });
    this.releasePromise = new Promise((resolve) => {
      this.resolveRelease = resolve;
    });
  }

  releaseFailure(): void {
    this.resolveRelease();
  }

  async extract(_input: OcrProviderInput): Promise<OcrProviderResult> {
    this.resolveStarted();
    await this.releasePromise;
    throw new OcrProviderError("provider_busy", "provider returned after lease expiry", true);
  }
}

async function fixtureImage(text: string): Promise<Buffer> {
  const escaped = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="360">
       <rect width="1200" height="360" fill="white"/>
       <text x="70" y="210" font-family="DejaVu Sans, Arial, sans-serif" font-size="82" font-weight="700" fill="black">${escaped}</text>
     </svg>`,
  );
  return sharp(svg).png().toBuffer();
}

test("OCR foundation is durable, review-aware, retryable and independent from media success", async () => {
  const db = createDatabase(databaseUrl);
  const storageRoot = await mkdtemp(join(tmpdir(), "alwaslh-ocr-"));
  const storage = new FileSystemMediaStorage(storageRoot);
  const media = new MediaPipelineService(db, storage);
  const ocr = new OcrExtractionService(db, storage);

  try {
    const highMedia = await media.processImage({
      idempotencyKey: "ocr-media-high-confidence",
      sourcePosition: 0,
      sourceFilename: "high-confidence.png",
      sourceMimeType: "image/png",
      sourcePageNumber: 7,
      bytes: await fixtureImage("ALWASLH OCR FOUNDATION"),
    });
    const provider = new SequenceOcrProvider("fake-ocr", "test-v1", [
      {
        rawText: "  ALWASLH   OCR\r\nFOUNDATION  ",
        meanConfidence: 93,
        metadata: { fixture: "high" },
      },
      {
        rawText: "MANUAL REVIEW",
        meanConfidence: 42,
        metadata: { fixture: "low" },
      },
    ]);

    const firstEnqueue = await ocr.enqueue(highMedia.mediaAssetId, provider, profile);
    assert.equal(firstEnqueue.replayed, false);
    const replayEnqueue = await ocr.enqueue(highMedia.mediaAssetId, provider, profile);
    assert.equal(replayEnqueue.replayed, true);
    assert.equal(replayEnqueue.extraction.id, firstEnqueue.extraction.id);

    const processed = await ocr.processNext(provider, profile);
    assert.ok(processed);
    assert.equal(processed.mediaAssetId, highMedia.mediaAssetId);
    assert.equal(processed.sourcePageNumber, 7);
    assert.equal(processed.extraction.status, "completed");
    assert.equal(processed.extraction.review_status, "not_required");
    assert.equal(processed.extraction.normalized_text, "ALWASLH OCR\nFOUNDATION");

    const search = await ocr.searchApproved("ALWASLH");
    assert.equal(search.length, 1);
    assert.equal(search[0]?.media_asset_id, highMedia.mediaAssetId);
    assert.equal(search[0]?.source_page_number, 7);

    const lowMedia = await media.processImage({
      idempotencyKey: "ocr-media-low-confidence",
      sourcePosition: 1,
      sourceFilename: "low-confidence.png",
      sourceMimeType: "image/png",
      sourcePageNumber: 8,
      bytes: await fixtureImage("MANUAL REVIEW"),
    });
    const lowEnqueue = await ocr.enqueue(lowMedia.mediaAssetId, provider, profile);
    const lowProcessed = await ocr.processNext(provider, profile);
    assert.ok(lowProcessed);
    assert.equal(lowProcessed.extraction.id, lowEnqueue.extraction.id);
    assert.equal(lowProcessed.extraction.review_status, "pending");
    assert.equal(lowProcessed.extraction.review_reason, "low_confidence");
    assert.equal((await ocr.searchApproved("MANUAL")).length, 0);

    const adminRows = await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('admin', 'OCR reviewer') returning id",
    );
    const adminId = adminRows[0]?.id;
    assert.ok(adminId);
    const reviewed = await ocr.review(
      { id: adminId, role: "admin", displayName: "OCR reviewer" },
      lowEnqueue.extraction.id,
      "approved",
      "MANUAL REVIEW APPROVED",
    );
    assert.equal(reviewed.review_status, "approved");
    assert.equal(reviewed.normalized_text, "MANUAL REVIEW APPROVED");
    assert.equal((await ocr.searchApproved("MANUAL")).length, 1);

    await assert.rejects(
      () =>
        ocr.review(
          { id: "00000000-0000-0000-0000-000000000001", role: "student", displayName: null },
          lowEnqueue.extraction.id,
          "approved",
        ),
      /مراجعة OCR للمدير فقط/,
    );

    const retryMedia = await media.processImage({
      idempotencyKey: "ocr-media-retry",
      sourcePosition: 2,
      sourceFilename: "retry.png",
      sourceMimeType: "image/png",
      bytes: await fixtureImage("RETRY OCR"),
    });
    const flaky = new SequenceOcrProvider("flaky-ocr", "test-v1", [
      new OcrProviderError("provider_busy", "provider temporarily busy", true),
      { rawText: "RETRY OCR SUCCESS", meanConfidence: 95 },
    ]);
    const retryEnqueue = await ocr.enqueue(retryMedia.mediaAssetId, flaky, profile);
    await assert.rejects(() => ocr.processNext(flaky, profile), /provider temporarily busy/);
    const retryState = await ocr.get(retryEnqueue.extraction.id);
    assert.equal(retryState?.status, "retrying");
    assert.equal(retryState?.attempt_count, 1);

    const mediaState = await db.query<{ status: string }>("select status from media_assets where id = $1", [
      retryMedia.mediaAssetId,
    ]);
    assert.equal(mediaState[0]?.status, "ready");

    await db.query("update ocr_extractions set next_attempt_at = now() where id = $1", [
      retryEnqueue.extraction.id,
    ]);
    const retrySuccess = await ocr.processNext(flaky, profile);
    assert.equal(retrySuccess?.extraction.status, "completed");
    assert.equal(retrySuccess?.extraction.attempt_count, 2);

    const concurrentMedia = await media.processImage({
      idempotencyKey: "ocr-media-concurrent-claim",
      sourcePosition: 3,
      sourceFilename: "concurrent.png",
      sourceMimeType: "image/png",
      bytes: await fixtureImage("CONCURRENT OCR"),
    });
    const slow = new SequenceOcrProvider(
      "slow-ocr",
      "test-v1",
      [{ rawText: "CONCURRENT OCR", meanConfidence: 99 }],
      80,
    );
    await ocr.enqueue(concurrentMedia.mediaAssetId, slow, profile);
    const concurrent = await Promise.all([ocr.processNext(slow, profile), ocr.processNext(slow, profile)]);
    assert.equal(concurrent.filter((value) => value !== null).length, 1);
    assert.equal(concurrent.filter((value) => value === null).length, 1);

    const emptyMedia = await media.processImage({
      idempotencyKey: "ocr-media-empty-text",
      sourcePosition: 4,
      sourceFilename: "empty.png",
      sourceMimeType: "image/png",
      bytes: await fixtureImage("EMPTY OCR"),
    });
    const emptyProvider = new SequenceOcrProvider("empty-ocr", "test-v1", [
      { rawText: "  \n\t ", meanConfidence: 99 },
    ]);
    const emptyEnqueue = await ocr.enqueue(emptyMedia.mediaAssetId, emptyProvider, profile);
    const emptyProcessed = await ocr.processNext(emptyProvider, profile);
    assert.equal(emptyProcessed?.extraction.id, emptyEnqueue.extraction.id);
    assert.equal(emptyProcessed?.extraction.review_status, "pending");
    assert.equal(emptyProcessed?.extraction.review_reason, "empty_text");

    const sensitiveMedia = await media.processImage({
      idempotencyKey: "ocr-media-sensitive-review",
      sourcePosition: 5,
      sourceFilename: "sensitive.png",
      sourceMimeType: "image/png",
      bytes: await fixtureImage("EXACT SOURCE TEXT"),
    });
    const sensitiveProvider = new SequenceOcrProvider("sensitive-ocr", "test-v1", [
      { rawText: "EXACT SOURCE TEXT", meanConfidence: 99 },
    ]);
    const sensitiveProfile: OcrExtractionProfile = {
      ...profile,
      key: "exact-source-review-v1",
      requiresReview: true,
    };
    const sensitiveEnqueue = await ocr.enqueue(
      sensitiveMedia.mediaAssetId,
      sensitiveProvider,
      sensitiveProfile,
    );
    const sensitiveProcessed = await ocr.processNext(sensitiveProvider, sensitiveProfile);
    assert.equal(sensitiveProcessed?.extraction.id, sensitiveEnqueue.extraction.id);
    assert.equal(sensitiveProcessed?.extraction.review_status, "pending");
    assert.equal(sensitiveProcessed?.extraction.review_reason, "profile_requires_review");
    assert.equal((await ocr.searchApproved("EXACT")).length, 0);

    const invalidatedMedia = await media.processImage({
      idempotencyKey: "ocr-media-invalidated-before-run",
      sourcePosition: 6,
      sourceFilename: "invalidated.png",
      sourceMimeType: "image/png",
      bytes: await fixtureImage("INVALIDATED MEDIA"),
    });
    const invalidatedProvider = new SequenceOcrProvider("invalidated-ocr", "test-v1", [
      { rawText: "SHOULD NOT RUN", meanConfidence: 99 },
    ]);
    const invalidatedEnqueue = await ocr.enqueue(invalidatedMedia.mediaAssetId, invalidatedProvider, profile);
    await db.query("update media_assets set status = 'failed' where id = $1", [
      invalidatedMedia.mediaAssetId,
    ]);
    await assert.rejects(() => ocr.processNext(invalidatedProvider, profile), /ocr_input_integrity_failed/);
    assert.equal((await ocr.get(invalidatedEnqueue.extraction.id))?.status, "failed");

    const staleMedia = await media.processImage({
      idempotencyKey: "ocr-media-stale-lease",
      sourcePosition: 7,
      sourceFilename: "stale-lease.png",
      sourceMimeType: "image/png",
      bytes: await fixtureImage("STALE LEASE"),
    });
    const staleProvider = new DeferredFailureOcrProvider("stale-ocr", "test-v1");
    const staleEnqueue = await ocr.enqueue(staleMedia.mediaAssetId, staleProvider, profile);
    const staleRun = ocr.processNext(staleProvider, profile);
    await staleProvider.started;
    await db.query(
      "update ocr_extractions set lease_expires_at = now() - interval '1 second' where id = $1",
      [staleEnqueue.extraction.id],
    );
    staleProvider.releaseFailure();
    await assert.rejects(staleRun, /ocr_lease_lost/);
    const staleState = await ocr.get(staleEnqueue.extraction.id);
    assert.equal(staleState?.status, "running");
    assert.equal(staleState?.attempt_count, 1);

    if (process.env.OCR_REAL_ENGINE === "1") {
      const realMedia = await media.processImage({
        idempotencyKey: "ocr-media-real-tesseract",
        sourcePosition: 8,
        sourceFilename: "real-tesseract.png",
        sourceMimeType: "image/png",
        sourcePageNumber: 9,
        bytes: await fixtureImage("ALWASLH OCR 123"),
      });
      const tesseract = new TesseractOcrProvider({ timeoutMs: 45_000 });
      const realProfile: OcrExtractionProfile = {
        ...profile,
        key: "tesseract-arabic-english-smoke-v1",
        reviewConfidenceThreshold: 0,
      };
      await ocr.enqueue(realMedia.mediaAssetId, tesseract, realProfile);
      const real = await ocr.processNext(tesseract, realProfile);
      assert.ok(real);
      assert.equal(real.sourcePageNumber, 9);
      assert.match(real.extraction.raw_text ?? "", /ALWASLH/i);
      assert.match(real.extraction.raw_text ?? "", /123/);
    }
  } finally {
    await db.close();
    await rm(storageRoot, { recursive: true, force: true });
  }
});
