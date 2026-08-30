import { createHash } from "node:crypto";
import { z } from "zod";
import type { Database, QueryExecutor } from "../db.js";

const assetSchema = z.object({
  sourcePath: z.string().min(1),
  filename: z.string().min(1),
  extension: z.string().min(1),
  mimeType: z.string().min(1),
  byteSize: z.number().int().nonnegative(),
  sourceGitBlobSha1: z.string().regex(/^[0-9a-f]{40}$/),
  namingFamily: z.string().min(1),
  sourceNumber: z.number().int().nonnegative(),
  sourceOrder: z.number().int().nonnegative(),
  titleHint: z.string().nullable(),
  sourceMetadata: z.record(z.unknown()),
});

const documentSchema = z.object({
  sourcePath: z.string().min(1),
  classSlug: z.string().min(1),
  className: z.string().min(1),
  subjectSlug: z.string().min(1),
  subjectName: z.string().min(1),
  kind: z.enum(["textbook", "government_exam"]),
  title: z.string().min(1),
  hijriYear: z.number().int().min(1300).max(1700).nullable(),
  examTrack: z.string().min(1).nullable(),
  position: z.number().int().nonnegative(),
  helperFiles: z.array(z.string()),
  sourceMetadata: z.record(z.unknown()),
  assets: z.array(assetSchema),
});

const issueArraySchema = z.array(z.unknown());

export const contentSourceInventorySchema = z.object({
  schemaVersion: z.literal(1),
  source: z.object({
    repository: z.string().min(1),
    revision: z.string().regex(/^[0-9a-f]{40}$/),
  }),
  summary: z.object({
    subjectRoots: z.number().int().nonnegative(),
    documents: z.number().int().nonnegative(),
    images: z.number().int().nonnegative(),
    helperFiles: z.number().int().nonnegative(),
    extensions: z.record(z.number().int().nonnegative()),
    manifestFiles: z.number().int().nonnegative(),
    duplicateBlobGroups: z.number().int().nonnegative(),
    duplicateBlobAssets: z.number().int().nonnegative(),
    otherFiles: z.number().int().nonnegative(),
    fatalIssues: z.number().int().nonnegative(),
    perSubject: z.array(z.record(z.unknown())),
  }),
  issues: z.object({
    sourceRevisionErrors: issueArraySchema,
    unmappedImages: issueArraySchema,
    unparsedAssets: issueArraySchema,
    manifestErrors: issueArraySchema,
    orderErrors: issueArraySchema,
    classificationErrors: issueArraySchema,
    expectedCountErrors: issueArraySchema,
    otherFiles: issueArraySchema,
    duplicateBlobGroups: issueArraySchema,
  }),
  documents: z.array(documentSchema),
  manifestSha256: z.string().regex(/^[0-9a-f]{64}$/),
});

export type ContentSourceInventory = z.infer<typeof contentSourceInventorySchema>;

export interface ContentSourceImportResult {
  runId: string;
  replayed: boolean;
  documents: number;
  assets: number;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(object)
        .sort()
        .map((key) => [key, canonicalize(object[key])]),
    );
  }
  return value;
}

export function inventoryDigest(inventory: ContentSourceInventory): string {
  const { manifestSha256: _manifestSha256, ...payload } = inventory;
  const encoded = JSON.stringify(canonicalize(payload));
  return createHash("sha256").update(encoded).digest("hex");
}

export function validateInventory(input: unknown): ContentSourceInventory {
  const inventory = contentSourceInventorySchema.parse(input);
  if (inventory.summary.fatalIssues !== 0) {
    throw new Error(`Content source inventory has ${inventory.summary.fatalIssues} fatal issue(s)`);
  }
  const assetCount = inventory.documents.reduce((sum, document) => sum + document.assets.length, 0);
  if (inventory.summary.documents !== inventory.documents.length) {
    throw new Error("Content source inventory document count does not match payload");
  }
  if (inventory.summary.images !== assetCount) {
    throw new Error("Content source inventory image count does not match payload");
  }
  const observedDigest = inventoryDigest(inventory);
  if (observedDigest !== inventory.manifestSha256) {
    throw new Error(`Content source inventory digest mismatch: expected ${inventory.manifestSha256}, observed ${observedDigest}`);
  }
  return inventory;
}

type RunRow = { id: string };
type DocumentRow = { id: string };

async function getOrCreateRun(tx: QueryExecutor, inventory: ContentSourceInventory): Promise<{ id: string; replayed: boolean }> {
  const existing = await tx.query<RunRow>(
    `select id
       from content_import_runs
      where source_repository = $1 and source_revision = $2 and manifest_sha256 = $3`,
    [inventory.source.repository, inventory.source.revision, inventory.manifestSha256],
  );
  if (existing[0]) return { id: existing[0].id, replayed: true };

  const rows = await tx.query<RunRow>(
    `insert into content_import_runs (
       source_repository, source_revision, manifest_sha256,
       subject_root_count, document_count, asset_count, helper_file_count, report
     ) values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
     returning id`,
    [
      inventory.source.repository,
      inventory.source.revision,
      inventory.manifestSha256,
      inventory.summary.subjectRoots,
      inventory.summary.documents,
      inventory.summary.images,
      inventory.summary.helperFiles,
      JSON.stringify({ summary: inventory.summary, issues: inventory.issues }),
    ],
  );
  const row = rows[0];
  if (!row) throw new Error("Content import run insert returned no id");
  return { id: row.id, replayed: false };
}

async function upsertDocument(
  tx: QueryExecutor,
  runId: string,
  repository: string,
  document: ContentSourceInventory["documents"][number],
): Promise<string> {
  const rows = await tx.query<DocumentRow>(
    `insert into content_source_documents (
       source_repository, source_path, class_slug, class_name, subject_slug, subject_name,
       kind, title, hijri_year, exam_track, position, is_present,
       first_seen_import_run_id, last_seen_import_run_id, source_metadata
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,$12,$12,$13::jsonb)
     on conflict (source_repository, source_path) do update set
       class_slug = excluded.class_slug,
       class_name = excluded.class_name,
       subject_slug = excluded.subject_slug,
       subject_name = excluded.subject_name,
       kind = excluded.kind,
       title = excluded.title,
       hijri_year = excluded.hijri_year,
       exam_track = excluded.exam_track,
       position = excluded.position,
       is_present = true,
       last_seen_import_run_id = excluded.last_seen_import_run_id,
       source_metadata = excluded.source_metadata
     returning id`,
    [
      repository,
      document.sourcePath,
      document.classSlug,
      document.className,
      document.subjectSlug,
      document.subjectName,
      document.kind,
      document.title,
      document.hijriYear,
      document.examTrack,
      document.position,
      runId,
      JSON.stringify({ ...document.sourceMetadata, helperFiles: document.helperFiles }),
    ],
  );
  const row = rows[0];
  if (!row) throw new Error(`Content source document upsert returned no id: ${document.sourcePath}`);
  return row.id;
}

async function upsertAsset(
  tx: QueryExecutor,
  runId: string,
  documentId: string,
  asset: ContentSourceInventory["documents"][number]["assets"][number],
): Promise<void> {
  await tx.query(
    `insert into content_source_assets (
       document_id, source_path, filename, position, mime_type, byte_size,
       source_git_blob_sha1, checksum_sha256, naming_family, source_number, title_hint,
       is_present, first_seen_import_run_id, last_seen_import_run_id, source_metadata
     ) values ($1,$2,$3,$4,$5,$6,$7,null,$8,$9,$10,true,$11,$11,$12::jsonb)
     on conflict (document_id, source_path) do update set
       filename = excluded.filename,
       position = excluded.position,
       mime_type = excluded.mime_type,
       byte_size = excluded.byte_size,
       source_git_blob_sha1 = excluded.source_git_blob_sha1,
       naming_family = excluded.naming_family,
       source_number = excluded.source_number,
       title_hint = excluded.title_hint,
       is_present = true,
       last_seen_import_run_id = excluded.last_seen_import_run_id,
       source_metadata = excluded.source_metadata`,
    [
      documentId,
      asset.sourcePath,
      asset.filename,
      asset.sourceOrder,
      asset.mimeType,
      asset.byteSize,
      asset.sourceGitBlobSha1,
      asset.namingFamily,
      asset.sourceNumber,
      asset.titleHint,
      runId,
      JSON.stringify(asset.sourceMetadata),
    ],
  );
}

export async function importContentSource(database: Database, input: unknown): Promise<ContentSourceImportResult> {
  const inventory = validateInventory(input);
  return database.transaction(async (tx) => {
    const run = await getOrCreateRun(tx, inventory);

    await tx.query(
      `update content_source_assets a
          set is_present = false, updated_at = now()
         from content_source_documents d
        where a.document_id = d.id
          and d.source_repository = $1
          and a.is_present`,
      [inventory.source.repository],
    );
    await tx.query(
      `update content_source_documents
          set is_present = false, updated_at = now()
        where source_repository = $1 and is_present`,
      [inventory.source.repository],
    );

    let assetCount = 0;
    for (const document of inventory.documents) {
      const documentId = await upsertDocument(tx, run.id, inventory.source.repository, document);
      for (const asset of document.assets) {
        await upsertAsset(tx, run.id, documentId, asset);
        assetCount += 1;
      }
    }

    return {
      runId: run.id,
      replayed: run.replayed,
      documents: inventory.documents.length,
      assets: assetCount,
    };
  });
}
