import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../src/config.js";

test("loadConfig accepts a PostgreSQL URL and defaults", () => {
  const config = loadConfig({ DATABASE_URL: "postgresql://user:pass@localhost:5432/alwaslh" });
  assert.equal(config.PORT, 3000);
  assert.equal(config.HOST, "0.0.0.0");
  assert.equal(config.NODE_ENV, "development");
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
