import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const APP_ORIGIN = "http://127.0.0.1:5174";

function createReaderFixture() {
  const apiDirectory = resolve(process.cwd(), "../api");
  const fixture = resolve(process.cwd(), "e2e/reader-fixture.ts");
  return JSON.parse(execFileSync(process.execPath, ["--import", "tsx", fixture], {
    cwd: apiDirectory,
    env: process.env,
    encoding: "utf8",
  }));
}

function revokeFixtureEntitlements(sessionToken) {
  const apiDirectory = resolve(process.cwd(), "../api");
  const helper = resolve(process.cwd(), "e2e/offline-reconnect-authority.ts");
  return JSON.parse(execFileSync(process.execPath, ["--import", "tsx", helper, "revoke-entitlements", sessionToken], {
    cwd: apiDirectory,
    env: process.env,
    encoding: "utf8",
  }));
}

async function packageCount(page) {
  return page.evaluate(() => new Promise((resolveValue, reject) => {
    const request = indexedDB.open("alwaslh-student-offline");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction("lessonPackages", "readonly");
      const count = transaction.objectStore("lessonPackages").count();
      count.onerror = () => { database.close(); reject(count.error); };
      count.onsuccess = () => { database.close(); resolveValue(count.result); };
    };
  }));
}

test("reconnect revalidates current authority and purges a revoked lesson package", async ({ context, page }) => {
  test.setTimeout(120_000);
  const fixture = createReaderFixture();

  await context.addCookies([{
    name: fixture.sessionCookieName,
    value: fixture.sessionToken,
    url: APP_ORIGIN,
    httpOnly: true,
    sameSite: "Lax",
  }]);

  await page.goto(`${APP_ORIGIN}/app/library/downloads`);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  const manifestResponse = page.waitForResponse((response) =>
    response.url().includes("/v1/student/offline/lessons/") && response.url().endsWith("/manifest") && response.status() === 200,
  );
  const downloadable = page.locator("[data-downloadable-lesson-id]").filter({ hasText: fixture.lessonTitle }).first();
  await expect(downloadable).toBeVisible();
  await downloadable.getByRole("button", { name: "حفظ بدون إنترنت" }).click();
  const payload = await (await manifestResponse).json();
  const lessonId = payload.manifest.lesson.id;
  await expect.poll(() => packageCount(page)).toBe(1);

  await context.setOffline(true);
  await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(false);

  const authorityChange = revokeFixtureEntitlements(fixture.sessionToken);
  expect(authorityChange.revokedCount).toBeGreaterThan(0);

  // Student Reader intentionally hides access denial as NOT_FOUND rather than
  // exposing entitlement details, so reconnect must treat this 404 as revocation.
  const deniedManifest = page.waitForResponse((response) =>
    response.url().includes(`/v1/student/offline/lessons/${lessonId}/manifest`) && response.status() === 404,
  );
  await context.setOffline(false);
  await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(true);
  await deniedManifest;

  // The reconnect boundary must delete the package instead of retaining protected
  // bytes under a stale entitlement merely because the blobs still exist locally.
  await expect.poll(() => packageCount(page)).toBe(0);

  await context.setOffline(true);
  await page.goto(`${APP_ORIGIN}/app/learn/lessons/${encodeURIComponent(lessonId)}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText("هذا الدرس المحفوظ غير متاح الآن", { exact: true })).toBeVisible();
  await expect(page.locator('[data-offline-reader="ready"]')).toHaveCount(0);
});
