import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import sharp from "sharp";
import { createDatabase } from "../../src/db.js";
import { MediaPipelineService } from "../../src/media/service.js";
import { FileSystemMediaStorage } from "../../src/media/storage.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for media integration tests");

test("media processing is retryable and idempotent across storage and PostgreSQL metadata", async () => {
  const db = createDatabase(databaseUrl);
  const root = await mkdtemp(join(tmpdir(), "alwaslh-media-integration-"));
  try {
    await db.query("delete from media_assets");
    const storage = new FileSystemMediaStorage(root);
    const service = new MediaPipelineService(db, storage);
    const source = await sharp({
      create: { width: 1200, height: 800, channels: 3, background: "white" },
    })
      .jpeg({ quality: 92 })
      .toBuffer();

    const input = {
      idempotencyKey: "stage10-media-image-0001",
      sourcePosition: 7,
      sourceFilename: "page-8.jpg",
      sourceMimeType: "image/jpeg",
      sourcePageNumber: 8,
      bytes: source,
    };

    const first = await service.processImage(input);
    const replay = await service.processImage(input);
    assert.equal(replay.mediaAssetId, first.mediaAssetId);

    const assets = await db.query<{
      id: string;
      status: string;
      attempt_count: number;
      source_position: number;
    }>("select id, status, attempt_count, source_position from media_assets where idempotency_key = $1", [
      input.idempotencyKey,
    ]);
    assert.equal(assets.length, 1);
    assert.equal(assets[0]?.status, "ready");
    assert.equal(Number(assets[0]?.attempt_count), 2);
    assert.equal(assets[0]?.source_position, 7);

    const variants = await db.query<{ storage_key: string; kind: string }>(
      "select storage_key, kind from media_variants where media_asset_id = $1 order by kind",
      [first.mediaAssetId],
    );
    assert.equal(variants.length, 4);
    for (const variant of variants) assert.equal(await storage.exists(variant.storage_key), true);

    await assert.rejects(
      service.processImage({
        ...input,
        idempotencyKey: "stage10-media-retry-0001",
        bytes: Buffer.from("not-an-image"),
      }),
    );
    const failed = await db.query<{ status: string }>(
      "select status from media_assets where idempotency_key = 'stage10-media-retry-0001'",
    );
    assert.equal(failed[0]?.status, "failed");

    await service.processImage({ ...input, idempotencyKey: "stage10-media-retry-0001" });
    const recovered = await db.query<{ status: string; attempt_count: number }>(
      "select status, attempt_count from media_assets where idempotency_key = 'stage10-media-retry-0001'",
    );
    assert.equal(recovered[0]?.status, "ready");
    assert.equal(Number(recovered[0]?.attempt_count), 2);
  } finally {
    await db.close();
    await rm(root, { recursive: true, force: true });
  }
});
