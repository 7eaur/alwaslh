import type { QueryExecutor } from "../db.js";

export type OcrExtractionStatus = "queued" | "running" | "retrying" | "completed" | "failed";
export type OcrReviewStatus = "not_required" | "pending" | "approved" | "rejected";

export interface OcrInputVariantRow {
  id: string;
  media_asset_id: string;
  storage_key: string;
  mime_type: string;
  byte_size: string;
  checksum_sha256: string;
  source_page_number: number | null;
  content_source_asset_id: string | null;
}

export interface OcrExtractionRow {
  id: string;
  input_media_variant_id: string;
  input_checksum_sha256: string;
  provider_key: string;
  provider_version: string;
  profile_key: string;
  status: OcrExtractionStatus;
  attempt_count: number;
  max_attempts: number;
  next_attempt_at: Date | null;
  raw_text: string | null;
  normalized_text: string | null;
  mean_confidence: number | null;
  review_status: OcrReviewStatus;
  review_reason: string | null;
  idempotency_key: string;
}

export interface ClaimedOcrExtraction extends OcrExtractionRow {
  lease_token: string;
}

export interface ApprovedOcrSearchRow {
  id: string;
  media_asset_id: string;
  source_page_number: number | null;
  text: string;
}

interface ExistingIdentityRow extends OcrExtractionRow {}

export async function loadOcrInputVariant(
  db: QueryExecutor,
  mediaAssetId: string,
  profileVersion: string,
): Promise<OcrInputVariantRow | undefined> {
  const rows = await db.query<OcrInputVariantRow>(
    `select v.id,
            v.media_asset_id,
            v.storage_key,
            v.mime_type,
            v.byte_size,
            v.checksum_sha256,
            a.source_page_number,
            a.content_source_asset_id
     from media_variants v
     join media_assets a on a.id = v.media_asset_id
     where a.id = $1
       and a.status = 'ready'
       and v.kind = 'ai'
       and v.profile_version = $2
     limit 1`,
    [mediaAssetId, profileVersion],
  );
  return rows[0];
}

export async function ensureOcrExtraction(
  tx: QueryExecutor,
  input: {
    inputMediaVariantId: string;
    inputChecksumSha256: string;
    providerKey: string;
    providerVersion: string;
    profileKey: string;
    maxAttempts: number;
    idempotencyKey: string;
  },
): Promise<{ extraction: OcrExtractionRow; replayed: boolean }> {
  const inserted = await tx.query<OcrExtractionRow>(
    `insert into ocr_extractions (
       input_media_variant_id,
       input_checksum_sha256,
       provider_key,
       provider_version,
       profile_key,
       max_attempts,
       idempotency_key
     ) values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (idempotency_key) do nothing
     returning id, input_media_variant_id, input_checksum_sha256, provider_key, provider_version,
               profile_key, status, attempt_count, max_attempts, next_attempt_at,
               raw_text, normalized_text, mean_confidence, review_status, review_reason, idempotency_key`,
    [
      input.inputMediaVariantId,
      input.inputChecksumSha256,
      input.providerKey,
      input.providerVersion,
      input.profileKey,
      input.maxAttempts,
      input.idempotencyKey,
    ],
  );
  if (inserted[0]) return { extraction: inserted[0], replayed: false };

  const existingRows = await tx.query<ExistingIdentityRow>(
    `select id, input_media_variant_id, input_checksum_sha256, provider_key, provider_version,
            profile_key, status, attempt_count, max_attempts, next_attempt_at,
            raw_text, normalized_text, mean_confidence, review_status, review_reason, idempotency_key
     from ocr_extractions
     where idempotency_key = $1
     for update`,
    [input.idempotencyKey],
  );
  const existing = existingRows[0];
  if (!existing) throw new Error("ocr_enqueue_failed");

  const identityMatches =
    existing.input_media_variant_id === input.inputMediaVariantId &&
    existing.input_checksum_sha256 === input.inputChecksumSha256 &&
    existing.provider_key === input.providerKey &&
    existing.provider_version === input.providerVersion &&
    existing.profile_key === input.profileKey &&
    existing.max_attempts === input.maxAttempts;
  if (!identityMatches) throw new Error("ocr_idempotency_conflict");

  return { extraction: existing, replayed: true };
}

export async function claimNextOcrExtraction(
  tx: QueryExecutor,
  providerKey: string,
  providerVersion: string,
  profileKey: string,
  leaseSeconds: number,
): Promise<ClaimedOcrExtraction | undefined> {
  await tx.query(
    `update ocr_extractions
     set status = 'failed',
         lease_token = null,
         lease_expires_at = null,
         completed_at = now(),
         last_error_code = coalesce(last_error_code, 'ocr_lease_exhausted'),
         last_error_message = coalesce(last_error_message, 'OCR worker lease expired after the final attempt')
     where status = 'running'
       and lease_expires_at <= now()
       and attempt_count >= max_attempts`,
  );

  const rows = await tx.query<ClaimedOcrExtraction>(
    `with candidate as (
       select id
       from ocr_extractions
       where provider_key = $1
         and provider_version = $2
         and profile_key = $3
         and attempt_count < max_attempts
         and (
           (status in ('queued', 'retrying') and (next_attempt_at is null or next_attempt_at <= now()))
           or
           (status = 'running' and lease_expires_at <= now())
         )
       order by created_at, id
       for update skip locked
       limit 1
     )
     update ocr_extractions e
     set status = 'running',
         attempt_count = e.attempt_count + 1,
         next_attempt_at = null,
         lease_token = gen_random_uuid(),
         lease_expires_at = now() + ($4::integer * interval '1 second'),
         started_at = coalesce(e.started_at, now()),
         completed_at = null,
         last_error_code = null,
         last_error_message = null
     from candidate
     where e.id = candidate.id
     returning e.id, e.input_media_variant_id, e.input_checksum_sha256,
               e.provider_key, e.provider_version, e.profile_key, e.status,
               e.attempt_count, e.max_attempts, e.next_attempt_at,
               e.raw_text, e.normalized_text, e.mean_confidence,
               e.review_status, e.review_reason, e.idempotency_key,
               e.lease_token`,
    [providerKey, providerVersion, profileKey, leaseSeconds],
  );
  return rows[0];
}

export async function loadClaimedOcrInput(
  db: QueryExecutor,
  extractionId: string,
  leaseToken: string,
): Promise<OcrInputVariantRow | undefined> {
  const rows = await db.query<OcrInputVariantRow>(
    `select v.id,
            v.media_asset_id,
            v.storage_key,
            v.mime_type,
            v.byte_size,
            v.checksum_sha256,
            a.source_page_number,
            a.content_source_asset_id
     from ocr_extractions e
     join media_variants v on v.id = e.input_media_variant_id
     join media_assets a on a.id = v.media_asset_id
     where e.id = $1
       and e.status = 'running'
       and e.lease_token = $2
       and e.lease_expires_at > now()
       and v.checksum_sha256 = e.input_checksum_sha256
     limit 1`,
    [extractionId, leaseToken],
  );
  return rows[0];
}

export async function completeOcrExtraction(
  tx: QueryExecutor,
  input: {
    extractionId: string;
    leaseToken: string;
    rawText: string;
    normalizedText: string;
    meanConfidence: number | null;
    providerMetadata: Record<string, unknown>;
    reviewStatus: "not_required" | "pending";
    reviewReason?: string;
  },
): Promise<OcrExtractionRow> {
  const rows = await tx.query<OcrExtractionRow>(
    `update ocr_extractions
     set status = 'completed',
         raw_text = $3,
         normalized_text = $4,
         mean_confidence = $5,
         provider_metadata = $6::jsonb,
         review_status = $7,
         review_reason = $8,
         lease_token = null,
         lease_expires_at = null,
         next_attempt_at = null,
         completed_at = now(),
         last_error_code = null,
         last_error_message = null
     where id = $1
       and status = 'running'
       and lease_token = $2
       and lease_expires_at > now()
     returning id, input_media_variant_id, input_checksum_sha256, provider_key, provider_version,
               profile_key, status, attempt_count, max_attempts, next_attempt_at,
               raw_text, normalized_text, mean_confidence, review_status, review_reason, idempotency_key`,
    [
      input.extractionId,
      input.leaseToken,
      input.rawText,
      input.normalizedText,
      input.meanConfidence,
      JSON.stringify(input.providerMetadata),
      input.reviewStatus,
      input.reviewReason ?? null,
    ],
  );
  const row = rows[0];
  if (!row) throw new Error("ocr_lease_lost");
  return row;
}

export async function failOcrExtraction(
  tx: QueryExecutor,
  input: {
    extractionId: string;
    leaseToken: string;
    retryable: boolean;
    retryDelaySeconds: number;
    errorCode: string;
    errorMessage: string;
  },
): Promise<OcrExtractionRow> {
  const rows = await tx.query<OcrExtractionRow>(
    `update ocr_extractions
     set status = case
           when $3::boolean and attempt_count < max_attempts then 'retrying'::ocr_extraction_status
           else 'failed'::ocr_extraction_status
         end,
         next_attempt_at = case
           when $3::boolean and attempt_count < max_attempts
             then now() + ($4::integer * interval '1 second')
           else null
         end,
         lease_token = null,
         lease_expires_at = null,
         completed_at = case
           when $3::boolean and attempt_count < max_attempts then null
           else now()
         end,
         last_error_code = left($5, 120),
         last_error_message = left($6, 2000)
     where id = $1
       and status = 'running'
       and lease_token = $2
     returning id, input_media_variant_id, input_checksum_sha256, provider_key, provider_version,
               profile_key, status, attempt_count, max_attempts, next_attempt_at,
               raw_text, normalized_text, mean_confidence, review_status, review_reason, idempotency_key`,
    [
      input.extractionId,
      input.leaseToken,
      input.retryable,
      input.retryDelaySeconds,
      input.errorCode,
      input.errorMessage,
    ],
  );
  const row = rows[0];
  if (!row) throw new Error("ocr_lease_lost");
  return row;
}

export async function reviewOcrExtraction(
  tx: QueryExecutor,
  input: {
    extractionId: string;
    actorProfileId: string;
    decision: "approved" | "rejected";
    replacementNormalizedText?: string;
  },
): Promise<OcrExtractionRow> {
  const rows = await tx.query<OcrExtractionRow>(
    `update ocr_extractions
     set review_status = $3,
         normalized_text = case when $4::text is null then normalized_text else $4::text end,
         reviewed_by_profile_id = $2,
         reviewed_at = now()
     where id = $1
       and status = 'completed'
       and review_status = 'pending'
     returning id, input_media_variant_id, input_checksum_sha256, provider_key, provider_version,
               profile_key, status, attempt_count, max_attempts, next_attempt_at,
               raw_text, normalized_text, mean_confidence, review_status, review_reason, idempotency_key`,
    [input.extractionId, input.actorProfileId, input.decision, input.replacementNormalizedText ?? null],
  );
  const row = rows[0];
  if (!row) throw new Error("ocr_review_conflict");
  return row;
}

export async function searchApprovedOcrText(
  db: QueryExecutor,
  query: string,
  limit: number,
): Promise<readonly ApprovedOcrSearchRow[]> {
  return db.query<ApprovedOcrSearchRow>(
    `select e.id,
            v.media_asset_id,
            a.source_page_number,
            coalesce(e.normalized_text, e.raw_text, '') as text
     from ocr_extractions e
     join media_variants v on v.id = e.input_media_variant_id
     join media_assets a on a.id = v.media_asset_id
     where e.status = 'completed'
       and e.review_status in ('not_required', 'approved')
       and to_tsvector('simple', coalesce(e.normalized_text, e.raw_text, '')) @@ plainto_tsquery('simple', $1)
     order by ts_rank(
       to_tsvector('simple', coalesce(e.normalized_text, e.raw_text, '')),
       plainto_tsquery('simple', $1)
     ) desc,
     e.created_at,
     e.id
     limit $2`,
    [query, limit],
  );
}

export async function getOcrExtraction(
  db: QueryExecutor,
  extractionId: string,
): Promise<OcrExtractionRow | undefined> {
  const rows = await db.query<OcrExtractionRow>(
    `select id, input_media_variant_id, input_checksum_sha256, provider_key, provider_version,
            profile_key, status, attempt_count, max_attempts, next_attempt_at,
            raw_text, normalized_text, mean_confidence, review_status, review_reason, idempotency_key
     from ocr_extractions
     where id = $1`,
    [extractionId],
  );
  return rows[0];
}
