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
});

test("loadConfig accepts bounded preview database settings", () => {
  const config = loadConfig({
    DATABASE_URL: "postgresql://user:pass@localhost:5432/alwaslh",
    DATABASE_SSL: "require",
    DATABASE_POOL_MAX: "2",
    SESSION_COOKIE_SAME_SITE: "none",
  });
  assert.equal(config.DATABASE_SSL, "require");
  assert.equal(config.DATABASE_POOL_MAX, 2);
  assert.equal(config.SESSION_COOKIE_SAME_SITE, "none");
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
