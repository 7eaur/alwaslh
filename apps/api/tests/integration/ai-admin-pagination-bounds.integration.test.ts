import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Stage13E pagination-bound integration tests");

const origin = "http://localhost:5173";

function cookie(name: string, token: string): string {
  return `${name}=${encodeURIComponent(token)}`;
}

test("Stage13E rejects pagination offsets outside the safe integer boundary", async () => {
  const suffix = randomUUID();
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);

  const profiles = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'Stage13E Pagination Admin') returning id",
  );
  const adminId = profiles[0]?.id;
  assert.ok(adminId);

  const identifier = `stage13e-pagination-${suffix}`;
  const password = "Stage13EPagination42!";
  await auth.createCredential(adminId, identifier, password);
  const session = await auth.login(identifier, password);
  const sessionCookie = cookie(config.SESSION_COOKIE_NAME, session.token);

  const app = buildApp({ config, database: db });
  const resourceId = randomUUID();
  const unsafeOffset = String(Number.MAX_SAFE_INTEGER + 1);
  const cases = [
    `/v1/admin/ai/jobs?offset=${unsafeOffset}`,
    `/v1/admin/ai/jobs/${resourceId}?unitOffset=${unsafeOffset}`,
    `/v1/admin/ai/units/${resourceId}?attemptOffset=${unsafeOffset}`,
    `/v1/admin/ai/outputs/${resourceId}?reviewOffset=${unsafeOffset}`,
  ];

  try {
    for (const url of cases) {
      const response = await app.inject({
        method: "GET",
        url,
        headers: { cookie: sessionCookie },
      });
      assert.equal(response.statusCode, 400, `expected BAD_REQUEST for ${url}`);
      const body = response.json();
      assert.equal(body.error?.code, "BAD_REQUEST");
    }
  } finally {
    await app.close();
    await db.close();
  }
});
