import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { hashToken } from "../../src/auth/crypto.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Student offline sync integration tests");
const requiredDatabaseUrl = databaseUrl;

const origin = "http://127.0.0.1:5174";

async function fixture() {
  const db = createDatabase(requiredDatabaseUrl);
  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'Stage16 sync student') returning id",
  );
  const studentId = studentRows[0]?.id;
  assert.ok(studentId);

  const keyMaterial = `stage16-sync-device-${crypto.randomUUID()}`;
  const deviceRows = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'Stage16 sync device') returning id`,
    [studentId, `fixture-${keyMaterial}`.padEnd(96, "x"), hashToken(keyMaterial)],
  );
  const deviceId = deviceRows[0]?.id;
  assert.ok(deviceId);

  const token = `stage16-sync-${crypto.randomUUID()}-${crypto.randomUUID()}`;
  await db.query(
    `insert into auth_sessions (profile_id, token_hash_sha256, device_id, expires_at)
     values ($1, $2, $3, now() + interval '1 hour')`,
    [studentId, hashToken(token), deviceId],
  );

  const classRows = await db.query<{ id: string }>(
    `insert into classes (slug, name, position, status)
     values ($1, 'Stage16 sync class', 0, 'active') returning id`,
    [`stage16-sync-class-${crypto.randomUUID()}`],
  );
  const classId = classRows[0]?.id;
  assert.ok(classId);

  const subjectRows = await db.query<{ id: string }>(
    `insert into subjects (slug, name, status)
     values ($1, 'Stage16 sync subject', 'active') returning id`,
    [`stage16-sync-subject-${crypto.randomUUID()}`],
  );
  const subjectId = subjectRows[0]?.id;
  assert.ok(subjectId);

  await db.query(
    `insert into subject_class_links (class_id, subject_id, position)
     values ($1, $2, 0)`,
    [classId, subjectId],
  );
  await db.query(
    `insert into student_entitlements (
       profile_id, scope, class_id, source, status, starts_at, expires_at
     ) values ($1, 'class', $2, 'admin', 'active', now() - interval '1 minute', now() + interval '1 day')`,
    [studentId, classId],
  );

  const lessonRows = await db.query<{ id: string }>(
    `insert into lessons (
       class_id, subject_id, slug, title, summary, position, status, published_at
     ) values ($1, $2, $3, 'Stage16 sync lesson', 'v1', 0, 'active', now()) returning id`,
    [classId, subjectId, `stage16-sync-lesson-${crypto.randomUUID()}`],
  );
  const lessonId = lessonRows[0]?.id;
  assert.ok(lessonId);

  return { db, studentId, deviceId, classId, subjectId, lessonId, token };
}

test("offline delta is entitlement-scoped, cursor-bounded and backed by tombstones", async () => {
  const f = await fixture();
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: requiredDatabaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "168",
  });
  const app = buildApp({ config, database: f.db });
  const cookie = `${config.SESSION_COOKIE_NAME}=${encodeURIComponent(f.token)}`;

  const initial = await app.inject({
    method: "GET",
    url: "/v1/student/offline/sync?after=0&limit=50",
    headers: { cookie },
  });
  assert.equal(initial.statusCode, 200);
  assert.equal(initial.headers["cache-control"], "private, no-store");
  const initialDelta = initial.json<{
    delta: {
      nextCursor: string;
      hasMore: boolean;
      entries: Array<{
        revision: string;
        entityType: string;
        entityId: string;
        changeType: string;
        classId: string | null;
        lessonId: string;
        contentRevision: number | null;
      }>;
    };
  }>().delta;
  assert.equal(initialDelta.hasMore, false);
  assert.ok(
    initialDelta.entries.some(
      (entry) =>
        entry.entityType === "lesson" && entry.lessonId === f.lessonId && entry.changeType === "upsert",
    ),
  );
  const firstCursor = initialDelta.nextCursor;
  assert.match(firstCursor, /^\d+$/);

  // Draft/unpublished changes in another class must never leak into this learner's delta.
  const otherClassRows = await f.db.query<{ id: string }>(
    `insert into classes (slug, name, status) values ($1, 'Other class', 'active') returning id`,
    [`stage16-sync-other-class-${crypto.randomUUID()}`],
  );
  const otherClassId = otherClassRows[0]?.id;
  assert.ok(otherClassId);
  await f.db.query("insert into subject_class_links (class_id, subject_id, position) values ($1, $2, 0)", [
    otherClassId,
    f.subjectId,
  ]);
  await f.db.query(
    `insert into lessons (class_id, subject_id, slug, title, status, published_at)
     values ($1, $2, $3, 'Other published lesson', 'active', now())`,
    [otherClassId, f.subjectId, `stage16-sync-other-lesson-${crypto.randomUUID()}`],
  );

  await f.db.query("update lessons set summary = 'v2' where id = $1", [f.lessonId]);
  const updateResponse = await app.inject({
    method: "GET",
    url: `/v1/student/offline/sync?after=${firstCursor}&limit=1`,
    headers: { cookie },
  });
  assert.equal(updateResponse.statusCode, 200);
  const updateDelta = updateResponse.json<{
    delta: { nextCursor: string; entries: Array<{ lessonId: string; contentRevision: number | null }> };
  }>().delta;
  assert.ok(updateDelta.entries.length <= 1);
  assert.ok(updateDelta.entries.some((entry) => entry.lessonId === f.lessonId));
  assert.ok((updateDelta.entries[0]?.contentRevision ?? 0) >= 2);

  const deleteAfter = updateDelta.nextCursor;
  await f.db.query("delete from lessons where id = $1", [f.lessonId]);
  const tombstones = await f.db.query<{ deleted_revision: string }>(
    `select deleted_revision::text
       from content_tombstones
      where entity_type = 'lesson' and entity_id = $1`,
    [f.lessonId],
  );
  assert.equal(tombstones.length, 1);

  const deleteResponse = await app.inject({
    method: "GET",
    url: `/v1/student/offline/sync?after=${deleteAfter}&limit=50`,
    headers: { cookie },
  });
  assert.equal(deleteResponse.statusCode, 200);
  const deleteDelta = deleteResponse.json<{
    delta: { entries: Array<{ lessonId: string; changeType: string; revision: string }> };
  }>().delta;
  const deletion = deleteDelta.entries.find(
    (entry) => entry.lessonId === f.lessonId && entry.changeType === "delete",
  );
  assert.ok(deletion);
  assert.equal(deletion.revision, tombstones[0]?.deleted_revision);

  await app.close();
});
