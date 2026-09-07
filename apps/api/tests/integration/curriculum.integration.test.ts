import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for curriculum integration tests");

const origin = "http://localhost:5173";

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

test("admin curriculum API preserves explicit offering scope and optional sections", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير المنهج') returning id",
  );
  const adminId = adminRows[0]?.id;
  assert.ok(adminId);
  await auth.createCredential(adminId, "stage13-curriculum-admin", "CurriculumAdmin123!");

  const app = buildApp({ config, database: db });

  const login = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    headers: { origin },
    payload: { identifier: "stage13-curriculum-admin", password: "CurriculumAdmin123!" },
  });
  assert.equal(login.statusCode, 200);
  const adminCookie = cookieFrom(login);

  const unauthenticated = await app.inject({ method: "GET", url: "/v1/admin/curriculum" });
  assert.equal(unauthenticated.statusCode, 401);

  const createClass = await app.inject({
    method: "POST",
    url: "/v1/admin/curriculum/classes",
    headers: { origin, cookie: adminCookie },
    payload: { slug: "Stage 13 Grade", name: "الصف التجريبي", position: 2 },
  });
  assert.equal(createClass.statusCode, 201);
  const classId = createClass.json().class.id as string;
  assert.equal(createClass.json().class.slug, "stage-13-grade");

  const duplicateClass = await app.inject({
    method: "POST",
    url: "/v1/admin/curriculum/classes",
    headers: { origin, cookie: adminCookie },
    payload: { slug: "stage-13-grade", name: "صف مكرر" },
  });
  assert.equal(duplicateClass.statusCode, 409);

  const createSubject = await app.inject({
    method: "POST",
    url: "/v1/admin/curriculum/subjects",
    headers: { origin, cookie: adminCookie },
    payload: { slug: "physics-stage13", name: "الفيزياء" },
  });
  assert.equal(createSubject.statusCode, 201);
  const subjectId = createSubject.json().subject.id as string;

  const createOffering = await app.inject({
    method: "POST",
    url: "/v1/admin/curriculum/offerings",
    headers: { origin, cookie: adminCookie },
    payload: { classId, subjectId, position: 4 },
  });
  assert.equal(createOffering.statusCode, 201);
  assert.equal(createOffering.json().offering.classId, classId);
  assert.equal(createOffering.json().offering.subjectId, subjectId);

  const createSection = await app.inject({
    method: "POST",
    url: "/v1/admin/curriculum/sections",
    headers: { origin, cookie: adminCookie },
    payload: {
      classId,
      subjectId,
      slug: "mechanics",
      title: "الوحدة الأولى: الميكانيكا",
      position: 1,
    },
  });
  assert.equal(createSection.statusCode, 201);
  const sectionId = createSection.json().section.id as string;

  const sectionedLesson = await app.inject({
    method: "POST",
    url: "/v1/admin/curriculum/lessons",
    headers: { origin, cookie: adminCookie },
    payload: {
      classId,
      subjectId,
      sectionId,
      slug: "newton-laws",
      title: "قوانين نيوتن",
      position: 2,
    },
  });
  assert.equal(sectionedLesson.statusCode, 201);
  const sectionedLessonId = sectionedLesson.json().lesson.id as string;
  assert.equal(sectionedLesson.json().lesson.sectionId, sectionId);

  const unsectionedLesson = await app.inject({
    method: "POST",
    url: "/v1/admin/curriculum/lessons",
    headers: { origin, cookie: adminCookie },
    payload: {
      classId,
      subjectId,
      slug: "intro-physics",
      title: "مدخل إلى الفيزياء",
      position: 0,
    },
  });
  assert.equal(unsectionedLesson.statusCode, 201);
  assert.equal(unsectionedLesson.json().lesson.sectionId, null);

  const secondClass = await app.inject({
    method: "POST",
    url: "/v1/admin/curriculum/classes",
    headers: { origin, cookie: adminCookie },
    payload: { slug: "stage-13-grade-two", name: "صف ثان", position: 3 },
  });
  assert.equal(secondClass.statusCode, 201);
  const secondClassId = secondClass.json().class.id as string;

  const secondOffering = await app.inject({
    method: "POST",
    url: "/v1/admin/curriculum/offerings",
    headers: { origin, cookie: adminCookie },
    payload: { classId: secondClassId, subjectId, position: 1 },
  });
  assert.equal(secondOffering.statusCode, 201);

  const crossScopeLesson = await app.inject({
    method: "POST",
    url: "/v1/admin/curriculum/lessons",
    headers: { origin, cookie: adminCookie },
    payload: {
      classId: secondClassId,
      subjectId,
      sectionId,
      slug: "invalid-cross-scope",
      title: "درس غير صالح",
    },
  });
  assert.equal(crossScopeLesson.statusCode, 409);

  await assert.rejects(
    db.query(
      `insert into lessons (class_id, subject_id, section_id, slug, title)
       values ($1, $2, $3, 'direct-invalid-cross-scope', 'ربط مباشر غير صالح')`,
      [secondClassId, subjectId, sectionId],
    ),
    (error) => error instanceof Error && error.message.includes("lessons_section_scope_fk"),
  );

  const detachSection = await app.inject({
    method: "PATCH",
    url: `/v1/admin/curriculum/lessons/${sectionedLessonId}`,
    headers: { origin, cookie: adminCookie },
    payload: { sectionId: null, summary: "تم نقل الدرس خارج الوحدة دون حذف محتواه" },
  });
  assert.equal(detachSection.statusCode, 200);
  assert.equal(detachSection.json().lesson.sectionId, null);

  const renameSection = await app.inject({
    method: "PATCH",
    url: `/v1/admin/curriculum/sections/${sectionId}`,
    headers: { origin, cookie: adminCookie },
    payload: { title: "الميكانيكا", status: "inactive" },
  });
  assert.equal(renameSection.statusCode, 200);
  assert.equal(renameSection.json().section.status, "inactive");

  const pauseOffering = await app.inject({
    method: "PATCH",
    url: `/v1/admin/curriculum/offerings/${classId}/${subjectId}`,
    headers: { origin, cookie: adminCookie },
    payload: { position: 5, status: "inactive" },
  });
  assert.equal(pauseOffering.statusCode, 200);
  assert.equal(pauseOffering.json().offering.status, "inactive");

  const snapshot = await app.inject({
    method: "GET",
    url: "/v1/admin/curriculum",
    headers: { cookie: adminCookie },
  });
  assert.equal(snapshot.statusCode, 200);
  const curriculum = snapshot.json().curriculum;
  assert.ok((curriculum.classes as Array<{ id: string }>).some((record) => record.id === classId));
  assert.ok((curriculum.subjects as Array<{ id: string }>).some((record) => record.id === subjectId));
  assert.ok(
    (curriculum.sections as Array<{ id: string; status: string }>).some(
      (record) => record.id === sectionId && record.status === "inactive",
    ),
  );
  assert.ok(
    (curriculum.lessons as Array<{ id: string; sectionId: string | null }>).some(
      (record) => record.id === sectionedLessonId && record.sectionId === null,
    ),
  );

  const archiveClass = await app.inject({
    method: "PATCH",
    url: `/v1/admin/curriculum/classes/${classId}`,
    headers: { origin, cookie: adminCookie },
    payload: { status: "archived" },
  });
  assert.equal(archiveClass.statusCode, 200);
  assert.equal(archiveClass.json().class.status, "archived");

  const persistedLessons = await db.query<{ count: string }>(
    "select count(*)::text as count from lessons where class_id = $1 and subject_id = $2",
    [classId, subjectId],
  );
  assert.equal(Number(persistedLessons[0]?.count), 2);

  const events = await db.query<{ count: string; actor_count: string }>(
    `select count(*)::text as count,
            count(*) filter (where actor_profile_id = $1)::text as actor_count
       from curriculum_events`,
    [adminId],
  );
  assert.ok(Number(events[0]?.count) >= 10);
  assert.equal(events[0]?.count, events[0]?.actor_count);

  const destructiveDelete = await app.inject({
    method: "DELETE",
    url: `/v1/admin/curriculum/lessons/${sectionedLessonId}`,
    headers: { origin, cookie: adminCookie },
  });
  assert.equal(destructiveDelete.statusCode, 404);

  await app.close();
});
