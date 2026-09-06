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
import { OcrExtractionService, type OcrExtractionProfile } from "../../src/ocr/service.js";
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

    if (process.env.OCR_REAL_ENGINE === "1") {
      const realMedia = await media.processImage({
        idempotencyKey: "ocr-media-real-tesseract",
        sourcePosition: 4,
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
