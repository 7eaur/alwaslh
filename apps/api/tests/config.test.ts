import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../src/config.js";

test("loadConfig accepts a PostgreSQL URL and secure deployment defaults", () => {
  const config = loadConfig({ DATABASE_URL: "postgresql://user:pass@localhost:5432/alwaslh" });
  assert.equal(config.PORT, 3000);
  assert.equal(config.HOST, "0.0.0.0");
  assert.equal(config.NODE_ENV, "development");
  assert.equal(config.DATABASE_SSL, "disable");
  assert.equal(config.DATABASE_POOL_MAX, 10);
  assert.equal(config.SESSION_COOKIE_SAME_SITE, "lax");
  assert.equal(config.INTEGRATIONS_API_KEY, undefined);
  assert.equal(
    config.AI_GATEWAY_BASE_URL,
    "https://app-a8tauoehdn9d-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta",
  );
  assert.equal(config.AI_GEMINI_MODEL, "gemini-2.5-flash");
  assert.equal(config.AI_WORKER_CONCURRENCY, 2);
  assert.equal(config.AI_PROVIDER_TIMEOUT_MS, 120_000);
  assert.equal(config.AI_PROVIDER_MAX_INLINE_BYTES, 16 * 1_048_576);
});

test("loadConfig accepts bounded preview database and AI runtime settings", () => {
  const config = loadConfig({
    DATABASE_URL: "postgresql://user:pass@localhost:5432/alwaslh",
    DATABASE_SSL: "require",
    DATABASE_POOL_MAX: "2",
    SESSION_COOKIE_SAME_SITE: "none",
    INTEGRATIONS_API_KEY: "provider-key",
    AI_GATEWAY_BASE_URL: "https://gateway.example/v1beta",
    AI_GEMINI_MODEL: "gemini-2.5-flash",
    AI_WORKER_CONCURRENCY: "1",
    AI_PROVIDER_TIMEOUT_MS: "30000",
    AI_PROVIDER_MAX_INLINE_BYTES: String(4 * 1_048_576),
  });
  assert.equal(config.DATABASE_SSL, "require");
  assert.equal(config.DATABASE_POOL_MAX, 2);
  assert.equal(config.SESSION_COOKIE_SAME_SITE, "none");
  assert.equal(config.INTEGRATIONS_API_KEY, "provider-key");
  assert.equal(config.AI_WORKER_CONCURRENCY, 1);
  assert.equal(config.AI_PROVIDER_TIMEOUT_MS, 30_000);
  assert.equal(config.AI_PROVIDER_MAX_INLINE_BYTES, 4 * 1_048_576);
});

test("loadConfig rejects missing database URL", () => {
  assert.throws(() => loadConfig({}), /DATABASE_URL/);
});

test("loadConfig rejects non-PostgreSQL protocols", () => {
  assert.throws(
    () => loadConfig({ DATABASE_URL: "https://example.com/database" }),
    /postgresql:\/\/ or postgres:\/\//,
  );
});

test("loadConfig rejects excessive database pools", () => {
  assert.throws(
    () =>
      loadConfig({
        DATABASE_URL: "postgresql://user:pass@localhost:5432/alwaslh",
        DATABASE_POOL_MAX: "21",
      }),
    /DATABASE_POOL_MAX/,
  );
});

test("loadConfig rejects unsafe AI runtime bounds", () => {
  assert.throws(
    () =>
      loadConfig({
        DATABASE_URL: "postgresql://user:pass@localhost:5432/alwaslh",
        AI_WORKER_CONCURRENCY: "9",
      }),
    /AI_WORKER_CONCURRENCY/,
  );
  assert.throws(
    () =>
      loadConfig({
        DATABASE_URL: "postgresql://user:pass@localhost:5432/alwaslh",
        AI_PROVIDER_TIMEOUT_MS: "1000",
      }),
    /AI_PROVIDER_TIMEOUT_MS/,
  );
});
