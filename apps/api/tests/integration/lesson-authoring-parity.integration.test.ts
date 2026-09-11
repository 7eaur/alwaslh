import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for lesson authoring parity tests");
const origin = "http://localhost:5173";

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

test("lesson parity keeps summary revisions consistent and exports safe canonical history", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    MEDIA_STORAGE_ROOT: "/tmp/alwaslh-stage13g-parity-media",
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);
  const suffix = randomUUID().slice(0, 8);
  const secretMarker = `SECRET-PARITY-${suffix}`;

  const adminId = (
    await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('admin', 'مدير إغلاق G-D') returning id",
    )
  )[0]?.id;
  const studentId = (
    await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('student', 'طالب إغلاق G-D') returning id",
    )
  )[0]?.id;
  assert.ok(adminId && studentId);

  const adminIdentifier = `stage13g-parity-admin-${suffix}`;
  const studentIdentifier = `stage13g-parity-student-${suffix}`;
  await auth.createCredential(adminId, adminIdentifier, "Stage13gParityAdmin123!");
  await auth.createCredential(studentId, studentIdentifier, "Stage13gParityStudent123!");
  const deviceId = (
    await db.query<{ id: string }>(
      `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
       values ($1, $2, $3, 'parity-device') returning id`,
      [studentId, "x".repeat(100), "e".repeat(64)],
    )
  )[0]?.id;
  assert.ok(deviceId);
  const studentSession = await auth.createStudentSession(studentId, deviceId, "parity-test");

  const classId = (
    await db.query<{ id: string }>("insert into classes (slug, name) values ($1, 'صف parity') returning id", [
      `stage13g-parity-class-${suffix}`,
    ])
  )[0]?.id;
  const subjectId = (
    await db.query<{ id: string }>(
      "insert into subjects (slug, name) values ($1, 'مادة parity') returning id",
      [`stage13g-parity-subject-${suffix}`],
    )
  )[0]?.id;
  assert.ok(classId && subjectId);
  await db.query("insert into subject_class_links (class_id, subject_id) values ($1, $2)", [
    classId,
    subjectId,
  ]);
  const lesson = (
    await db.query<{ id: string; content_revision: string }>(
      `insert into lessons (class_id, subject_id, slug, title)
       values ($1, $2, $3, 'درس parity')
       returning id, content_revision`,
      [classId, subjectId, `stage13g-parity-lesson-${suffix}`],
    )
  )[0];
  assert.ok(lesson);
  const baselineRevision = Number(lesson.content_revision);
  assert.ok(Number.isSafeInteger(baselineRevision) && baselineRevision > 0);

  const readRevision = async (): Promise<number> => {
    const value = (
      await db.query<{ content_revision: string }>("select content_revision from lessons where id = $1", [
        lesson.id,
      ])
    )[0]?.content_revision;
    const parsed = Number(value);
    assert.ok(Number.isSafeInteger(parsed) && parsed > 0);
    return parsed;
  };

  const app = buildApp({ config, database: db });
  try {
    const login = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { identifier: adminIdentifier, password: "Stage13gParityAdmin123!" },
    });
    assert.equal(login.statusCode, 200);
    const adminCookie = cookieFrom(login);
    const studentCookie = `${config.SESSION_COOKIE_NAME}=${studentSession.token}`;

    const patch = (summary: string | null) =>
      app.inject({
        method: "PATCH",
        url: `/v1/admin/curriculum/lessons/${lesson.id}`,
        headers: { cookie: adminCookie, origin },
        payload: { summary },
      });

    assert.equal((await patch("ملخص parity يدوي")).statusCode, 200);
    assert.equal(await readRevision(), baselineRevision + 1);

    assert.equal((await patch("ملخص parity يدوي")).statusCode, 200);
    assert.equal(
      await readRevision(),
      baselineRevision + 1,
      "saving the same summary must not create a content revision",
    );

    assert.equal((await patch(null)).statusCode, 200);
    assert.equal(await readRevision(), baselineRevision + 2);
    assert.equal((await patch("ملخص نهائي آمن")).statusCode, 200);

    const itemId = (
      await db.query<{ id: string }>(
        `insert into question_bank_items (class_id, subject_id, origin, created_by_profile_id)
         values ($1, $2, 'manual', $3) returning id`,
        [classId, subjectId, adminId],
      )
    )[0]?.id;
    assert.ok(itemId);
    const revisionId = (
      await db.query<{ id: string }>(
        `insert into question_bank_revisions (
           item_id, revision_number, status, type, prompt, options, answer_text,
           answer_status, difficulty, created_by_profile_id
         ) values ($1, 1, 'draft', 'direct', '=سؤال parity', '[]'::jsonb, 'إجابة parity', 'known', 'easy', $2)
         returning id`,
        [itemId, adminId],
      )
    )[0]?.id;
    assert.ok(revisionId);
    await db.query(
      "insert into question_bank_revision_lessons (revision_id, lesson_id, position) values ($1, $2, 0)",
      [revisionId, lesson.id],
    );
    await db.query(
      `insert into question_bank_events (item_id, revision_id, action, actor_profile_id, note)
       values ($1, $2, 'create', $3, $4)`,
      [itemId, revisionId, adminId, secretMarker],
    );
    await db.query(
      `insert into curriculum_events (actor_profile_id, resource_type, resource_key, event_type, metadata)
       values ($1, 'lesson', $2, 'parity_secret_fixture', $3::jsonb)`,
      [adminId, lesson.id, JSON.stringify({ secretMarker })],
    );
    await db.query(
      `insert into ai_jobs (
         created_by_profile_id, job_type, prompt_key, prompt_version, input_manifest, idempotency_key
       ) values ($1, 'lesson_summary', 'parity', '1', $2::jsonb, $3)`,
      [
        adminId,
        JSON.stringify({ authoring: { kind: "lesson_generation", lessonIds: [lesson.id] }, secretMarker }),
        `stage13g-parity-${randomUUID()}`,
      ],
    );

    const anonymous = await app.inject({
      method: "POST",
      url: "/v1/admin/curriculum/lesson-authoring-export",
      headers: { origin },
      payload: { lessonIds: [lesson.id] },
    });
    assert.equal(anonymous.statusCode, 401);

    const student = await app.inject({
      method: "POST",
      url: "/v1/admin/curriculum/lesson-authoring-export",
      headers: { cookie: studentCookie, origin },
      payload: { lessonIds: [lesson.id] },
    });
    assert.equal(student.statusCode, 403);

    const exported = await app.inject({
      method: "POST",
      url: "/v1/admin/curriculum/lesson-authoring-export",
      headers: { cookie: adminCookie, origin },
      payload: { lessonIds: [lesson.id] },
    });
    assert.equal(exported.statusCode, 200);
    const body = exported.json();
    assert.equal(body.counts.lessons, 1);
    assert.equal(body.counts.questions, 1);
    assert.match(body.contentCsv, /ملخص نهائي آمن/);
    assert.match(body.contentCsv, /'=سؤال parity/);
    assert.match(body.historyCsv, /curriculum/);
    assert.match(body.historyCsv, /question_bank/);
    assert.match(body.historyCsv, /ai/);
    assert.doesNotMatch(exported.body, new RegExp(secretMarker));

    const aiOnly = await app.inject({
      method: "POST",
      url: "/v1/admin/curriculum/lesson-authoring-export",
      headers: { cookie: adminCookie, origin },
      payload: { lessonIds: [lesson.id], historySource: "ai" },
    });
    assert.equal(aiOnly.statusCode, 200);
    assert.match(aiOnly.json().historyCsv, /ai/);
    assert.doesNotMatch(aiOnly.json().historyCsv, /question_bank/);
  } finally {
    await app.close();
  }
});
