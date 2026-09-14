import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

function createReaderFixture() {
  const apiDirectory = resolve(process.cwd(), "../api");
  const fixture = resolve(process.cwd(), "e2e/reader-fixture.ts");
  return JSON.parse(execFileSync(process.execPath, ["--import", "tsx", fixture], {
    cwd: apiDirectory,
    env: process.env,
    encoding: "utf8",
  }));
}

function mutateAuthority(action, fixture) {
  const apiDirectory = resolve(process.cwd(), "../api");
  const mutation = resolve(process.cwd(), "e2e/offline-revalidation-fixture.ts");
  execFileSync(
    process.execPath,
    ["--import", "tsx", mutation, action, fixture.studentId, fixture.classId, fixture.lessonId],
    { cwd: apiDirectory, env: process.env, encoding: "utf8" },
  );
}

function downloadableRow(page, lessonTitle) {
  return page.locator("[data-downloadable-lesson-id]").filter({ hasText: lessonTitle }).first();
}

async function storedPackageCount(page) {
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

async function saveLesson(page, lessonTitle) {
  const row = downloadableRow(page, lessonTitle);
  await expect(row).toBeVisible();
  const button = row.getByRole("button", { name: /حفظ بدون إنترنت|تحديث النسخة/ });
  await expect(button).toBeVisible();
  await button.click();
  await expect.poll(() => storedPackageCount(page)).toBe(1);
}

test("reconnect removes revoked and stale protected lesson packages using current server authority and delta cursor", async ({ page }) => {
  const fixture = createReaderFixture();
  await page.context().addCookies([{
    name: fixture.sessionCookieName,
    value: fixture.sessionToken,
    url: "http://127.0.0.1:5174",
    httpOnly: true,
    sameSite: "Lax",
  }]);

  await page.goto("/app/library/downloads");
  await expect(page.getByRole("heading", { name: "الدروس المحفوظة" })).toBeVisible();
  await saveLesson(page, fixture.lessonTitle);

  // Current entitlement authority wins after reconnect: an expired class grant
  // must make the locally stored protected bytes unavailable and remove them.
  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  mutateAuthority("expire-entitlement", fixture);
  const deniedDeltaPromise = page.waitForResponse((response) =>
    response.url().includes("/v1/student/offline/sync?") && response.status() === 200,
  );
  await page.context().setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await deniedDeltaPromise;
  await expect.poll(() => storedPackageCount(page), { timeout: 15_000 }).toBe(0);

  // Restore authority and save the current publication again so we can prove
  // that a later canonical content revision is delivered by the bounded delta
  // and invalidates the old local package before the full manifest pass.
  mutateAuthority("restore-entitlement", fixture);
  await page.reload();
  await expect(page.getByRole("heading", { name: "الدروس المحفوظة" })).toBeVisible();
  await saveLesson(page, fixture.lessonTitle);

  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  mutateAuthority("bump-revision", fixture);
  const revisionDeltaPromise = page.waitForResponse((response) =>
    response.url().includes("/v1/student/offline/sync?") && response.status() === 200,
  );
  await page.context().setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  const revisionDeltaResponse = await revisionDeltaPromise;
  const revisionPayload = await revisionDeltaResponse.json();
  expect(revisionPayload.delta.entries.some((entry) => entry.lessonId === fixture.lessonId)).toBe(true);
  expect(revisionPayload.delta.nextCursor).toMatch(/^\d+$/);
  await expect.poll(() => storedPackageCount(page), { timeout: 15_000 }).toBe(0);

  const scopedCursor = await page.evaluate(({ profileId, deviceId }) =>
    localStorage.getItem(`alwaslh-student-offline:sync-cursor:${profileId}:${deviceId}`),
  { profileId: fixture.studentId, deviceId: fixture.deviceId });
  expect(scopedCursor).toBe(revisionPayload.delta.nextCursor);
});
