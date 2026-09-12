import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const TEST_OFFLINE_AUTH_KEY_ID = "74c59568f7f704fa20017ef844ad3d31a76701afa83dcd73e33e85fa482bd266";

function createReaderFixture() {
  const apiDirectory = resolve(process.cwd(), "../api");
  const fixture = resolve(process.cwd(), "e2e/reader-fixture.ts");
  const output = execFileSync(process.execPath, ["--import", "tsx", fixture], { cwd: apiDirectory, env: process.env, encoding: "utf8" });
  return JSON.parse(output);
}

async function offlinePackageFacts(page) {
  return page.evaluate(() => new Promise((resolveValue, reject) => {
    const request = indexedDB.open("alwaslh-student-offline");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("lessonPackages")) { db.close(); resolveValue([]); return; }
      const transaction = db.transaction("lessonPackages", "readonly");
      const read = transaction.objectStore("lessonPackages").getAll();
      read.onerror = () => reject(read.error);
      read.onsuccess = async () => {
        try {
          const facts = [];
          for (const record of read.result) {
            const assets = [];
            for (const asset of record.assets) {
              const digest = await crypto.subtle.digest("SHA-256", await asset.blob.arrayBuffer());
              const checksum = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
              assets.push({ id: asset.id, byteSize: asset.byteSize, blobSize: asset.blob.size, checksumSha256: asset.checksumSha256, actualChecksumSha256: checksum });
            }
            facts.push({ packageKey: record.packageKey, scopeKey: record.scopeKey, lessonId: record.lessonId, contentRevision: record.contentRevision, totalByteSize: record.totalByteSize, authorizationKeyId: record.authorization?.keyId ?? null, assets });
          }
          db.close(); resolveValue(facts);
        } catch (error) { db.close(); reject(error); }
      };
    };
  }));
}

function downloadableRow(page, lessonTitle) {
  return page.locator("[data-downloadable-lesson-id]").filter({ hasText: lessonTitle }).first();
}

async function saveLesson(page, lessonTitle) {
  const row = downloadableRow(page, lessonTitle);
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "حفظ بدون إنترنت" }).click();
}

test("protected lesson download preserves integrity contracts behind learner-facing Downloads UX", async ({ page }) => {
  const fixture = createReaderFixture();
  await page.context().addCookies([{ name: fixture.sessionCookieName, value: fixture.sessionToken, url: "http://127.0.0.1:5174", httpOnly: true, sameSite: "Lax" }]);

  await page.goto("/");
  await expect(page).toHaveURL(/\/app\/home$/);
  await expect(page.getByRole("heading", { name: "ماذا تريد أن تفعل الآن؟" })).toBeVisible();
  await page.getByRole("link", { name: "التنزيلات", exact: true }).first().click();
  await expect(page).toHaveURL(/\/app\/downloads$/);
  await expect(page.getByRole("heading", { name: "التنزيلات", exact: true })).toBeVisible();
  await expect(downloadableRow(page, fixture.lessonTitle)).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/SHA-256|Service Worker|Cache API|content revision|revision|ES256|P-256/i);

  const manifestPromise = page.waitForResponse((response) => response.url().includes("/v1/student/offline/lessons/") && response.url().endsWith("/manifest") && response.status() === 200);
  await saveLesson(page, fixture.lessonTitle);
  const manifestPayload = await (await manifestPromise).json();
  const manifest = manifestPayload.manifest;
  expect(manifestPayload.authorization.algorithm).toBe("ES256");
  expect(manifestPayload.authorization.keyId).toBe(TEST_OFFLINE_AUTH_KEY_ID);
  expect(manifest.assets).toHaveLength(1);
  await expect(page.getByText("تم حفظ الدرس للتعلم بدون إنترنت.", { exact: true })).toBeVisible();
  const savedRow = page.locator(`[data-downloaded-lesson-id="${manifest.lesson.id}"]`);
  await expect(savedRow.getByText("متاح بدون إنترنت", { exact: true })).toBeVisible();

  let packages = await offlinePackageFacts(page);
  expect(packages).toHaveLength(1);
  expect(packages[0].lessonId).toBe(manifest.lesson.id);
  expect(packages[0].contentRevision).toBe(manifest.lesson.contentRevision);
  expect(packages[0].totalByteSize).toBe(manifest.totalByteSize);
  expect(packages[0].authorizationKeyId).toBe(TEST_OFFLINE_AUTH_KEY_ID);
  expect(packages[0].assets[0].actualChecksumSha256).toBe(manifest.assets[0].checksumSha256);

  await savedRow.getByRole("button", { name: "إزالة من الجهاز" }).click();
  await expect(page.getByText("تمت إزالة الدرس من هذا الجهاز.", { exact: true })).toBeVisible();
  await expect.poll(async () => (await offlinePackageFacts(page)).length).toBe(0);

  const offlineManifestPattern = "**/v1/student/offline/lessons/*/manifest";
  await page.route(offlineManifestPattern, async (route) => {
    const response = await route.fetch();
    const payload = await response.json();
    payload.manifest.lesson.title = `${payload.manifest.lesson.title} — tampered`;
    await route.fulfill({ response, json: payload });
  });
  await saveLesson(page, fixture.lessonTitle);
  await expect(page.getByText("تعذر حفظ الدرس بأمان. حدّث الصفحة وحاول مرة أخرى.", { exact: true })).toBeVisible();
  expect(await offlinePackageFacts(page)).toHaveLength(0);
  await page.unroute(offlineManifestPattern);

  let corruptedAssetRequestObserved = false;
  const offlineAssetPattern = "**/v1/student/offline/lessons/**/assets/**";
  await page.route(offlineAssetPattern, async (route) => {
    const response = await route.fetch();
    const body = Buffer.from(await response.body());
    expect(body.length).toBe(manifest.assets[0].byteSize);
    if (body.length > 0) body[0] ^= 0xff;
    corruptedAssetRequestObserved = true;
    await route.fulfill({ response, body });
  });
  await saveLesson(page, fixture.lessonTitle);
  expect(corruptedAssetRequestObserved).toBe(true);
  await expect(page.getByText("تعذر حفظ الدرس بأمان. لم يتم الاحتفاظ بتنزيل غير مكتمل.", { exact: true })).toBeVisible();
  expect(await offlinePackageFacts(page)).toHaveLength(0);
  await page.unroute(offlineAssetPattern);

  await saveLesson(page, fixture.lessonTitle);
  await expect(page.getByText("تم حفظ الدرس للتعلم بدون إنترنت.", { exact: true })).toBeVisible();
  packages = await offlinePackageFacts(page);
  expect(packages).toHaveLength(1);

  await page.getByRole("link", { name: "حسابي", exact: true }).click();
  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page.getByRole("heading", { name: "لدي حساب بالفعل" })).toBeVisible();
  await expect.poll(async () => (await offlinePackageFacts(page)).length).toBe(0);
});
