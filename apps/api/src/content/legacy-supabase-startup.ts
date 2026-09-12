import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AppConfig } from "../config.js";
import type { Database } from "../db.js";
import { FileSystemMediaStorage } from "../media/storage.js";
import { inspectExperimentalContent, resetExperimentalContent } from "./legacy-content-reset.js";
import { LegacySupabaseClient } from "./legacy-supabase-client.js";
import {
  dryRunLegacySubject,
  importLegacySubject,
  type LegacySubjectMapping,
} from "./legacy-supabase-importer.js";
import { verifyLegacySubjectImport } from "./legacy-supabase-verifier.js";

const BATCH_ENV = "LEGACY_CONTENT_STARTUP_BATCH";

interface StartupBatchMarker {
  completedAt: string;
  mapping: LegacySubjectMapping;
  manifestSha256: string;
  backupPath: string | null;
  backupSha256: string | null;
  firstImportRunId: string;
  replayImportRunId: string;
  verification: {
    lessonCount: number;
    lessonAssetCount: number;
    uniqueMediaAssets: number;
    questionCount: number;
    storageVariantsVerified: number;
    sourcePagesVerified: number;
    questionSourcesVerified: number;
  };
}

function parseBatch(value: string): LegacySubjectMapping {
  const parts = value.split("|");
  if (parts.length !== 4) throw new Error("legacy_startup_batch_invalid_shape");
  const [legacySubjectId, targetClassSlug, targetSubjectSlug, orderText] = parts;
  if (!legacySubjectId || !/^[0-9a-f-]{36}$/i.test(legacySubjectId)) {
    throw new Error("legacy_startup_batch_invalid_subject_id");
  }
  if (!targetClassSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(targetClassSlug)) {
    throw new Error("legacy_startup_batch_invalid_class_slug");
  }
  if (!targetSubjectSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(targetSubjectSlug)) {
    throw new Error("legacy_startup_batch_invalid_subject_slug");
  }
  const documentOrder = Number(orderText);
  if (!Number.isSafeInteger(documentOrder) || documentOrder < 0 || documentOrder > 100_000) {
    throw new Error("legacy_startup_batch_invalid_document_order");
  }
  return { legacySubjectId, targetClassSlug, targetSubjectSlug, documentOrder };
}

function markerPath(config: AppConfig, mapping: LegacySubjectMapping): string {
  return path.join(
    config.MEDIA_STORAGE_ROOT,
    "legacy-import-markers",
    `${mapping.legacySubjectId}-${mapping.targetClassSlug}-${mapping.targetSubjectSlug}-${mapping.documentOrder}.json`,
  );
}

async function markerExists(filePath: string): Promise<boolean> {
  try {
    const value = JSON.parse(await readFile(filePath, "utf8")) as Partial<StartupBatchMarker>;
    return typeof value.completedAt === "string" && typeof value.manifestSha256 === "string";
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return false;
    throw error;
  }
}

async function writeMarker(filePath: string, marker: StartupBatchMarker): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(marker, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  await rename(tempPath, filePath);
}

function log(event: string, payload: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ event, ...payload }));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function runLegacyContentStartupBatch(
  config: AppConfig,
  database: Database,
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  const raw = env[BATCH_ENV]?.trim();
  if (!raw) return;

  const mapping = parseBatch(raw);
  const filePath = markerPath(config, mapping);
  if (await markerExists(filePath)) {
    log("legacy_startup_batch_already_completed", { markerPath: filePath, legacySubjectId: mapping.legacySubjectId });
    return;
  }

  const legacyUrl = env.LEGACY_SUPABASE_URL?.trim();
  const legacyKey = env.LEGACY_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!legacyUrl || !legacyKey) throw new Error("legacy_startup_source_configuration_missing");

  const client = new LegacySupabaseClient(legacyUrl, legacyKey);
  const storage = new FileSystemMediaStorage(config.MEDIA_STORAGE_ROOT);

  log("legacy_startup_batch_dry_run_started", { legacySubjectId: mapping.legacySubjectId });
  const dryRun = await dryRunLegacySubject(client, mapping);
  log("legacy_startup_batch_dry_run_complete", {
    manifestSha256: dryRun.manifestSha256,
    sourcePages: dryRun.sourcePages,
    logicalLessons: dryRun.logicalLessons,
    sourceImageRecords: dryRun.sourceImageRecords,
    uniqueExactImageFiles: dryRun.uniqueExactImageFiles,
    sourceQuestions: dryRun.sourceQuestions,
    importableQuestions: dryRun.importableQuestions,
    blockingReasons: dryRun.blockingReasons,
  });
  if (dryRun.blockingReasons.length > 0) {
    throw new Error(`legacy_startup_batch_blocked:${dryRun.blockingReasons.join(",")}`);
  }

  let backupPath: string | null = null;
  let backupSha256: string | null = null;
  try {
    const inspection = await inspectExperimentalContent(database);
    log("legacy_startup_experimental_content_confirmed", {
      importRunId: inspection.importRunId,
      counts: inspection.counts,
      authCounts: inspection.authCounts,
    });
    const reset = await resetExperimentalContent(database, config.MEDIA_STORAGE_ROOT);
    backupPath = reset.backupPath;
    backupSha256 = reset.backupSha256;
    log("legacy_startup_experimental_content_reset_complete", {
      backupPath: reset.backupPath,
      backupSha256: reset.backupSha256,
      deletedCounts: reset.counts,
      postResetCounts: reset.postResetCounts,
      preservedAuthCounts: reset.authCounts,
    });
  } catch (error) {
    if (errorMessage(error) !== "experimental_cleanup_import_run_invalid:0") throw error;
    log("legacy_startup_experimental_content_already_absent", {
      reason: "bootstrap import run no longer exists; continuing with idempotent target import",
    });
  }

  const progress = (event: Record<string, unknown>) => {
    const completed = typeof event.completed === "number" ? event.completed : null;
    const total = typeof event.total === "number" ? event.total : null;
    if (completed === null || completed === 1 || completed === total || completed % 10 === 0) {
      log("legacy_startup_import_progress", event);
    }
  };

  const first = await importLegacySubject({ database, storage, client, mapping, dryRun, onProgress: progress });
  log("legacy_startup_first_import_complete", first as unknown as Record<string, unknown>);
  const firstVerification = await verifyLegacySubjectImport({ database, storage, client, mapping, dryRun });
  log("legacy_startup_first_verification_complete", firstVerification as unknown as Record<string, unknown>);

  const replay = await importLegacySubject({ database, storage, client, mapping, dryRun, onProgress: progress });
  log("legacy_startup_replay_import_complete", replay as unknown as Record<string, unknown>);
  const replayVerification = await verifyLegacySubjectImport({ database, storage, client, mapping, dryRun });
  log("legacy_startup_replay_verification_complete", replayVerification as unknown as Record<string, unknown>);

  if (
    replayVerification.lessonCount !== firstVerification.lessonCount ||
    replayVerification.lessonAssetCount !== firstVerification.lessonAssetCount ||
    replayVerification.uniqueMediaAssets !== firstVerification.uniqueMediaAssets ||
    replayVerification.questionCount !== firstVerification.questionCount
  ) {
    throw new Error("legacy_startup_replay_changed_target_counts");
  }

  await writeMarker(filePath, {
    completedAt: new Date().toISOString(),
    mapping,
    manifestSha256: dryRun.manifestSha256,
    backupPath,
    backupSha256,
    firstImportRunId: first.runId,
    replayImportRunId: replay.runId,
    verification: {
      lessonCount: replayVerification.lessonCount,
      lessonAssetCount: replayVerification.lessonAssetCount,
      uniqueMediaAssets: replayVerification.uniqueMediaAssets,
      questionCount: replayVerification.questionCount,
      storageVariantsVerified: replayVerification.storageVariantsVerified,
      sourcePagesVerified: replayVerification.sourcePagesVerified,
      questionSourcesVerified: replayVerification.questionSourcesVerified,
    },
  });
  log("legacy_startup_batch_complete", {
    markerPath: filePath,
    manifestSha256: dryRun.manifestSha256,
    firstImportRunId: first.runId,
    replayImportRunId: replay.runId,
  });
}
