import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const TEST_OFFLINE_AUTH_KEY_ID = "74c59568f7f704fa20017ef844ad3d31a76701afa83dcd73e33e85fa482bd266";

function createReaderFixture() {
  const apiDirectory = resolve(process.cwd(), "../api");
  const fixture = resolve(process.cwd(), "e2e/reader-fixture.ts");
  const output = execFileSync(process.execPath, ["--import", "tsx", fixture], {
    cwd: apiDirectory,
    env: process.env,
    encoding: "utf8",
  });
  return JSON.parse(output);
}

async function offlinePackageFacts(page) {
  return page.evaluate(() =>
    new Promise((resolveValue, reject) => {
      const request = indexedDB.open("alwaslh-student-offline");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("lessonPackages")) {
          db.close();
          resolveValue([]);
          return;
        }
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
                const checksum = [...new Uint8Array(digest)]
                  .map((byte) => byte.toString(16).padStart(2, "0"))
                  .join("");
                assets.push({
                  id: asset.id,
                  byteSize: asset.byteSize,
                  blobSize: asset.blob.size,
                  checksumSha256: asset.checksumSha256,
                  actualChecksumSha256: checksum,
                });
              }
              facts.push({
                packageKey: record.packageKey,
                scopeKey: record.scopeKey,
                lessonId: record.lessonId,
                contentRevision: record.contentRevision,
                totalByteSize: record.totalByteSize,
                authorizationKeyId: record.authorization?.keyId ?? null,
                assets,
              });
            }
            db.close();
            resolveValue(facts);
          } catch (error) {
            db.close();
            reject(error);
          }
        };
      };
    }),
  );
}

test("protected lesson download verifies server authorization and bytes, commits atomically, rejects tampering and cleans up", async ({ page }) => {
  const fixture = createReaderFixture();
  await page.context().addCookies([
    {
      name: fixture.sessionCookieName,
      value: fixture.sessionToken,
      url: "http://127.0.0.1:5174",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/");
  await expect(page.getByText("تم تسجيل الدخول", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "التنزيلات", exact: true }).first().click();
  await expect(page).toHaveURL(/\/app\/downloads$/);
  await expect(page.getByRole("heading", { name: "تنزيل الدروس لهذا الجهاز" })).toBeVisible();
  await expect(page.getByLabel("الدرس")).toContainText(fixture.lessonTitle);

  const manifestPromise = page.waitForResponse(
    (response) =>
      response.url().includes("/v1/student/offline/lessons/") &&
      response.url().endsWith("/manifest") &&
      response.status() === 200,
  );
  await page.getByRole("button", { name: "تنزيل للاستخدام دون اتصال" }).click();
  const manifestResponse = await manifestPromise;
  const manifestPayload = await manifestResponse.json();
  const manifest = manifestPayload.manifest;
  expect(manifestPayload.authorization.algorithm).toBe("ES256");
  expect(manifestPayload.authorization.keyId).toBe(TEST_OFFLINE_AUTH_KEY_ID);
  expect(manifest.assets).toHaveLength(1);
  await expect(page.getByText("تم حفظ الدرس والتحقق من ملفاته وتصريحه الصادر من الخادم.", { exact: true })).toBeVisible();
  await expect(page.getByText(/هذه النسخة محفوظة ومتحقق منها عند الإصدار المنشور/)).toBeVisible();

  let packages = await offlinePackageFacts(page);
  expect(packages).toHaveLength(1);
  expect(packages[0].lessonId).toBe(manifest.lesson.id);
  expect(packages[0].contentRevision).toBe(manifest.lesson.contentRevision);
  expect(packages[0].totalByteSize).toBe(manifest.totalByteSize);
  expect(packages[0].authorizationKeyId).toBe(TEST_OFFLINE_AUTH_KEY_ID);
  expect(packages[0].assets).toHaveLength(1);
  expect(packages[0].assets[0].blobSize).toBe(manifest.assets[0].byteSize);
  expect(packages[0].assets[0].byteSize).toBe(manifest.assets[0].byteSize);
  expect(packages[0].assets[0].checksumSha256).toBe(manifest.assets[0].checksumSha256);
  expect(packages[0].assets[0].actualChecksumSha256).toBe(manifest.assets[0].checksumSha256);

  await page.getByRole("button", { name: "حذف التنزيل" }).click();
  await expect(page.getByText("تم حذف النسخة المحفوظة من هذا الجهاز.", { exact: true })).toBeVisible();
  await expect.poll(async () => (await offlinePackageFacts(page)).length).toBe(0);

  const offlineManifestPattern = "**/v1/student/offline/lessons/*/manifest";
  await page.route(offlineManifestPattern, async (route) => {
    const response = await route.fetch();
    const payload = await response.json();
    payload.manifest.lesson.title = `${payload.manifest.lesson.title} — tampered`;
    await route.fulfill({ response, json: payload });
  });

  await page.getByRole("button", { name: "تنزيل للاستخدام دون اتصال" }).click();
  await expect(page.getByText(/تعذر التحقق من تصريح التنزيل الصادر من الخادم/)).toBeVisible();
  expect(await offlinePackageFacts(page)).toHaveLength(0);
  await page.unroute(offlineManifestPattern);

  const offlineAssetPattern = "**/v1/student/offline/lessons/*/assets/*?revision=*";
  await page.route(offlineAssetPattern, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: manifest.assets[0].mimeType,
      body: Buffer.alloc(manifest.assets[0].byteSize, 0),
    });
  });

  await page.getByRole("button", { name: "تنزيل للاستخدام دون اتصال" }).click();
  await expect(page.getByText(/لم يكتمل التحقق من ملفات الدرس/)).toBeVisible();
  expect(await offlinePackageFacts(page)).toHaveLength(0);
  await page.unroute(offlineAssetPattern);

  await page.getByRole("button", { name: "تنزيل للاستخدام دون اتصال" }).click();
  await expect(page.getByText("تم حفظ الدرس والتحقق من ملفاته وتصريحه الصادر من الخادم.", { exact: true })).toBeVisible();
  packages = await offlinePackageFacts(page);
  expect(packages).toHaveLength(1);

  await page.getByRole("link", { name: "حسابي", exact: true }).click();
  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page.getByRole("heading", { name: "لدي حساب بالفعل" })).toBeVisible();
  await expect.poll(async () => (await offlinePackageFacts(page)).length).toBe(0);
});
