import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDatabase } from "../src/db.js";
import { verifyPopplerAvailable } from "../src/media/pdf-processor.js";
import { MediaPipelineService } from "../src/media/service.js";
import { FileSystemMediaStorage } from "../src/media/storage.js";

const path = process.env.MEDIA_TEST_PDF;
const databaseUrl = process.env.DATABASE_URL;
if (!path) throw new Error("MEDIA_TEST_PDF is required");
if (!databaseUrl) throw new Error("DATABASE_URL is required");

await verifyPopplerAvailable();
const db = createDatabase(databaseUrl);
const root = await mkdtemp(join(tmpdir(), "alwaslh-pdf-pipeline-"));
try {
  const service = new MediaPipelineService(db, new FileSystemMediaStorage(root));
  const input = {
    idempotencyKey: "stage10-pdf-smoke-0001",
    sourcePositionStart: 100,
    sourceFilename: "two-pages.pdf",
    sourceMimeType: "application/pdf" as const,
    bytes: await readFile(path),
    concurrency: 2,
  };

  const pages = await service.processPdf(input);
  assert.equal(pages.length, 2);
  assert.deepEqual(
    pages.map((page) => page.sourcePageNumber),
    [1, 2],
  );
  assert.deepEqual(
    pages.map((page) => page.sourcePosition),
    [100, 101],
  );
  assert.deepEqual(
    pages.map((page) => page.variants.length),
    [4, 4],
  );
  assert.deepEqual(
    pages.map((page) => page.replayed),
    [false, false],
  );
  for (const page of pages) {
    const display = page.variants.find((variant) => variant.kind === "display");
    assert.ok(display?.width && display.height);
    assert.ok(Math.max(display.width, display.height) >= 1200);
    assert.ok(Math.max(display.width, display.height) <= 1800);
  }

  const replay = await service.processPdf(input);
  assert.deepEqual(
    replay.map((page) => page.sourcePageNumber),
    [1, 2],
  );
  assert.deepEqual(
    replay.map((page) => page.replayed),
    [true, true],
  );

  const databaseOrder = await db.query<{ source_page_number: number; source_position: number }>(
    `select source_page_number, source_position
     from media_assets
     where idempotency_key like 'stage10-pdf-smoke-0001:page:%'
     order by source_position`,
  );
  assert.deepEqual(
    databaseOrder.map((page) => page.source_page_number),
    [1, 2],
  );
  assert.deepEqual(
    databaseOrder.map((page) => page.source_position),
    [100, 101],
  );

  await assert.rejects(
    service.processPdf({
      idempotencyKey: "stage10-invalid-pdf-0001",
      sourcePositionStart: 200,
      sourceFilename: "invalid.pdf",
      sourceMimeType: "application/pdf",
      bytes: Buffer.from("not-a-pdf"),
    }),
    /pdf_inspection_failed/,
  );
  const invalidRows = await db.query<{ count: string }>(
    "select count(*)::text as count from media_assets where idempotency_key like 'stage10-invalid-pdf-0001:%'",
  );
  assert.equal(invalidRows[0]?.count, "0");

  console.log("Stage 10 PDF smoke: extraction, transforms, quality, replay, errors and order verified");
} finally {
  await db.close();
  await rm(root, { recursive: true, force: true });
}
