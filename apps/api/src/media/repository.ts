import type { QueryExecutor } from "../db.js";
import type { ProcessedMediaAsset } from "./media-types.js";

interface MediaAssetRow {
  id: string;
  status: "processing" | "ready" | "failed";
}

export async function ensureMediaAsset(
  tx: QueryExecutor,
  input: {
    idempotencyKey: string;
    contentSourceAssetId?: string;
    sourcePosition: number;
    sourceFilename: string;
    sourceMimeType: string;
    sourcePageNumber?: number;
  },
): Promise<MediaAssetRow> {
  const rows = await tx.query<MediaAssetRow>(
    `insert into media_assets (
       idempotency_key, content_source_asset_id, source_position, source_filename,
       source_mime_type, source_page_number, status, attempt_count
     ) values ($1, $2, $3, $4, $5, $6, 'processing', 1)
     on conflict (idempotency_key) do update
       set attempt_count = media_assets.attempt_count + 1,
           status = case when media_assets.status = 'ready' then 'ready'::media_asset_status else 'processing'::media_asset_status end,
           last_error_code = case when media_assets.status = 'ready' then media_assets.last_error_code else null end,
           last_error_message = case when media_assets.status = 'ready' then media_assets.last_error_message else null end
     returning id, status`,
    [
      input.idempotencyKey,
      input.contentSourceAssetId ?? null,
      input.sourcePosition,
      input.sourceFilename,
      input.sourceMimeType,
      input.sourcePageNumber ?? null,
    ],
  );
  const row = rows[0];
  if (!row) throw new Error("media_asset_upsert_failed");
  return row;
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
