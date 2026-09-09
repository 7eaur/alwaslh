import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import Fastify from "fastify";
import type { AdminAiOperationsService } from "../src/ai/admin-operations.js";
import { registerAdminAiOperationsRoutes } from "../src/ai/admin-operations-http.js";
import type { AuthService } from "../src/auth/service.js";
import { loadConfig } from "../src/config.js";
import { toPublicError } from "../src/errors.js";

test("Stage13E rejects unsafe pagination offsets before service execution", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/alwaslh_unit_test",
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: "http://localhost:5173",
    SESSION_TTL_HOURS: "24",
  });
  const sessionToken = "stage13e-pagination-session";
  const auth = {
    async authenticate(token: string | undefined) {
      assert.equal(token, sessionToken);
      return { id: randomUUID(), role: "admin" as const, displayName: "Pagination Admin" };
    },
  } as unknown as AuthService;

  const calls: Array<{ method: string; offset: number }> = [];
  const operations = {
    async listJobs(input: { offset: number; limit: number }) {
      calls.push({ method: "jobs", offset: input.offset });
      return { jobs: [], pagination: { total: 0, limit: input.limit, offset: input.offset } };
    },
    async jobDetail(_id: string, _limit: number, offset: number) {
      calls.push({ method: "job", offset });
      return {};
    },
    async unitDetail(_id: string, _limit: number, offset: number) {
      calls.push({ method: "unit", offset });
      return {};
    },
    async outputDetail(_id: string, _limit: number, offset: number) {
      calls.push({ method: "output", offset });
      return {};
    },
  } as unknown as AdminAiOperationsService;

  const app = Fastify({ logger: false });
  app.setErrorHandler((error, _request, reply) => {
    const publicError = toPublicError(error);
    return reply.code(publicError.statusCode).send(publicError.body);
  });
  registerAdminAiOperationsRoutes(app, config, auth, operations);

  const headers = { cookie: `${config.SESSION_COOKIE_NAME}=${sessionToken}` };
  const resourceId = randomUUID();
  const unsafeOffset = String(Number.MAX_SAFE_INTEGER + 1);
  const unsafeUrls = [
    `/v1/admin/ai/jobs?offset=${unsafeOffset}`,
    `/v1/admin/ai/jobs/${resourceId}?unitOffset=${unsafeOffset}`,
    `/v1/admin/ai/units/${resourceId}?attemptOffset=${unsafeOffset}`,
    `/v1/admin/ai/outputs/${resourceId}?reviewOffset=${unsafeOffset}`,
  ];

  try {
    for (const url of unsafeUrls) {
      const response = await app.inject({ method: "GET", url, headers });
      assert.equal(response.statusCode, 400, `expected BAD_REQUEST for ${url}`);
      assert.equal(response.json().error?.code, "BAD_REQUEST");
    }
    assert.deepEqual(calls, []);

    const safeResponse = await app.inject({
      method: "GET",
      url: `/v1/admin/ai/jobs?offset=${Number.MAX_SAFE_INTEGER}`,
      headers,
    });
    assert.equal(safeResponse.statusCode, 200);
    assert.deepEqual(calls, [{ method: "jobs", offset: Number.MAX_SAFE_INTEGER }]);
  } finally {
    await app.close();
  }
});
