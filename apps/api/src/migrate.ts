import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { loadConfig } from "./config.js";

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(here, "../../../database/migrations");
const lockId = 781534219;

function checksum(contents: string): string {
  return createHash("sha256").update(contents).digest("hex");
}

const config = loadConfig();
const client = new Client({ connectionString: config.DATABASE_URL, connectionTimeoutMillis: 5_000 });
await client.connect();

try {
  await client.query("select pg_advisory_lock($1)", [lockId]);
  await client.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      checksum_sha256 text not null,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((name) => /^\d{4}_.+\.sql$/.test(name))
    .sort((a, b) => a.localeCompare(b));

  for (const filename of files) {
    const contents = await readFile(resolve(migrationsDir, filename), "utf8");
    const hash = checksum(contents);
    const existing = await client.query<{ checksum_sha256: string }>(
      "select checksum_sha256 from schema_migrations where filename = $1",
      [filename],
    );

    if (existing.rowCount === 1) {
      if (existing.rows[0]?.checksum_sha256 !== hash) {
        throw new Error(`Applied migration changed on disk: ${filename}`);
      }
      console.log(`skip ${filename}`);
      continue;
    }

    console.log(`apply ${filename}`);
    await client.query(contents);
    await client.query("insert into schema_migrations (filename, checksum_sha256) values ($1, $2)", [
      filename,
      hash,
    ]);
  }
} finally {
  await client.query("select pg_advisory_unlock($1)", [lockId]).catch(() => undefined);
  await client.end();
}
