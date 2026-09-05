import type { QueryExecutor } from "../db.js";
import type { ProcessedMediaAsset } from "./media-types.js";

export interface MediaAssetRow {
  id: string;
  status: "processing" | "ready" | "failed";
}

interface ExistingMediaAssetRow extends MediaAssetRow {
  content_source_asset_id: string | null;
  source_position: number;
  source_filename: string;
  source_mime_type: string;
  source_page_number: number | null;
  source_checksum_sha256: string;
  source_byte_size: string;
}

export interface StoredMediaVariantRow {
  kind: "source" | "display" | "thumbnail" | "ai";
  profile_version: string;
  storage_key: string;
  mime_type: string;
  byte_size: string;
  width: number | null;
  height: number | null;
  checksum_sha256: string;
}

export interface MediaIdentityInput {
  idempotencyKey: string;
  contentSourceAssetId?: string;
  sourcePosition: number;
  sourceFilename: string;
  sourceMimeType: string;
  sourcePageNumber?: number;
  sourceChecksumSha256: string;
  sourceByteSize: number;
}

function sameNullable<T>(left: T | null | undefined, right: T | null | undefined): boolean {
  return (left ?? null) === (right ?? null);
}

function assertSameIdentity(existing: ExistingMediaAssetRow, input: MediaIdentityInput): void {
  const matches =
    sameNullable(existing.content_source_asset_id, input.contentSourceAssetId) &&
    existing.source_position === input.sourcePosition &&
    existing.source_filename === input.sourceFilename &&
    existing.source_mime_type === input.sourceMimeType &&
    sameNullable(existing.source_page_number, input.sourcePageNumber) &&
    existing.source_checksum_sha256 === input.sourceChecksumSha256 &&
    Number(existing.source_byte_size) === input.sourceByteSize;

  if (!matches) throw new Error("idempotency_conflict");
}

export async function ensureMediaAsset(tx: QueryExecutor, input: MediaIdentityInput): Promise<MediaAssetRow> {
  const existingRows = await tx.query<ExistingMediaAssetRow>(
    `select id, status, content_source_asset_id, source_position, source_filename,
            source_mime_type, source_page_number, source_checksum_sha256, source_byte_size
     from media_assets
     where idempotency_key = $1
     for update`,
    [input.idempotencyKey],
  );
  const existing = existingRows[0];

  if (existing) {
    assertSameIdentity(existing, input);
    const updatedRows = await tx.query<MediaAssetRow>(
      `update media_assets
       set attempt_count = attempt_count + 1,
           status = case when status = 'ready' then 'ready'::media_asset_status else 'processing'::media_asset_status end,
           last_error_code = case when status = 'ready' then last_error_code else null end,
           last_error_message = case when status = 'ready' then last_error_message else null end
       where id = $1
       returning id, status`,
      [existing.id],
    );
    const updated = updatedRows[0];
    if (!updated) throw new Error("media_asset_upsert_failed");
    return updated;
  }

  const rows = await tx.query<MediaAssetRow>(
    `insert into media_assets (
       idempotency_key, content_source_asset_id, source_position, source_filename,
       source_mime_type, source_page_number, source_checksum_sha256, source_byte_size,
       status, attempt_count
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, 'processing', 1)
     returning id, status`,
    [
      input.idempotencyKey,
      input.contentSourceAssetId ?? null,
      input.sourcePosition,
      input.sourceFilename,
      input.sourceMimeType,
      input.sourcePageNumber ?? null,
      input.sourceChecksumSha256,
      input.sourceByteSize,
    ],
  );
  const row = rows[0];
  if (!row) throw new Error("media_asset_upsert_failed");
  return row;
}

export async function listMediaVariants(
  tx: QueryExecutor,
  mediaAssetId: string,
): Promise<readonly StoredMediaVariantRow[]> {
  return tx.query<StoredMediaVariantRow>(
    `select kind, profile_version, storage_key, mime_type, byte_size, width, height, checksum_sha256
     from media_variants
     where media_asset_id = $1
     order by array_position(array['source','display','thumbnail','ai']::media_variant_kind[], kind)`,
    [mediaAssetId],
  );
}

export async function commitProcessedMedia(tx: QueryExecutor, asset: ProcessedMediaAsset): Promise<void> {
  for (const variant of asset.variants) {
    await tx.query(
      `insert into media_variants (
         media_asset_id, kind, profile_version, storage_key, mime_type,
         byte_size, width, height, checksum_sha256
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       on conflict (media_asset_id, kind, profile_version) do update
         set storage_key = excluded.storage_key,
             mime_type = excluded.mime_type,
             byte_size = excluded.byte_size,
             width = excluded.width,
             height = excluded.height,
             checksum_sha256 = excluded.checksum_sha256`,
      [
        asset.mediaAssetId,
        variant.kind,
        variant.profileVersion,
        `media/${asset.mediaAssetId}/${variant.kind}/${variant.profileVersion}-${variant.checksumSha256}.${variant.extension}`,
        variant.mimeType,
        variant.bytes.byteLength,
        variant.width ?? null,
        variant.height ?? null,
        variant.checksumSha256,
      ],
    );
  }

  await tx.query(
    `update media_assets
     set status = 'ready', last_error_code = null, last_error_message = null
     where id = $1`,
    [asset.mediaAssetId],
  );
}

export async function markMediaFailed(
  tx: QueryExecutor,
  mediaAssetId: string,
  code: string,
  message: string,
): Promise<void> {
  await tx.query(
    `update media_assets
     set status = 'failed', last_error_code = $2, last_error_message = left($3, 2000)
     where id = $1`,
    [mediaAssetId, code, message],
  );
}
