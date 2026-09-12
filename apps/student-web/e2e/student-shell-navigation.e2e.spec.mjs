import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

function createStudentFixture() {
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

async function openAuthenticatedStudent(page) {
  const fixture = createStudentFixture();
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
  await expect(page.getByRole("heading", { name: "ماذا تريد أن تتعلم اليوم؟" })).toBeVisible();
  return fixture;
}

test("Student shell provides stable mobile destinations, focus, history and offline status", async ({ page }) => {
  await openAuthenticatedStudent(page);

  await expect(page.locator(".aw-product-shell")).toHaveAttribute("dir", "rtl");
  const phoneNav = page.getByRole("navigation", { name: "التنقل الرئيسي للطالب على الهاتف" });
  await expect(phoneNav).toBeVisible();
  await expect(phoneNav.getByRole("link")).toHaveCount(4);
  await expect(phoneNav.getByRole("link", { name: "الرئيسية" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "حسابي", exact: true })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "متصل" }).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await phoneNav.getByRole("link", { name: "التعلم" }).click();
  await expect(page).toHaveURL(/\/app\/learn$/);
  await expect(page.locator("#route-content")).toBeFocused();
  await expect(page.getByRole("heading", { name: "التعلم" })).toBeVisible();
  await expect(phoneNav.getByRole("link", { name: "التعلم" })).toHaveAttribute("aria-current", "page");

  await page.goBack();
  await expect(page).toHaveURL(/\/app\/home$/);
  await expect(page.locator("#route-content")).toBeFocused();
  await expect(page.getByRole("heading", { name: "ماذا تريد أن تتعلم اليوم؟" })).toBeVisible();

  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByRole("status").filter({ hasText: "غير متصل — يمكنك فتح ما سبق تنزيله" })).toBeVisible();
  await page.context().setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.getByRole("status").filter({ hasText: "متصل" }).first()).toBeVisible();
});

test("Student shell adapts navigation for tablet and desktop without overflow", async ({ page }) => {
  await openAuthenticatedStudent(page);

  await page.setViewportSize({ width: 768, height: 1024 });
  const adaptiveNav = page.getByRole("navigation", { name: "التنقل الرئيسي للطالب" });
  await expect(adaptiveNav).toBeVisible();
  await expect(page.getByRole("navigation", { name: "التنقل الرئيسي للطالب على الهاتف" })).toBeHidden();
  await expect(adaptiveNav.getByRole("link", { name: "الرئيسية" })).toHaveAttribute("aria-current", "page");
  await expect(adaptiveNav.getByRole("link", { name: "الحساب" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await adaptiveNav.getByRole("link", { name: "التدريب" }).click();
  await expect(page).toHaveURL(/\/app\/practice$/);
  await expect(page.locator("#route-content")).toBeFocused();
  await expect(adaptiveNav.getByRole("link", { name: "التدريب" })).toHaveAttribute("aria-current", "page");

  await page.setViewportSize({ width: 1366, height: 900 });
  await expect(adaptiveNav).toBeVisible();
  const navBox = await adaptiveNav.boundingBox();
  expect(navBox).not.toBeNull();
  expect(navBox.height).toBeGreaterThan(navBox.width);
  await expectNoHorizontalOverflow(page);

  await adaptiveNav.getByRole("link", { name: "التنزيلات" }).click();
  await expect(page).toHaveURL(/\/app\/downloads$/);
  await expect(page.locator("#route-content")).toBeFocused();
  await expect(adaptiveNav.getByRole("link", { name: "التنزيلات" })).toHaveAttribute("aria-current", "page");
});
