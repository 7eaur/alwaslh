import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../../src/app.js";
import { hashToken } from "../../src/auth/crypto.js";
import { loadConfig } from "../../src/config.js";
import { CurriculumService } from "../../src/curriculum/service.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for Student curriculum integration tests");

const origin = "http://127.0.0.1:5174";

type TestDatabase = ReturnType<typeof createDatabase>;

async function createStudentDevice(db: TestDatabase, profileId: string): Promise<string> {
  const keyMaterial = `stage14-device-${crypto.randomUUID()}`;
  const rows = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'Stage14 curriculum integration fixture')
     returning id`,
    [profileId, `fixture-${keyMaterial}`.padEnd(96, "x"), hashToken(keyMaterial)],
  );
  const id = rows[0]?.id;
  assert.ok(id);
  return id;
}

async function sessionCookie(
  db: TestDatabase,
  cookieName: string,
  profileId: string,
  deviceId: string | null = null,
): Promise<string> {
  const token = `stage14-${crypto.randomUUID()}-${crypto.randomUUID()}`;
  await db.query(
    `insert into auth_sessions (profile_id, token_hash_sha256, device_id, expires_at)
     values ($1, $2, $3, now() + interval '1 hour')`,
    [profileId, hashToken(token), deviceId],
  );
  return `${cookieName}=${encodeURIComponent(token)}`;
}

test("Student curriculum is session-protected, entitlement-filtered and publication-safe", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
  });
  const db = createDatabase(databaseUrl);

  const actorRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'Stage14 curriculum fixture') returning id",
  );
  const adminId = actorRows[0]?.id;
  assert.ok(adminId);

  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب الصف المحدد') returning id",
  );
  const studentId = studentRows[0]?.id;
  assert.ok(studentId);

  const fullStudentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب الوصول الكامل') returning id",
  );
  const fullStudentId = fullStudentRows[0]?.id;
  assert.ok(fullStudentId);

  const curriculum = new CurriculumService(db);
  const classOne = await curriculum.createClass(adminId, {
    slug: `stage14-student-${crypto.randomUUID()}`,
    name: "الصف الأول التجريبي",
    description: "صف يجب أن يظهر لصاحب الصلاحية",
    position: 2,
    status: "active",
  });
  const classTwo = await curriculum.createClass(adminId, {
    slug: `stage14-hidden-${crypto.randomUUID()}`,
    name: "الصف الثاني التجريبي",
    description: "صف لا يجب أن يظهر لصلاحية منتهية",
    position: 1,
    status: "active",
  });
  const subject = await curriculum.createSubject(adminId, {
    slug: `stage14-physics-${crypto.randomUUID()}`,
    name: "الفيزياء",
    description: "مادة تجريبية",
    status: "active",
  });
  await curriculum.createOffering(adminId, {
    classId: classOne.id,
    subjectId: subject.id,
    position: 3,
    status: "active",
  });
  await curriculum.createOffering(adminId, {
    classId: classTwo.id,
    subjectId: subject.id,
    position: 1,
    status: "active",
  });
  const section = await curriculum.createSection(adminId, {
    classId: classOne.id,
    subjectId: subject.id,
    slug: `stage14-mechanics-${crypto.randomUUID()}`,
    title: "الميكانيكا",
    position: 2,
    status: "active",
  });
  const unsectioned = await curriculum.createLesson(adminId, {
    classId: classOne.id,
    subjectId: subject.id,
    slug: `stage14-intro-${crypto.randomUUID()}`,
    title: "مدخل إلى الفيزياء",
    summary: "ملخص منشور خارج الوحدات",
    position: 0,
    status: "active",
  });
  const sectioned = await curriculum.createLesson(adminId, {
    classId: classOne.id,
    subjectId: subject.id,
    sectionId: section.id,
    slug: `stage14-newton-${crypto.randomUUID()}`,
    title: "قوانين نيوتن",
    summary: "ملخص منشور داخل الوحدة",
    position: 1,
    status: "active",
  });
  const draft = await curriculum.createLesson(adminId, {
    classId: classOne.id,
    subjectId: subject.id,
    slug: `stage14-draft-${crypto.randomUUID()}`,
    title: "درس مسودة",
    position: 2,
    status: "active",
  });
  const otherClassLesson = await curriculum.createLesson(adminId, {
    classId: classTwo.id,
    subjectId: subject.id,
    slug: `stage14-other-${crypto.randomUUID()}`,
    title: "درس صف آخر",
    position: 0,
    status: "active",
  });

  await db.query(
    `update lessons
        set published_at = now() - interval '1 minute'
      where id = any($1::uuid[])`,
    [[unsectioned.id, sectioned.id, otherClassLesson.id]],
  );
  await db.query(
    `insert into student_entitlements (profile_id, scope, class_id, source, starts_at, expires_at)
     values ($1, 'class', $2, 'admin', now() - interval '1 day', now() + interval '30 days')`,
    [studentId, classOne.id],
  );
  await db.query(
    `insert into student_entitlements (profile_id, scope, class_id, source, starts_at, expires_at)
     values ($1, 'class', $2, 'admin', now() - interval '30 days', now() - interval '1 day')`,
    [studentId, classTwo.id],
  );
  await db.query(
    `insert into student_entitlements (profile_id, scope, source, starts_at, expires_at)
     values ($1, 'all_content', 'admin', now() - interval '1 day', now() + interval '30 days')`,
    [fullStudentId],
  );

  const studentDeviceId = await createStudentDevice(db, studentId);
  const fullStudentDeviceId = await createStudentDevice(db, fullStudentId);
  const studentCookie = await sessionCookie(db, config.SESSION_COOKIE_NAME, studentId, studentDeviceId);
  const fullStudentCookie = await sessionCookie(
    db,
    config.SESSION_COOKIE_NAME,
    fullStudentId,
    fullStudentDeviceId,
  );
  const adminCookie = await sessionCookie(db, config.SESSION_COOKIE_NAME, adminId);
  const app = buildApp({ config, database: db });

  try {
    const unauthenticated = await app.inject({ method: "GET", url: "/v1/student/curriculum" });
    assert.equal(unauthenticated.statusCode, 401);

    const adminRejected = await app.inject({
      method: "GET",
      url: "/v1/student/curriculum",
      headers: { cookie: adminCookie },
    });
    assert.equal(adminRejected.statusCode, 403);

    const limited = await app.inject({
      method: "GET",
      url: "/v1/student/curriculum",
      headers: { cookie: studentCookie },
    });
    assert.equal(limited.statusCode, 200);
    const limitedClasses = limited.json().curriculum.classes as Array<{
      id: string;
      subjects: Array<{
        id: string;
        position: number;
        unsectionedLessons: Array<{ id: string; title: string }>;
        sections: Array<{ id: string; lessons: Array<{ id: string; title: string }> }>;
      }>;
    }>;
    assert.deepEqual(
      limitedClasses.map((record) => record.id),
      [classOne.id],
    );
    assert.equal(limitedClasses[0]?.subjects[0]?.id, subject.id);
    assert.equal(limitedClasses[0]?.subjects[0]?.position, 3);
    assert.deepEqual(
      limitedClasses[0]?.subjects[0]?.unsectionedLessons.map((lesson) => lesson.id),
      [unsectioned.id],
    );
    assert.deepEqual(
      limitedClasses[0]?.subjects[0]?.sections[0]?.lessons.map((lesson) => lesson.id),
      [sectioned.id],
    );
    assert.equal(JSON.stringify(limited.json()).includes(draft.id), false);
    assert.equal(JSON.stringify(limited.json()).includes(otherClassLesson.id), false);

    const allContent = await app.inject({
      method: "GET",
      url: "/v1/student/curriculum",
      headers: { cookie: fullStudentCookie },
    });
    assert.equal(allContent.statusCode, 200);
    const allClassIds = (allContent.json().curriculum.classes as Array<{ id: string }>).map(
      (record) => record.id,
    );
    assert.deepEqual(allClassIds, [classTwo.id, classOne.id]);
    assert.equal(JSON.stringify(allContent.json()).includes(otherClassLesson.id), true);
    assert.equal(JSON.stringify(allContent.json()).includes(draft.id), false);
  } finally {
    await db.query("delete from student_entitlements where profile_id = any($1::uuid[])", [
      [studentId, fullStudentId],
    ]);
    await db.query("delete from lessons where id = any($1::uuid[])", [
      [unsectioned.id, sectioned.id, draft.id, otherClassLesson.id],
    ]);
    await db.query("delete from curriculum_sections where id = $1", [section.id]);
    await db.query("delete from subject_class_links where subject_id = $1 and class_id = any($2::uuid[])", [
      subject.id,
      [classOne.id, classTwo.id],
    ]);
    await db.query("delete from classes where id = any($1::uuid[])", [[classOne.id, classTwo.id]]);
    await db.query("delete from subjects where id = $1", [subject.id]);
    await db.query("delete from profiles where id = any($1::uuid[])", [[adminId, studentId, fullStudentId]]);
    await app.close();
  }
});
