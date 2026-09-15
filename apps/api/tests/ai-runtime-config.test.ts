import assert from "node:assert/strict";
import test from "node:test";
import { createConfiguredAiWorker } from "../src/ai/runtime.js";
import { loadConfig } from "../src/config.js";
import type { Database, QueryExecutor } from "../src/db.js";
import type { MediaStorage } from "../src/media/storage.js";

const executor: QueryExecutor = {
  async query<T>() {
    return [] as readonly T[];
  },
};

const database: Database = {
  ...executor,
  async ping() {},
  async transaction<T>(work: (tx: QueryExecutor) => Promise<T>) {
    return work(executor);
  },
  async close() {},
};

const mediaStorage: MediaStorage = {
  async put() {},
  async read() {
    return Buffer.alloc(0);
  },
  async exists() {
    return false;
  },
  async remove() {},
};

test("configured AI worker stays disabled when the provider credential is absent", () => {
  const config = loadConfig({ DATABASE_URL: "postgresql://user:pass@localhost:5432/alwaslh" });
  assert.equal(createConfiguredAiWorker(config, database, mediaStorage), null);
});

test("configured AI worker is constructed when the provider credential is present", () => {
  const config = loadConfig({
    DATABASE_URL: "postgresql://user:pass@localhost:5432/alwaslh",
    INTEGRATIONS_API_KEY: "provider-key",
  });
  const runtime = createConfiguredAiWorker(config, database, mediaStorage);
  assert.ok(runtime);
  runtime.requestStop();
});
