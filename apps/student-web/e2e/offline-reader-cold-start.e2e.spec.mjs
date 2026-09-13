import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium, expect, test } from "@playwright/test";

const APP_ORIGIN = "http://127.0.0.1:5174";
const ACTIVE_SCOPE_KEY = "alwaslh-student-offline:active-scope";
const TEST_NOW_KEY = "__alwaslh_e2e_now";

function createReaderFixture() {
  const apiDirectory = resolve(process.cwd(), "../api");
  const fixture = resolve(process.cwd(), "e2e/reader-fixture.ts");
  return JSON.parse(execFileSync(process.execPath, ["--import", "tsx", fixture], {
    cwd: apiDirectory,
    env: process.env,
    encoding: "utf8",
  }));
}

function downloadableRow(page, lessonTitle) {
  return page.locator("[data-downloadable-lesson-id]").filter({ hasText: lessonTitle }).first();
}

async function packageSnapshot(page) {
  return page.evaluate(() => new Promise((resolveValue, reject) => {
    const request = indexedDB.open("alwaslh-student-offline");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction("lessonPackages", "readonly");
      const read = transaction.objectStore("lessonPackages").getAll();
      read.onerror = () => { database.close(); reject(read.error); };
      read.onsuccess = async () => {
        try {
          const record = read.result[0];
          if (!record) throw new Error("offline_package_missing");
          const asset = record.assets[0];
          if (!asset) throw new Error("offline_asset_missing");
          const bytes = [...new Uint8Array(await asset.blob.arrayBuffer())];
          database.close();
          resolveValue({
            signature: record.authorization.signature,
            bytes,
            mimeType: asset.blob.type,
            downloadedAtClientMs: record.downloadedAtClientMs,
            authorizationExpiresAt: record.authorizationExpiresAt,
          });
        } catch (error) {
          database.close();
          reject(error);
        }
      };
    };
  }));
}

async function updateStoredPackage(page, update) {
  await page.evaluate((change) => new Promise((resolveValue, reject) => {
    const request = indexedDB.open("alwaslh-student-offline");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction("lessonPackages", "readwrite");
      const store = transaction.objectStore("lessonPackages");
      const read = store.getAll();
      read.onerror = () => { database.close(); reject(read.error); };
      read.onsuccess = () => {
        const record = read.result[0];
        if (!record) { database.close(); reject(new Error("offline_package_missing")); return; }
        if (change.signature !== undefined) record.authorization.signature = change.signature;
        if (change.bytes !== undefined) {
          const asset = record.assets[0];
          if (!asset) { database.close(); reject(new Error("offline_asset_missing")); return; }
          asset.blob = new Blob([Uint8Array.from(change.bytes)], { type: change.mimeType ?? asset.blob.type });
        }
        store.put(record);
      };
      transaction.oncomplete = () => { database.close(); resolveValue(); };
      transaction.onerror = () => { database.close(); reject(transaction.error); };
      transaction.onabort = () => { database.close(); reject(transaction.error); };
    };
  }), update);
}

async function expectOfflineReaderReady(page, fixture) {
  await expect(page.locator('[data-offline-reader="ready"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: fixture.lessonTitle })).toBeVisible();
  await expect(page.getByText(fixture.approvedText, { exact: true })).toBeVisible();
  await expect(page.getByText(fixture.pendingText, { exact: true })).toHaveCount(0);
  await expect(page.getByText("محفوظ على هذا الجهاز · بدون إنترنت", { exact: true })).toBeVisible();
  await expect(page.locator(".reader-page img")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/SHA-256|ES256|P-256|IndexedDB|Service Worker|session|authority|Stage/i);
}

async function expectOfflineReaderDenied(page) {
  await expect(page.getByText("هذا الدرس المحفوظ غير متاح الآن", { exact: true })).toBeVisible();
  await expect(page.locator('[data-offline-reader="ready"]')).toHaveCount(0);
}

test("saved lesson survives a real browser restart offline and remains fail-closed on tampering, isolation and time bounds", async () => {
  test.setTimeout(120_000);
  const fixture = createReaderFixture();
  const userDataDir = mkdtempSync(join(tmpdir(), "alwaslh-016i-"));
  let context = null;

  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: true,
      locale: "ar-YE",
      viewport: { width: 390, height: 844 },
    });
    let page = context.pages()[0] ?? await context.newPage();
    await context.addCookies([{
      name: fixture.sessionCookieName,
      value: fixture.sessionToken,
      url: APP_ORIGIN,
      httpOnly: true,
      sameSite: "Lax",
    }]);

    await page.goto(`${APP_ORIGIN}/app/library/downloads`);
    await expect(page.getByRole("heading", { name: "الدروس المحفوظة" })).toBeVisible();
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

    const manifestPromise = page.waitForResponse((response) => response.url().includes("/v1/student/offline/lessons/") && response.url().endsWith("/manifest") && response.status() === 200);
    const row = downloadableRow(page, fixture.lessonTitle);
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "حفظ بدون إنترنت" }).click();
    const manifestPayload = await (await manifestPromise).json();
    const lessonId = manifestPayload.manifest.lesson.id;
    await expect(page.locator(`[data-downloaded-lesson-id="${lessonId}"]`).getByRole("link", { name: "فتح الدرس" })).toBeVisible();
    const snapshot = await packageSnapshot(page);
    const originalScope = await page.evaluate((key) => localStorage.getItem(key), ACTIVE_SCOPE_KEY);
    expect(originalScope).toBeTruthy();

    // The restart must not depend on the authenticated HTTP session.
    await context.clearCookies();
    await context.close();
    context = null;

    context = await chromium.launchPersistentContext(userDataDir, {
      headless: true,
      locale: "ar-YE",
      viewport: { width: 390, height: 844 },
    });
    await context.setOffline(true);
    page = context.pages()[0] ?? await context.newPage();
    const sessionCookies = await context.cookies(APP_ORIGIN);
    expect(sessionCookies.some((cookie) => cookie.name === fixture.sessionCookieName)).toBe(false);

    await page.goto(`${APP_ORIGIN}/app/learn/lessons/${encodeURIComponent(lessonId)}`, { waitUntil: "domcontentloaded" });
    await expectOfflineReaderReady(page, fixture);

    // Read-time ES256 verification: a stored signature mutation must deny use.
    await updateStoredPackage(page, { signature: "AA" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectOfflineReaderDenied(page);
    await updateStoredPackage(page, { signature: snapshot.signature });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectOfflineReaderReady(page, fixture);

    // Read-time blob integrity: same-size content corruption must deny use.
    const corruptedBytes = [...snapshot.bytes];
    if (corruptedBytes.length > 0) corruptedBytes[0] ^= 0xff;
    await updateStoredPackage(page, { bytes: corruptedBytes, mimeType: snapshot.mimeType });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectOfflineReaderDenied(page);
    await updateStoredPackage(page, { bytes: snapshot.bytes, mimeType: snapshot.mimeType });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectOfflineReaderReady(page, fixture);

    // A different durable account/device scope cannot discover another scope's package.
    const parsedScope = JSON.parse(originalScope);
    await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
      key: ACTIVE_SCOPE_KEY,
      value: { profileId: `${parsedScope.profileId}-other`, deviceId: parsedScope.deviceId },
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectOfflineReaderDenied(page);
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: ACTIVE_SCOPE_KEY, value: originalScope });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectOfflineReaderReady(page, fixture);

    await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), {
      key: ACTIVE_SCOPE_KEY,
      value: { profileId: parsedScope.profileId, deviceId: `${parsedScope.deviceId}-other` },
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectOfflineReaderDenied(page);
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: ACTIVE_SCOPE_KEY, value: originalScope });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectOfflineReaderReady(page, fixture);

    // A deterministic page clock lets the browser acceptance prove rollback and expiry denial.
    await context.addInitScript(({ key }) => {
      try {
        const forced = window.localStorage.getItem(key);
        if (forced !== null) {
          const value = Number(forced);
          if (Number.isFinite(value)) Date.now = () => value;
        }
      } catch {
        // about:blank and denied storage are intentionally ignored.
      }
    }, { key: TEST_NOW_KEY });

    await page.evaluate(({ key, value }) => localStorage.setItem(key, String(value)), {
      key: TEST_NOW_KEY,
      value: snapshot.downloadedAtClientMs - 6 * 60 * 1000,
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectOfflineReaderDenied(page);

    await page.evaluate((key) => localStorage.removeItem(key), TEST_NOW_KEY);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectOfflineReaderReady(page, fixture);

    await page.evaluate(({ key, value }) => localStorage.setItem(key, String(value)), {
      key: TEST_NOW_KEY,
      value: Date.parse(snapshot.authorizationExpiresAt) + 1_000,
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expectOfflineReaderDenied(page);
  } finally {
    if (context) await context.close().catch(() => undefined);
    rmSync(userDataDir, { recursive: true, force: true });
  }
});
