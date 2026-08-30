import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { QueryResultRow } from "pg";
import sharp from "sharp";
import { createDatabase, type Database, type QueryExecutor } from "../../src/db.js";
import { MediaPipelineService } from "../../src/media/service.js";
import { FileSystemMediaStorage, type MediaStorage } from "../../src/media/storage.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for media integration tests");

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

class FlakyMemoryStorage implements MediaStorage {
  readonly objects = new Map<string, Buffer>();
  private writes = 0;

  constructor(private failAtWrite: number | null = null) {}

  async put(key: string, bytes: Uint8Array): Promise<void> {
    this.writes += 1;
    if (this.failAtWrite === this.writes) {
      this.failAtWrite = null;
      throw new Error("injected_storage_failure");
    }
    this.objects.set(key, Buffer.from(bytes));
  }

  async read(key: string): Promise<Buffer> {
    const value = this.objects.get(key);
    if (!value) throw new Error("not_found");
    return Buffer.from(value);
  }

  async exists(key: string): Promise<boolean> {
    return this.objects.has(key);
  }

  async remove(key: string): Promise<void> {
    this.objects.delete(key);
  }
}

class AbortAfterFirstWriteStorage extends FlakyMemoryStorage {
  private abortWrites = 0;

  constructor(private readonly controller: AbortController) {
    super();
  }

  override async put(key: string, bytes: Uint8Array): Promise<void> {
    await super.put(key, bytes);
    this.abortWrites += 1;
    if (this.abortWrites === 1) this.controller.abort();
  }
}

class MetadataCommitFailureDatabase implements Database {
  private transactionCount = 0;

  constructor(private readonly delegate: Database) {}

  async ping(): Promise<void> {
    await this.delegate.ping();
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: readonly unknown[] = [],
  ): Promise<readonly T[]> {
    return this.delegate.query<T>(text, values);
  }

  async transaction<T>(work: (tx: QueryExecutor) => Promise<T>): Promise<T> {
    this.transactionCount += 1;
    if (this.transactionCount === 2) throw new Error("injected_metadata_commit_failure");
    return this.delegate.transaction(work);
  }

  async close(): Promise<void> {}
}

async function createContentSourceAsset(db: Database, byteSize: number): Promise<string> {
  const runRows = await db.query<{ id: string }>(
    `insert into content_import_runs (
       source_repository, source_revision, manifest_sha256,
       subject_root_count, document_count, asset_count, helper_file_count
     ) values ('stage10-test', 'revision-1', $1, 1, 1, 1, 0)
     returning id`,
    ["a".repeat(64)],
  );
  const runId = runRows[0]?.id;
  assert.ok(runId);

  const documentRows = await db.query<{ id: string }>(
    `insert into content_source_documents (
       source_repository, source_path, class_slug, class_name, subject_slug, subject_name,
       kind, title, position, first_seen_import_run_id, last_seen_import_run_id
     ) values ('stage10-test', 'book-1', 'grade-test', 'صف اختباري', 'subject-test', 'مادة اختبارية',
               'textbook', 'كتاب اختباري', 0, $1, $1)
     returning id`,
    [runId],
  );
  const documentId = documentRows[0]?.id;
  assert.ok(documentId);

  const assetRows = await db.query<{ id: string }>(
    `insert into content_source_assets (
       document_id, source_path, filename, position, mime_type, byte_size,
       source_git_blob_sha1, naming_family, source_number,
       first_seen_import_run_id, last_seen_import_run_id
     ) values ($1, 'book-1/page-1.jpg', 'page-1.jpg', 0, 'image/jpeg', $2,
               $3, 'book_page', 1, $4, $4)
     returning id`,
    [documentId, byteSize, "b".repeat(40), runId],
  );
  const assetId = assetRows[0]?.id;
  assert.ok(assetId);
  return assetId;
}

test("media processing binds idempotency to source bytes and preserves Stage 9 provenance", async () => {
  const db = createDatabase(databaseUrl);
  const root = await mkdtemp(join(tmpdir(), "alwaslh-media-integration-"));
  try {
    await db.query("delete from media_assets");
    await db.query("delete from content_import_runs where source_repository = 'stage10-test'");

    const storage = new FileSystemMediaStorage(root);
    const service = new MediaPipelineService(db, storage);
    const source = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: "white" },
    })
      .jpeg({ quality: 92 })
      .toBuffer();
    const contentSourceAssetId = await createContentSourceAsset(db, source.byteLength);

    const input = {
      idempotencyKey: "stage10-media-image-0001",
      sourcePosition: 7,
      sourceFilename: "page-8.jpg",
      sourceMimeType: "image/jpeg",
      sourcePageNumber: 8,
      contentSourceAssetId,
      bytes: source,
    };

    const first = await service.processImage(input);
    const replay = await service.processImage(input);
    assert.equal(first.replayed, false);
    assert.equal(replay.replayed, true);
    assert.equal(replay.mediaAssetId, first.mediaAssetId);

    const assets = await db.query<{
      id: string;
      status: string;
      attempt_count: number;
      source_position: number;
      content_source_asset_id: string;
      source_checksum_sha256: string;
      source_byte_size: string;
    }>(
      `select id, status, attempt_count, source_position, content_source_asset_id,
              source_checksum_sha256, source_byte_size
       from media_assets where idempotency_key = $1`,
      [input.idempotencyKey],
    );
    assert.equal(assets.length, 1);
    assert.equal(assets[0]?.status, "ready");
    assert.equal(Number(assets[0]?.attempt_count), 2);
    assert.equal(assets[0]?.source_position, 7);
    assert.equal(assets[0]?.content_source_asset_id, contentSourceAssetId);
    assert.equal(assets[0]?.source_checksum_sha256, sha256(source));
    assert.equal(Number(assets[0]?.source_byte_size), source.byteLength);

    const variants = await db.query<{
      storage_key: string;
      kind: string;
      checksum_sha256: string;
      byte_size: string;
      width: number | null;
      height: number | null;
    }>(
      `select storage_key, kind, checksum_sha256, byte_size, width, height
       from media_variants where media_asset_id = $1`,
      [first.mediaAssetId],
    );
    assert.equal(variants.length, 4);
    for (const variant of variants) {
      assert.equal(await storage.exists(variant.storage_key), true);
      const bytes = await storage.read(variant.storage_key);
      assert.equal(bytes.byteLength, Number(variant.byte_size));
      assert.equal(sha256(bytes), variant.checksum_sha256);
      assert.ok(variant.width && variant.height);
    }

    await assert.rejects(service.processImage({ ...input, sourcePosition: 8 }), /idempotency_conflict/);
    const unchanged = await db.query<{ status: string; attempt_count: number }>(
      "select status, attempt_count from media_assets where idempotency_key = $1",
      [input.idempotencyKey],
    );
    assert.equal(unchanged[0]?.status, "ready");
    assert.equal(Number(unchanged[0]?.attempt_count), 2);
  } finally {
    await db.close();
    await rm(root, { recursive: true, force: true });
  }
});

test("transient storage failure cleans partial objects and same-input retry succeeds", async () => {
  const db = createDatabase(databaseUrl);
  try {
    const source = await sharp({
      create: { width: 900, height: 600, channels: 3, background: "white" },
    })
      .jpeg()
      .toBuffer();
    const storage = new FlakyMemoryStorage(2);
    const service = new MediaPipelineService(db, storage);
    const input = {
      idempotencyKey: "stage10-media-storage-retry-0001",
      sourcePosition: 20,
      sourceFilename: "retry.jpg",
      sourceMimeType: "image/jpeg",
      bytes: source,
    };

    await assert.rejects(service.processImage(input), /storage_write_failed/);
    assert.equal(storage.objects.size, 0);
    const failed = await db.query<{ status: string; last_error_code: string; attempt_count: number }>(
      "select status, last_error_code, attempt_count from media_assets where idempotency_key = $1",
      [input.idempotencyKey],
    );
    assert.equal(failed[0]?.status, "failed");
    assert.equal(failed[0]?.last_error_code, "storage_write_failed");
    assert.equal(Number(failed[0]?.attempt_count), 1);

    const recovered = await service.processImage(input);
    assert.equal(recovered.replayed, false);
    assert.equal(storage.objects.size, 4);
    const ready = await db.query<{ status: string; attempt_count: number }>(
      "select status, attempt_count from media_assets where idempotency_key = $1",
      [input.idempotencyKey],
    );
    assert.equal(ready[0]?.status, "ready");
    assert.equal(Number(ready[0]?.attempt_count), 2);
  } finally {
    await db.close();
  }
});

test("abort and metadata commit failures clean stored objects and remain observable", async () => {
  const db = createDatabase(databaseUrl);
  try {
    const source = await sharp({
      create: { width: 800, height: 500, channels: 3, background: "white" },
    })
      .jpeg()
      .toBuffer();

    const controller = new AbortController();
    const abortStorage = new AbortAfterFirstWriteStorage(controller);
    const abortService = new MediaPipelineService(db, abortStorage);
    await assert.rejects(
      abortService.processImage({
        idempotencyKey: "stage10-media-abort-0001",
        sourcePosition: 30,
        sourceFilename: "abort.jpg",
        sourceMimeType: "image/jpeg",
        bytes: source,
        signal: controller.signal,
      }),
      /aborted/,
    );
    assert.equal(abortStorage.objects.size, 0);
    const aborted = await db.query<{ status: string; last_error_code: string }>(
      "select status, last_error_code from media_assets where idempotency_key = 'stage10-media-abort-0001'",
    );
    assert.equal(aborted[0]?.status, "failed");
    assert.equal(aborted[0]?.last_error_code, "aborted");

    const metadataStorage = new FlakyMemoryStorage();
    const metadataDatabase = new MetadataCommitFailureDatabase(db);
    const metadataService = new MediaPipelineService(metadataDatabase, metadataStorage);
    await assert.rejects(
      metadataService.processImage({
        idempotencyKey: "stage10-media-metadata-failure-0001",
        sourcePosition: 31,
        sourceFilename: "metadata.jpg",
        sourceMimeType: "image/jpeg",
        bytes: source,
      }),
      /metadata_commit_failed/,
    );
    assert.equal(metadataStorage.objects.size, 0);
    const metadataFailed = await db.query<{ status: string; last_error_code: string }>(
      `select status, last_error_code from media_assets
       where idempotency_key = 'stage10-media-metadata-failure-0001'`,
    );
    assert.equal(metadataFailed[0]?.status, "failed");
    assert.equal(metadataFailed[0]?.last_error_code, "metadata_commit_failed");
  } finally {
    await db.close();
  }
});
