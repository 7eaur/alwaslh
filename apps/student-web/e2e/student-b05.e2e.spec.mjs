import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

function createReaderFixture() {
  const apiDirectory = resolve(process.cwd(), "../api");
  const fixture = resolve(process.cwd(), "e2e/reader-fixture.ts");
  return JSON.parse(execFileSync(process.execPath, ["--import", "tsx", fixture], { cwd: apiDirectory, env: process.env, encoding: "utf8" }));
}

async function expectNoOverflow(page) {
  const size = await page.locator("body").evaluate((body) => ({ scrollWidth: body.scrollWidth, clientWidth: body.clientWidth }));
  expect(size.scrollWidth).toBeLessThanOrEqual(size.clientWidth + 1);
}

async function assertProductionCopy(page) {
  await expect(page.locator("body")).not.toContainText(/SHA-256|Service Worker|Cache API|IndexedDB|localStorage|sessionStorage|ES256|P-256|content revision|revision|manifest|device key|مفتاح الجهاز|بصمة SHA/i);
}

async function capture(page, name) {
  for (const viewport of [
    { suffix: "phone", width: 390, height: 844 },
    { suffix: "desktop", width: 1366, height: 900 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expectNoOverflow(page);
    await assertProductionCopy(page);
    await page.screenshot({ path: `test-results/ux-b05-${name}-${viewport.suffix}.png`, fullPage: false });
  }
  await page.setViewportSize({ width: 390, height: 844 });
}

test("B05 Downloads and Account are learner-facing, responsive and honest offline", async ({ page, context }) => {
  const fixture = createReaderFixture();
  await page.context().addCookies([{ name: fixture.sessionCookieName, value: fixture.sessionToken, url: "http://127.0.0.1:5174", httpOnly: true, sameSite: "Lax" }]);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/downloads");
  await expect(page.getByRole("heading", { name: "التنزيلات", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "الدروس المحفوظة" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "دروس متاحة للتنزيل" })).toBeVisible();
  await expect(page.locator("[data-downloadable-lesson-id]").filter({ hasText: fixture.lessonTitle })).toBeVisible();
  await capture(page, "downloads-library");

  const lessonRow = page.locator("[data-downloadable-lesson-id]").filter({ hasText: fixture.lessonTitle });
  await lessonRow.getByRole("button", { name: "حفظ بدون إنترنت" }).click();
  await expect(page.getByText("تم حفظ الدرس للتعلم بدون إنترنت.", { exact: true })).toBeVisible();
  const savedRow = page.locator("[data-downloaded-lesson-id]").filter({ hasText: fixture.lessonTitle });
  await expect(savedRow.getByText("متاح بدون إنترنت", { exact: true })).toBeVisible();
  await capture(page, "downloads-saved");

  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByText("أنت غير متصل الآن", { exact: true })).toBeVisible();
  await expect(savedRow).toBeVisible();
  await expect(page.getByRole("heading", { name: "دروس متاحة للتنزيل" })).toHaveCount(0);
  await capture(page, "downloads-offline");

  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await page.getByRole("link", { name: "حسابي", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/account$/);
  await expect(page.getByRole("heading", { name: "وصولك الحالي" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "لديك رمز صف جديد؟" })).toBeVisible();
  await expect(page.getByRole("button", { name: "تسجيل الخروج" })).toBeVisible();
  await capture(page, "account");

  await page.getByRole("link", { name: "الرئيسية", exact: true }).first().click();
  await expect(page.locator(".student-account-section")).toHaveCount(0);
  await page.getByRole("link", { name: "التعلم", exact: true }).first().click();
  await expect(page.locator(".student-account-section")).toHaveCount(0);
});
