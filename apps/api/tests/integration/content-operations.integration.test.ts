import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for content operations integration tests");

const origin = "http://localhost:5173";
const checksumA = "a".repeat(64);
const checksumB = "b".repeat(64);
const gitShaA = "a".repeat(40);
const gitShaB = "b".repeat(40);

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

test("Admin content operations preserve source order and provide OCR review without creating a second pipeline", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير عمليات المحتوى') returning id",
  );
  const adminId = adminRows[0]?.id;
  assert.ok(adminId);
  await auth.createCredential(adminId, "stage13-content-admin", "ContentOperationsAdmin123!");

  const runRows = await db.query<{ id: string }>(
    `insert into content_import_runs (
       source_repository, source_revision, manifest_sha256,
       subject_root_count, document_count, asset_count, helper_file_count
     ) values ('7eaur/alwaslh-go', 'content-ops-test', $1, 1, 2, 2, 0)
     returning id`,
    [checksumA],
  );
  const runId = runRows[0]?.id;
  assert.ok(runId);

  const documentRows = await db.query<{ id: string }>(
    `insert into content_source_documents (
       source_repository, source_path, class_slug, class_name, subject_slug, subject_name,
       kind, title, position, first_seen_import_run_id, last_seen_import_run_id
     ) values
       ('7eaur/alwaslh-go', 'grade-3/physics/book', 'grade-3', 'الصف الثالث', 'physics', 'الفيزياء',
        'textbook', 'كتاب الفيزياء التجريبي', 1, $1, $1),
       ('7eaur/alwaslh-go', 'grade-3/chemistry/exam', 'grade-3', 'الصف الثالث', 'chemistry', 'الكيمياء',
        'government_exam', 'اختبار الكيمياء', 2, $1, $1)
     returning id`,
    [runId],
  );
  const physicsDocumentId = documentRows[0]?.id;
  assert.ok(physicsDocumentId);

  const assetRows = await db.query<{ id: string }>(
    `insert into content_source_assets (
       document_id, source_path, filename, position, mime_type, byte_size,
       source_git_blob_sha1, checksum_sha256, naming_family, source_number,
       first_seen_import_run_id, last_seen_import_run_id
     ) values
       ($1, 'grade-3/physics/book/002.jpg', '002.jpg', 1, 'image/jpeg', 1200,
        $2, $3, 'numbered', 2, $4, $4),
       ($1, 'grade-3/physics/book/001.jpg', '001.jpg', 0, 'image/jpeg', 1000,
        $5, $6, 'numbered', 1, $4, $4)
     returning id`,
    [physicsDocumentId, gitShaB, checksumB, runId, gitShaA, checksumA],
  );
  const secondSourceAssetId = assetRows[0]?.id;
  const firstSourceAssetId = assetRows[1]?.id;
  assert.ok(secondSourceAssetId);
  assert.ok(firstSourceAssetId);

  const readyMediaRows = await db.query<{ id: string }>(
    `insert into media_assets (
       idempotency_key, content_source_asset_id, source_position, source_filename,
       source_mime_type, source_page_number, source_checksum_sha256, source_byte_size,
       status, attempt_count
     ) values ('content-ops-ready', $1, 0, '001.jpg', 'image/jpeg', 1, $2, 1000, 'ready', 1)
     returning id`,
    [firstSourceAssetId, checksumA],
  );
  const readyMediaId = readyMediaRows[0]?.id;
  assert.ok(readyMediaId);

  await db.query(
    `insert into media_assets (
       idempotency_key, content_source_asset_id, source_position, source_filename,
       source_mime_type, source_page_number, source_checksum_sha256, source_byte_size,
       status, attempt_count, last_error_code, last_error_message
     ) values ('content-ops-failed', $1, 1, '002.jpg', 'image/jpeg', 2, $2, 1200,
               'failed', 2, 'image_decode_failed', 'fixture failure')`,
    [secondSourceAssetId, checksumB],
  );

  const variantRows = await db.query<{ id: string; kind: string }>(
    `insert into media_variants (
       media_asset_id, kind, profile_version, storage_key, mime_type,
       byte_size, width, height, checksum_sha256
     ) values
       ($1, 'source', 'source-v1', 'content-ops/source.webp', 'image/webp', 900, 1000, 1400, $2),
       ($1, 'display', 'display-v1', 'content-ops/display.webp', 'image/webp', 500, 800, 1120, $2),
       ($1, 'thumbnail', 'thumbnail-v1', 'content-ops/thumb.webp', 'image/webp', 100, 240, 336, $2),
       ($1, 'ai', 'ai-v1', 'content-ops/ai.webp', 'image/webp', 400, 800, 1120, $2)
     returning id, kind`,
    [readyMediaId, checksumA],
  );
  const aiVariantId = variantRows.find((row) => row.kind === "ai")?.id;
  assert.ok(aiVariantId);

  const extractionRows = await db.query<{ id: string }>(
    `insert into ocr_extractions (
       input_media_variant_id, input_checksum_sha256, provider_key, provider_version,
       profile_key, status, attempt_count, max_attempts, raw_text, normalized_text,
       mean_confidence, review_status, review_reason, idempotency_key, completed_at
     ) values
       ($1, $2, 'fixture', 'v1', 'standard', 'completed', 1, 3,
        'نص  يحتاج   مراجعة', 'نص يحتاج مراجعة', 42.5, 'pending', 'low_confidence',
        'content-ops-ocr-pending', now()),
       ($1, $2, 'fixture', 'v1', 'exact', 'completed', 1, 3,
        '', '', 99, 'pending', 'empty_text', 'content-ops-ocr-empty', now())
     returning id`,
    [aiVariantId, checksumA],
  );
  const pendingExtractionId = extractionRows[0]?.id;
  const emptyExtractionId = extractionRows[1]?.id;
  assert.ok(pendingExtractionId);
  assert.ok(emptyExtractionId);

  const app = buildApp({ config, database: db });
  try {
    const unauthenticated = await app.inject({ method: "GET", url: "/v1/admin/content-operations" });
    assert.equal(unauthenticated.statusCode, 401);

    const login = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { identifier: "stage13-content-admin", password: "ContentOperationsAdmin123!" },
    });
    assert.equal(login.statusCode, 200);
    const adminCookie = cookieFrom(login);

    const overview = await app.inject({
      method: "GET",
      url: "/v1/admin/content-operations?classSlug=grade-3&subjectSlug=physics&q=فيزياء",
      headers: { cookie: adminCookie },
    });
    assert.equal(overview.statusCode, 200);
    const operations = overview.json().operations;
    assert.equal(operations.summary.documentCount, 1);
    assert.equal(operations.summary.assetCount, 2);
    assert.equal(operations.summary.mediaCount, 2);
    assert.equal(operations.summary.readyMediaCount, 1);
    assert.equal(operations.summary.failedMediaCount, 1);
    assert.equal(operations.summary.pendingOcrCount, 2);
    assert.equal(operations.documents[0].title, "كتاب الفيزياء التجريبي");
    assert.equal(operations.documents[0].pendingOcrCount, 2);
    assert.ok(operations.facets.subjects.some((facet: { slug: string }) => facet.slug === "chemistry"));

    const examFilter = await app.inject({
      method: "GET",
      url: "/v1/admin/content-operations?kind=government_exam",
      headers: { cookie: adminCookie },
    });
    assert.equal(examFilter.statusCode, 200);
    assert.equal(examFilter.json().operations.summary.documentCount, 1);
    assert.equal(examFilter.json().operations.documents[0].title, "اختبار الكيمياء");

    const detail = await app.inject({
      method: "GET",
      url: `/v1/admin/content-operations/documents/${physicsDocumentId}`,
      headers: { cookie: adminCookie },
    });
    assert.equal(detail.statusCode, 200);
    const assets = detail.json().detail.assets;
    assert.deepEqual(
      assets.map((asset: { filename: string }) => asset.filename),
      ["001.jpg", "002.jpg"],
    );
    assert.equal(assets[0].media.status, "ready");
    assert.deepEqual(
      assets[0].media.variants.map((variant: { kind: string }) => variant.kind),
      ["source", "display", "thumbnail", "ai"],
    );
    assert.equal(assets[0].media.ocrExtractions.length, 2);
    assert.equal(assets[0].media.ocrExtractions[0].rawText, undefined);
    assert.equal(assets[1].media.status, "failed");
    assert.equal(assets[1].media.lastErrorCode, "image_decode_failed");

    const extraction = await app.inject({
      method: "GET",
      url: `/v1/admin/content-operations/ocr/${pendingExtractionId}`,
      headers: { cookie: adminCookie },
    });
    assert.equal(extraction.statusCode, 200);
    assert.equal(extraction.json().extraction.rawText, "نص  يحتاج   مراجعة");
    assert.equal(extraction.json().extraction.source.documentId, physicsDocumentId);
    assert.equal(extraction.json().extraction.source.sourcePageNumber, 1);

    const approve = await app.inject({
      method: "PATCH",
      url: `/v1/admin/content-operations/ocr/${pendingExtractionId}/review`,
      headers: { origin, cookie: adminCookie },
      payload: { decision: "approved", replacementText: "  نص   مصحح  " },
    });
    assert.equal(approve.statusCode, 200);
    assert.equal(approve.json().extraction.reviewStatus, "approved");
    assert.equal(approve.json().extraction.normalizedText, "نص مصحح");
    assert.equal(approve.json().extraction.reviewedByProfileId, adminId);

    const replayReview = await app.inject({
      method: "PATCH",
      url: `/v1/admin/content-operations/ocr/${pendingExtractionId}/review`,
      headers: { origin, cookie: adminCookie },
      payload: { decision: "approved" },
    });
    assert.equal(replayReview.statusCode, 409);

    const emptyApproval = await app.inject({
      method: "PATCH",
      url: `/v1/admin/content-operations/ocr/${emptyExtractionId}/review`,
      headers: { origin, cookie: adminCookie },
      payload: { decision: "approved" },
    });
    assert.equal(emptyApproval.statusCode, 400);

    const emptyCorrection = await app.inject({
      method: "PATCH",
      url: `/v1/admin/content-operations/ocr/${emptyExtractionId}/review`,
      headers: { origin, cookie: adminCookie },
      payload: { decision: "approved", replacementText: "النص بعد المراجعة" },
    });
    assert.equal(emptyCorrection.statusCode, 200);
    assert.equal(emptyCorrection.json().extraction.normalizedText, "النص بعد المراجعة");

    const afterReview = await app.inject({
      method: "GET",
      url: `/v1/admin/content-operations?subjectSlug=physics`,
      headers: { cookie: adminCookie },
    });
    assert.equal(afterReview.statusCode, 200);
    assert.equal(afterReview.json().operations.summary.pendingOcrCount, 0);
  } finally {
    await app.close();
  }
});
