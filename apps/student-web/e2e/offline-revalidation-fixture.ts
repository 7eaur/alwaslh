import { createDatabase } from "../../api/src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for offline revalidation fixture");

const [action, studentId, classId, lessonId] = process.argv.slice(2);
if (!action || !studentId || !classId || !lessonId) {
  throw new Error("usage: offline-revalidation-fixture <action> <studentId> <classId> <lessonId>");
}

const db = createDatabase(databaseUrl);
try {
  switch (action) {
    case "expire-entitlement":
      await db.query(
        `update student_entitlements
         set expires_at = now() - interval '1 minute'
         where profile_id = $1 and class_id = $2 and status = 'active'`,
        [studentId, classId],
      );
      break;
    case "restore-entitlement":
      await db.query(
        `update student_entitlements
         set expires_at = now() + interval '30 days'
         where profile_id = $1 and class_id = $2 and status = 'active'`,
        [studentId, classId],
      );
      break;
    case "bump-revision":
      await db.query(
        `update lessons set content_revision = content_revision + 1 where id = $1`,
        [lessonId],
      );
      break;
    case "unpublish":
      await db.query(
        `update lessons set published_at = null where id = $1`,
        [lessonId],
      );
      break;
    default:
      throw new Error(`unknown offline revalidation action: ${action}`);
  }
} finally {
  await db.close();
}
