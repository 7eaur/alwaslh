import { createConfiguredAiWorker } from "./ai/runtime.js";
import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { runLegacyContentStartupBatch } from "./content/legacy-supabase-startup.js";
import { createDatabase } from "./db.js";
import { FileSystemMediaStorage } from "./media/public.js";

const config = loadConfig();
const database = createDatabase(config.DATABASE_URL, {
  ssl: config.DATABASE_SSL === "require",
  maxConnections: config.DATABASE_POOL_MAX,
});

try {
  await runLegacyContentStartupBatch(config, database);
} catch (error) {
  console.error("Legacy content startup batch failed", error);
  await database.close().catch(() => undefined);
  process.exit(1);
}

const app = buildApp({ config, database });
const aiWorker = createConfiguredAiWorker(
  config,
  database,
  new FileSystemMediaStorage(config.MEDIA_STORAGE_ROOT),
);
let aiWorkerPromise: Promise<void> | null = null;

async function shutdown(signal: NodeJS.Signals) {
  app.log.info({ signal }, "shutting down");
  aiWorker?.requestStop();
  if (aiWorkerPromise) {
    await aiWorkerPromise.catch((error) => {
      app.log.error({ err: error }, "AI worker stopped with an error during shutdown");
    });
  }
  await app.close();
  process.exit(0);
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));

try {
  await app.listen({ host: config.HOST, port: config.PORT });
  if (aiWorker) {
    app.log.info(
      {
        provider: "gemini-gateway",
        model: config.AI_GEMINI_MODEL,
        concurrency: config.AI_WORKER_CONCURRENCY,
      },
      "AI generation worker enabled",
    );
    aiWorkerPromise = aiWorker.run();
    void aiWorkerPromise.catch((error) => {
      app.log.error({ err: error }, "AI generation worker stopped unexpectedly");
    });
  } else {
    app.log.warn("AI generation worker disabled because INTEGRATIONS_API_KEY is not configured");
  }
} catch (error) {
  app.log.fatal({ err: error }, "failed to start API");
  aiWorker?.requestStop();
  await app.close();
  process.exit(1);
}
