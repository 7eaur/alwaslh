import { z } from "zod";
import { loadConfig } from "../config.js";
import { createDatabase } from "../db.js";
import { FileSystemMediaStorage } from "../media/storage.js";
import { inspectExperimentalContent, resetExperimentalContent } from "./legacy-content-reset.js";
import { LegacySupabaseClient } from "./legacy-supabase-client.js";
import {
  dryRunLegacySubject,
  importLegacySubject,
  type LegacySubjectMapping,
} from "./legacy-supabase-importer.js";
import { verifyLegacySubjectImport } from "./legacy-supabase-verifier.js";

const commandSchema = z.enum([
  "inspect-reset",
  "reset-experimental",
  "dry-run-subject",
  "import-subject",
  "verify-subject",
]);

const uuidSchema = z.string().uuid();
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`missing_required_env:${name}`);
  return value;
}

function parseMapping(args: readonly string[]): LegacySubjectMapping {
  const legacySubjectId = uuidSchema.parse(args[0]);
  const targetClassSlug = slugSchema.parse(args[1]);
  const targetSubjectSlug = slugSchema.parse(args[2]);
  const documentOrder = Number(args[3]);
  if (!Number.isSafeInteger(documentOrder) || documentOrder < 0 || documentOrder > 100_000) {
    throw new Error("invalid_document_order");
  }
  return { legacySubjectId, targetClassSlug, targetSubjectSlug, documentOrder };
}

function legacyClient(): LegacySupabaseClient {
  return new LegacySupabaseClient(
    requiredEnv("LEGACY_SUPABASE_URL"),
    requiredEnv("LEGACY_SUPABASE_PUBLISHABLE_KEY"),
  );
}

function log(event: string, payload: Record<string, unknown>): void {
  console.log(JSON.stringify({ event, ...payload }));
}

async function main(): Promise<void> {
  const command = commandSchema.parse(process.argv[2]);
  const args = process.argv.slice(3);
  const config = loadConfig();
  const database = createDatabase(config.DATABASE_URL, {
    ssl: config.DATABASE_SSL === "require",
    maxConnections: Math.min(config.DATABASE_POOL_MAX, 4),
  });
  const storage = new FileSystemMediaStorage(config.MEDIA_STORAGE_ROOT);

  try {
    if (command === "inspect-reset") {
      const inspection = await inspectExperimentalContent(database);
      log("legacy_experimental_content_inspection", inspection as unknown as Record<string, unknown>);
      return;
    }

    if (command === "reset-experimental") {
      const confirmation = args[0];
      if (confirmation !== "DELETE_EXPERIMENTAL_CONTENT") {
        throw new Error("reset_requires_confirmation:DELETE_EXPERIMENTAL_CONTENT");
      }
      const result = await resetExperimentalContent(database, config.MEDIA_STORAGE_ROOT);
      log("legacy_experimental_content_reset_complete", result as unknown as Record<string, unknown>);
      return;
    }

    const mapping = parseMapping(args);
    const client = legacyClient();
    const dryRun = await dryRunLegacySubject(client, mapping);
    log("legacy_supabase_dry_run_complete", dryRun as unknown as Record<string, unknown>);

    if (command === "dry-run-subject") return;

    if (dryRun.blockingReasons.length > 0) {
      throw new Error(`legacy_import_blocked:${dryRun.blockingReasons.join(",")}`);
    }

    if (command === "verify-subject") {
      const verification = await verifyLegacySubjectImport({
        database,
        storage,
        client,
        mapping,
        dryRun,
      });
      log("legacy_supabase_verify_complete", verification as unknown as Record<string, unknown>);
      return;
    }

    const result = await importLegacySubject({
      database,
      storage,
      client,
      mapping,
      dryRun,
      onProgress(event) {
        if (
          event.event !== "legacy_supabase_media_progress" ||
          event.completed === 1 ||
          event.completed === event.total ||
          (typeof event.completed === "number" && event.completed % 10 === 0)
        ) {
          log("legacy_supabase_import_progress", event);
        }
      },
    });
    log("legacy_supabase_import_complete", result as unknown as Record<string, unknown>);

    const verification = await verifyLegacySubjectImport({
      database,
      storage,
      client,
      mapping,
      dryRun,
    });
    log("legacy_supabase_verify_complete", verification as unknown as Record<string, unknown>);
  } finally {
    await database.close();
  }
}

await main();
