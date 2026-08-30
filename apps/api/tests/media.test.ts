import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import sharp from "sharp";
import { prepareImageVariants } from "../src/media/image-processor.js";
import { mapWithConcurrencyOrdered } from "../src/media/ordered-concurrency.js";
import { buildMediaStorageKey } from "../src/media/service.js";
import { assertMediaStorageKey, FileSystemMediaStorage } from "../src/media/storage.js";

test("ordered concurrency preserves input order even when completion order is reversed", async () => {
  const items = [1, 2, 3, 4, 5];
  const completed: number[] = [];
  const results = await mapWithConcurrencyOrdered(items, 5, async (value) => {
    await new Promise((resolve) => setTimeout(resolve, (6 - value) * 5));
    completed.push(value);
    return `page-${value}`;
  });
  assert.notDeepEqual(completed, items);
  assert.deepEqual(results, ["page-1", "page-2", "page-3", "page-4", "page-5"]);
  await assert.rejects(mapWithConcurrencyOrdered(items, 9, async (value) => value), /invalid_concurrency/);
  await assert.rejects(mapWithConcurrencyOrdered(items, 0, async (value) => value), /invalid_concurrency/);
});

test("filesystem storage rejects traversal and writes atomically under its root", async () => {
  const root = await mkdtemp(join(tmpdir(), "alwaslh-media-"));
  try {
    const storage = new FileSystemMediaStorage(root);
    assert.throws(() => assertMediaStorageKey("../escape.txt"), /invalid_media_storage_key/);
    assert.throws(() => assertMediaStorageKey("media/../../escape.txt"), /invalid_media_storage_key/);
    assert.throws(() => assertMediaStorageKey("/absolute.txt"), /invalid_media_storage_key/);

    const key = "media/asset-1/source/source-abc.png";
    const bytes = Buffer.from("safe-bytes");
    await storage.put(key, bytes);
    assert.equal(await storage.exists(key), true);
    assert.deepEqual(await storage.read(key), bytes);
    await storage.remove(key);
    assert.equal(await storage.exists(key), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("image processor creates deterministic source/display/thumbnail/AI variants", async () => {
  const source = await sharp({
    create: { width: 2200, height: 1400, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();

  const variants = await prepareImageVariants(source);
  assert.deepEqual(
    variants.map((variant) => variant.kind),
    ["source", "display", "thumbnail", "ai"],
  );
  const display = variants.find((variant) => variant.kind === "display");
  const thumbnail = variants.find((variant) => variant.kind === "thumbnail");
  const ai = variants.find((variant) => variant.kind === "ai");
  assert.ok(display?.width && display.height && Math.max(display.width, display.height) <= 1800);
  assert.ok(thumbnail?.width && thumbnail.height && Math.max(thumbnail.width, thumbnail.height) <= 480);
  assert.ok(ai?.width && ai.height && Math.max(ai.width, ai.height) <= 1280);

  for (const variant of variants) {
    assert.ok(variant.bytes.byteLength > 0);
    assert.ok(variant.width && variant.height);
    assert.match(variant.checksumSha256, /^[0-9a-f]{64}$/);
    const firstKey = buildMediaStorageKey("asset-1", variant);
    const secondKey = buildMediaStorageKey("asset-1", variant);
    assert.equal(firstKey, secondKey);
    assert.equal(assertMediaStorageKey(firstKey), firstKey);
  }

  await assert.rejects(prepareImageVariants(Buffer.from("not-an-image")));
});
