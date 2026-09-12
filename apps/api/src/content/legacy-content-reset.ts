import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Database, QueryExecutor } from "../db.js";

const EXPERIMENTAL_SOURCE_REPOSITORY = "7eaur/alwaslh-go";
const EXPERIMENTAL_SOURCE_REVISION = "f81ebb6ef6198818fa091f7a8c1c81b4de7dbd23";
const EXPECTED_CLASS_SLUG = "grade-9";
const EXPECTED_SUBJECT_SLUG = "english";

interface IdRow {
  id: string;
}

interface ImportRunRow extends IdRow {
  source_repository: string;
  source_revision: string;
  manifest_sha256: string;
}

interface LessonRow extends IdRow {
  class_id: string;
  subject_id: string;
  slug: string;
  title: string;
  published_at: Date | null;
}

interface VariantRow {
  storage_key: string;
}

export interface ExperimentalContentInspection {
  importRunId: string;
  classId: string;
  subjectId: string;
  lessonIds: string[];
  mediaAssetIds: string[];
  counts: {
    importRuns: number;
    sourceDocuments: number;
    sourceAssets: number;
    lessons: number;
    lessonAssets: number;
    mediaAssets: number;
    mediaVariants: number;
    curriculumEvents: number;
    contentIngestionTasks: number;
    questionBankLessonLinks: number;
    questionBankSourceLinks: number;
    quizLessonLinks: number;
    legacyQuestions: number;
    practiceSessions: number;
  };
  authCounts: Record<string, number>;
  orphanStorageKeys: string[];
}

export interface ExperimentalContentResetResult extends ExperimentalContentInspection {
  backupPath: string;
  backupSha256: string;
  postResetCounts: Record<string, number>;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function count(tx: QueryExecutor, text: string, values: readonly unknown[] = []): Promise<number> {
  const rows = await tx.query<{ count: string }>(text, values);
  return Number(rows[0]?.count ?? 0);
}

async function authCounts(tx: QueryExecutor): Promise<Record<string, number>> {
  const tables = [
    "profiles",
    "auth_credentials",
    "auth_events",
    "auth_sessions",
    "student_entitlements",
    "full_access_codes",
    "class_access_codes",
    "access_events",
    "access_redemptions",
    "student_activation_tickets",
    "student_devices",
  ] as const;
  const output: Record<string, number> = {};
  for (const table of tables) output[table] = await count(tx, `select count(*) from ${table}`);
  return output;
}

async function classAndSubject(tx: QueryExecutor): Promise<{ classId: string; subjectId: string }> {
  const classes = await tx.query<IdRow>("select id from classes where slug = $1", [EXPECTED_CLASS_SLUG]);
  const subjects = await tx.query<IdRow>("select id from subjects where slug = $1", [EXPECTED_SUBJECT_SLUG]);
  const classId = classes[0]?.id;
  const subjectId = subjects[0]?.id;
  if (!classId || classes.length !== 1) throw new Error("experimental_cleanup_grade9_missing_or_ambiguous");
  if (!subjectId || subjects.length !== 1)
    throw new Error("experimental_cleanup_english_missing_or_ambiguous");
  const links = await count(
    tx,
    "select count(*) from subject_class_links where class_id = $1 and subject_id = $2",
    [classId, subjectId],
  );
  if (links !== 1) throw new Error(`experimental_cleanup_offering_invalid:${links}`);
  return { classId, subjectId };
}

export async function inspectExperimentalContent(database: Database): Promise<ExperimentalContentInspection> {
  const { classId, subjectId } = await classAndSubject(database);
  const runs = await database.query<ImportRunRow>(
    `select id, source_repository, source_revision, manifest_sha256
       from content_import_runs
      where source_repository = $1 and source_revision = $2`,
    [EXPERIMENTAL_SOURCE_REPOSITORY, EXPERIMENTAL_SOURCE_REVISION],
  );
  const run = runs[0];
  if (!run || runs.length !== 1) throw new Error(`experimental_cleanup_import_run_invalid:${runs.length}`);

  const lessons = await database.query<LessonRow>(
    `select distinct l.id, l.class_id, l.subject_id, l.slug, l.title, l.published_at
       from lessons l
       join lesson_assets la on la.lesson_id = l.id
      where la.source_metadata ->> 'sourceRepository' = $1
      order by l.slug`,
    [EXPERIMENTAL_SOURCE_REPOSITORY],
  );
  if (lessons.some((lesson) => lesson.published_at !== null)) {
    throw new Error("experimental_cleanup_refuses_published_lesson");
  }
  if (lessons.some((lesson) => lesson.class_id !== classId || lesson.subject_id !== subjectId)) {
    throw new Error("experimental_cleanup_scope_escape");
  }
  const lessonIds = lessons.map((lesson) => lesson.id);
  if (lessonIds.length === 0) throw new Error("experimental_cleanup_no_lessons");

  const totalLessons = await count(database, "select count(*) from lessons");
  if (totalLessons !== lessonIds.length) {
    throw new Error(`experimental_cleanup_unrelated_lessons_present:${totalLessons}:${lessonIds.length}`);
  }

  const mediaRows = await database.query<IdRow>(
    `select distinct media_asset_id as id
       from lesson_assets
      where lesson_id = any($1::uuid[]) and media_asset_id is not null
      order by media_asset_id`,
    [lessonIds],
  );
  const mediaAssetIds = mediaRows.map((row) => row.id);
  const variantRows = mediaAssetIds.length
    ? await database.query<VariantRow>(
        "select storage_key from media_variants where media_asset_id = any($1::uuid[]) order by storage_key",
        [mediaAssetIds],
      )
    : [];

  const counts = {
    importRuns: runs.length,
    sourceDocuments: await count(
      database,
      "select count(*) from content_source_documents where first_seen_import_run_id = $1 or last_seen_import_run_id = $1",
      [run.id],
    ),
    sourceAssets: await count(
      database,
      "select count(*) from content_source_assets where first_seen_import_run_id = $1 or last_seen_import_run_id = $1",
      [run.id],
    ),
    lessons: lessonIds.length,
    lessonAssets: await count(
      database,
      "select count(*) from lesson_assets where lesson_id = any($1::uuid[])",
      [lessonIds],
    ),
    mediaAssets: mediaAssetIds.length,
    mediaVariants: mediaAssetIds.length
      ? await count(database, "select count(*) from media_variants where media_asset_id = any($1::uuid[])", [
          mediaAssetIds,
        ])
      : 0,
    curriculumEvents: await count(
      database,
      "select count(*) from curriculum_events where resource_type = 'lesson' and resource_key = any($1::text[])",
      [lessonIds],
    ),
    contentIngestionTasks: await count(
      database,
      "select count(*) from content_ingestion_tasks where lesson_id = any($1::uuid[])",
      [lessonIds],
    ),
    questionBankLessonLinks: await count(
      database,
      "select count(*) from question_bank_revision_lessons where lesson_id = any($1::uuid[])",
      [lessonIds],
    ),
    questionBankSourceLinks: mediaAssetIds.length
      ? await count(
          database,
          "select count(*) from question_bank_revision_sources where media_asset_id = any($1::uuid[])",
          [mediaAssetIds],
        )
      : 0,
    quizLessonLinks: await count(
      database,
      "select count(*) from quiz_lessons where lesson_id = any($1::uuid[])",
      [lessonIds],
    ),
    legacyQuestions: await count(
      database,
      "select count(*) from questions where lesson_id = any($1::uuid[])",
      [lessonIds],
    ),
    practiceSessions: await count(
      database,
      "select count(*) from practice_sessions where lesson_id = any($1::uuid[])",
      [lessonIds],
    ),
  };

  if (counts.contentIngestionTasks !== 0)
    throw new Error("experimental_cleanup_ingestion_dependency_present");
  if (counts.questionBankLessonLinks !== 0 || counts.questionBankSourceLinks !== 0) {
    throw new Error("experimental_cleanup_question_bank_dependency_present");
  }
  if (counts.quizLessonLinks !== 0 || counts.legacyQuestions !== 0 || counts.practiceSessions !== 0) {
    throw new Error("experimental_cleanup_learning_dependency_present");
  }

  const expected = {
    sourceDocuments: 1,
    sourceAssets: 75,
    lessons: 10,
    lessonAssets: 75,
    mediaAssets: 75,
    mediaVariants: 300,
    curriculumEvents: 10,
  } as const;
  for (const [key, value] of Object.entries(expected)) {
    if (counts[key as keyof typeof counts] !== value) {
      throw new Error(
        `experimental_cleanup_expected_count_mismatch:${key}:${counts[key as keyof typeof counts]}:${value}`,
      );
    }
  }

  const totalMedia = await count(database, "select count(*) from media_assets");
  const totalSourceDocs = await count(database, "select count(*) from content_source_documents");
  const totalSourceAssets = await count(database, "select count(*) from content_source_assets");
  const totalRuns = await count(database, "select count(*) from content_import_runs");
  if (
    totalMedia !== counts.mediaAssets ||
    totalSourceDocs !== counts.sourceDocuments ||
    totalSourceAssets !== counts.sourceAssets ||
    totalRuns !== counts.importRuns
  ) {
    throw new Error("experimental_cleanup_unrelated_content_provenance_present");
  }

  return {
    importRunId: run.id,
    classId,
    subjectId,
    lessonIds,
    mediaAssetIds,
    counts,
    authCounts: await authCounts(database),
    orphanStorageKeys: [...new Set(variantRows.map((row) => row.storage_key))],
  };
}

async function jsonRows(tx: QueryExecutor, text: string, values: readonly unknown[]): Promise<unknown[]> {
  const rows = await tx.query<{ row: unknown }>(text, values);
  return rows.map((entry) => entry.row);
}

async function buildBackup(
  database: Database,
  inspection: ExperimentalContentInspection,
): Promise<Record<string, unknown>> {
  const { lessonIds, mediaAssetIds, importRunId } = inspection;
  return {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    sourceRepository: EXPERIMENTAL_SOURCE_REPOSITORY,
    sourceRevision: EXPERIMENTAL_SOURCE_REVISION,
    inspection,
    rows: {
      content_import_runs: await jsonRows(
        database,
        "select to_jsonb(t) as row from content_import_runs t where id = $1",
        [importRunId],
      ),
      content_source_documents: await jsonRows(
        database,
        "select to_jsonb(t) as row from content_source_documents t where first_seen_import_run_id = $1 or last_seen_import_run_id = $1 order by id",
        [importRunId],
      ),
      content_source_assets: await jsonRows(
        database,
        "select to_jsonb(t) as row from content_source_assets t where first_seen_import_run_id = $1 or last_seen_import_run_id = $1 order by position,id",
        [importRunId],
      ),
      lessons: await jsonRows(
        database,
        "select to_jsonb(t) as row from lessons t where id = any($1::uuid[]) order by position,id",
        [lessonIds],
      ),
      lesson_assets: await jsonRows(
        database,
        "select to_jsonb(t) as row from lesson_assets t where lesson_id = any($1::uuid[]) order by lesson_id,position,id",
        [lessonIds],
      ),
      media_assets: await jsonRows(
        database,
        "select to_jsonb(t) as row from media_assets t where id = any($1::uuid[]) order by id",
        [mediaAssetIds],
      ),
      media_variants: await jsonRows(
        database,
        "select to_jsonb(t) as row from media_variants t where media_asset_id = any($1::uuid[]) order by media_asset_id,kind",
        [mediaAssetIds],
      ),
      curriculum_events: await jsonRows(
        database,
        "select to_jsonb(t) as row from curriculum_events t where resource_type = 'lesson' and resource_key = any($1::text[]) order by id",
        [lessonIds],
      ),
    },
  };
}

export async function resetExperimentalContent(
  database: Database,
  mediaStorageRoot: string,
): Promise<ExperimentalContentResetResult> {
  const inspection = await inspectExperimentalContent(database);
  const backup = await buildBackup(database, inspection);
  const backupJson = JSON.stringify(backup, null, 2);
  const backupSha256 = sha256(backupJson);
  const backupDir = path.resolve(mediaStorageRoot, "backups", "experimental-content-reset");
  await mkdir(backupDir, { recursive: true });
  const backupPath = path.join(
    backupDir,
    `${new Date().toISOString().replace(/[:.]/g, "-")}-${backupSha256.slice(0, 12)}.json`,
  );
  await writeFile(backupPath, backupJson, { encoding: "utf8", flag: "wx" });

  const beforeAuth = inspection.authCounts;
  await database.transaction(async (tx) => {
    await tx.query(
      "delete from curriculum_events where resource_type = 'lesson' and resource_key = any($1::text[])",
      [inspection.lessonIds],
    );
    await tx.query("delete from lesson_assets where lesson_id = any($1::uuid[])", [inspection.lessonIds]);
    await tx.query("delete from media_assets where id = any($1::uuid[])", [inspection.mediaAssetIds]);
    await tx.query("delete from lessons where id = any($1::uuid[])", [inspection.lessonIds]);
    await tx.query(
      "delete from content_source_assets where first_seen_import_run_id = $1 or last_seen_import_run_id = $1",
      [inspection.importRunId],
    );
    await tx.query(
      "delete from content_source_documents where first_seen_import_run_id = $1 or last_seen_import_run_id = $1",
      [inspection.importRunId],
    );
    await tx.query("delete from content_import_runs where id = $1", [inspection.importRunId]);
  });

  const postResetCounts = {
    classes: await count(database, "select count(*) from classes where id = $1", [inspection.classId]),
    subjects: await count(database, "select count(*) from subjects where id = $1", [inspection.subjectId]),
    subjectClassLinks: await count(
      database,
      "select count(*) from subject_class_links where class_id = $1 and subject_id = $2",
      [inspection.classId, inspection.subjectId],
    ),
    lessons: await count(database, "select count(*) from lessons"),
    lessonAssets: await count(database, "select count(*) from lesson_assets"),
    mediaAssets: await count(database, "select count(*) from media_assets"),
    mediaVariants: await count(database, "select count(*) from media_variants"),
    contentImportRuns: await count(database, "select count(*) from content_import_runs"),
    contentSourceDocuments: await count(database, "select count(*) from content_source_documents"),
    contentSourceAssets: await count(database, "select count(*) from content_source_assets"),
  };
  if (
    postResetCounts.classes !== 1 ||
    postResetCounts.subjects !== 1 ||
    postResetCounts.subjectClassLinks !== 1 ||
    postResetCounts.lessons !== 0 ||
    postResetCounts.lessonAssets !== 0 ||
    postResetCounts.mediaAssets !== 0 ||
    postResetCounts.mediaVariants !== 0 ||
    postResetCounts.contentImportRuns !== 0 ||
    postResetCounts.contentSourceDocuments !== 0 ||
    postResetCounts.contentSourceAssets !== 0
  ) {
    throw new Error(`experimental_cleanup_postcondition_failed:${JSON.stringify(postResetCounts)}`);
  }

  const afterAuth = await authCounts(database);
  for (const [table, before] of Object.entries(beforeAuth)) {
    if (afterAuth[table] !== before) {
      throw new Error(`experimental_cleanup_auth_changed:${table}:${before}:${afterAuth[table]}`);
    }
  }

  return {
    ...inspection,
    backupPath,
    backupSha256,
    postResetCounts,
  };
}
