import { loadConfig } from "../config.js";
import { createDatabase } from "../db.js";
import { FileSystemMediaStorage } from "../media/storage.js";
import { bootstrapLegacySubject } from "./legacy-subject-bootstrap.js";

const classSlug = process.argv[2];
const subjectSlug = process.argv[3];

if (!classSlug || !subjectSlug) {
  throw new Error("Usage: npm run content:bootstrap-legacy-subject -- <classSlug> <subjectSlug>");
}

const config = loadConfig();
const database = createDatabase(config.DATABASE_URL, {
  ssl: config.DATABASE_SSL === "require",
  maxConnections: config.DATABASE_POOL_MAX,
});
const storage = new FileSystemMediaStorage(config.MEDIA_STORAGE_ROOT);

try {
  const result = await bootstrapLegacySubject({
    database,
    storage,
    classSlug,
    subjectSlug,
    onProgress(completed, total, filename) {
      if (completed === 1 || completed === total || completed % 10 === 0) {
        console.log(
          JSON.stringify({
            event: "legacy_subject_bootstrap_progress",
            completed,
            total,
            filename,
          }),
        );
      }
    },
  });
  console.log(JSON.stringify({ event: "legacy_subject_bootstrap_complete", ...result }));
} finally {
  await database.close();
}
