import { createHash } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import type { Database, QueryExecutor } from "../db.js";
import type { ProcessedMediaAsset } from "../media/media-types.js";
import { buildMediaStorageKey, MediaPipelineService } from "../media/service.js";
import type { MediaStorage } from "../media/storage.js";

const SOURCE_REPOSITORY = "7eaur/alwaslh-go";
const SOURCE_REVISION = "f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23";
const GITHUB_API_VERSION = "2022-11-28";
const MAX_SCOPED_SOURCE_BYTES = 120 * 1024 * 1024;

const manifestEntrySchema = z.object({
  seq: z.number().int().positive(),
  source_page: z.number().int().positive(),
  book_page: z.number().int().positive().nullable(),
  section: z.string().trim().min(1),
  title: z.string().trim().min(1),
  original_name: z.string().trim().min(1),
  new_name: z.string().trim().min(1),
  relative_path: z.string().trim().min(1),
});

const githubContentEntrySchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  sha: z.string().regex(/^[0-9a-f]{40}$/),
  size: z.number().int().nonnegative(),
  type: z.string(),
});

export type LegacyManifestEntry = z.infer<typeof manifestEntrySchema>;

type LegacySubjectConfig = {
  key: string;
  classSlug: string;
  className: string;
  subjectSlug: string;
  subjectName: string;
  sourceRoot: string;
  documentUnit: string;
  expectedImages: number;
};

const SUBJECTS: Readonly<Record<string, LegacySubjectConfig>> = {
  "grade-9:english": {
    key: "grade-9:english",
    classSlug: "grade-9",
    className: "الصف التاسع",
    subjectSlug: "english",
    subjectName: "اللغة الإنجليزية",
    sourceRoot: "تاسع انجليزي",
    documentUnit: "الانجليزي_تاسع",
    expectedImages: 75,
  },
};

type GithubContentEntry = z.infer<typeof githubContentEntrySchema>;

type ImportRunRow = { id: string };
type IdRow = { id: string };
type LessonRow = { id: string; published_at: Date | null };
type CountRow = { count: string };

type SourceName = {
  namingFamily: string;
  sourceNumber: number;
  titleHint: string | null;
};

type SectionPlan = {
  section: string;
  slug: string;
  position: number;
};

type LessonPlan = SectionPlan & { lessonId: string };

export interface LegacySubjectBootstrapResult {
  sourceRepository: string;
  sourceRevision: string;
  classSlug: string;
  subjectSlug: string;
  documentPath: string;
  sourceImages: number;
  sourceBytes: number;
  readyMediaAssets: number;
  mediaVariants: number;
  draftLessonAssets: number;
  lessons: number;
  replayedMediaAssets: number;
}

function sha256(bytes: Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function encodeGithubPath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function documentPath(config: LegacySubjectConfig): string {
  return `${config.sourceRoot}/${config.documentUnit}`;
}

function manifestPath(config: LegacySubjectConfig): string {
  return `${documentPath(config)}/manifest.json`;
}

function imagesPath(config: LegacySubjectConfig): string {
  return `${documentPath(config)}/الصور`;
}

function rawUrl(path: string): string {
  return `https://raw.githubusercontent.com/${SOURCE_REPOSITORY}/${SOURCE_REVISION}/${encodeGithubPath(path)}`;
}

function contentsApiUrl(path: string): string {
  return `https://api.github.com/repos/${SOURCE_REPOSITORY}/contents/${encodeGithubPath(path)}?ref=${SOURCE_REVISION}`;
}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastStatus = 0;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "alwaslh-production-content-bootstrap/1.0",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (response.ok) return response;
    lastStatus = response.status;
    if (response.status !== 429 && response.status < 500) break;
    await delay(400 * attempt);
  }
  throw new Error(`legacy_source_fetch_failed:${lastStatus}:${url}`);
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetchWithRetry(url);
  return response.json() as Promise<unknown>;
}

async function fetchBytes(url: string): Promise<Buffer> {
  const response = await fetchWithRetry(url);
  return Buffer.from(await response.arrayBuffer());
}

export function validateLegacyManifest(input: unknown, expectedImages: number): LegacyManifestEntry[] {
  const manifest = z.array(manifestEntrySchema).parse(input);
  if (manifest.length !== expectedImages) {
    throw new Error(`legacy_manifest_count_mismatch:${manifest.length}:${expectedImages}`);
  }

  const seenSeq = new Set<number>();
  const seenPaths = new Set<string>();
  for (let index = 0; index < manifest.length; index += 1) {
    const entry = manifest[index];
    if (!entry) throw new Error("legacy_manifest_entry_missing");
    const expectedSeq = index + 1;
    if (entry.seq !== expectedSeq) {
      throw new Error(`legacy_manifest_sequence_mismatch:${entry.seq}:${expectedSeq}`);
    }
    if (seenSeq.has(entry.seq)) throw new Error(`legacy_manifest_duplicate_sequence:${entry.seq}`);
    if (seenPaths.has(entry.relative_path)) {
      throw new Error(`legacy_manifest_duplicate_path:${entry.relative_path}`);
    }
    if (!entry.relative_path.startsWith("الصور/")) {
      throw new Error(`legacy_manifest_path_outside_images:${entry.relative_path}`);
    }
    seenSeq.add(entry.seq);
    seenPaths.add(entry.relative_path);
  }
  return manifest;
}

export function parseLegacySourceName(filename: string): SourceName {
  const dot = filename.lastIndexOf(".");
  const stem = dot > 0 ? filename.slice(0, dot) : filename;
  const patterns: readonly [string, RegExp][] = [
    ["preliminary", /^تمهيدي\s*([0-9]+)(?:\s*-\s*(.*))?$/i],
    ["front", /^front\s*([0-9]+)(?:\s*-\s*(.*))?$/i],
    ["pdf", /^PDF\s*([0-9]+)(?:\s*-\s*(.*))?$/i],
    ["book_page", /^ص\s*([0-9]+)(?:\s*-\s*(.*))?$/i],
    ["english_page", /^p\s*([0-9]+)(?:\s*-\s*(.*))?$/i],
    ["exam_page", /^صفحة[_\s-]*([0-9]+)(?:\s*-\s*(.*))?$/i],
  ];
  for (const [namingFamily, pattern] of patterns) {
    const match = pattern.exec(stem);
    const numberText = match?.[1];
    if (!numberText) continue;
    const title = match?.[2]?.trim();
    return {
      namingFamily,
      sourceNumber: Number(numberText),
      titleHint: title ? title : null,
    };
  }
  throw new Error(`legacy_source_filename_unparsed:${filename}`);
}

export function buildLegacySectionPlan(manifest: readonly LegacyManifestEntry[]): SectionPlan[] {
  const sections: SectionPlan[] = [];
  const seen = new Set<string>();
  for (const entry of manifest) {
    if (seen.has(entry.section)) continue;
    const position = sections.length;
    sections.push({
      section: entry.section,
      slug: `legacy-english9-section-${String(position + 1).padStart(2, "0")}`,
      position,
    });
    seen.add(entry.section);
  }
  return sections;
}

function mimeTypeForFilename(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      throw new Error(`legacy_source_unsupported_image:${filename}`);
  }
}

async function ensureScopedImportRun(
  tx: QueryExecutor,
  config: LegacySubjectConfig,
  manifest: readonly LegacyManifestEntry[],
): Promise<string> {
  const digest = sha256(
    JSON.stringify({
      mode: "scoped_media_bootstrap",
      repository: SOURCE_REPOSITORY,
      revision: SOURCE_REVISION,
      classSlug: config.classSlug,
      subjectSlug: config.subjectSlug,
      manifest,
    }),
  );
  const rows = await tx.query<ImportRunRow>(
    `insert into content_import_runs (
       source_repository, source_revision, manifest_sha256,
       subject_root_count, document_count, asset_count, helper_file_count, report
     ) values ($1,$2,$3,1,1,$4,3,$5::jsonb)
     on conflict (source_repository, source_revision, manifest_sha256) do update set
       report = excluded.report
     returning id`,
    [
      SOURCE_REPOSITORY,
      SOURCE_REVISION,
      digest,
      manifest.length,
      JSON.stringify({
        mode: "scoped_media_bootstrap",
        scope: { classSlug: config.classSlug, subjectSlug: config.subjectSlug },
        sourceRoot: config.sourceRoot,
        documentPath: documentPath(config),
      }),
    ],
  );
  const row = rows[0];
  if (!row) throw new Error("legacy_import_run_missing");
  return row.id;
}

async function ensureSourceDocument(
  tx: QueryExecutor,
  runId: string,
  config: LegacySubjectConfig,
): Promise<string> {
  const path = documentPath(config);
  const rows = await tx.query<IdRow>(
    `insert into content_source_documents (
       source_repository, source_path, class_slug, class_name, subject_slug, subject_name,
       kind, title, hijri_year, exam_track, position, is_present,
       first_seen_import_run_id, last_seen_import_run_id, source_metadata
     ) values ($1,$2,$3,$4,$5,$6,'textbook',$7,null,null,0,true,$8,$8,$9::jsonb)
     on conflict (source_repository, source_path) do update set
       class_slug = excluded.class_slug,
       class_name = excluded.class_name,
       subject_slug = excluded.subject_slug,
       subject_name = excluded.subject_name,
       is_present = true,
       last_seen_import_run_id = excluded.last_seen_import_run_id,
       source_metadata = content_source_documents.source_metadata || excluded.source_metadata
     returning id`,
    [
      SOURCE_REPOSITORY,
      path,
      config.classSlug,
      config.className,
      config.subjectSlug,
      config.subjectName,
      config.documentUnit.replaceAll("_", " "),
      runId,
      JSON.stringify({
        bootstrapMode: "scoped_media_bootstrap",
        assetParentPaths: [imagesPath(config)],
        helperFiles: [
          `${path}/manifest.json`,
          `${path}/دليل_الصور_صفحة_بصفحة.txt`,
          `${path}/دليل_الصور_صفحة_بصفحة.xlsx`,
        ],
      }),
    ],
  );
  const row = rows[0];
  if (!row) throw new Error("legacy_source_document_missing");
  return row.id;
}

async function ensureSourceAsset(
  tx: QueryExecutor,
  input: {
    runId: string;
    documentId: string;
    sourcePath: string;
    filename: string;
    position: number;
    mimeType: string;
    byteSize: number;
    sourceGitBlobSha1: string;
    checksumSha256: string;
    naming: SourceName;
    manifest: LegacyManifestEntry;
  },
): Promise<string> {
  const rows = await tx.query<IdRow>(
    `insert into content_source_assets (
       document_id, source_path, filename, position, mime_type, byte_size,
       source_git_blob_sha1, checksum_sha256, naming_family, source_number, title_hint,
       is_present, first_seen_import_run_id, last_seen_import_run_id, source_metadata
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,$12,$12,$13::jsonb)
     on conflict (document_id, source_path) do update set
       filename = excluded.filename,
       position = excluded.position,
       mime_type = excluded.mime_type,
       byte_size = excluded.byte_size,
       source_git_blob_sha1 = excluded.source_git_blob_sha1,
       checksum_sha256 = excluded.checksum_sha256,
       naming_family = excluded.naming_family,
       source_number = excluded.source_number,
       title_hint = excluded.title_hint,
       is_present = true,
       last_seen_import_run_id = excluded.last_seen_import_run_id,
       source_metadata = excluded.source_metadata
     returning id`,
    [
      input.documentId,
      input.sourcePath,
      input.filename,
      input.position,
      input.mimeType,
      input.byteSize,
      input.sourceGitBlobSha1,
      input.checksumSha256,
      input.naming.namingFamily,
      input.naming.sourceNumber,
      input.naming.titleHint,
      input.runId,
      JSON.stringify({ manifest: input.manifest, bootstrapMode: "scoped_media_bootstrap" }),
    ],
  );
  const row = rows[0];
  if (!row) throw new Error(`legacy_source_asset_missing:${input.sourcePath}`);
  return row.id;
}

async function ensureIdBySlug(
  tx: QueryExecutor,
  table: "classes" | "subjects",
  slug: string,
  name: string,
): Promise<string> {
  await tx.query(
    `insert into ${table} (slug, name, status) values ($1,$2,'active') on conflict (slug) do nothing`,
    [slug, name],
  );
  const rows = await tx.query<IdRow>(`select id from ${table} where slug = $1`, [slug]);
  const row = rows[0];
  if (!row) throw new Error(`legacy_curriculum_${table}_missing:${slug}`);
  return row.id;
}

async function ensureLessons(
  database: Database,
  config: LegacySubjectConfig,
  manifest: readonly LegacyManifestEntry[],
): Promise<{ classId: string; subjectId: string; lessons: LessonPlan[] }> {
  return database.transaction(async (tx) => {
    const classId = await ensureIdBySlug(tx, "classes", config.classSlug, config.className);
    const subjectId = await ensureIdBySlug(tx, "subjects", config.subjectSlug, config.subjectName);
    await tx.query(
      `insert into subject_class_links (class_id, subject_id, position, status)
       values ($1,$2,0,'active')
       on conflict (class_id, subject_id) do nothing`,
      [classId, subjectId],
    );

    const lessons: LessonPlan[] = [];
    for (const plan of buildLegacySectionPlan(manifest)) {
      await tx.query(
        `insert into lessons (class_id, subject_id, slug, title, position, status, content_revision, published_at)
         values ($1,$2,$3,$4,$5,'active',1,null)
         on conflict (class_id, subject_id, slug) do nothing`,
        [classId, subjectId, plan.slug, plan.section, plan.position],
      );
      const rows = await tx.query<LessonRow>(
        `select id, published_at from lessons where class_id = $1 and subject_id = $2 and slug = $3`,
        [classId, subjectId, plan.slug],
      );
      const row = rows[0];
      if (!row) throw new Error(`legacy_lesson_missing:${plan.slug}`);
      if (row.published_at !== null)
        throw new Error(`legacy_bootstrap_refuses_published_lesson:${plan.slug}`);
      lessons.push({ ...plan, lessonId: row.id });
    }
    return { classId, subjectId, lessons };
  });
}

function requiredVariant(output: ProcessedMediaAsset, kind: "source" | "display" | "thumbnail" | "ai") {
  const variant = output.variants.find((candidate) => candidate.kind === kind);
  if (!variant) throw new Error(`legacy_media_variant_missing:${kind}`);
  return variant;
}

async function linkDraftLessonAsset(
  database: Database,
  input: {
    lessonId: string;
    media: ProcessedMediaAsset;
    lessonPosition: number;
    manifest: LegacyManifestEntry;
    sourcePath: string;
  },
): Promise<void> {
  const source = requiredVariant(input.media, "source");
  const display = requiredVariant(input.media, "display");
  const thumbnail = requiredVariant(input.media, "thumbnail");
  const ai = requiredVariant(input.media, "ai");
  const sourceKey = buildMediaStorageKey(input.media.mediaAssetId, source);
  const displayKey = buildMediaStorageKey(input.media.mediaAssetId, display);
  const thumbnailKey = buildMediaStorageKey(input.media.mediaAssetId, thumbnail);
  const aiKey = buildMediaStorageKey(input.media.mediaAssetId, ai);

  await database.transaction(async (tx) => {
    const existing = await tx.query<IdRow>(
      "select id from lesson_assets where lesson_id = $1 and media_asset_id = $2",
      [input.lessonId, input.media.mediaAssetId],
    );
    if (existing[0]) return;

    const positionConflict = await tx.query<IdRow>(
      "select id from lesson_assets where lesson_id = $1 and position = $2",
      [input.lessonId, input.lessonPosition],
    );
    if (positionConflict[0]) {
      throw new Error(`legacy_lesson_asset_position_conflict:${input.lessonId}:${input.lessonPosition}`);
    }

    await tx.query(
      `insert into lesson_assets (
         lesson_id, kind, position, storage_key, source_storage_key, thumbnail_storage_key,
         ai_storage_key, mime_type, byte_size, width, height, checksum_sha256,
         source_page_number, source_metadata, media_asset_id, publication_status
       ) values ($1,'image',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,'draft')`,
      [
        input.lessonId,
        input.lessonPosition,
        displayKey,
        sourceKey,
        thumbnailKey,
        aiKey,
        display.mimeType,
        display.bytes.byteLength,
        display.width ?? null,
        display.height ?? null,
        display.checksumSha256,
        input.manifest.source_page,
        JSON.stringify({
          bootstrapMode: "scoped_media_bootstrap",
          sourceRepository: SOURCE_REPOSITORY,
          sourceRevision: SOURCE_REVISION,
          sourcePath: input.sourcePath,
          manifest: input.manifest,
        }),
        input.media.mediaAssetId,
      ],
    );
  });
}

function lessonPositionByEntry(manifest: readonly LegacyManifestEntry[]): Map<number, number> {
  const positions = new Map<string, number>();
  const bySeq = new Map<number, number>();
  for (const entry of manifest) {
    const next = positions.get(entry.section) ?? 0;
    bySeq.set(entry.seq, next);
    positions.set(entry.section, next + 1);
  }
  return bySeq;
}

async function count(database: Database, text: string, values: readonly unknown[]): Promise<number> {
  const rows = await database.query<CountRow>(text, values);
  return Number(rows[0]?.count ?? 0);
}

export async function bootstrapLegacySubject(input: {
  database: Database;
  storage: MediaStorage;
  classSlug: string;
  subjectSlug: string;
  onProgress?: (completed: number, total: number, filename: string) => void;
}): Promise<LegacySubjectBootstrapResult> {
  const config = SUBJECTS[`${input.classSlug}:${input.subjectSlug}`];
  if (!config) throw new Error(`legacy_subject_not_allowed:${input.classSlug}:${input.subjectSlug}`);

  const manifestRaw = await fetchJson(rawUrl(manifestPath(config)));
  const manifest = validateLegacyManifest(manifestRaw, config.expectedImages);
  const listingRaw = await fetchJson(contentsApiUrl(imagesPath(config)));
  const listing = z
    .array(githubContentEntrySchema)
    .parse(listingRaw)
    .filter((entry) => entry.type === "file");
  const filesByName = new Map<string, GithubContentEntry>();
  for (const file of listing) {
    if (filesByName.has(file.name)) throw new Error(`legacy_source_duplicate_filename:${file.name}`);
    filesByName.set(file.name, file);
  }

  const totalSourceBytes = manifest.reduce((sum, entry) => {
    const file = filesByName.get(entry.new_name);
    if (!file) throw new Error(`legacy_source_image_missing:${entry.new_name}`);
    const expectedPath = `${imagesPath(config)}/${entry.new_name}`;
    if (file.path !== expectedPath)
      throw new Error(`legacy_source_image_path_mismatch:${file.path}:${expectedPath}`);
    return sum + file.size;
  }, 0);
  if (totalSourceBytes > MAX_SCOPED_SOURCE_BYTES) {
    throw new Error(`legacy_source_scope_too_large:${totalSourceBytes}:${MAX_SCOPED_SOURCE_BYTES}`);
  }

  const { lessons } = await ensureLessons(input.database, config, manifest);
  const lessonBySection = new Map(lessons.map((lesson) => [lesson.section, lesson]));
  const lessonPositions = lessonPositionByEntry(manifest);
  const pipeline = new MediaPipelineService(input.database, input.storage);

  const { runId, documentId } = await input.database.transaction(async (tx) => {
    const runId = await ensureScopedImportRun(tx, config, manifest);
    const documentId = await ensureSourceDocument(tx, runId, config);
    return { runId, documentId };
  });

  let replayedMediaAssets = 0;
  for (let index = 0; index < manifest.length; index += 1) {
    const entry = manifest[index];
    if (!entry) throw new Error("legacy_manifest_entry_missing");
    const file = filesByName.get(entry.new_name);
    if (!file) throw new Error(`legacy_source_image_missing:${entry.new_name}`);
    const sourcePath = `${imagesPath(config)}/${entry.new_name}`;
    const bytes = await fetchBytes(rawUrl(sourcePath));
    if (bytes.byteLength !== file.size) {
      throw new Error(`legacy_source_byte_size_mismatch:${entry.new_name}:${bytes.byteLength}:${file.size}`);
    }
    const checksum = sha256(bytes);
    const naming = parseLegacySourceName(entry.new_name);
    const mimeType = mimeTypeForFilename(entry.new_name);
    const contentSourceAssetId = await input.database.transaction((tx) =>
      ensureSourceAsset(tx, {
        runId,
        documentId,
        sourcePath,
        filename: entry.new_name,
        position: entry.seq - 1,
        mimeType,
        byteSize: bytes.byteLength,
        sourceGitBlobSha1: file.sha,
        checksumSha256: checksum,
        naming,
        manifest: entry,
      }),
    );

    const media = await pipeline.processImage({
      idempotencyKey: `legacy:${SOURCE_REVISION}:${sourcePath}`,
      sourcePosition: entry.seq - 1,
      sourceFilename: entry.new_name,
      sourceMimeType: mimeType,
      sourcePageNumber: entry.source_page,
      contentSourceAssetId,
      bytes,
    });
    if (media.replayed) replayedMediaAssets += 1;

    const lesson = lessonBySection.get(entry.section);
    const lessonPosition = lessonPositions.get(entry.seq);
    if (!lesson || lessonPosition === undefined) {
      throw new Error(`legacy_lesson_mapping_missing:${entry.seq}:${entry.section}`);
    }
    await linkDraftLessonAsset(input.database, {
      lessonId: lesson.lessonId,
      media,
      lessonPosition,
      manifest: entry,
      sourcePath,
    });
    input.onProgress?.(index + 1, manifest.length, entry.new_name);
  }

  await input.database.transaction(async (tx) => {
    for (const lesson of lessons) {
      await tx.query(
        `insert into curriculum_events (actor_profile_id, resource_type, resource_key, event_type, metadata)
         values (null, 'lesson', $1, 'legacy_content_bootstrapped_draft', $2::jsonb)`,
        [
          lesson.lessonId,
          JSON.stringify({
            sourceRepository: SOURCE_REPOSITORY,
            sourceRevision: SOURCE_REVISION,
            classSlug: config.classSlug,
            subjectSlug: config.subjectSlug,
            sourceDocumentPath: documentPath(config),
            section: lesson.section,
          }),
        ],
      );
    }
  });

  const scopeValues = [SOURCE_REPOSITORY, documentPath(config)] as const;
  const sourceImages = await count(
    input.database,
    `select count(*)::text as count
       from content_source_assets a
       join content_source_documents d on d.id = a.document_id
      where d.source_repository = $1 and d.source_path = $2 and a.is_present`,
    scopeValues,
  );
  const readyMediaAssets = await count(
    input.database,
    `select count(*)::text as count
       from media_assets m
       join content_source_assets a on a.id = m.content_source_asset_id
       join content_source_documents d on d.id = a.document_id
      where d.source_repository = $1 and d.source_path = $2 and m.status = 'ready'`,
    scopeValues,
  );
  const mediaVariants = await count(
    input.database,
    `select count(*)::text as count
       from media_variants v
       join media_assets m on m.id = v.media_asset_id
       join content_source_assets a on a.id = m.content_source_asset_id
       join content_source_documents d on d.id = a.document_id
      where d.source_repository = $1 and d.source_path = $2`,
    scopeValues,
  );
  const draftLessonAssets = await count(
    input.database,
    `select count(*)::text as count
       from lesson_assets la
      where la.publication_status = 'draft'
        and la.source_metadata ->> 'sourceRepository' = $1
        and la.source_metadata ->> 'sourcePath' like $2`,
    [SOURCE_REPOSITORY, `${imagesPath(config)}/%`],
  );

  if (
    sourceImages !== config.expectedImages ||
    readyMediaAssets !== config.expectedImages ||
    mediaVariants !== config.expectedImages * 4 ||
    draftLessonAssets !== config.expectedImages
  ) {
    throw new Error(
      `legacy_bootstrap_verification_failed:${sourceImages}:${readyMediaAssets}:${mediaVariants}:${draftLessonAssets}`,
    );
  }

  return {
    sourceRepository: SOURCE_REPOSITORY,
    sourceRevision: SOURCE_REVISION,
    classSlug: config.classSlug,
    subjectSlug: config.subjectSlug,
    documentPath: documentPath(config),
    sourceImages,
    sourceBytes: totalSourceBytes,
    readyMediaAssets,
    mediaVariants,
    draftLessonAssets,
    lessons: lessons.length,
    replayedMediaAssets,
  };
}
