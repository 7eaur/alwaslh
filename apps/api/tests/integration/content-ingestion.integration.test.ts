import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import sharp from "sharp";
import { buildApp } from "../../src/app.js";
import { AuthService } from "../../src/auth/service.js";
import { loadConfig } from "../../src/config.js";
import { createDatabase } from "../../src/db.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for content ingestion integration tests");

const origin = "http://localhost:5173";
const pdfFixture = Buffer.from(
  "JVBERi0xLjMKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMSAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL0NvbnRlbnRzIDggMCBSIC9NZWRpYUJveCBbIDAgMCAyMDAgMjYwIF0gL1BhcmVudCA3IDAgUiAvUmVzb3VyY2VzIDw8Ci9Gb250IDEgMCBSIC9Qcm9jU2V0IFsgL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSSBdCj4+IC9Sb3RhdGUgMCAvVHJhbnMgPDwKCj4+IAogIC9UeXBlIC9QYWdlCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9Db250ZW50cyA5IDAgUiAvTWVkaWFCb3ggWyAwIDAgMjAwIDI2MCBdIC9QYXJlbnQgNyAwIFIgL1Jlc291cmNlcyA8PAovRm9udCAxIDAgUiAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXQo+PiAvUm90YXRlIDAgL1RyYW5zIDw8Cgo+PiAKICAvVHlwZSAvUGFnZQo+PgplbmRvYmoKNSAwIG9iago8PAovUGFnZU1vZGUgL1VzZU5vbmUgL1BhZ2VzIDcgMCBSIC9UeXBlIC9DYXRhbG9nCj4+CmVuZG9iago2IDAgb2JqCjw8Ci9BdXRob3IgKGFub255bW91cykgL0NyZWF0aW9uRGF0ZSAoRDoyMDI2MDkwODAxMDk0MCswMCcwMCcpIC9DcmVhdG9yIChhbm9ueW1vdXMpIC9LZXl3b3JkcyAoKSAvTW9kRGF0ZSAoRDoyMDI2MDkwODAxMDk0MCswMCcwMCcpIC9Qcm9kdWNlciAoUmVwb3J0TGFiIFBERiBMaWJyYXJ5IC0gXChvcGVuc291cmNlXCkpIAogIC9TdWJqZWN0ICh1bnNwZWNpZmllZCkgL1RpdGxlICh1bnRpdGxlZCkgL1RyYXBwZWQgL0ZhbHNlCj4+CmVuZG9iago3IDAgb2JqCjw8Ci9Db3VudCAyIC9LaWRzIFsgMyAwIFIgNCAwIFIgXSAvVHlwZSAvUGFnZXMKPj4KZW5kb2JqCjggMCBvYmoKPDwKL0xlbmd0aCA4MQo+PgpzdHJlYW0KMSAwIDAgMSAwIDAgY20gIEJUIC9GMSAxMiBUZiAxNC40IFRMIEVUCkJUIDEgMCAwIDEgMjAgMjAwIFRtIChQYWdlIDEpIFRqIFQqIEVUCiAKZW5kc3RyZWFtCmVuZG9iago5IDAgb2JqCjw8Ci9MZW5ndGggODEKPj4Kc3RyZWFtCjEgMCAwIDEgMCAwIGNtICBCVCAvRjEgMTIgVGYgMTQuNCBUTCBFVApCVCAxIDAgMCAxIDIwIDIwMCBUbSAoUGFnZSAyKSBUaiBUKiBFVAogCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDEwCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDA2MSAwMDAwMCBuIAowMDAwMDAwMDkyIDAwMDAwIG4gCjAwMDAwMDAxOTkgMDAwMDAgbiAKMDAwMDAwMDM5MiAwMDAwMCBuIAowMDAwMDAwNTg1IDAwMDAwIG4gCjAwMDAwMDA2NTMgMDAwMDAgbiAKMDAwMDAwMDkxNCAwMDAwMCBuIAowMDAwMDAwOTc5IDAwMDAwIG4gCjAwMDAwMDExMDkgMDAwMDAgbiAKdHJhaWxlcgo8PAovSUQgCls8NGM0YTRlZTNiYmI2NmM5NTcxZGUzMGJlNWI4ZjM0MmE+PDRjNGE0ZWUzYmJiNjZjOTU3MWRlMzBiZTViOGYzNDJhPl0KJSBSZXBvcnRMYWIgZ2VuZXJhdGVkIFBERiBkb2N1bWVudCAtLSBkaWdlc3QgKG9wZW5zb3VyY2UpCgovSW5mbyA2IDAgUgovUm9vdCA1IDAgUgovU2l6ZSAxMAo+PgpzdGFydHhyZWYKMTIzOQolJUVPRgo=",
  "base64",
);

function cookieFrom(response: { headers: Record<string, string | string[] | number | undefined> }): string {
  const raw = response.headers["set-cookie"];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value === "number") throw new Error("Expected Set-Cookie header");
  return value.split(";", 1)[0] ?? "";
}

test("Admin mixed ingestion preserves order, keeps ready media unpublished, then links and publishes explicitly", async () => {
  const storageRoot = await mkdtemp(join(tmpdir(), "alwaslh-stage13d-"));
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: databaseUrl,
    LOG_LEVEL: "silent",
    ALLOWED_ORIGINS: origin,
    SESSION_TTL_HOURS: "24",
    MEDIA_STORAGE_ROOT: storageRoot,
  });
  const db = createDatabase(databaseUrl);
  const auth = new AuthService(db, config.SESSION_TTL_HOURS);
  const imageFixture = await sharp({
    create: { width: 200, height: 260, channels: 3, background: { r: 245, g: 245, b: 245 } },
  })
    .jpeg({ quality: 85 })
    .toBuffer();

  const adminRows = await db.query<{ id: string }>(
    "insert into profiles (role, display_name) values ('admin', 'مدير رفع المحتوى') returning id",
  );
  const adminId = adminRows[0]?.id;
  assert.ok(adminId);
  await auth.createCredential(adminId, `stage13d-admin-${adminId}`, "Stage13dAdminPass123!");

  const classRows = await db.query<{ id: string }>(
    `insert into classes (slug, name, position) values ($1, 'صف اختبار الرفع', 0) returning id`,
    [`stage13d-class-${adminId}`],
  );
  const subjectRows = await db.query<{ id: string }>(
    `insert into subjects (slug, name) values ($1, 'مادة اختبار الرفع') returning id`,
    [`stage13d-subject-${adminId}`],
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
     values ($1, $2, $3, 'درس الرفع المختلط', 0)
     returning id`,
    [classId, subjectId, `stage13d-lesson-${adminId}`],
  );
  const lessonId = lessonRows[0]?.id;
  assert.ok(lessonId);

  const app = buildApp({ config, database: db });
  try {
    const login = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { identifier: `stage13d-admin-${adminId}`, password: "Stage13dAdminPass123!" },
    });
    assert.equal(login.statusCode, 200);
    const cookie = cookieFrom(login);

    const unauthenticated = await app.inject({ method: "GET", url: "/v1/admin/content-ingestions" });
    assert.equal(unauthenticated.statusCode, 401);

    const studentRows = await db.query<{ id: string }>(
      "insert into profiles (role, display_name) values ('student', 'طالب غير مخول') returning id",
    );
    const studentId = studentRows[0]?.id;
    assert.ok(studentId);
    await auth.createCredential(studentId, `stage13d-student-${studentId}`, "Stage13dStudentPass123!");
    const deviceRows = await db.query<{ id: string }>(
      `insert into student_devices (profile_id, public_key_spki, public_key_sha256, label)
       values ($1, $2, $3, 'Stage13D integration device')
       returning id`,
      [studentId, `integration-device-${"x".repeat(96)}`, "d".repeat(64)],
    );
    const deviceId = deviceRows[0]?.id;
    assert.ok(deviceId);
    const studentSession = await auth.createStudentSession(studentId, deviceId, "stage13d-integration");
    const studentCookie = `${config.SESSION_COOKIE_NAME}=${encodeURIComponent(studentSession.token)}`;
    const forbidden = await app.inject({
      method: "GET",
      url: "/v1/admin/content-ingestions",
      headers: { origin, cookie: studentCookie },
    });
    assert.equal(forbidden.statusCode, 403);

    const createResponse = await app.inject({
      method: "POST",
      url: "/v1/admin/content-ingestions",
      headers: { origin, cookie },
      payload: {
        lessonId,
        clientRequestId: randomUUID(),
        items: [
          { filename: "01-cover.jpg", mimeType: "image/jpeg", byteSize: imageFixture.byteLength },
          { filename: "02-chapter.pdf", mimeType: "application/pdf", byteSize: pdfFixture.byteLength },
          { filename: "03-tail.jpg", mimeType: "image/jpeg", byteSize: imageFixture.byteLength },
        ],
      },
    });
    assert.equal(createResponse.statusCode, 200, createResponse.body);
    let task = createResponse.json().task as {
      id: string;
      status: string;
      archivedAt: string | null;
      items: Array<{ id: string; position: number; status: string }>;
      media: Array<{ sourcePosition: number; sourcePageNumber: number | null }>;
      lessonAssets: Array<{ publicationStatus: string; position: number }>;
    };
    assert.equal(task.status, "uploading");
    assert.deepEqual(
      task.items.map((item) => item.position),
      [0, 1, 2],
    );

    for (const [index, bytes] of [imageFixture, pdfFixture, imageFixture].entries()) {
      const item = task.items[index];
      assert.ok(item);
      const upload = await app.inject({
        method: "PUT",
        url: `/v1/admin/content-ingestions/${task.id}/items/${item.id}/content`,
        headers: { origin, cookie, "content-type": "application/octet-stream" },
        payload: bytes,
      });
      assert.equal(upload.statusCode, 200, upload.body);
      task = upload.json().task;
    }
    assert.equal(task.status, "ready");

    const process = await app.inject({
      method: "POST",
      url: `/v1/admin/content-ingestions/${task.id}/process`,
      headers: { origin, cookie },
    });
    assert.equal(process.statusCode, 200, process.body);
    task = process.json().task;
    assert.equal(task.status, "completed", process.body);
    assert.deepEqual(
      task.media.map((media) => media.sourcePosition),
      [0, 1, 2, 3],
    );
    assert.deepEqual(
      task.media.map((media) => media.sourcePageNumber),
      [null, 1, 2, null],
    );
    assert.equal(task.lessonAssets.length, 0, "ready media must not publish or attach implicitly");

    const beforeLink = await db.query<{ published_at: Date | null; content_revision: string }>(
      "select published_at, content_revision::text from lessons where id = $1",
      [lessonId],
    );
    assert.equal(beforeLink[0]?.published_at, null);
    assert.equal(beforeLink[0]?.content_revision, "1");

    const link = await app.inject({
      method: "POST",
      url: `/v1/admin/content-ingestions/${task.id}/link`,
      headers: { origin, cookie },
    });
    assert.equal(link.statusCode, 200, link.body);
    task = link.json().task;
    assert.equal(task.lessonAssets.length, 4);
    assert.deepEqual(
      task.lessonAssets.map((asset) => asset.publicationStatus),
      ["draft", "draft", "draft", "draft"],
    );
    assert.deepEqual(
      task.lessonAssets.map((asset) => asset.position),
      [0, 1, 2, 3],
    );

    const review = await app.inject({
      method: "PATCH",
      url: `/v1/admin/content-ingestions/${task.id}/publication`,
      headers: { origin, cookie },
      payload: { action: "submit_review" },
    });
    assert.equal(review.statusCode, 200, review.body);
    task = review.json().task;
    assert.ok(task.lessonAssets.every((asset) => asset.publicationStatus === "review"));

    const publish = await app.inject({
      method: "PATCH",
      url: `/v1/admin/content-ingestions/${task.id}/publication`,
      headers: { origin, cookie },
      payload: { action: "publish" },
    });
    assert.equal(publish.statusCode, 200, publish.body);
    task = publish.json().task;
    assert.ok(task.lessonAssets.every((asset) => asset.publicationStatus === "published"));

    const publishedLesson = await db.query<{ published_at: Date | null; content_revision: string }>(
      "select published_at, content_revision::text from lessons where id = $1",
      [lessonId],
    );
    assert.ok(publishedLesson[0]?.published_at);
    assert.equal(publishedLesson[0]?.content_revision, "2");

    const orderedLinks = await db.query<{ source_position: number; asset_position: number }>(
      `select cim.source_position, la.position as asset_position
         from content_ingestion_media cim
         join lesson_assets la on la.media_asset_id = cim.media_asset_id
        where cim.task_id = $1
        order by cim.source_position`,
      [task.id],
    );
    assert.deepEqual(
      orderedLinks.map((row) => [row.source_position, row.asset_position]),
      [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
      ],
    );

    const archive = await app.inject({
      method: "PATCH",
      url: `/v1/admin/content-ingestions/${task.id}/archive`,
      headers: { origin, cookie },
    });
    assert.equal(archive.statusCode, 200, archive.body);
    task = archive.json().task;
    assert.ok(task.archivedAt);
    const retained = await db.query<{ count: string }>(
      "select count(*)::text as count from lesson_assets where ingestion_task_id = $1",
      [task.id],
    );
    assert.equal(retained[0]?.count, "4", "archiving history must not delete lesson dependencies");
  } finally {
    await app.close();
    await rm(storageRoot, { recursive: true, force: true });
  }
});
