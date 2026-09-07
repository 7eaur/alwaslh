import type { Database } from "../db.js";
import { AppError } from "../errors.js";
import { normalizeOcrText } from "../ocr/normalize.js";
import { reviewOcrExtraction } from "../ocr/repository.js";

export type ContentSourceDocumentKind = "textbook" | "government_exam";
export type MediaAssetStatus = "processing" | "ready" | "failed";
export type OcrExtractionStatus = "queued" | "running" | "retrying" | "completed" | "failed";
export type OcrReviewStatus = "not_required" | "pending" | "approved" | "rejected";

export interface ContentOperationsFilters {
  classSlug?: string;
  subjectSlug?: string;
  kind?: ContentSourceDocumentKind;
  query?: string;
  limit: number;
  offset: number;
}

export interface SourceFacet {
  slug: string;
  name: string;
}

export interface ContentOperationsDocument {
  id: string;
  sourcePath: string;
  classSlug: string;
  className: string;
  subjectSlug: string;
  subjectName: string;
  kind: ContentSourceDocumentKind;
  title: string;
  hijriYear: number | null;
  examTrack: string | null;
  position: number;
  assetCount: number;
  mediaCount: number;
  readyMediaCount: number;
  failedMediaCount: number;
  pendingOcrCount: number;
  updatedAt: Date;
}

export interface ContentOperationsSummary {
  documentCount: number;
  assetCount: number;
  mediaCount: number;
  readyMediaCount: number;
  failedMediaCount: number;
  pendingOcrCount: number;
}

export interface ContentOperationsOverview {
  summary: ContentOperationsSummary;
  facets: {
    classes: SourceFacet[];
    subjects: SourceFacet[];
  };
  documents: ContentOperationsDocument[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface MediaVariantView {
  id: string;
  kind: "source" | "display" | "thumbnail" | "ai";
  profileVersion: string;
  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  checksumSha256: string;
}

export interface OcrExtractionMetadataView {
  id: string;
  inputMediaVariantId: string;
  providerKey: string;
  providerVersion: string;
  profileKey: string;
  status: OcrExtractionStatus;
  attemptCount: number;
  maxAttempts: number;
  meanConfidence: number | null;
  reviewStatus: OcrReviewStatus;
  reviewReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SourceAssetOperationsView {
  id: string;
  sourcePath: string;
  filename: string;
  position: number;
  mimeType: string;
  byteSize: number;
  checksumSha256: string | null;
  namingFamily: string;
  sourceNumber: number;
  titleHint: string | null;
  media: null | {
    id: string;
    status: MediaAssetStatus;
    sourcePageNumber: number | null;
    attemptCount: number;
    lastErrorCode: string | null;
    lastErrorMessage: string | null;
    variants: MediaVariantView[];
    ocrExtractions: OcrExtractionMetadataView[];
  };
}

export interface ContentOperationsDocumentDetail {
  document: Omit<
    ContentOperationsDocument,
    "assetCount" | "mediaCount" | "readyMediaCount" | "failedMediaCount" | "pendingOcrCount"
  >;
  assets: SourceAssetOperationsView[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface OcrExtractionDetailView extends OcrExtractionMetadataView {
  rawText: string | null;
  normalizedText: string | null;
  reviewedAt: Date | null;
  reviewedByProfileId: string | null;
  reviewedByDisplayName: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  source: {
    documentId: string | null;
    documentTitle: string | null;
    sourceAssetId: string | null;
    filename: string | null;
    sourcePosition: number;
    sourcePageNumber: number | null;
    mediaAssetId: string;
  };
}

interface DocumentRow {
  id: string;
  source_path: string;
  class_slug: string;
  class_name: string;
  subject_slug: string;
  subject_name: string;
  kind: ContentSourceDocumentKind;
  title: string;
  hijri_year: number | null;
  exam_track: string | null;
  position: number;
  updated_at: Date;
}

interface DocumentListRow extends DocumentRow {
  asset_count: string;
  media_count: string;
  ready_media_count: string;
  failed_media_count: string;
  pending_ocr_count: string;
}

interface SummaryRow {
  document_count: string;
  asset_count: string;
  media_count: string;
  ready_media_count: string;
  failed_media_count: string;
  pending_ocr_count: string;
}

interface FacetRow {
  slug: string;
  name: string;
}

interface AssetRow {
  id: string;
  source_path: string;
  filename: string;
  position: number;
  mime_type: string;
  byte_size: string;
  checksum_sha256: string | null;
  naming_family: string;
  source_number: number;
  title_hint: string | null;
  media_id: string | null;
  media_status: MediaAssetStatus | null;
  source_page_number: number | null;
  media_attempt_count: number | null;
  last_error_code: string | null;
  last_error_message: string | null;
}

interface VariantRow {
  id: string;
  media_asset_id: string;
  kind: MediaVariantView["kind"];
  profile_version: string;
  mime_type: string;
  byte_size: string;
  width: number | null;
  height: number | null;
  checksum_sha256: string;
}

interface OcrMetadataRow {
  id: string;
  media_asset_id: string;
  input_media_variant_id: string;
  provider_key: string;
  provider_version: string;
  profile_key: string;
  status: OcrExtractionStatus;
  attempt_count: number;
  max_attempts: number;
  mean_confidence: string | null;
  review_status: OcrReviewStatus;
  review_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

interface OcrDetailRow extends OcrMetadataRow {
  raw_text: string | null;
  normalized_text: string | null;
  reviewed_at: Date | null;
  reviewed_by_profile_id: string | null;
  reviewed_by_display_name: string | null;
  last_error_code: string | null;
  last_error_message: string | null;
  document_id: string | null;
  document_title: string | null;
  source_asset_id: string | null;
  filename: string | null;
  source_position: number;
  source_page_number: number | null;
  media_asset_id: string;
}

function mapDocument(row: DocumentRow) {
  return {
    id: row.id,
    sourcePath: row.source_path,
    classSlug: row.class_slug,
    className: row.class_name,
    subjectSlug: row.subject_slug,
    subjectName: row.subject_name,
    kind: row.kind,
    title: row.title,
    hijriYear: row.hijri_year,
    examTrack: row.exam_track,
    position: row.position,
    updatedAt: row.updated_at,
  };
}

function mapOcrMetadata(row: OcrMetadataRow): OcrExtractionMetadataView {
  return {
    id: row.id,
    inputMediaVariantId: row.input_media_variant_id,
    providerKey: row.provider_key,
    providerVersion: row.provider_version,
    profileKey: row.profile_key,
    status: row.status,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    meanConfidence: row.mean_confidence === null ? null : Number(row.mean_confidence),
    reviewStatus: row.review_status,
    reviewReason: row.review_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function filterParams(filters: ContentOperationsFilters): readonly unknown[] {
  return [
    filters.classSlug ?? null,
    filters.subjectSlug ?? null,
    filters.kind ?? null,
    filters.query?.trim() || null,
  ];
}

const FILTER_SQL = `
  d.is_present
  and ($1::text is null or d.class_slug = $1)
  and ($2::text is null or d.subject_slug = $2)
  and ($3::content_source_document_kind is null or d.kind = $3)
  and (
    $4::text is null
    or d.title ilike '%' || $4 || '%'
    or d.source_path ilike '%' || $4 || '%'
    or d.class_name ilike '%' || $4 || '%'
    or d.subject_name ilike '%' || $4 || '%'
  )`;

export class AdminContentOperationsService {
  constructor(private readonly database: Database) {}

  async overview(filters: ContentOperationsFilters): Promise<ContentOperationsOverview> {
    const params = filterParams(filters);
    const rows = await this.database.query<DocumentListRow>(
      `select d.id, d.source_path, d.class_slug, d.class_name, d.subject_slug, d.subject_name,
              d.kind, d.title, d.hijri_year, d.exam_track, d.position, d.updated_at,
              (select count(*) from content_source_assets a where a.document_id = d.id and a.is_present) as asset_count,
              (select count(*) from content_source_assets a join media_assets m on m.content_source_asset_id = a.id
                where a.document_id = d.id and a.is_present) as media_count,
              (select count(*) from content_source_assets a join media_assets m on m.content_source_asset_id = a.id
                where a.document_id = d.id and a.is_present and m.status = 'ready') as ready_media_count,
              (select count(*) from content_source_assets a join media_assets m on m.content_source_asset_id = a.id
                where a.document_id = d.id and a.is_present and m.status = 'failed') as failed_media_count,
              (select count(distinct e.id)
                 from content_source_assets a
                 join media_assets m on m.content_source_asset_id = a.id
                 join media_variants v on v.media_asset_id = m.id
                 join ocr_extractions e on e.input_media_variant_id = v.id
                where a.document_id = d.id and a.is_present
                  and e.status = 'completed' and e.review_status = 'pending') as pending_ocr_count
       from content_source_documents d
       where ${FILTER_SQL}
       order by d.class_name, d.subject_name, d.position, d.id
       limit $5 offset $6`,
      [...params, filters.limit, filters.offset],
    );

    const totals = await this.database.query<SummaryRow>(
      `with filtered_documents as (
         select d.id from content_source_documents d where ${FILTER_SQL}
       ), filtered_assets as (
         select a.id
         from content_source_assets a
         join filtered_documents d on d.id = a.document_id
         where a.is_present
       ), filtered_media as (
         select m.id, m.status
         from media_assets m
         join filtered_assets a on a.id = m.content_source_asset_id
       )
       select
         (select count(*) from filtered_documents) as document_count,
         (select count(*) from filtered_assets) as asset_count,
         (select count(*) from filtered_media) as media_count,
         (select count(*) from filtered_media where status = 'ready') as ready_media_count,
         (select count(*) from filtered_media where status = 'failed') as failed_media_count,
         (select count(distinct e.id)
            from ocr_extractions e
            join media_variants v on v.id = e.input_media_variant_id
            join filtered_media m on m.id = v.media_asset_id
           where e.status = 'completed' and e.review_status = 'pending') as pending_ocr_count`,
      params,
    );
    const total = totals[0];
    if (!total) throw new AppError("INTERNAL_ERROR", "تعذر قراءة ملخص المحتوى", 500);

    const [classes, subjects] = await Promise.all([
      this.database.query<FacetRow>(
        `select class_slug as slug, min(class_name) as name
         from content_source_documents where is_present
         group by class_slug order by min(class_name), class_slug`,
      ),
      this.database.query<FacetRow>(
        `select subject_slug as slug, min(subject_name) as name
         from content_source_documents where is_present
         group by subject_slug order by min(subject_name), subject_slug`,
      ),
    ]);

    return {
      summary: {
        documentCount: Number(total.document_count),
        assetCount: Number(total.asset_count),
        mediaCount: Number(total.media_count),
        readyMediaCount: Number(total.ready_media_count),
        failedMediaCount: Number(total.failed_media_count),
        pendingOcrCount: Number(total.pending_ocr_count),
      },
      facets: { classes, subjects },
      documents: rows.map((row) => ({
        ...mapDocument(row),
        assetCount: Number(row.asset_count),
        mediaCount: Number(row.media_count),
        readyMediaCount: Number(row.ready_media_count),
        failedMediaCount: Number(row.failed_media_count),
        pendingOcrCount: Number(row.pending_ocr_count),
      })),
      pagination: {
        total: Number(total.document_count),
        limit: filters.limit,
        offset: filters.offset,
      },
    };
  }

  async documentDetail(
    documentId: string,
    limit: number,
    offset: number,
  ): Promise<ContentOperationsDocumentDetail> {
    const documents = await this.database.query<DocumentRow>(
      `select id, source_path, class_slug, class_name, subject_slug, subject_name,
              kind, title, hijri_year, exam_track, position, updated_at
       from content_source_documents
       where id = $1 and is_present`,
      [documentId],
    );
    const document = documents[0];
    if (!document) throw new AppError("NOT_FOUND", "مستند المصدر غير موجود", 404);

    const countRows = await this.database.query<{ count: string }>(
      "select count(*) from content_source_assets where document_id = $1 and is_present",
      [documentId],
    );
    const assets = await this.database.query<AssetRow>(
      `select a.id, a.source_path, a.filename, a.position, a.mime_type, a.byte_size,
              a.checksum_sha256, a.naming_family, a.source_number, a.title_hint,
              m.id as media_id, m.status as media_status, m.source_page_number,
              m.attempt_count as media_attempt_count, m.last_error_code, m.last_error_message
       from content_source_assets a
       left join media_assets m on m.content_source_asset_id = a.id
       where a.document_id = $1 and a.is_present
       order by a.position, a.id
       limit $2 offset $3`,
      [documentId, limit, offset],
    );

    const mediaIds = assets.flatMap((asset) => (asset.media_id ? [asset.media_id] : []));
    const variants =
      mediaIds.length === 0
        ? []
        : await this.database.query<VariantRow>(
            `select id, media_asset_id, kind, profile_version, mime_type, byte_size,
                    width, height, checksum_sha256
             from media_variants
             where media_asset_id = any($1::uuid[])
             order by media_asset_id,
                      array_position(array['source','display','thumbnail','ai']::media_variant_kind[], kind),
                      profile_version`,
            [mediaIds],
          );
    const extractions =
      mediaIds.length === 0
        ? []
        : await this.database.query<OcrMetadataRow>(
            `select e.id, v.media_asset_id, e.input_media_variant_id,
                    e.provider_key, e.provider_version, e.profile_key, e.status,
                    e.attempt_count, e.max_attempts, e.mean_confidence,
                    e.review_status, e.review_reason, e.created_at, e.updated_at
             from ocr_extractions e
             join media_variants v on v.id = e.input_media_variant_id
             where v.media_asset_id = any($1::uuid[])
             order by v.media_asset_id, e.created_at desc, e.id`,
            [mediaIds],
          );

    const variantsByMedia = new Map<string, MediaVariantView[]>();
    for (const row of variants) {
      const bucket = variantsByMedia.get(row.media_asset_id) ?? [];
      bucket.push({
        id: row.id,
        kind: row.kind,
        profileVersion: row.profile_version,
        mimeType: row.mime_type,
        byteSize: Number(row.byte_size),
        width: row.width,
        height: row.height,
        checksumSha256: row.checksum_sha256,
      });
      variantsByMedia.set(row.media_asset_id, bucket);
    }

    const ocrByMedia = new Map<string, OcrExtractionMetadataView[]>();
    for (const row of extractions) {
      const bucket = ocrByMedia.get(row.media_asset_id) ?? [];
      bucket.push(mapOcrMetadata(row));
      ocrByMedia.set(row.media_asset_id, bucket);
    }

    return {
      document: mapDocument(document),
      assets: assets.map((asset) => ({
        id: asset.id,
        sourcePath: asset.source_path,
        filename: asset.filename,
        position: asset.position,
        mimeType: asset.mime_type,
        byteSize: Number(asset.byte_size),
        checksumSha256: asset.checksum_sha256,
        namingFamily: asset.naming_family,
        sourceNumber: asset.source_number,
        titleHint: asset.title_hint,
        media:
          asset.media_id && asset.media_status
            ? {
                id: asset.media_id,
                status: asset.media_status,
                sourcePageNumber: asset.source_page_number,
                attemptCount: asset.media_attempt_count ?? 0,
                lastErrorCode: asset.last_error_code,
                lastErrorMessage: asset.last_error_message,
                variants: variantsByMedia.get(asset.media_id) ?? [],
                ocrExtractions: ocrByMedia.get(asset.media_id) ?? [],
              }
            : null,
      })),
      pagination: {
        total: Number(countRows[0]?.count ?? 0),
        limit,
        offset,
      },
    };
  }

  async ocrExtraction(extractionId: string): Promise<OcrExtractionDetailView> {
    const rows = await this.database.query<OcrDetailRow>(
      `select e.id, v.media_asset_id, e.input_media_variant_id,
              e.provider_key, e.provider_version, e.profile_key, e.status,
              e.attempt_count, e.max_attempts, e.mean_confidence,
              e.review_status, e.review_reason, e.created_at, e.updated_at,
              e.raw_text, e.normalized_text, e.reviewed_at, e.reviewed_by_profile_id,
              p.display_name as reviewed_by_display_name,
              e.last_error_code, e.last_error_message,
              d.id as document_id, d.title as document_title,
              a.id as source_asset_id, a.filename,
              m.source_position, m.source_page_number
       from ocr_extractions e
       join media_variants v on v.id = e.input_media_variant_id
       join media_assets m on m.id = v.media_asset_id
       left join content_source_assets a on a.id = m.content_source_asset_id
       left join content_source_documents d on d.id = a.document_id
       left join profiles p on p.id = e.reviewed_by_profile_id
       where e.id = $1`,
      [extractionId],
    );
    const row = rows[0];
    if (!row) throw new AppError("NOT_FOUND", "استخراج OCR غير موجود", 404);
    return {
      ...mapOcrMetadata(row),
      rawText: row.raw_text,
      normalizedText: row.normalized_text,
      reviewedAt: row.reviewed_at,
      reviewedByProfileId: row.reviewed_by_profile_id,
      reviewedByDisplayName: row.reviewed_by_display_name,
      lastErrorCode: row.last_error_code,
      lastErrorMessage: row.last_error_message,
      source: {
        documentId: row.document_id,
        documentTitle: row.document_title,
        sourceAssetId: row.source_asset_id,
        filename: row.filename,
        sourcePosition: row.source_position,
        sourcePageNumber: row.source_page_number,
        mediaAssetId: row.media_asset_id,
      },
    };
  }

  async reviewOcr(
    actorProfileId: string,
    extractionId: string,
    decision: "approved" | "rejected",
    replacementText?: string,
  ): Promise<OcrExtractionDetailView> {
    const current = await this.ocrExtraction(extractionId);
    if (current.status !== "completed" || current.reviewStatus !== "pending") {
      throw new AppError("CONFLICT", "استخراج OCR ليس بانتظار المراجعة", 409);
    }
    if (decision === "rejected" && replacementText !== undefined) {
      throw new AppError("BAD_REQUEST", "تصحيح النص متاح عند الاعتماد فقط", 400);
    }

    const replacementNormalizedText =
      replacementText === undefined ? undefined : normalizeOcrText(replacementText);
    if (replacementNormalizedText !== undefined && !replacementNormalizedText) {
      throw new AppError("BAD_REQUEST", "النص المصحح لا يمكن أن يكون فارغًا", 400);
    }
    if (decision === "approved") {
      const approvedText =
        replacementNormalizedText ?? normalizeOcrText(current.normalizedText ?? current.rawText ?? "");
      if (!approvedText) {
        throw new AppError("BAD_REQUEST", "صحح النص الفارغ قبل اعتماده", 400);
      }
    }

    try {
      await this.database.transaction((tx) =>
        reviewOcrExtraction(tx, {
          extractionId,
          actorProfileId,
          decision,
          ...(replacementNormalizedText === undefined ? {} : { replacementNormalizedText }),
        }),
      );
    } catch (error) {
      if (error instanceof Error && error.message === "ocr_review_conflict") {
        throw new AppError("CONFLICT", "تغيرت حالة مراجعة OCR. حدّث البيانات ثم حاول مرة أخرى", 409);
      }
      throw error;
    }
    return this.ocrExtraction(extractionId);
  }
}
