import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for lesson content integration tests");

const origin = "http://localhost:5173";

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

test("lesson-level publication manages imported draft assets without requiring an ingestion task", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);
  const adminPassword = `Lesson-${randomUUID()}-Aa1!`;

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير نشر المحتوى') returning id",
  );
  const adminId = adminRows[0]?.id;
  assert.ok(adminId);
  await auth.createCredential(adminId, `lesson-content-admin-${adminId}`, adminPassword);

  const classRows = await db.query<{ id: string }>(
    "insert into classes (slug, name, position) values ($1, 'صف نشر المحتوى', 0) returning id",
    [`lesson-content-class-${adminId}`],
  );
  const subjectRows = await db.query<{ id: string }>(
    "insert into subjects (slug, name) values ($1, 'مادة نشر المحتوى') returning id",
    [`lesson-content-subject-${adminId}`],
  );
  const classId = classRows[0]?.id;
  const subjectId = subjectRows[0]?.id;
  assert.ok(classId);
  assert.ok(subjectId);
  await db.query("insert into subject_class_links (class_id, subject_id, position) values ($1, $2, 0)", [
    classId,
    subjectId,
  ]);

  const lessonRows = await db.query<{ id: string }>(
    `insert into lessons (class_id, subject_id, slug, title, position)
     values ($1, $2, $3, 'درس مستورد بلا مهمة رفع', 0)
     returning id`,
    [classId, subjectId, `lesson-content-ready-${adminId}`],
  );
  const blockedLessonRows = await db.query<{ id: string }>(
    `insert into lessons (class_id, subject_id, slug, title, position)
     values ($1, $2, $3, 'درس بوسيط غير جاهز', 1)
     returning id`,
    [classId, subjectId, `lesson-content-blocked-${adminId}`],
  );
  const lessonId = lessonRows[0]?.id;
  const blockedLessonId = blockedLessonRows[0]?.id;
  assert.ok(lessonId);
  assert.ok(blockedLessonId);

  const readyMediaRows = await db.query<{ id: string }>(
    `insert into media_assets (
       idempotency_key, source_position, source_filename, source_mime_type,
       source_checksum_sha256, source_byte_size, status, attempt_count
     ) values
       ($1, 0, 'page-1.webp', 'image/webp', $2, 100, 'ready', 1),
       ($3, 1, 'page-2.webp', 'image/webp', $4, 100, 'ready', 1)
     returning id`,
    [
      `lesson-content-ready-a-${adminId}`,
      "a".repeat(64),
      `lesson-content-ready-b-${adminId}`,
      "b".repeat(64),
    ],
  );
  const failedMediaRows = await db.query<{ id: string }>(
    `insert into media_assets (
       idempotency_key, source_position, source_filename, source_mime_type,
       source_checksum_sha256, source_byte_size, status, attempt_count, last_error_code, last_error_message
     ) values ($1, 0, 'blocked.webp', 'image/webp', $2, 100, 'failed', 1, 'fixture_failed', 'تعذر تجهيز الوسيط')
     returning id`,
    [`lesson-content-failed-${adminId}`, "c".repeat(64)],
  );
  assert.equal(readyMediaRows.length, 2);
  const failedMediaId = failedMediaRows[0]?.id;
  assert.ok(failedMediaId);

  for (const [position, media] of readyMediaRows.entries()) {
    await db.query(
      `insert into lesson_assets (
         lesson_id, kind, position, storage_key, mime_type, byte_size, checksum_sha256,
         media_asset_id, publication_status
       ) values ($1, 'image', $2, $3, 'image/webp', 100, $4, $5, 'draft')`,
      [
        lessonId,
        position,
        `lesson-content/${lessonId}/${position}.webp`,
        position === 0 ? "a".repeat(64) : "b".repeat(64),
        media.id,
      ],
    );
  }
  await db.query(
    `insert into lesson_assets (
       lesson_id, kind, position, storage_key, mime_type, byte_size, checksum_sha256,
       media_asset_id, publication_status
     ) values ($1, 'image', 0, $2, 'image/webp', 100, $3, $4, 'draft')`,
    [blockedLessonId, `lesson-content/${blockedLessonId}/0.webp`, "c".repeat(64), failedMediaId],
  );

  const app = buildApp({ config, database: db });
  try {
    const unauthenticated = await app.inject({
      method: "GET",
      url: `/v1/admin/lesson-content/${lessonId}`,
    });
    assert.equal(unauthenticated.statusCode, 401);

    const login = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { identifier: `lesson-content-admin-${adminId}`, password: adminPassword },
    });
    assert.equal(login.statusCode, 200, login.body);
    const cookie = cookieFrom(login);

    const initial = await app.inject({
      method: "GET",
      url: `/v1/admin/lesson-content/${lessonId}`,
      headers: { cookie },
    });
    assert.equal(initial.statusCode, 200, initial.body);
    assert.deepEqual(initial.json().content.counts, {
      total: 2,
      draft: 2,
      review: 0,
      published: 0,
      reviewReady: 0,
      reviewBlocked: 0,
    });

    const submitReview = await app.inject({
      method: "PATCH",
      url: `/v1/admin/lesson-content/${lessonId}/publication`,
      headers: { origin, cookie },
      payload: { action: "submit_review" },
    });
    assert.equal(submitReview.statusCode, 200, submitReview.body);
    assert.equal(submitReview.json().content.counts.review, 2);
    assert.equal(submitReview.json().content.counts.reviewReady, 2);

    const returnDraft = await app.inject({
      method: "PATCH",
      url: `/v1/admin/lesson-content/${lessonId}/publication`,
      headers: { origin, cookie },
      payload: { action: "return_to_draft" },
    });
    assert.equal(returnDraft.statusCode, 200, returnDraft.body);
    assert.equal(returnDraft.json().content.counts.draft, 2);

    const submitAgain = await app.inject({
      method: "PATCH",
      url: `/v1/admin/lesson-content/${lessonId}/publication`,
      headers: { origin, cookie },
      payload: { action: "submit_review" },
    });
    assert.equal(submitAgain.statusCode, 200, submitAgain.body);

    const publish = await app.inject({
      method: "PATCH",
      url: `/v1/admin/lesson-content/${lessonId}/publication`,
      headers: { origin, cookie },
      payload: { action: "publish" },
    });
    assert.equal(publish.statusCode, 200, publish.body);
    assert.deepEqual(publish.json().content.counts, {
      total: 2,
      draft: 0,
      review: 0,
      published: 2,
      reviewReady: 0,
      reviewBlocked: 0,
    });
    assert.ok(publish.json().content.publishedAt);

    const publishedLesson = await db.query<{ revision: string; published_at: Date | null }>(
      "select content_revision::text as revision, published_at from lessons where id = $1",
      [lessonId],
    );
    assert.equal(publishedLesson[0]?.revision, "2");
    assert.ok(publishedLesson[0]?.published_at);

    const legacyAssets = await db.query<{ count: string }>(
      `select count(*)::text as count
         from lesson_assets
        where lesson_id = $1 and ingestion_task_id is null and publication_status = 'published'`,
      [lessonId],
    );
    assert.equal(legacyAssets[0]?.count, "2");

    const events = await db.query<{ event_type: string; asset_count: string }>(
      `select event_type, metadata->>'assetCount' as asset_count
         from curriculum_events
        where resource_type = 'lesson' and resource_key = $1
        order by created_at, id`,
      [lessonId],
    );
    assert.deepEqual(
      events.map((event) => [event.event_type, event.asset_count]),
      [
        ["lesson_content_submitted_for_review", "2"],
        ["lesson_content_returned_to_draft", "2"],
        ["lesson_content_submitted_for_review", "2"],
        ["lesson_content_published", "2"],
      ],
    );

    const blockedReview = await app.inject({
      method: "PATCH",
      url: `/v1/admin/lesson-content/${blockedLessonId}/publication`,
      headers: { origin, cookie },
      payload: { action: "submit_review" },
    });
    assert.equal(blockedReview.statusCode, 200, blockedReview.body);
    assert.equal(blockedReview.json().content.counts.reviewBlocked, 1);

    const blockedPublish = await app.inject({
      method: "PATCH",
      url: `/v1/admin/lesson-content/${blockedLessonId}/publication`,
      headers: { origin, cookie },
      payload: { action: "publish" },
    });
    assert.equal(blockedPublish.statusCode, 409, blockedPublish.body);

    const blockedLesson = await db.query<{ revision: string; published_at: Date | null }>(
      "select content_revision::text as revision, published_at from lessons where id = $1",
      [blockedLessonId],
    );
    assert.equal(blockedLesson[0]?.revision, "1");
    assert.equal(blockedLesson[0]?.published_at, null);
  } finally {
    await app.close();
  }
});
