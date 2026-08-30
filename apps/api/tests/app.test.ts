import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";
import type { Database, QueryExecutor } from "../src/db.js";

const config: AppConfig = {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: 3000,
  LOG_LEVEL: "silent",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
  SESSION_COOKIE_NAME: "alwaslh_session",
  SESSION_TTL_HOURS: 168,
  ALLOWED_ORIGINS: "http://localhost:5173",
};

function fakeDatabase(options: { ready?: boolean } = {}): Database {
  const executor: QueryExecutor = {
    async query() {
      return [];
    },
  };
  return {
    ...executor,
    async ping() {
      if (options.ready === false) throw new Error("db unavailable");
    },
    async transaction(work) {
      return work(executor);
    },
    async close() {},
  };
}

test("GET /health is process health only", async () => {
  const app = buildApp({ config, database: fakeDatabase({ ready: false }) });
  const response = await app.inject({ method: "GET", url: "/health" });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "ok", service: "alwaslh-api" });
  await app.close();
});

test("GET /ready returns 200 when PostgreSQL is reachable", async () => {
  const app = buildApp({ config, database: fakeDatabase() });
  const response = await app.inject({ method: "GET", url: "/ready" });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "ready" });
  await app.close();
});

test("GET /ready returns 503 when PostgreSQL is unavailable", async () => {
  const app = buildApp({ config, database: fakeDatabase({ ready: false }) });
  const response = await app.inject({ method: "GET", url: "/ready" });
  assert.equal(response.statusCode, 503);
  assert.deepEqual(response.json(), { status: "not_ready" });
  await app.close();
});

test("unknown routes use the public error envelope", async () => {
  const app = buildApp({ config, database: fakeDatabase() });
  const response = await app.inject({ method: "GET", url: "/missing" });
  assert.equal(response.statusCode, 404);
  assert.equal(response.json().error.code, "NOT_FOUND");
  await app.close();
});
