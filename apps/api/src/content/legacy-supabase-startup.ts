import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AppConfig } from "../config.js";
import type { Database, QueryExecutor } from "../db.js";
import { FileSystemMediaStorage } from "../media/storage.js";
import { inspectExperimentalContent, resetExperimentalContent } from "./legacy-content-reset.js";
import { LegacySupabaseClient } from "./legacy-supabase-client.js";
import {
  dryRunLegacySubject,
  importLegacySubject,
  type LegacySubjectDryRun,
  type LegacySubjectImportResult,
  type LegacySubjectMapping,
} from "./legacy-supabase-importer.js";
import {
  type LegacySubjectVerificationResult,
  verifyLegacySubjectImport,
} from "./legacy-supabase-verifier.js";

export const FIRST_PRODUCTION_BATCH_FLAG = "grade9-english-textbook-v1";
const BATCH_ENV = "LEGACY_CONTENT_STARTUP_BATCH";
const EXPECTED_BATCH: LegacySubjectMapping = {
  legacySubjectId: "1794eea5-4772-4c94-bd2b-b08e5815e733",
  targetClassSlug: "grade-9",
  targetSubjectSlug: "english",
  documentOrder: 0,
};
const EXPECTED_SOURCE_PAGES = 69;
const EXPECTED_LOGICAL_LESSONS = 62;
const EXPECTED_QUESTIONS = 104;
const JOURNAL_SCHEMA_VERSION = 1;

type AttemptPhase =
  | "dry-run-verified"
  | "snapshot-verified"
  | "reset-started"
  | "experimental-reset-complete"
  | "first-import-complete"
  | "first-verification-complete"
  | "replay-import-complete"
  | "replay-verification-complete"
  | "failed";

interface ProtectedState {
  immutableDigest: string;
  counts: Record<string, number>;
}

interface StartupAttemptJournal {
  schemaVersion: number;
  batchId: string;
  startedAt: string;
  updatedAt: string;
  phase: AttemptPhase;
  mapping: LegacySubjectMapping;
  manifestSha256: string;
  snapshotPath: string | null;
  snapshotSha256: string | null;
  snapshotByteSize: number | null;
  resetBackupPath: string | null;
  resetBackupSha256: string | null;
  protectedBaseline: ProtectedState;
  failure: { at: string; phaseBeforeFailure: AttemptPhase; message: string } | null;
}

interface StartupBatchMarker {
  schemaVersion: number;
  batchId: string;
  completedAt: string;
  mapping: LegacySubjectMapping;
  manifestSha256: string;
  snapshotPath: string;
  snapshotSha256: string;
  snapshotByteSize: number;
  resetBackupPath: string | null;
  resetBackupSha256: string | null;
  firstImportRunId: string;
  replayImportRunId: string;
  protectedStateDigest: string;
  verification: LegacySubjectVerificationResult;
}

interface BackupVariantRow {
  media_asset_id: string;
  kind: string;
  storage_key: string;
  byte_size: string;
  checksum_sha256: string;
}

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function sameMapping(left: LegacySubjectMapping, right: LegacySubjectMapping): boolean {
  return (
    left.legacySubjectId === right.legacySubjectId &&
    left.targetClassSlug === right.targetClassSlug &&
    left.targetSubjectSlug === right.targetSubjectSlug &&
    left.documentOrder === right.documentOrder
  );
}

export function parseFirstProductionBatchFlag(value: string): LegacySubjectMapping {
  if (value !== FIRST_PRODUCTION_BATCH_FLAG) throw new Error("legacy_startup_batch_flag_not_allowed");
  return { ...EXPECTED_BATCH };
}

export function assertFirstProductionBatchDryRun(dryRun: LegacySubjectDryRun): void {
  if (dryRun.blockingReasons.length > 0) {
    throw new Error(`legacy_startup_batch_blocked:${dryRun.blockingReasons.join(",")}`);
  }
  if (
    dryRun.sourcePages !== EXPECTED_SOURCE_PAGES ||
    dryRun.sourceImageRecords !== EXPECTED_SOURCE_PAGES ||
    dryRun.logicalLessons !== EXPECTED_LOGICAL_LESSONS ||
    dryRun.sourceQuestions !== EXPECTED_QUESTIONS ||
    dryRun.importableQuestions !== EXPECTED_QUESTIONS ||
    dryRun.unresolvedPages.length !== 0 ||
    dryRun.unresolvedQuestions.length !== 0 ||
    dryRun.exactDuplicateQuestionRecords !== 0
  ) {
    throw new Error(
      `legacy_startup_first_batch_contract_mismatch:${JSON.stringify({
        sourcePages: dryRun.sourcePages,
        sourceImageRecords: dryRun.sourceImageRecords,
        logicalLessons: dryRun.logicalLessons,
        sourceQuestions: dryRun.sourceQuestions,
        importableQuestions: dryRun.importableQuestions,
        unresolvedPages: dryRun.unresolvedPages.length,
        unresolvedQuestions: dryRun.unresolvedQuestions.length,
        exactDuplicateQuestionRecords: dryRun.exactDuplicateQuestionRecords,
      })}`,
    );
  }
}

export function assertReplayStable(
  first: LegacySubjectImportResult,
  replay: LegacySubjectImportResult,
  firstVerification: LegacySubjectVerificationResult,
  replayVerification: LegacySubjectVerificationResult,
): void {
  if (first.runId !== replay.runId) throw new Error("legacy_startup_replay_changed_import_run");
  if (replay.newMediaAssets !== 0)
    throw new Error(`legacy_startup_replay_created_media:${replay.newMediaAssets}`);
  if (
    replay.lessons !== first.lessons ||
    replay.sourceAssets !== first.sourceAssets ||
    replay.lessonAssets !== first.lessonAssets ||
    replay.uniqueMediaAssetsUsed !== first.uniqueMediaAssetsUsed ||
    replay.questionsImported !== first.questionsImported
  ) {
    throw new Error("legacy_startup_replay_changed_import_counts");
  }
  if (
    replayVerification.sourceManifestSha256 !== firstVerification.sourceManifestSha256 ||
    replayVerification.lessonCount !== firstVerification.lessonCount ||
    replayVerification.lessonAssetCount !== firstVerification.lessonAssetCount ||
    replayVerification.uniqueMediaAssets !== firstVerification.uniqueMediaAssets ||
    replayVerification.questionCount !== firstVerification.questionCount ||
    replayVerification.duplicateReadyMediaChecksumRows !== 0 ||
    replayVerification.publishedLessonCount !== 0 ||
    replayVerification.nonDraftLessonAssetCount !== 0 ||
    replayVerification.publishedQuestionRevisionCount !== 0
  ) {
    throw new Error("legacy_startup_replay_verification_changed");
  }
}

function markerDirectory(config: AppConfig): string {
  return path.join(config.MEDIA_STORAGE_ROOT, "legacy-import-markers");
}

function completionMarkerPath(config: AppConfig): string {
  return path.join(markerDirectory(config), `${FIRST_PRODUCTION_BATCH_FLAG}.complete.json`);
}

function attemptJournalPath(config: AppConfig): string {
  return path.join(markerDirectory(config), `${FIRST_PRODUCTION_BATCH_FLAG}.attempt.json`);
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw error;
  }
}

async function writeJsonAtomic(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  await rename(tempPath, filePath);
}

async function completionMarker(config: AppConfig): Promise<StartupBatchMarker | null> {
  const marker = await readJson<StartupBatchMarker>(completionMarkerPath(config));
  if (!marker) return null;
  if (
    marker.schemaVersion !== JOURNAL_SCHEMA_VERSION ||
    marker.batchId !== FIRST_PRODUCTION_BATCH_FLAG ||
    !sameMapping(marker.mapping, EXPECTED_BATCH) ||
    marker.verification.verified !== true
  ) {
    throw new Error("legacy_startup_completion_marker_invalid");
  }
  return marker;
}

async function count(tx: QueryExecutor, table: string): Promise<number> {
  const rows = await tx.query<{ count: string }>(`select count(*)::text as count from ${table}`);
  return Number(rows[0]?.count ?? 0);
}

async function immutableRows(database: Database): Promise<Record<string, unknown[]>> {
  const queries = {
    classes: "select to_jsonb(t) as row from classes t order by id",
    subjects: "select to_jsonb(t) as row from subjects t order by id",
    subject_class_links: "select to_jsonb(t) as row from subject_class_links t order by class_id,subject_id",
    schema_migrations: "select to_jsonb(t) as row from schema_migrations t order by filename",
  } as const;
  const output: Record<string, unknown[]> = {};
  for (const [name, sql] of Object.entries(queries)) {
    const rows = await database.query<{ row: unknown }>(sql);
    output[name] = rows.map((entry) => entry.row);
  }
  return output;
}

async function captureProtectedState(database: Database): Promise<ProtectedState> {
  const tables = [
    "classes",
    "subjects",
    "subject_class_links",
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
    "schema_migrations",
  ] as const;
  const counts: Record<string, number> = {};
  for (const table of tables) counts[table] = await count(database, table);
  return {
    immutableDigest: sha256(JSON.stringify(await immutableRows(database))),
    counts,
  };
}

function assertProtectedState(baseline: ProtectedState, current: ProtectedState): void {
  if (current.immutableDigest !== baseline.immutableDigest) {
    throw new Error("legacy_startup_protected_reference_state_changed");
  }
  const mustRemainEqual = [
    "classes",
    "subjects",
    "subject_class_links",
    "profiles",
    "auth_credentials",
    "student_entitlements",
    "full_access_codes",
    "class_access_codes",
    "student_devices",
    "schema_migrations",
  ] as const;
  for (const table of mustRemainEqual) {
    if (current.counts[table] !== baseline.counts[table]) {
      throw new Error(
        `legacy_startup_protected_count_changed:${table}:${baseline.counts[table]}:${current.counts[table]}`,
      );
    }
  }
}

async function jsonRows(database: Database, text: string, values: readonly unknown[]): Promise<unknown[]> {
  const rows = await database.query<{ row: unknown }>(text, values);
  return rows.map((entry) => entry.row);
}

async function createVerifiedSnapshot(
  database: Database,
  storage: FileSystemMediaStorage,
  config: AppConfig,
): Promise<{ path: string; sha256: string; byteSize: number }> {
  const inspection = await inspectExperimentalContent(database);
  const variants = inspection.mediaAssetIds.length
    ? await database.query<BackupVariantRow>(
        `select media_asset_id,kind::text as kind,storage_key,byte_size::text,checksum_sha256
           from media_variants where media_asset_id = any($1::uuid[])
          order by media_asset_id,kind`,
        [inspection.mediaAssetIds],
      )
    : [];
  for (const variant of variants) {
    const bytes = await storage.read(variant.storage_key);
    if (bytes.byteLength !== Number(variant.byte_size) || sha256(bytes) !== variant.checksum_sha256) {
      throw new Error(
        `legacy_startup_snapshot_media_integrity_failed:${variant.media_asset_id}:${variant.kind}`,
      );
    }
  }

  const snapshot = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    inspection,
    storageVariants: variants,
    rows: {
      content_import_runs: await jsonRows(
        database,
        "select to_jsonb(t) as row from content_import_runs t where id = $1",
        [inspection.importRunId],
      ),
      content_source_documents: await jsonRows(
        database,
        "select to_jsonb(t) as row from content_source_documents t where first_seen_import_run_id = $1 or last_seen_import_run_id = $1 order by id",
        [inspection.importRunId],
      ),
      content_source_assets: await jsonRows(
        database,
        "select to_jsonb(t) as row from content_source_assets t where first_seen_import_run_id = $1 or last_seen_import_run_id = $1 order by position,id",
        [inspection.importRunId],
      ),
      lessons: await jsonRows(
        database,
        "select to_jsonb(t) as row from lessons t where id = any($1::uuid[]) order by position,id",
        [inspection.lessonIds],
      ),
      lesson_assets: await jsonRows(
        database,
        "select to_jsonb(t) as row from lesson_assets t where lesson_id = any($1::uuid[]) order by lesson_id,position,id",
        [inspection.lessonIds],
      ),
      media_assets: await jsonRows(
        database,
        "select to_jsonb(t) as row from media_assets t where id = any($1::uuid[]) order by id",
        [inspection.mediaAssetIds],
      ),
      media_variants: await jsonRows(
        database,
        "select to_jsonb(t) as row from media_variants t where media_asset_id = any($1::uuid[]) order by media_asset_id,kind",
        [inspection.mediaAssetIds],
      ),
      curriculum_events: await jsonRows(
        database,
        "select to_jsonb(t) as row from curriculum_events t where resource_type = 'lesson' and resource_key = any($1::text[]) order by id",
        [inspection.lessonIds],
      ),
    },
  };
  const serialized = JSON.stringify(snapshot, null, 2);
  const digest = sha256(serialized);
  const backupDir = path.join(config.MEDIA_STORAGE_ROOT, "backups", "production-legacy-transition");
  await mkdir(backupDir, { recursive: true });
  const filePath = path.join(
    backupDir,
    `${new Date().toISOString().replace(/[:.]/g, "-")}-${digest.slice(0, 12)}.json`,
  );
  await writeFile(filePath, serialized, { encoding: "utf8", flag: "wx" });
  const persisted = await readFile(filePath, "utf8");
  if (sha256(persisted) !== digest) throw new Error("legacy_startup_snapshot_readback_hash_mismatch");
  const parsed = JSON.parse(persisted) as {
    schemaVersion?: number;
    inspection?: { counts?: { lessons?: number } };
  };
  if (parsed.schemaVersion !== 1 || parsed.inspection?.counts?.lessons !== 10) {
    throw new Error("legacy_startup_snapshot_readback_structure_invalid");
  }
  return { path: filePath, sha256: digest, byteSize: Buffer.byteLength(persisted) };
}

async function assertStudentPublicationFence(
  database: Database,
  mapping: LegacySubjectMapping,
): Promise<void> {
  const rows = await database.query<{ lessons: string; assets: string }>(
    `select
       count(distinct l.id) filter (where l.published_at is not null and l.published_at <= now())::text as lessons,
       count(la.id) filter (
         where l.published_at is not null and l.published_at <= now() and la.publication_status = 'published'
       )::text as assets
       from lessons l
       left join lesson_assets la on la.lesson_id = l.id
       join classes c on c.id = l.class_id
       join subjects s on s.id = l.subject_id
      where c.slug = $1 and s.slug = $2
        and exists (
          select 1 from curriculum_events ce
           where ce.resource_type = 'lesson' and ce.resource_key = l.id::text
             and ce.event_type = 'legacy_supabase_imported_draft'
             and ce.metadata ->> 'legacySubjectId' = $3
        )`,
    [mapping.targetClassSlug, mapping.targetSubjectSlug, mapping.legacySubjectId],
  );
  if (Number(rows[0]?.lessons ?? 0) !== 0 || Number(rows[0]?.assets ?? 0) !== 0) {
    throw new Error("legacy_startup_student_publication_fence_failed");
  }
}

function log(event: string, payload: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ event, ...payload }));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function writeAttempt(
  config: AppConfig,
  journal: StartupAttemptJournal,
  phase: AttemptPhase,
  patch: Partial<StartupAttemptJournal> = {},
): Promise<StartupAttemptJournal> {
  const next: StartupAttemptJournal = {
    ...journal,
    ...patch,
    phase,
    updatedAt: new Date().toISOString(),
  };
  await writeJsonAtomic(attemptJournalPath(config), next);
  return next;
}

export async function runLegacyContentStartupBatch(
  config: AppConfig,
  database: Database,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  const raw = env[BATCH_ENV]?.trim();
  if (!raw) return;
  const mapping = parseFirstProductionBatchFlag(raw);

  const completed = await completionMarker(config);
  if (completed) {
    log("legacy_startup_batch_already_completed", {
      markerPath: completionMarkerPath(config),
      manifestSha256: completed.manifestSha256,
    });
    return;
  }

  const legacyUrl = env.LEGACY_SUPABASE_URL?.trim();
  const legacyKey = env.LEGACY_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!legacyUrl || !legacyKey) throw new Error("legacy_startup_source_configuration_missing");

  const client = new LegacySupabaseClient(legacyUrl, legacyKey);
  const storage = new FileSystemMediaStorage(config.MEDIA_STORAGE_ROOT);
  log("legacy_startup_batch_dry_run_started", { batchId: FIRST_PRODUCTION_BATCH_FLAG });
  const dryRun = await dryRunLegacySubject(client, mapping);
  assertFirstProductionBatchDryRun(dryRun);
  log("legacy_startup_batch_dry_run_complete", {
    manifestSha256: dryRun.manifestSha256,
    sourcePages: dryRun.sourcePages,
    logicalLessons: dryRun.logicalLessons,
    sourceImageRecords: dryRun.sourceImageRecords,
    uniqueExactImageFiles: dryRun.uniqueExactImageFiles,
    importableQuestions: dryRun.importableQuestions,
  });

  const protectedNow = await captureProtectedState(database);
  const existingAttempt = await readJson<StartupAttemptJournal>(attemptJournalPath(config));
  if (existingAttempt) {
    if (
      existingAttempt.schemaVersion !== JOURNAL_SCHEMA_VERSION ||
      existingAttempt.batchId !== FIRST_PRODUCTION_BATCH_FLAG ||
      !sameMapping(existingAttempt.mapping, mapping) ||
      existingAttempt.manifestSha256 !== dryRun.manifestSha256
    ) {
      throw new Error("legacy_startup_attempt_journal_conflict");
    }
    assertProtectedState(existingAttempt.protectedBaseline, protectedNow);
  }

  let journal: StartupAttemptJournal =
    existingAttempt ??
    ({
      schemaVersion: JOURNAL_SCHEMA_VERSION,
      batchId: FIRST_PRODUCTION_BATCH_FLAG,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phase: "dry-run-verified",
      mapping,
      manifestSha256: dryRun.manifestSha256,
      snapshotPath: null,
      snapshotSha256: null,
      snapshotByteSize: null,
      resetBackupPath: null,
      resetBackupSha256: null,
      protectedBaseline: protectedNow,
      failure: null,
    } satisfies StartupAttemptJournal);
  journal = await writeAttempt(config, journal, "dry-run-verified", { failure: null });

  let phaseBeforeFailure: AttemptPhase = journal.phase;
  try {
    let inspectionExists = true;
    try {
      await inspectExperimentalContent(database);
    } catch (error) {
      if (errorMessage(error) !== "experimental_cleanup_import_run_invalid:0") throw error;
      inspectionExists = false;
    }

    if (inspectionExists) {
      const snapshot = await createVerifiedSnapshot(database, storage, config);
      journal = await writeAttempt(config, journal, "snapshot-verified", {
        snapshotPath: snapshot.path,
        snapshotSha256: snapshot.sha256,
        snapshotByteSize: snapshot.byteSize,
      });
      phaseBeforeFailure = journal.phase;
      journal = await writeAttempt(config, journal, "reset-started");
      phaseBeforeFailure = journal.phase;
      const reset = await resetExperimentalContent(database, config.MEDIA_STORAGE_ROOT);
      journal = await writeAttempt(config, journal, "experimental-reset-complete", {
        resetBackupPath: reset.backupPath,
        resetBackupSha256: reset.backupSha256,
      });
      phaseBeforeFailure = journal.phase;
      log("legacy_startup_experimental_content_reset_complete", {
        snapshotPath: snapshot.path,
        snapshotSha256: snapshot.sha256,
        resetBackupPath: reset.backupPath,
        resetBackupSha256: reset.backupSha256,
        postResetCounts: reset.postResetCounts,
      });
    } else {
      if (!journal.snapshotPath || !journal.snapshotSha256 || !journal.snapshotByteSize) {
        throw new Error("legacy_startup_experimental_absent_without_verified_snapshot");
      }
      log("legacy_startup_experimental_content_already_absent", {
        recoveryPhase: journal.phase,
        snapshotPath: journal.snapshotPath,
        snapshotSha256: journal.snapshotSha256,
      });
    }

    assertProtectedState(journal.protectedBaseline, await captureProtectedState(database));

    const progress = (event: Record<string, unknown>) => {
      const completedCount = typeof event.completed === "number" ? event.completed : null;
      const total = typeof event.total === "number" ? event.total : null;
      if (
        completedCount === null ||
        completedCount === 1 ||
        completedCount === total ||
        completedCount % 10 === 0
      ) {
        log("legacy_startup_import_progress", event);
      }
    };

    const first = await importLegacySubject({
      database,
      storage,
      client,
      mapping,
      dryRun,
      onProgress: progress,
    });
    journal = await writeAttempt(config, journal, "first-import-complete");
    phaseBeforeFailure = journal.phase;
    log("legacy_startup_first_import_complete", first as unknown as Record<string, unknown>);

    const firstVerification = await verifyLegacySubjectImport({ database, storage, client, mapping, dryRun });
    await assertStudentPublicationFence(database, mapping);
    journal = await writeAttempt(config, journal, "first-verification-complete");
    phaseBeforeFailure = journal.phase;
    log(
      "legacy_startup_first_verification_complete",
      firstVerification as unknown as Record<string, unknown>,
    );

    const replay = await importLegacySubject({
      database,
      storage,
      client,
      mapping,
      dryRun,
      onProgress: progress,
    });
    journal = await writeAttempt(config, journal, "replay-import-complete");
    phaseBeforeFailure = journal.phase;
    log("legacy_startup_replay_import_complete", replay as unknown as Record<string, unknown>);

    const replayVerification = await verifyLegacySubjectImport({
      database,
      storage,
      client,
      mapping,
      dryRun,
    });
    await assertStudentPublicationFence(database, mapping);
    assertReplayStable(first, replay, firstVerification, replayVerification);
    assertProtectedState(journal.protectedBaseline, await captureProtectedState(database));
    journal = await writeAttempt(config, journal, "replay-verification-complete");
    phaseBeforeFailure = journal.phase;
    log(
      "legacy_startup_replay_verification_complete",
      replayVerification as unknown as Record<string, unknown>,
    );

    if (!journal.snapshotPath || !journal.snapshotSha256 || !journal.snapshotByteSize) {
      throw new Error("legacy_startup_verified_snapshot_missing_at_completion");
    }
    const marker: StartupBatchMarker = {
      schemaVersion: JOURNAL_SCHEMA_VERSION,
      batchId: FIRST_PRODUCTION_BATCH_FLAG,
      completedAt: new Date().toISOString(),
      mapping,
      manifestSha256: dryRun.manifestSha256,
      snapshotPath: journal.snapshotPath,
      snapshotSha256: journal.snapshotSha256,
      snapshotByteSize: journal.snapshotByteSize,
      resetBackupPath: journal.resetBackupPath,
      resetBackupSha256: journal.resetBackupSha256,
      firstImportRunId: first.runId,
      replayImportRunId: replay.runId,
      protectedStateDigest: journal.protectedBaseline.immutableDigest,
      verification: replayVerification,
    };
    await writeJsonAtomic(completionMarkerPath(config), marker);
    const persistedMarker = await completionMarker(config);
    if (!persistedMarker || persistedMarker.manifestSha256 !== dryRun.manifestSha256) {
      throw new Error("legacy_startup_completion_marker_readback_failed");
    }
    log("legacy_startup_batch_complete", {
      markerPath: completionMarkerPath(config),
      manifestSha256: dryRun.manifestSha256,
      firstImportRunId: first.runId,
      replayImportRunId: replay.runId,
      verification: replayVerification,
    });
  } catch (error) {
    const message = errorMessage(error);
    await writeAttempt(config, journal, "failed", {
      failure: { at: new Date().toISOString(), phaseBeforeFailure, message },
    }).catch(() => undefined);
    log("legacy_startup_batch_failed", { phaseBeforeFailure, message });
    throw error;
  }
}
