import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";
import { FileSystemMediaStorage } from "../../src/media/storage.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for content preview integration tests");

const origin = "http://localhost:5173";
const storageKey = "content-preview/ocr-source.webp";

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

test("Admin OCR preview streams verified source bytes without exposing storage internals", async () => {
  const mediaRoot = await mkdtemp(join(tmpdir(), "alwaslh-admin-preview-"));
  const previewBytes = await sharp({
    create: {
      width: 8,
      height: 8,
      channels: 3,
      background: { r: 240, g: 244, b: 248 },
    },
  })
    .webp({ quality: 90 })
    .toBuffer();
  const previewChecksum = createHash("sha256").update(previewBytes).digest("hex");
  const storage = new FileSystemMediaStorage(mediaRoot);
  await storage.put(storageKey, previewBytes);

  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
    MEDIA_STORAGE_ROOT: mediaRoot,
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);
  const adminPassword = `Preview-${randomUUID()}-Aa1!`;

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير معاينة OCR') returning id",
  );
  const adminId = adminRows[0]?.id;
  assert.ok(adminId);
  await auth.createCredential(adminId, "stage13-content-preview-admin", adminPassword);

  const runRows = await db.query<{ id: string }>(
    `insert into content_import_runs (
       source_repository, source_revision, manifest_sha256,
       subject_root_count, document_count, asset_count, helper_file_count
     ) values ('7eaur/alwaslh-go', 'content-preview-test', $1, 1, 1, 1, 0)
     returning id`,
    [previewChecksum],
  );
  const runId = runRows[0]?.id;
  assert.ok(runId);

  const documentRows = await db.query<{ id: string }>(
    `insert into content_source_documents (
       source_repository, source_path, class_slug, class_name, subject_slug, subject_name,
       kind, title, position, first_seen_import_run_id, last_seen_import_run_id
     ) values (
       '7eaur/alwaslh-go', 'preview/grade-3/physics/book', 'preview-grade-3', 'الصف الثالث',
       'preview-physics', 'الفيزياء', 'textbook', 'كتاب معاينة OCR', 0, $1, $1
     ) returning id`,
    [runId],
  );
  const documentId = documentRows[0]?.id;
  assert.ok(documentId);

  const assetRows = await db.query<{ id: string }>(
    `insert into content_source_assets (
       document_id, source_path, filename, position, mime_type, byte_size,
       source_git_blob_sha1, checksum_sha256, naming_family, source_number,
       first_seen_import_run_id, last_seen_import_run_id
     ) values (
       $1, 'preview/grade-3/physics/book/001.webp', '001.webp', 0, 'image/webp', $2,
       $3, $4, 'numbered', 1, $5, $5
     ) returning id`,
    [documentId, previewBytes.byteLength, "a".repeat(40), previewChecksum, runId],
  );
  const sourceAssetId = assetRows[0]?.id;
  assert.ok(sourceAssetId);

  const mediaRows = await db.query<{ id: string }>(
    `insert into media_assets (
       idempotency_key, content_source_asset_id, source_position, source_filename,
       source_mime_type, source_page_number, source_checksum_sha256, source_byte_size,
       status, attempt_count
     ) values (
       'content-preview-ready', $1, 0, '001.webp', 'image/webp', 1, $2, $3, 'ready', 1
     ) returning id`,
    [sourceAssetId, previewChecksum, previewBytes.byteLength],
  );
  const mediaId = mediaRows[0]?.id;
  assert.ok(mediaId);

  const variantRows = await db.query<{ id: string }>(
    `insert into media_variants (
       media_asset_id, kind, profile_version, storage_key, mime_type,
       byte_size, width, height, checksum_sha256
     ) values ($1, 'ai', 'preview-v1', $2, 'image/webp', $3, 8, 8, $4)
     returning id`,
    [mediaId, storageKey, previewBytes.byteLength, previewChecksum],
  );
  const variantId = variantRows[0]?.id;
  assert.ok(variantId);

  const extractionRows = await db.query<{ id: string }>(
    `insert into ocr_extractions (
       input_media_variant_id, input_checksum_sha256, provider_key, provider_version,
       profile_key, status, attempt_count, max_attempts, raw_text, normalized_text,
       mean_confidence, review_status, review_reason, idempotency_key, completed_at
     ) values (
       $1, $2, 'fixture', 'v1', 'standard', 'completed', 1, 3,
       'نص للمعاينة', 'نص للمعاينة', 75, 'pending', 'low_confidence',
       'content-preview-ocr', now()
     ) returning id`,
    [variantId, previewChecksum],
  );
  const extractionId = extractionRows[0]?.id;
  assert.ok(extractionId);

  const app = buildApp({ config, database: db });
  try {
    const unauthenticated = await app.inject({
      method: "GET",
      url: `/v1/admin/content-operations/ocr/${extractionId}/preview`,
    });
    assert.equal(unauthenticated.statusCode, 401);

    const login = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { identifier: "stage13-content-preview-admin", password: adminPassword },
    });
    assert.equal(login.statusCode, 200);
    const adminCookie = cookieFrom(login);

    const preview = await app.inject({
      method: "GET",
      url: `/v1/admin/content-operations/ocr/${extractionId}/preview`,
      headers: { cookie: adminCookie },
    });
    assert.equal(preview.statusCode, 200);
    assert.equal(preview.headers["content-type"], "image/webp");
    assert.equal(preview.headers["content-length"], String(previewBytes.byteLength));
    assert.equal(preview.headers["cache-control"], "private, no-store");
    assert.equal(preview.headers["x-content-type-options"], "nosniff");
    assert.equal(preview.headers.etag, `"${previewChecksum}"`);
    assert.deepEqual(preview.rawPayload, previewBytes);

    await storage.put(storageKey, Buffer.from("tampered-preview"));
    const corrupted = await app.inject({
      method: "GET",
      url: `/v1/admin/content-operations/ocr/${extractionId}/preview`,
      headers: { cookie: adminCookie },
    });
    assert.equal(corrupted.statusCode, 503);
    assert.equal(corrupted.json().error.code, "SERVICE_UNAVAILABLE");
    assert.equal(JSON.stringify(corrupted.json()).includes(storageKey), false);
  } finally {
    await app.close();
    await rm(mediaRoot, { recursive: true, force: true });
  }
});
