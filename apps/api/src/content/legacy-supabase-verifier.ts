import { createHash } from "node:crypto";
import type { Database } from "../db.js";
import type { MediaStorage } from "../media/storage.js";
import type { LegacySupabaseClient } from "./legacy-supabase-client.js";
import type { LegacySubjectDryRun, LegacySubjectMapping } from "./legacy-supabase-importer.js";
import {
  buildLogicalLessonPlan,
  canonicalDigest,
  type LogicalLesson,
  normalizeLegacyQuestion,
  questionFingerprint,
  stableUuid,
  type TargetQuestion,
} from "./legacy-supabase-model.js";

interface OfferingRow {
  class_id: string;
  subject_id: string;
}

interface LessonRow {
  id: string;
  slug: string;
  title: string;
  position: number;
  published_at: Date | null;
}

interface AssetRow {
  lesson_id: string;
  lesson_slug: string;
  position: number;
  media_asset_id: string;
  source_page_number: number | null;
  publication_status: string;
  source_metadata: Record<string, unknown>;
  source_checksum_sha256: string;
  source_byte_size: string;
  media_status: string;
}

interface QuestionRow {
  item_id: string;
  revision_id: string;
  status: string;
  type: string;
  prompt: string;
  options: unknown;
  correct_option_index: number | null;
  answer_text: string | null;
  answer_status: string;
  difficulty: string;
  explanation: string | null;
  lesson_id: string;
}

interface QuestionSourceRow {
  revision_id: string;
  position: number;
  media_asset_id: string;
  page_number: number;
  input_checksum_sha256: string;
  content_source_asset_id: string | null;
}

interface VariantRow {
  media_asset_id: string;
  kind: string;
  storage_key: string;
  byte_size: string;
  checksum_sha256: string;
}

interface ExpectedQuestion {
  itemId: string;
  revisionId: string;
  lesson: LogicalLesson;
  question: TargetQuestion;
  sources: Array<{ legacyPageId: string; pageNumber: number }>;
}

export interface LegacySubjectVerificationResult {
  legacySubjectId: string;
  targetClassSlug: string;
  targetSubjectSlug: string;
  sourceManifestSha256: string;
  lessonCount: number;
  lessonAssetCount: number;
  uniqueMediaAssets: number;
  duplicateReadyMediaChecksumRows: number;
  questionCount: number;
  publishedLessonCount: number;
  nonDraftLessonAssetCount: number;
  publishedQuestionRevisionCount: number;
  storageVariantsVerified: number;
  sourcePagesVerified: number;
  questionSourcesVerified: number;
  verified: true;
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function expectedQuestions(lessons: readonly LogicalLesson[], projectRef: string): ExpectedQuestion[] {
  const byFingerprint = new Map<string, ExpectedQuestion>();
  for (const lesson of lessons) {
    for (const page of lesson.pages) {
      for (let ordinal = 0; ordinal < page.ai_questions.length; ordinal += 1) {
        const normalized = normalizeLegacyQuestion(page.ai_questions[ordinal]);
        if (normalized.state !== "ready") continue;
        if (page.page_number === null) throw new Error(`legacy_verify_question_page_missing:${page.id}`);
        const fingerprint = questionFingerprint(lesson.sourceKey, normalized.question);
        const existing = byFingerprint.get(fingerprint);
        if (existing) {
          existing.sources.push({ legacyPageId: page.id, pageNumber: page.page_number });
          continue;
        }
        const itemId = stableUuid(`legacy-supabase:question:item:${projectRef}:${fingerprint}`);
        byFingerprint.set(fingerprint, {
          itemId,
          revisionId: stableUuid(`legacy-supabase:question:revision:${itemId}:1`),
          lesson,
          question: normalized.question,
          sources: [{ legacyPageId: page.id, pageNumber: page.page_number }],
        });
      }
    }
  }
  return [...byFingerprint.values()];
}

function sourceMetadataString(metadata: Record<string, unknown>, key: string): string | null {
  const value = metadata[key];
  return typeof value === "string" ? value : null;
}

export async function verifyLegacySubjectImport(input: {
  database: Database;
  storage: MediaStorage;
  client: LegacySupabaseClient;
  mapping: LegacySubjectMapping;
  dryRun: LegacySubjectDryRun;
}): Promise<LegacySubjectVerificationResult> {
  const source = await input.client.subject(input.mapping.legacySubjectId);
  const pages = await input.client.subjectPages(input.mapping.legacySubjectId);
  const manifestSha256 = canonicalDigest({
    projectRef: input.client.projectRef,
    legacyClass: source.class,
    legacySubject: source.subject,
    target: input.mapping,
    pages,
  });
  if (manifestSha256 !== input.dryRun.manifestSha256)
    throw new Error("legacy_verify_source_manifest_changed");

  const plan = buildLogicalLessonPlan(input.mapping.legacySubjectId, pages);
  if (plan.unresolvedPages.length > 0) throw new Error("legacy_verify_unresolved_source_pages");
  if (plan.lessons.length !== input.dryRun.logicalLessons)
    throw new Error("legacy_verify_lesson_plan_changed");

  const offerings = await input.database.query<OfferingRow>(
    `select c.id as class_id, s.id as subject_id
       from classes c
       join subjects s on s.slug = $2
       join subject_class_links l on l.class_id = c.id and l.subject_id = s.id
      where c.slug = $1 and c.status = 'active' and s.status = 'active' and l.status = 'active'`,
    [input.mapping.targetClassSlug, input.mapping.targetSubjectSlug],
  );
  const offering = offerings[0];
  if (!offering || offerings.length !== 1) throw new Error("legacy_verify_target_offering_invalid");

  const expectedSlugs = plan.lessons.map((lesson) => lesson.slug);
  const lessons = await input.database.query<LessonRow>(
    `select id,slug,title,position,published_at
       from lessons
      where class_id = $1 and subject_id = $2 and slug = any($3::text[])
      order by position,id`,
    [offering.class_id, offering.subject_id, expectedSlugs],
  );
  if (lessons.length !== plan.lessons.length) {
    throw new Error(`legacy_verify_lesson_count:${lessons.length}:${plan.lessons.length}`);
  }

  const lessonIdBySlug = new Map<string, string>();
  for (let index = 0; index < plan.lessons.length; index += 1) {
    const expected = plan.lessons[index];
    const actual = lessons[index];
    if (!expected || !actual) throw new Error("legacy_verify_lesson_sequence_missing");
    const expectedPosition = input.mapping.documentOrder * 10_000 + expected.position;
    if (
      actual.slug !== expected.slug ||
      actual.title !== expected.title ||
      actual.position !== expectedPosition ||
      actual.published_at !== null
    ) {
      throw new Error(`legacy_verify_lesson_sequence_mismatch:${expected.slug}`);
    }
    lessonIdBySlug.set(actual.slug, actual.id);
  }

  const lessonIds = lessons.map((lesson) => lesson.id);
  const assets = await input.database.query<AssetRow>(
    `select la.lesson_id,l.slug as lesson_slug,la.position,la.media_asset_id,la.source_page_number,
            la.publication_status::text as publication_status,la.source_metadata,
            ma.source_checksum_sha256,ma.source_byte_size,ma.status::text as media_status
       from lesson_assets la
       join lessons l on l.id = la.lesson_id
       join media_assets ma on ma.id = la.media_asset_id
      where la.lesson_id = any($1::uuid[])
      order by l.position,la.position,la.id`,
    [lessonIds],
  );
  if (assets.length !== input.dryRun.sourceImageRecords) {
    throw new Error(`legacy_verify_lesson_asset_count:${assets.length}:${input.dryRun.sourceImageRecords}`);
  }

  const dryImageByPage = new Map(input.dryRun.images.map((image) => [image.legacyPageId, image]));
  const assetByLegacyPage = new Map<string, AssetRow>();
  let assetCursor = 0;
  for (const expectedLesson of plan.lessons) {
    const lessonId = lessonIdBySlug.get(expectedLesson.slug);
    if (!lessonId) throw new Error(`legacy_verify_lesson_id_missing:${expectedLesson.slug}`);
    for (let position = 0; position < expectedLesson.pages.length; position += 1) {
      const page = expectedLesson.pages[position];
      const actual = assets[assetCursor];
      assetCursor += 1;
      if (!page || !actual) throw new Error("legacy_verify_asset_sequence_missing");
      const dryImage = dryImageByPage.get(page.id);
      if (!dryImage) throw new Error(`legacy_verify_dry_image_missing:${page.id}`);
      if (
        actual.lesson_id !== lessonId ||
        actual.lesson_slug !== expectedLesson.slug ||
        actual.position !== position ||
        actual.source_page_number !== page.page_number ||
        actual.publication_status !== "draft" ||
        actual.source_checksum_sha256 !== dryImage.checksumSha256 ||
        Number(actual.source_byte_size) !== dryImage.byteSize ||
        actual.media_status !== "ready" ||
        sourceMetadataString(actual.source_metadata, "legacyRecordId") !== page.id ||
        sourceMetadataString(actual.source_metadata, "legacySubjectId") !== input.mapping.legacySubjectId
      ) {
        throw new Error(`legacy_verify_asset_mismatch:${page.id}`);
      }
      assetByLegacyPage.set(page.id, actual);
    }
  }

  const usedMediaIds = [...new Set(assets.map((asset) => asset.media_asset_id))];
  const duplicateChecksums = await input.database.query<{ source_checksum_sha256: string; count: string }>(
    `select source_checksum_sha256,count(*)::text as count
       from media_assets
      where status = 'ready'
      group by source_checksum_sha256
     having count(*) > 1`,
  );
  if (duplicateChecksums.length > 0) {
    throw new Error(`legacy_verify_duplicate_media_checksum_rows:${duplicateChecksums.length}`);
  }

  const variants = await input.database.query<VariantRow>(
    `select media_asset_id,kind::text as kind,storage_key,byte_size,checksum_sha256
       from media_variants
      where media_asset_id = any($1::uuid[])
      order by media_asset_id,array_position(array['source','display','thumbnail','ai']::media_variant_kind[],kind)`,
    [usedMediaIds],
  );
  if (variants.length !== usedMediaIds.length * 4) {
    throw new Error(`legacy_verify_variant_count:${variants.length}:${usedMediaIds.length * 4}`);
  }
  for (const variant of variants) {
    const bytes = await input.storage.read(variant.storage_key);
    if (bytes.byteLength !== Number(variant.byte_size) || sha256(bytes) !== variant.checksum_sha256) {
      throw new Error(`legacy_verify_variant_integrity:${variant.media_asset_id}:${variant.kind}`);
    }
  }

  const expected = expectedQuestions(plan.lessons, input.client.projectRef);
  if (expected.length !== input.dryRun.importableQuestions) {
    throw new Error(
      `legacy_verify_expected_question_count:${expected.length}:${input.dryRun.importableQuestions}`,
    );
  }
  const itemIds = expected.map((entry) => entry.itemId);
  const questionRows = itemIds.length
    ? await input.database.query<QuestionRow>(
        `select i.id as item_id,r.id as revision_id,r.status::text as status,r.type::text as type,
                r.prompt,r.options,r.correct_option_index,r.answer_text,r.answer_status::text as answer_status,
                r.difficulty::text as difficulty,r.explanation,rl.lesson_id
           from question_bank_items i
           join question_bank_revisions r on r.item_id = i.id and r.revision_number = 1
           join question_bank_revision_lessons rl on rl.revision_id = r.id
          where i.id = any($1::uuid[])
          order by i.id`,
        [itemIds],
      )
    : [];
  if (questionRows.length !== expected.length) {
    throw new Error(`legacy_verify_question_count:${questionRows.length}:${expected.length}`);
  }
  const questionByItem = new Map(questionRows.map((row) => [row.item_id, row]));
  const revisionIds: string[] = [];
  for (const entry of expected) {
    const actual = questionByItem.get(entry.itemId);
    const expectedLessonId = lessonIdBySlug.get(entry.lesson.slug);
    if (!actual || !expectedLessonId) throw new Error(`legacy_verify_question_missing:${entry.itemId}`);
    const q = entry.question;
    if (
      actual.revision_id !== entry.revisionId ||
      actual.status !== "draft" ||
      actual.type !== q.type ||
      actual.prompt !== q.prompt ||
      JSON.stringify(actual.options) !== JSON.stringify(q.options) ||
      actual.correct_option_index !== q.correctOptionIndex ||
      actual.answer_text !== q.answerText ||
      actual.answer_status !== q.answerStatus ||
      actual.difficulty !== q.difficulty ||
      actual.explanation !== q.explanation ||
      actual.lesson_id !== expectedLessonId
    ) {
      throw new Error(`legacy_verify_question_mismatch:${entry.itemId}`);
    }
    revisionIds.push(actual.revision_id);
  }

  const sourceRows = revisionIds.length
    ? await input.database.query<QuestionSourceRow>(
        `select revision_id,position,media_asset_id,page_number,input_checksum_sha256,content_source_asset_id
           from question_bank_revision_sources
          where revision_id = any($1::uuid[])
          order by revision_id,position`,
        [revisionIds],
      )
    : [];
  const sourcesByRevision = new Map<string, QuestionSourceRow[]>();
  for (const row of sourceRows) {
    const group = sourcesByRevision.get(row.revision_id) ?? [];
    group.push(row);
    sourcesByRevision.set(row.revision_id, group);
  }
  let verifiedQuestionSources = 0;
  for (const entry of expected) {
    const actualSources = sourcesByRevision.get(entry.revisionId) ?? [];
    if (actualSources.length !== entry.sources.length) {
      throw new Error(
        `legacy_verify_question_source_count:${entry.itemId}:${actualSources.length}:${entry.sources.length}`,
      );
    }
    for (let position = 0; position < entry.sources.length; position += 1) {
      const expectedSource = entry.sources[position];
      const actual = actualSources[position];
      if (!expectedSource || !actual) throw new Error("legacy_verify_question_source_missing");
      const pageAsset = assetByLegacyPage.get(expectedSource.legacyPageId);
      if (!pageAsset)
        throw new Error(`legacy_verify_question_page_asset_missing:${expectedSource.legacyPageId}`);
      if (
        actual.position !== position ||
        actual.media_asset_id !== pageAsset.media_asset_id ||
        actual.page_number !== expectedSource.pageNumber ||
        actual.input_checksum_sha256 !== pageAsset.source_checksum_sha256 ||
        actual.content_source_asset_id === null
      ) {
        throw new Error(`legacy_verify_question_source_mismatch:${entry.itemId}:${position}`);
      }
      verifiedQuestionSources += 1;
    }
  }

  const publishedLessonCount = lessons.filter((lesson) => lesson.published_at !== null).length;
  const nonDraftLessonAssetCount = assets.filter((asset) => asset.publication_status !== "draft").length;
  const publishedQuestionRevisionCount = questionRows.filter(
    (question) => question.status === "published",
  ).length;
  if (publishedLessonCount !== 0 || nonDraftLessonAssetCount !== 0 || publishedQuestionRevisionCount !== 0) {
    throw new Error("legacy_verify_publication_safety_failed");
  }

  return {
    legacySubjectId: input.mapping.legacySubjectId,
    targetClassSlug: input.mapping.targetClassSlug,
    targetSubjectSlug: input.mapping.targetSubjectSlug,
    sourceManifestSha256: manifestSha256,
    lessonCount: lessons.length,
    lessonAssetCount: assets.length,
    uniqueMediaAssets: usedMediaIds.length,
    duplicateReadyMediaChecksumRows: duplicateChecksums.length,
    questionCount: questionRows.length,
    publishedLessonCount,
    nonDraftLessonAssetCount,
    publishedQuestionRevisionCount,
    storageVariantsVerified: variants.length,
    sourcePagesVerified: assetByLegacyPage.size,
    questionSourcesVerified: verifiedQuestionSources,
    verified: true,
  };
}
