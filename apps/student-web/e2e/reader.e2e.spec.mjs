import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

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

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.locator("body").evaluate((body) => ({
    scrollWidth: body.scrollWidth,
    clientWidth: body.clientWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

test("authorized Learn hierarchy opens a focused protected Reader with direct-route parity", async ({ page }) => {
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
  await expect(page).toHaveURL(/\/app\/home$/);
  await expect(page.getByRole("heading", { name: "ماذا تريد أن تفعل الآن؟" })).toBeVisible();
  await page.getByRole("link", { name: "التعلم", exact: true }).first().click();
  await expect(page).toHaveURL(/\/app\/learn$/);
  await expect(page.getByRole("heading", { name: "موادك ودروسك" })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/Stage16|PWA|authority/);

  await expect(page.getByRole("heading", { name: fixture.className })).toBeVisible();
  const subjectLink = page.getByRole("link", { name: new RegExp(fixture.subjectName) });
  await expect(subjectLink).toBeVisible();
  await subjectLink.click();
  await expect(page).toHaveURL(/\/app\/learn\/subjects\/[^/]+$/);
  await expect(page.getByRole("heading", { name: fixture.subjectName })).toBeVisible();

  const lessonLink = page.getByRole("link", { name: new RegExp(fixture.lessonTitle) });
  await lessonLink.focus();
  await expect(lessonLink).toBeFocused();

  const readerResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/v1/student/lessons/") &&
      response.url().endsWith("/reader") &&
      response.status() === 200,
  );
  const mediaResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/v1/student/lesson-assets/${fixture.assetId}/content`) && response.status() === 200,
  );
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/app\/learn\/lessons\/[^/]+$/);
  const directReaderUrl = page.url();

  const readerResponse = await readerResponsePromise;
  const readerPayload = await readerResponse.json();
  expect(JSON.stringify(readerPayload)).not.toContain("storage_key");
  expect(JSON.stringify(readerPayload)).not.toContain(fixture.pendingText);

  const mediaResponse = await mediaResponsePromise;
  expect(mediaResponse.headers()["cache-control"]).toBe("private, no-store");
  expect(mediaResponse.headers()["x-content-type-options"]).toBe("nosniff");
  expect(mediaResponse.headers()["content-type"]).toContain("image/png");

  await expect(page.getByRole("heading", { name: fixture.lessonTitle })).toBeVisible();
  await expect(page.getByText(fixture.approvedText, { exact: true })).toBeVisible();
  await expect(page.getByText(fixture.pendingText, { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /استماع للدرس|الاستماع غير متاح/ })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "التنقل الرئيسي للطالب على الهاتف" })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "التنقل الرئيسي للطالب" })).toHaveCount(0);

  const image = page.locator(".reader-media img");
  await expect(image).toBeVisible();
  expect(await image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
  await expectNoHorizontalOverflow(page);

  const search = page.getByLabel("بحث داخل الدرس");
  await search.fill("الحركة");
  await expect(page.getByText(/نتيجة/)).toBeVisible();
  await page.getByRole("button", { name: "الانتقال إلى أول نتيجة" }).click();
  await expect(page.locator(".reader-page").first()).toBeFocused();
  await search.focus();
  await search.press("Enter");
  await expect(page.locator(".reader-page").first()).toBeFocused();

  await search.fill("عبارة غير موجودة داخل الدرس");
  await expect(page.getByText("لا توجد نتيجة داخل الدرس", { exact: true })).toBeVisible();
  await expect(page.getByText("لا توجد نتائج", { exact: true })).toBeVisible();
  await search.fill("");

  await page.setViewportSize({ width: 768, height: 1024 });
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole("heading", { name: fixture.lessonTitle })).toBeVisible();

  await page.setViewportSize({ width: 1366, height: 900 });
  await expectNoHorizontalOverflow(page);
  await expect(image).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);

  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByText("أنت غير متصل", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "فتح التنزيلات" })).toBeVisible();

  const restoredReader = page.waitForResponse(
    (response) => response.url().includes("/v1/student/lessons/") && response.url().endsWith("/reader") && response.status() === 200,
  );
  await page.context().setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await restoredReader;
  await expect(page.getByText(fixture.approvedText, { exact: true })).toBeVisible();

  const subjectUrl = await page.getByRole("link", { name: new RegExp(`العودة إلى ${fixture.subjectName}`) }).getAttribute("href");
  await page.getByRole("link", { name: new RegExp(`العودة إلى ${fixture.subjectName}`) }).click();
  await expect(page).toHaveURL(new RegExp(`${subjectUrl}$`));
  const returnedLessonLink = page.getByRole("link", { name: new RegExp(fixture.lessonTitle) });
  await expect(returnedLessonLink).toBeVisible();

  const directReaderPromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/lessons/") && response.url().endsWith("/reader") && response.status() === 200,
  );
  await page.goto(directReaderUrl);
  await directReaderPromise;
  await expect(page.getByRole("heading", { name: fixture.lessonTitle })).toBeVisible();
  await expect(page.getByText(fixture.approvedText, { exact: true })).toBeVisible();
  await expect(page.locator("#route-content")).toBeFocused();

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${subjectUrl}$`));
  await expect(page.getByRole("heading", { name: fixture.subjectName })).toBeVisible();
});
