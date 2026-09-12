import { createHash } from "node:crypto";
import type { Database, QueryExecutor } from "../db.js";
import type { ProcessedMediaAsset } from "../media/media-types.js";
import { MediaPipelineService } from "../media/service.js";
import type { MediaStorage } from "../media/storage.js";
import type { LegacyImageBytes, LegacySupabaseClient } from "./legacy-supabase-client.js";
import {
  buildLogicalLessonPlan,
  canonicalDigest,
  type LegacyPage,
  type LogicalLesson,
  normalizeLegacyQuestion,
  questionFingerprint,
  stableUuid,
  type TargetQuestion,
} from "./legacy-supabase-model.js";

const SOURCE_TABLE = "public.lessons";
const SOURCE_BUCKET = "lesson_content";

export interface LegacySubjectMapping {
  legacySubjectId: string;
  targetClassSlug: string;
  targetSubjectSlug: string;
  documentOrder: number;
}

export interface LegacyImageAudit {
  legacyPageId: string;
  lessonSourceKey: string;
  pageNumber: number;
  sourceUrl: string;
  bucket: string;
  objectPath: string;
  filename: string;
  mimeType: string;
  byteSize: number;
  checksumSha256: string;
}

export interface LegacyQuestionIssue {
  legacyPageId: string;
  questionOrdinal: number;
  reason: string;
}

export interface LegacySubjectDryRun {
  sourceRepository: string;
  sourceRevision: string;
  manifestSha256: string;
  legacyClass: { id: string; name: string };
  legacySubject: { id: string; name: string };
  target: {
    classSlug: string;
    subjectSlug: string;
    documentOrder: number;
  };
  documentKind: "textbook" | "government_exam";
  sourcePages: number;
  logicalLessons: number;
  sourceImageRecords: number;
  uniqueExactImageFiles: number;
  exactDuplicateImageGroups: number;
  exactDuplicateImageRecords: number;
  sameLessonDuplicateImageGroups: number;
  sourceQuestions: number;
  importableQuestions: number;
  exactDuplicateQuestionRecords: number;
  unresolvedQuestions: LegacyQuestionIssue[];
  unresolvedPages: Array<{ legacyPageId: string; reason: string }>;
  duplicatePageNumbers: number[];
  blockingReasons: string[];
  lessons: Array<{
    sourceKey: string;
    slug: string;
    title: string;
    position: number;
    firstPageNumber: number;
    lastPageNumber: number;
    pageCount: number;
    questionCount: number;
  }>;
  images: LegacyImageAudit[];
}

interface IdRow {
  id: string;
}

interface OfferingRow {
  class_id: string;
  subject_id: string;
}

interface SourceAssetRow extends IdRow {
  checksum_sha256: string | null;
  byte_size: string;
  mime_type: string;
  position: number;
  source_number: number;
}

interface ExistingMediaRow extends IdRow {
  source_checksum_sha256: string;
  source_byte_size: string;
  source_mime_type: string;
  status: "processing" | "ready" | "failed";
}

interface VariantRow {
  kind: "source" | "display" | "thumbnail" | "ai";
  profile_version: string;
  storage_key: string;
  mime_type: string;
  byte_size: string;
  width: number | null;
  height: number | null;
  checksum_sha256: string;
}

interface LessonRow extends IdRow {
  title: string;
  position: number;
  published_at: Date | null;
  class_id: string;
  subject_id: string;
}

interface QuestionSourceRef {
  legacyPageId: string;
  questionOrdinal: number;
  pageNumber: number;
}

interface NormalizedQuestionGroup {
  fingerprint: string;
  logicalLesson: LogicalLesson;
  question: TargetQuestion;
  sourceType: string;
  inferredType: boolean;
  sources: QuestionSourceRef[];
}

interface ImportedPageContext {
  sourceAssetId: string;
  mediaAssetId: string;
  sourceChecksumSha256: string;
}

export interface LegacySubjectImportResult {
  runId: string;
  sourceRepository: string;
  sourceRevision: string;
  legacySubjectId: string;
  targetClassSlug: string;
  targetSubjectSlug: string;
  lessons: number;
  sourceAssets: number;
  lessonAssets: number;
  uniqueMediaAssetsUsed: number;
  newMediaAssets: number;
  reusedExactMediaAssets: number;
  questionsImported: number;
  questionsSkippedUnresolved: number;
  questionDuplicatesCollapsed: number;
  allLessonAssetsDraft: boolean;
  allQuestionRevisionsDraft: boolean;
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function mapWithConcurrency<T, R>(
  input: readonly T[],
  concurrency: number,
  work: (value: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error("invalid_concurrency");
  const output = new Array<R>(input.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, input.length) }, async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= input.length) return;
      const value = input[index];
      if (value === undefined) throw new Error("legacy_source_concurrency_value_missing");
      output[index] = await work(value, index);
    }
  });
  await Promise.all(workers);
  return output;
}

function lessonForPage(lessons: readonly LogicalLesson[]): Map<string, LogicalLesson> {
  const output = new Map<string, LogicalLesson>();
  for (const lesson of lessons) {
    for (const page of lesson.pages) output.set(page.id, lesson);
  }
  return output;
}

function questionGroups(lessons: readonly LogicalLesson[]): {
  groups: NormalizedQuestionGroup[];
  sourceQuestions: number;
  duplicateRows: number;
  unresolved: LegacyQuestionIssue[];
} {
  const byFingerprint = new Map<string, NormalizedQuestionGroup>();
  const unresolved: LegacyQuestionIssue[] = [];
  let sourceQuestions = 0;
  let duplicateRows = 0;

  for (const lesson of lessons) {
    for (const page of lesson.pages) {
      for (let ordinal = 0; ordinal < page.ai_questions.length; ordinal += 1) {
        sourceQuestions += 1;
        const raw = page.ai_questions[ordinal];
        const normalized = normalizeLegacyQuestion(raw);
        if (normalized.state !== "ready") {
          unresolved.push({ legacyPageId: page.id, questionOrdinal: ordinal, reason: normalized.reason });
          continue;
        }
        const fingerprint = questionFingerprint(lesson.sourceKey, normalized.question);
        const source: QuestionSourceRef = {
          legacyPageId: page.id,
          questionOrdinal: ordinal,
          pageNumber: page.page_number ?? 0,
        };
        const existing = byFingerprint.get(fingerprint);
        if (existing) {
          duplicateRows += 1;
          existing.sources.push(source);
          continue;
        }
        byFingerprint.set(fingerprint, {
          fingerprint,
          logicalLesson: lesson,
          question: normalized.question,
          sourceType: normalized.sourceType,
          inferredType: normalized.inferredType,
          sources: [source],
        });
      }
    }
  }
  return { groups: [...byFingerprint.values()], sourceQuestions, duplicateRows, unresolved };
}

function documentKind(pages: readonly LegacyPage[]): "textbook" | "government_exam" {
  const values = new Set(pages.map((page) => page.content_type));
  if (values.size !== 1) throw new Error("legacy_subject_mixed_content_types");
  return values.has("exam_model") ? "government_exam" : "textbook";
}

function duplicatePageNumbers(pages: readonly LegacyPage[]): number[] {
  const counts = new Map<number, number>();
  for (const page of pages) {
    if (page.page_number === null) continue;
    counts.set(page.page_number, (counts.get(page.page_number) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([pageNumber]) => pageNumber)
    .sort((a, b) => a - b);
}

export async function dryRunLegacySubject(
  client: LegacySupabaseClient,
  mapping: LegacySubjectMapping,
): Promise<LegacySubjectDryRun> {
  const source = await client.subject(mapping.legacySubjectId);
  const pages = await client.subjectPages(mapping.legacySubjectId);
  if (pages.length === 0) throw new Error("legacy_subject_has_no_pages");
  const plan = buildLogicalLessonPlan(mapping.legacySubjectId, pages);
  const byPage = lessonForPage(plan.lessons);
  const duplicatePages = duplicatePageNumbers(pages);
  const sourceManifest = {
    projectRef: client.projectRef,
    legacyClass: source.class,
    legacySubject: source.subject,
    target: mapping,
    pages,
  };
  const manifestSha256 = canonicalDigest(sourceManifest);
  const sourceRepository = `supabase://${client.projectRef}`;
  const sourceRevision = `snapshot:${manifestSha256}`;

  const eligiblePages = plan.lessons.flatMap((lesson) => lesson.pages);
  const images = await mapWithConcurrency(eligiblePages, 4, async (page) => {
    const url = page.image_urls[0];
    const lesson = byPage.get(page.id);
    if (!url || !lesson || page.page_number === null)
      throw new Error(`legacy_page_not_importable:${page.id}`);
    const image = await client.imageBytes(url);
    return {
      legacyPageId: page.id,
      lessonSourceKey: lesson.sourceKey,
      pageNumber: page.page_number,
      sourceUrl: image.sourceUrl,
      bucket: image.bucket,
      objectPath: image.objectPath,
      filename: image.filename,
      mimeType: image.mimeType,
      byteSize: image.byteSize,
      checksumSha256: image.checksumSha256,
    } satisfies LegacyImageAudit;
  });

  const byChecksum = new Map<string, LegacyImageAudit[]>();
  for (const image of images) {
    const group = byChecksum.get(image.checksumSha256) ?? [];
    group.push(image);
    byChecksum.set(image.checksumSha256, group);
  }
  const exactDuplicateGroups = [...byChecksum.values()].filter((group) => group.length > 1);
  const sameLessonDuplicateGroups = exactDuplicateGroups.filter((group) => {
    const lessonKeys = new Set(group.map((image) => image.lessonSourceKey));
    return lessonKeys.size < group.length;
  });

  const questions = questionGroups(plan.lessons);
  const questionCountByLesson = new Map<string, number>();
  for (const group of questions.groups) {
    questionCountByLesson.set(
      group.logicalLesson.sourceKey,
      (questionCountByLesson.get(group.logicalLesson.sourceKey) ?? 0) + 1,
    );
  }

  const blockingReasons: string[] = [];
  if (plan.unresolvedPages.length > 0) blockingReasons.push("unresolved_source_pages");
  if (duplicatePages.length > 0) blockingReasons.push("duplicate_page_numbers");
  if (sameLessonDuplicateGroups.length > 0) blockingReasons.push("same_lesson_exact_duplicate_media");

  return {
    sourceRepository,
    sourceRevision,
    manifestSha256,
    legacyClass: { id: source.class.id, name: source.class.name },
    legacySubject: { id: source.subject.id, name: source.subject.name },
    target: {
      classSlug: mapping.targetClassSlug,
      subjectSlug: mapping.targetSubjectSlug,
      documentOrder: mapping.documentOrder,
    },
    documentKind: documentKind(pages),
    sourcePages: pages.length,
    logicalLessons: plan.lessons.length,
    sourceImageRecords: images.length,
    uniqueExactImageFiles: byChecksum.size,
    exactDuplicateImageGroups: exactDuplicateGroups.length,
    exactDuplicateImageRecords: exactDuplicateGroups.reduce((sum, group) => sum + group.length - 1, 0),
    sameLessonDuplicateImageGroups: sameLessonDuplicateGroups.length,
    sourceQuestions: questions.sourceQuestions,
    importableQuestions: questions.groups.length,
    exactDuplicateQuestionRecords: questions.duplicateRows,
    unresolvedQuestions: questions.unresolved,
    unresolvedPages: plan.unresolvedPages,
    duplicatePageNumbers: duplicatePages,
    blockingReasons,
    lessons: plan.lessons.map((lesson) => ({
      sourceKey: lesson.sourceKey,
      slug: lesson.slug,
      title: lesson.title,
      position: mapping.documentOrder * 10_000 + lesson.position,
      firstPageNumber: lesson.firstPageNumber,
      lastPageNumber: lesson.lastPageNumber,
      pageCount: lesson.pages.length,
      questionCount: questionCountByLesson.get(lesson.sourceKey) ?? 0,
    })),
    images,
  };
}

async function offering(database: Database, mapping: LegacySubjectMapping): Promise<OfferingRow> {
  const rows = await database.query<OfferingRow>(
    `select c.id as class_id, s.id as subject_id
       from classes c
       join subjects s on s.slug = $2
       join subject_class_links l on l.class_id = c.id and l.subject_id = s.id
      where c.slug = $1 and c.status = 'active' and s.status = 'active' and l.status = 'active'`,
    [mapping.targetClassSlug, mapping.targetSubjectSlug],
  );
  const row = rows[0];
  if (!row || rows.length !== 1) throw new Error("legacy_target_offering_missing_or_ambiguous");
  return row;
}

async function importActor(database: Database): Promise<string> {
  const rows = await database.query<IdRow>(
    "select id from profiles where role = 'admin' and status = 'active' order by created_at,id limit 2",
  );
  const row = rows[0];
  if (!row) throw new Error("legacy_import_active_admin_missing");
  return row.id;
}

async function ensureRun(tx: QueryExecutor, dryRun: LegacySubjectDryRun): Promise<string> {
  const rows = await tx.query<IdRow>(
    `insert into content_import_runs (
       source_repository, source_revision, manifest_sha256,
       subject_root_count, document_count, asset_count, helper_file_count, report
     ) values ($1,$2,$3,1,1,$4,0,$5::jsonb)
     on conflict (source_repository, source_revision, manifest_sha256) do update set report = excluded.report
     returning id`,
    [
      dryRun.sourceRepository,
      dryRun.sourceRevision,
      dryRun.manifestSha256,
      dryRun.sourceImageRecords,
      JSON.stringify({
        mode: "legacy_supabase_logical_import",
        legacyClass: dryRun.legacyClass,
        legacySubject: dryRun.legacySubject,
        target: dryRun.target,
        dryRun: {
          sourcePages: dryRun.sourcePages,
          logicalLessons: dryRun.logicalLessons,
          uniqueExactImageFiles: dryRun.uniqueExactImageFiles,
          exactDuplicateImageRecords: dryRun.exactDuplicateImageRecords,
          sourceQuestions: dryRun.sourceQuestions,
          importableQuestions: dryRun.importableQuestions,
          unresolvedQuestions: dryRun.unresolvedQuestions.length,
        },
      }),
    ],
  );
  const id = rows[0]?.id;
  if (!id) throw new Error("legacy_import_run_upsert_failed");
  return id;
}

async function ensureDocument(
  tx: QueryExecutor,
  runId: string,
  dryRun: LegacySubjectDryRun,
): Promise<string> {
  const sourcePath = `public.subjects/${dryRun.legacySubject.id}`;
  const rows = await tx.query<IdRow>(
    `insert into content_source_documents (
       source_repository, source_path, class_slug, class_name, subject_slug, subject_name,
       kind, title, hijri_year, exam_track, position, is_present,
       first_seen_import_run_id, last_seen_import_run_id, source_metadata
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,null,null,$9,true,$10,$10,$11::jsonb)
     on conflict (source_repository, source_path) do update set
       class_slug = excluded.class_slug,
       class_name = excluded.class_name,
       subject_slug = excluded.subject_slug,
       subject_name = excluded.subject_name,
       kind = excluded.kind,
       title = excluded.title,
       position = excluded.position,
       is_present = true,
       last_seen_import_run_id = excluded.last_seen_import_run_id,
       source_metadata = excluded.source_metadata
     returning id`,
    [
      dryRun.sourceRepository,
      sourcePath,
      dryRun.target.classSlug,
      dryRun.target.classSlug,
      dryRun.target.subjectSlug,
      dryRun.target.subjectSlug,
      dryRun.documentKind,
      dryRun.legacySubject.name,
      dryRun.target.documentOrder,
      runId,
      JSON.stringify({
        sourceKind: "legacy_supabase",
        projectRef: dryRun.sourceRepository.replace("supabase://", ""),
        legacyClass: dryRun.legacyClass,
        legacySubject: dryRun.legacySubject,
        manifestSha256: dryRun.manifestSha256,
        mappingConfidence: "explicit_product_owner_mapping",
      }),
    ],
  );
  const id = rows[0]?.id;
  if (!id) throw new Error("legacy_source_document_upsert_failed");
  return id;
}

async function ensureSourceAsset(
  tx: QueryExecutor,
  input: {
    runId: string;
    documentId: string;
    position: number;
    page: LegacyPage;
    image: LegacyImageBytes;
    projectRef: string;
  },
): Promise<string> {
  if (input.page.page_number === null) throw new Error("legacy_source_asset_page_missing");
  const sourcePath = `${SOURCE_TABLE}/${input.page.id}/image/0`;
  const existing = await tx.query<SourceAssetRow>(
    `select id, checksum_sha256, byte_size, mime_type, position, source_number
       from content_source_assets where document_id = $1 and source_path = $2`,
    [input.documentId, sourcePath],
  );
  const current = existing[0];
  if (current) {
    if (
      current.checksum_sha256 !== input.image.checksumSha256 ||
      Number(current.byte_size) !== input.image.byteSize ||
      current.mime_type !== input.image.mimeType ||
      current.position !== input.position ||
      current.source_number !== input.page.page_number
    ) {
      throw new Error(`legacy_source_asset_idempotency_conflict:${input.page.id}`);
    }
    await tx.query(
      `update content_source_assets set last_seen_import_run_id = $2, is_present = true,
              source_metadata = $3::jsonb
        where id = $1`,
      [
        current.id,
        input.runId,
        JSON.stringify({
          sourceKind: "legacy_supabase",
          projectRef: input.projectRef,
          legacyTable: SOURCE_TABLE,
          legacyRecordId: input.page.id,
          legacySubjectId: input.page.subject_id,
          storageBucket: input.image.bucket,
          storageObjectPath: input.image.objectPath,
          sourceUrl: input.image.sourceUrl,
          contentType: input.page.content_type,
          pageNumber: input.page.page_number,
          sourceChecksumSha256: input.image.checksumSha256,
        }),
      ],
    );
    return current.id;
  }

  const rows = await tx.query<IdRow>(
    `insert into content_source_assets (
       document_id, source_path, filename, position, mime_type, byte_size,
       source_git_blob_sha1, checksum_sha256, naming_family, source_number, title_hint,
       is_present, first_seen_import_run_id, last_seen_import_run_id, source_metadata
     ) values ($1,$2,$3,$4,$5,$6,null,$7,'legacy_supabase_storage',$8,$9,true,$10,$10,$11::jsonb)
     returning id`,
    [
      input.documentId,
      sourcePath,
      input.image.filename,
      input.position,
      input.image.mimeType,
      input.image.byteSize,
      input.image.checksumSha256,
      input.page.page_number,
      input.page.title,
      input.runId,
      JSON.stringify({
        sourceKind: "legacy_supabase",
        projectRef: input.projectRef,
        legacyTable: SOURCE_TABLE,
        legacyRecordId: input.page.id,
        legacySubjectId: input.page.subject_id,
        storageBucket: input.image.bucket,
        storageObjectPath: input.image.objectPath,
        sourceUrl: input.image.sourceUrl,
        contentType: input.page.content_type,
        pageNumber: input.page.page_number,
        sourceChecksumSha256: input.image.checksumSha256,
      }),
    ],
  );
  const id = rows[0]?.id;
  if (!id) throw new Error("legacy_source_asset_insert_failed");
  return id;
}

async function ensureLesson(
  tx: QueryExecutor,
  offeringRow: OfferingRow,
  lesson: LogicalLesson,
  absolutePosition: number,
): Promise<string> {
  await tx.query(
    `insert into lessons (
       class_id, subject_id, section_id, slug, title, summary, position, status, content_revision, published_at
     ) values ($1,$2,null,$3,$4,null,$5,'active',1,null)
     on conflict (class_id, subject_id, slug) do nothing`,
    [offeringRow.class_id, offeringRow.subject_id, lesson.slug, lesson.title, absolutePosition],
  );
  const rows = await tx.query<LessonRow>(
    `select id,title,position,published_at,class_id,subject_id
       from lessons where class_id = $1 and subject_id = $2 and slug = $3`,
    [offeringRow.class_id, offeringRow.subject_id, lesson.slug],
  );
  const row = rows[0];
  if (!row || rows.length !== 1) throw new Error(`legacy_target_lesson_missing:${lesson.slug}`);
  if (
    row.title !== lesson.title ||
    row.position !== absolutePosition ||
    row.class_id !== offeringRow.class_id ||
    row.subject_id !== offeringRow.subject_id
  ) {
    throw new Error(`legacy_target_lesson_idempotency_conflict:${lesson.slug}`);
  }
  if (row.published_at !== null) throw new Error(`legacy_import_refuses_published_lesson:${lesson.slug}`);
  return row.id;
}

async function readyMediaByChecksum(
  database: Database,
  checksum: string,
  byteSize: number,
): Promise<ExistingMediaRow | null> {
  const rows = await database.query<ExistingMediaRow>(
    `select id,source_checksum_sha256,source_byte_size,source_mime_type,status
       from media_assets
      where source_checksum_sha256 = $1 and source_byte_size = $2 and status = 'ready'
      order by created_at,id limit 2`,
    [checksum, byteSize],
  );
  return rows[0] ?? null;
}

async function verifiedVariants(
  database: Database,
  storage: MediaStorage,
  mediaAssetId: string,
): Promise<VariantRow[]> {
  const rows = await database.query<VariantRow>(
    `select kind,profile_version,storage_key,mime_type,byte_size,width,height,checksum_sha256
       from media_variants where media_asset_id = $1
      order by array_position(array['source','display','thumbnail','ai']::media_variant_kind[], kind)`,
    [mediaAssetId],
  );
  if (rows.length !== 4) throw new Error(`legacy_media_variant_count_invalid:${mediaAssetId}:${rows.length}`);
  const expected = ["source", "display", "thumbnail", "ai"] as const;
  for (let index = 0; index < rows.length; index += 1) {
    const variant = rows[index];
    if (!variant || variant.kind !== expected[index])
      throw new Error(`legacy_media_variant_order_invalid:${mediaAssetId}`);
    const bytes = await storage.read(variant.storage_key);
    if (bytes.byteLength !== Number(variant.byte_size) || sha256(bytes) !== variant.checksum_sha256) {
      throw new Error(`legacy_media_variant_integrity_failed:${mediaAssetId}:${variant.kind}`);
    }
  }
  return [...rows];
}

function processedVariants(asset: ProcessedMediaAsset): VariantRow[] {
  return asset.variants.map((variant) => ({
    kind: variant.kind,
    profile_version: variant.profileVersion,
    storage_key: `media/${asset.mediaAssetId}/${variant.kind}/${variant.profileVersion}-${variant.checksumSha256}.${variant.extension}`,
    mime_type: variant.mimeType,
    byte_size: String(variant.bytes.byteLength),
    width: variant.width ?? null,
    height: variant.height ?? null,
    checksum_sha256: variant.checksumSha256,
  }));
}

async function ensureLessonAsset(
  database: Database,
  input: {
    lessonId: string;
    lessonPosition: number;
    mediaAssetId: string;
    variants: readonly VariantRow[];
    page: LegacyPage;
    image: LegacyImageBytes;
    sourceAssetId: string;
    runId: string;
    projectRef: string;
    dedupeDecision: "NEW_CANONICAL" | "EXACT_DUPLICATE_REUSE";
  },
): Promise<void> {
  const source = input.variants.find((variant) => variant.kind === "source");
  const display = input.variants.find((variant) => variant.kind === "display");
  const thumbnail = input.variants.find((variant) => variant.kind === "thumbnail");
  const ai = input.variants.find((variant) => variant.kind === "ai");
  if (!source || !display || !thumbnail || !ai) throw new Error("legacy_media_required_variant_missing");
  if (input.page.page_number === null) throw new Error("legacy_lesson_asset_page_missing");

  await database.transaction(async (tx) => {
    const existingByPosition = await tx.query<{ id: string; media_asset_id: string | null }>(
      "select id,media_asset_id from lesson_assets where lesson_id = $1 and position = $2",
      [input.lessonId, input.lessonPosition],
    );
    const existing = existingByPosition[0];
    if (existing) {
      if (existing.media_asset_id !== input.mediaAssetId) {
        throw new Error(`legacy_lesson_asset_position_conflict:${input.lessonId}:${input.lessonPosition}`);
      }
      return;
    }
    const sameMedia = await tx.query<IdRow>(
      "select id from lesson_assets where lesson_id = $1 and media_asset_id = $2",
      [input.lessonId, input.mediaAssetId],
    );
    if (sameMedia[0])
      throw new Error(
        `legacy_same_lesson_duplicate_media_not_supported:${input.lessonId}:${input.mediaAssetId}`,
      );

    await tx.query(
      `insert into lesson_assets (
         lesson_id,kind,position,storage_key,source_storage_key,thumbnail_storage_key,ai_storage_key,
         mime_type,byte_size,width,height,checksum_sha256,source_page_number,source_metadata,
         media_asset_id,publication_status
       ) values ($1,'image',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,'draft')`,
      [
        input.lessonId,
        input.lessonPosition,
        display.storage_key,
        source.storage_key,
        thumbnail.storage_key,
        ai.storage_key,
        display.mime_type,
        Number(display.byte_size),
        display.width,
        display.height,
        display.checksum_sha256,
        input.page.page_number,
        JSON.stringify({
          sourceKind: "legacy_supabase",
          legacyProjectRef: input.projectRef,
          legacyTable: SOURCE_TABLE,
          legacyRecordId: input.page.id,
          legacySubjectId: input.page.subject_id,
          legacyStorageBucket: input.image.bucket,
          legacyStorageObject: input.image.objectPath,
          sourceChecksumSha256: input.image.checksumSha256,
          sourceAssetId: input.sourceAssetId,
          importRunId: input.runId,
          dedupeDecision: input.dedupeDecision,
        }),
        input.mediaAssetId,
      ],
    );
  });
}

async function ensureQuestion(
  database: Database,
  input: {
    actorProfileId: string;
    offering: OfferingRow;
    group: NormalizedQuestionGroup;
    lessonId: string;
    importedPages: Map<string, ImportedPageContext>;
    projectRef: string;
    legacySubjectId: string;
  },
): Promise<void> {
  const itemId = stableUuid(`legacy-supabase:question:item:${input.projectRef}:${input.group.fingerprint}`);
  const revisionId = stableUuid(`legacy-supabase:question:revision:${itemId}:1`);
  const q = input.group.question;
  const note = JSON.stringify({
    sourceKind: "legacy_supabase",
    projectRef: input.projectRef,
    legacySubjectId: input.legacySubjectId,
    fingerprint: input.group.fingerprint,
    sourceType: input.group.sourceType,
    inferredType: input.group.inferredType,
    sourceRefs: input.group.sources.map((source) => ({
      legacyPageId: source.legacyPageId,
      questionOrdinal: source.questionOrdinal,
    })),
  });
  if (note.length > 4000) throw new Error(`legacy_question_provenance_too_large:${itemId}`);

  await database.transaction(async (tx) => {
    await tx.query(
      `insert into question_bank_items (id,class_id,subject_id,origin,created_by_profile_id)
       values ($1,$2,$3,'ai',$4) on conflict (id) do nothing`,
      [itemId, input.offering.class_id, input.offering.subject_id, input.actorProfileId],
    );
    const itemRows = await tx.query<{ class_id: string; subject_id: string; origin: string }>(
      "select class_id,subject_id,origin::text as origin from question_bank_items where id = $1",
      [itemId],
    );
    const item = itemRows[0];
    if (
      !item ||
      item.class_id !== input.offering.class_id ||
      item.subject_id !== input.offering.subject_id ||
      item.origin !== "ai"
    ) {
      throw new Error(`legacy_question_item_idempotency_conflict:${itemId}`);
    }

    await tx.query(
      `insert into question_bank_revisions (
         id,item_id,revision_number,status,type,prompt,options,correct_option_index,answer_text,
         answer_status,difficulty,explanation,method,created_by_profile_id
       ) values ($1,$2,1,'draft',$3,$4,$5::jsonb,$6,$7,$8,$9,$10,null,$11)
       on conflict (item_id,revision_number) do nothing`,
      [
        revisionId,
        itemId,
        q.type,
        q.prompt,
        JSON.stringify(q.options),
        q.correctOptionIndex,
        q.answerText,
        q.answerStatus,
        q.difficulty,
        q.explanation,
        input.actorProfileId,
      ],
    );
    const revisionRows = await tx.query<{
      id: string;
      status: string;
      type: string;
      prompt: string;
      options: unknown;
      correct_option_index: number | null;
      answer_text: string | null;
      answer_status: string;
      difficulty: string;
      explanation: string | null;
    }>(
      `select id,status::text as status,type::text as type,prompt,options,correct_option_index,answer_text,
              answer_status::text as answer_status,difficulty::text as difficulty,explanation
         from question_bank_revisions where item_id = $1 and revision_number = 1`,
      [itemId],
    );
    const revision = revisionRows[0];
    if (
      !revision ||
      revision.id !== revisionId ||
      revision.status !== "draft" ||
      revision.type !== q.type ||
      revision.prompt !== q.prompt ||
      JSON.stringify(revision.options) !== JSON.stringify(q.options) ||
      revision.correct_option_index !== q.correctOptionIndex ||
      revision.answer_text !== q.answerText ||
      revision.answer_status !== q.answerStatus ||
      revision.difficulty !== q.difficulty ||
      revision.explanation !== q.explanation
    ) {
      throw new Error(`legacy_question_revision_idempotency_conflict:${itemId}`);
    }

    await tx.query(
      `insert into question_bank_revision_lessons (revision_id,lesson_id,position)
       values ($1,$2,0) on conflict (revision_id,lesson_id) do nothing`,
      [revisionId, input.lessonId],
    );

    for (let position = 0; position < input.group.sources.length; position += 1) {
      const source = input.group.sources[position];
      if (!source) throw new Error("legacy_question_source_missing");
      const page = input.importedPages.get(source.legacyPageId);
      if (!page) throw new Error(`legacy_question_page_not_imported:${source.legacyPageId}`);
      await tx.query(
        `insert into question_bank_revision_sources (
           revision_id,position,media_asset_id,page_number,input_checksum_sha256,
           ocr_extraction_id,content_source_asset_id,source_quote
         ) values ($1,$2,$3,$4,$5,null,$6,null)
         on conflict (revision_id,position) do nothing`,
        [
          revisionId,
          position,
          page.mediaAssetId,
          source.pageNumber,
          page.sourceChecksumSha256,
          page.sourceAssetId,
        ],
      );
    }

    const eventRows = await tx.query<IdRow>(
      `select id::text as id from question_bank_events
        where item_id = $1 and revision_id = $2 and action = 'import' and note = $3
        limit 1`,
      [itemId, revisionId, note],
    );
    if (!eventRows[0]) {
      await tx.query(
        `insert into question_bank_events (item_id,revision_id,action,actor_profile_id,note)
         values ($1,$2,'import',$3,$4)`,
        [itemId, revisionId, input.actorProfileId, note],
      );
    }
  });
}

export async function importLegacySubject(input: {
  database: Database;
  storage: MediaStorage;
  client: LegacySupabaseClient;
  mapping: LegacySubjectMapping;
  dryRun: LegacySubjectDryRun;
  onProgress?: (event: Record<string, unknown>) => void;
}): Promise<LegacySubjectImportResult> {
  if (input.dryRun.blockingReasons.length > 0) {
    throw new Error(`legacy_import_blocked:${input.dryRun.blockingReasons.join(",")}`);
  }
  if (input.dryRun.legacySubject.id !== input.mapping.legacySubjectId) {
    throw new Error("legacy_import_dry_run_subject_mismatch");
  }

  const source = await input.client.subject(input.mapping.legacySubjectId);
  const pages = await input.client.subjectPages(input.mapping.legacySubjectId);
  const manifestSha256 = canonicalDigest({
    projectRef: input.client.projectRef,
    legacyClass: source.class,
    legacySubject: source.subject,
    target: input.mapping,
    pages,
  });
  if (manifestSha256 !== input.dryRun.manifestSha256) throw new Error("legacy_source_changed_after_dry_run");

  const plan = buildLogicalLessonPlan(input.mapping.legacySubjectId, pages);
  if (plan.unresolvedPages.length > 0 || plan.lessons.length !== input.dryRun.logicalLessons) {
    throw new Error("legacy_lesson_plan_changed_after_dry_run");
  }
  const questionPlan = questionGroups(plan.lessons);
  if (
    questionPlan.groups.length !== input.dryRun.importableQuestions ||
    questionPlan.unresolved.length !== input.dryRun.unresolvedQuestions.length
  ) {
    throw new Error("legacy_question_plan_changed_after_dry_run");
  }

  const targetOffering = await offering(input.database, input.mapping);
  const actorProfileId = await importActor(input.database);
  const { runId, documentId } = await input.database.transaction(async (tx) => {
    const runId = await ensureRun(tx, input.dryRun);
    const documentId = await ensureDocument(tx, runId, input.dryRun);
    return { runId, documentId };
  });

  const lessonIds = new Map<string, string>();
  for (const lesson of plan.lessons) {
    const absolutePosition = input.mapping.documentOrder * 10_000 + lesson.position;
    const lessonId = await input.database.transaction((tx) =>
      ensureLesson(tx, targetOffering, lesson, absolutePosition),
    );
    lessonIds.set(lesson.sourceKey, lessonId);
  }

  const pageToLesson = lessonForPage(plan.lessons);
  const dryRunImages = new Map(input.dryRun.images.map((image) => [image.legacyPageId, image]));
  const importedPages = new Map<string, ImportedPageContext>();
  const usedMediaAssets = new Set<string>();
  const pipeline = new MediaPipelineService(input.database, input.storage);
  let newMediaAssets = 0;
  let reusedExactMediaAssets = 0;
  let completed = 0;

  for (const [position, page] of pages.entries()) {
    const lesson = pageToLesson.get(page.id);
    if (!lesson) continue;
    const imageUrl = page.image_urls[0];
    const dryImage = dryRunImages.get(page.id);
    if (!imageUrl || !dryImage || page.page_number === null)
      throw new Error(`legacy_page_dry_run_missing:${page.id}`);
    const image = await input.client.imageBytes(imageUrl);
    if (
      image.checksumSha256 !== dryImage.checksumSha256 ||
      image.byteSize !== dryImage.byteSize ||
      image.objectPath !== dryImage.objectPath
    ) {
      throw new Error(`legacy_source_image_changed_after_dry_run:${page.id}`);
    }

    const sourceAssetId = await input.database.transaction((tx) =>
      ensureSourceAsset(tx, {
        runId,
        documentId,
        position,
        page,
        image,
        projectRef: input.client.projectRef,
      }),
    );

    let mediaAssetId: string;
    let variants: VariantRow[];
    let dedupeDecision: "NEW_CANONICAL" | "EXACT_DUPLICATE_REUSE";
    const canonical = await readyMediaByChecksum(input.database, image.checksumSha256, image.byteSize);
    if (canonical) {
      mediaAssetId = canonical.id;
      variants = await verifiedVariants(input.database, input.storage, canonical.id);
      dedupeDecision = "EXACT_DUPLICATE_REUSE";
      reusedExactMediaAssets += 1;
    } else {
      const processed = await pipeline.processImage({
        idempotencyKey: `legacy-supabase:${input.client.projectRef}:${page.id}:image:0`,
        sourcePosition: position,
        sourceFilename: image.filename,
        sourceMimeType: image.mimeType,
        sourcePageNumber: page.page_number,
        contentSourceAssetId: sourceAssetId,
        bytes: image.bytes,
      });
      mediaAssetId = processed.mediaAssetId;
      variants = processedVariants(processed);
      dedupeDecision = "NEW_CANONICAL";
      if (!processed.replayed) newMediaAssets += 1;
    }

    const lessonId = lessonIds.get(lesson.sourceKey);
    if (!lessonId) throw new Error(`legacy_target_lesson_id_missing:${lesson.sourceKey}`);
    const lessonPosition = lesson.pages.findIndex((candidate) => candidate.id === page.id);
    if (lessonPosition < 0) throw new Error(`legacy_lesson_page_position_missing:${page.id}`);
    await ensureLessonAsset(input.database, {
      lessonId,
      lessonPosition,
      mediaAssetId,
      variants,
      page,
      image,
      sourceAssetId,
      runId,
      projectRef: input.client.projectRef,
      dedupeDecision,
    });
    importedPages.set(page.id, {
      sourceAssetId,
      mediaAssetId,
      sourceChecksumSha256: image.checksumSha256,
    });
    usedMediaAssets.add(mediaAssetId);
    completed += 1;
    input.onProgress?.({
      event: "legacy_supabase_media_progress",
      completed,
      total: input.dryRun.sourceImageRecords,
      legacyPageId: page.id,
      pageNumber: page.page_number,
      dedupeDecision,
    });
  }

  for (const group of questionPlan.groups) {
    const lessonId = lessonIds.get(group.logicalLesson.sourceKey);
    if (!lessonId) throw new Error(`legacy_question_lesson_missing:${group.logicalLesson.sourceKey}`);
    await ensureQuestion(input.database, {
      actorProfileId,
      offering: targetOffering,
      group,
      lessonId,
      importedPages,
      projectRef: input.client.projectRef,
      legacySubjectId: input.mapping.legacySubjectId,
    });
  }

  await input.database.transaction(async (tx) => {
    for (const [sourceKey, lessonId] of lessonIds) {
      const exists = await tx.query<IdRow>(
        `select id::text as id from curriculum_events
          where resource_type = 'lesson' and resource_key = $1 and event_type = 'legacy_supabase_imported_draft'
            and metadata ->> 'legacySubjectId' = $2 limit 1`,
        [lessonId, input.mapping.legacySubjectId],
      );
      if (!exists[0]) {
        await tx.query(
          `insert into curriculum_events (actor_profile_id,resource_type,resource_key,event_type,metadata)
           values ($1,'lesson',$2,'legacy_supabase_imported_draft',$3::jsonb)`,
          [
            actorProfileId,
            lessonId,
            JSON.stringify({
              sourceRepository: input.dryRun.sourceRepository,
              sourceRevision: input.dryRun.sourceRevision,
              legacySubjectId: input.mapping.legacySubjectId,
              logicalLessonSourceKey: sourceKey,
              importRunId: runId,
            }),
          ],
        );
      }
    }
  });

  const sourceAssets = Number(
    (
      await input.database.query<{ count: string }>(
        `select count(*)
           from content_source_assets a join content_source_documents d on d.id = a.document_id
          where d.source_repository = $1 and d.source_path = $2 and a.is_present`,
        [input.dryRun.sourceRepository, `public.subjects/${input.mapping.legacySubjectId}`],
      )
    )[0]?.count ?? 0,
  );
  const lessonAssets = Number(
    (
      await input.database.query<{ count: string }>(
        `select count(*) from lesson_assets
          where source_metadata ->> 'legacyProjectRef' = $1
            and source_metadata ->> 'legacySubjectId' = $2`,
        [input.client.projectRef, input.mapping.legacySubjectId],
      )
    )[0]?.count ?? 0,
  );
  const importedQuestionCount = Number(
    (
      await input.database.query<{ count: string }>(
        `select count(distinct r.id)
           from question_bank_revisions r
           join question_bank_revision_sources s on s.revision_id = r.id
           join content_source_assets a on a.id = s.content_source_asset_id
           join content_source_documents d on d.id = a.document_id
          where d.source_repository = $1 and d.source_path = $2 and r.status = 'draft'`,
        [input.dryRun.sourceRepository, `public.subjects/${input.mapping.legacySubjectId}`],
      )
    )[0]?.count ?? 0,
  );
  const nonDraftAssets = Number(
    (
      await input.database.query<{ count: string }>(
        `select count(*) from lesson_assets
          where source_metadata ->> 'legacyProjectRef' = $1
            and source_metadata ->> 'legacySubjectId' = $2
            and publication_status <> 'draft'`,
        [input.client.projectRef, input.mapping.legacySubjectId],
      )
    )[0]?.count ?? 0,
  );
  const nonDraftQuestions = Number(
    (
      await input.database.query<{ count: string }>(
        `select count(distinct r.id)
           from question_bank_revisions r
           join question_bank_revision_sources s on s.revision_id = r.id
           join content_source_assets a on a.id = s.content_source_asset_id
           join content_source_documents d on d.id = a.document_id
          where d.source_repository = $1 and d.source_path = $2 and r.status <> 'draft'`,
        [input.dryRun.sourceRepository, `public.subjects/${input.mapping.legacySubjectId}`],
      )
    )[0]?.count ?? 0,
  );

  if (sourceAssets !== input.dryRun.sourceImageRecords || lessonAssets !== input.dryRun.sourceImageRecords) {
    throw new Error(`legacy_import_asset_verification_failed:${sourceAssets}:${lessonAssets}`);
  }
  if (importedQuestionCount !== input.dryRun.importableQuestions) {
    throw new Error(
      `legacy_import_question_verification_failed:${importedQuestionCount}:${input.dryRun.importableQuestions}`,
    );
  }
  if (nonDraftAssets !== 0 || nonDraftQuestions !== 0) {
    throw new Error(`legacy_import_publication_safety_failed:${nonDraftAssets}:${nonDraftQuestions}`);
  }

  return {
    runId,
    sourceRepository: input.dryRun.sourceRepository,
    sourceRevision: input.dryRun.sourceRevision,
    legacySubjectId: input.mapping.legacySubjectId,
    targetClassSlug: input.mapping.targetClassSlug,
    targetSubjectSlug: input.mapping.targetSubjectSlug,
    lessons: plan.lessons.length,
    sourceAssets,
    lessonAssets,
    uniqueMediaAssetsUsed: usedMediaAssets.size,
    newMediaAssets,
    reusedExactMediaAssets,
    questionsImported: importedQuestionCount,
    questionsSkippedUnresolved: questionPlan.unresolved.length,
    questionDuplicatesCollapsed: questionPlan.duplicateRows,
    allLessonAssetsDraft: nonDraftAssets === 0,
    allQuestionRevisionsDraft: nonDraftQuestions === 0,
  };
}
