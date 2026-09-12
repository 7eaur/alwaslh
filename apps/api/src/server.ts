import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { runLegacyContentStartupBatch } from "./content/legacy-supabase-startup.js";
import { createDatabase } from "./db.js";

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

async function shutdown(signal: NodeJS.Signals) {
  app.log.info({ signal }, "shutting down");
  await app.close();
  process.exit(0);
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));

try {
  await app.listen({ host: config.HOST, port: config.PORT });
} catch (error) {
  app.log.fatal({ err: error }, "failed to start API");
  await app.close();
  process.exit(1);
}
