import assert from "node:assert/strict";
import test from "node:test";
import { AccessService } from "../../src/access/service.js";
import { buildApp } from "../../src/app.js";
import { validateDevicePublicKey } from "../../src/auth/device-crypto.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";
import { createTestDeviceKey } from "../device-test-key.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for notification/operations integration tests");

const origin = "http://localhost:5173";

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

test("Admin notifications share one authority with Student visibility and the operations dashboard", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);
  const access = new AccessService(db);

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير الإشعارات') returning id",
  );
  const studentRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('student', 'طالب الإشعارات') returning id",
  );
  const classRows = await db.query<{ id: string }>(
    "insert into classes (slug, name) values ('stage13g-notif-class', 'صف الإشعارات') returning id",
  );
  const subjectRows = await db.query<{ id: string }>(
    "insert into subjects (slug, name) values ('stage13g-notif-subject', 'مادة الإشعارات') returning id",
  );
  const adminId = adminRows[0]?.id;
  const studentId = studentRows[0]?.id;
  const classId = classRows[0]?.id;
  const subjectId = subjectRows[0]?.id;
  assert.ok(adminId && studentId && classId && subjectId);

  await db.query(
    "insert into subject_class_links (class_id, subject_id) values ($1, $2)",
    [classId, subjectId],
  );
  await db.query(
    `insert into lessons (class_id, subject_id, slug, title)
     values ($1, $2, 'stage13g-notif-lesson', 'درس الإشعارات')`,
    [classId, subjectId],
  );
  await db.query(
    `insert into student_entitlements (profile_id, scope, class_id, source, status, expires_at)
     values ($1, 'class', $2, 'admin', 'active', now() + interval '30 days')`,
    [studentId, classId],
  );

  await auth.createCredential(adminId, "stage13g-notif-admin", "Stage13gNotifAdmin123!");
  await auth.createCredential(studentId, "stage13g-notif-student", "Stage13gNotifStudent123!");

  const key = createTestDeviceKey();
  const validated = validateDevicePublicKey(key.publicKeySpki);
  const deviceRows = await db.query<{ id: string }>(
    `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
     values ($1, $2, $3, 'notification-integration') returning id`,
    [studentId, validated.publicKeySpki, validated.fingerprintSha256],
  );
  const deviceId = deviceRows[0]?.id;
  assert.ok(deviceId);

  await access.generateFullCodes(adminId, 1, 60);
  await access.generateClassCodes(adminId, classId, 1, 30);

  const app = buildApp({ config, database: db });

  const adminLogin = await app.inject({
    method: "POST",
    url: "/v1/auth/login",
    headers: { origin },
    payload: { identifier: "stage13g-notif-admin", password: "Stage13gNotifAdmin123!" },
  });
  assert.equal(adminLogin.statusCode, 200);
  const adminCookie = cookieFrom(adminLogin);

  const studentSession = await auth.createStudentSession(studentId, deviceId, "stage13g-notification-test");
  const studentCookie = `${config.SESSION_COOKIE_NAME}=${studentSession.token}`;

  const invalidCreate = await app.inject({
    method: "POST",
    url: "/v1/admin/notifications",
    headers: { origin, cookie: adminCookie },
    payload: { title: "   ", body: "نص صالح" },
  });
  assert.equal(invalidCreate.statusCode, 400);

  const globalCreate = await app.inject({
    method: "POST",
    url: "/v1/admin/notifications",
    headers: { origin, cookie: adminCookie },
    payload: {
      title: "إشعار عام تجريبي",
      body: "هذا إشعار يصل إلى جميع الطلاب.",
      severity: "info",
      actionPath: "/student",
    },
  });
  assert.equal(globalCreate.statusCode, 201);
  const globalId = globalCreate.json().notification.id as string;
  assert.ok(globalId);

  const classCreate = await app.inject({
    method: "POST",
    url: "/v1/admin/notifications",
    headers: { origin, cookie: adminCookie },
    payload: {
      title: "إشعار صف تجريبي",
      body: "هذا الإشعار لطلاب الصف ذوي الصلاحية النشطة.",
      severity: "warning",
      targetClassId: classId,
    },
  });
  assert.equal(classCreate.statusCode, 201);
  const classIdNotification = classCreate.json().notification.id as string;

  const adminList = await app.inject({
    method: "GET",
    url: "/v1/admin/notifications?search=%D8%AA%D8%AC%D8%B1%D9%8A%D8%A8%D9%8A&limit=10&offset=0",
    headers: { cookie: adminCookie },
  });
  assert.equal(adminList.statusCode, 200);
  assert.equal(adminList.json().page.total, 2);

  const studentList = await app.inject({
    method: "GET",
    url: "/v1/student/notifications?limit=10&offset=0",
    headers: { cookie: studentCookie },
  });
  assert.equal(studentList.statusCode, 200);
  const visibleIds = (studentList.json().notifications as Array<{ id: string }>).map((item) => item.id);
  assert.ok(visibleIds.includes(globalId));
  assert.ok(visibleIds.includes(classIdNotification));
  assert.equal(studentList.json().unreadCount, 2);

  const markRead = await app.inject({
    method: "POST",
    url: `/v1/student/notifications/${globalId}/read`,
    headers: { origin, cookie: studentCookie },
  });
  assert.equal(markRead.statusCode, 204);

  const afterRead = await app.inject({
    method: "GET",
    url: "/v1/student/notifications?limit=10&offset=0",
    headers: { cookie: studentCookie },
  });
  assert.equal(afterRead.statusCode, 200);
  assert.equal(afterRead.json().unreadCount, 1);
  const globalAfterRead = (afterRead.json().notifications as Array<{ id: string; readAt: string | null }>).find(
    (item) => item.id === globalId,
  );
  assert.ok(globalAfterRead?.readAt);

  const overview = await app.inject({
    method: "GET",
    url: "/v1/admin/operations/overview?recentLimit=10",
    headers: { cookie: adminCookie },
  });
  assert.equal(overview.statusCode, 200);
  assert.equal(overview.json().metrics.activeClasses, 1);
  assert.equal(overview.json().metrics.activeSubjects, 1);
  assert.equal(overview.json().metrics.activeLessons, 1);
  assert.equal(overview.json().metrics.activeStudents, 1);
  assert.equal(overview.json().metrics.studentsWithAccess, 1);
  assert.equal(overview.json().metrics.activeFullCodes, 1);
  assert.equal(overview.json().metrics.activeClassCodes, 1);
  assert.equal(overview.json().metrics.activeNotifications, 2);
  assert.ok((overview.json().recentNotifications as Array<{ id: string }>).some((item) => item.id === globalId));
  assert.ok((overview.json().recentActivity as Array<{ source: string }>).some((item) => item.source === "access"));
  assert.ok((overview.json().recentActivity as Array<{ source: string }>).some((item) => item.source === "auth"));

  const studentForbiddenOverview = await app.inject({
    method: "GET",
    url: "/v1/admin/operations/overview",
    headers: { cookie: studentCookie },
  });
  assert.equal(studentForbiddenOverview.statusCode, 403);

  const removeGlobal = await app.inject({
    method: "DELETE",
    url: `/v1/admin/notifications/${globalId}`,
    headers: { origin, cookie: adminCookie },
  });
  assert.equal(removeGlobal.statusCode, 204);

  const afterDelete = await app.inject({
    method: "GET",
    url: "/v1/student/notifications?limit=10&offset=0",
    headers: { cookie: studentCookie },
  });
  assert.equal(afterDelete.statusCode, 200);
  assert.deepEqual(
    (afterDelete.json().notifications as Array<{ id: string }>).map((item) => item.id),
    [classIdNotification],
  );
  assert.equal(afterDelete.json().unreadCount, 1);

  const anonymousStudentFeed = await app.inject({
    method: "GET",
    url: "/v1/student/notifications",
  });
  assert.equal(anonymousStudentFeed.statusCode, 401);

  await app.close();
});
