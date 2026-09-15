import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

function createStudentFixture() {
  const apiDirectory = resolve(process.cwd(), "../api");
  const fixture = resolve(process.cwd(), "e2e/reader-fixture.ts");
  return JSON.parse(execFileSync(process.execPath, ["--import", "tsx", fixture], { cwd: apiDirectory, env: process.env, encoding: "utf8" }));
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.locator("body").evaluate((body) => ({ scrollWidth: body.scrollWidth, clientWidth: body.clientWidth }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function openAuthenticatedStudent(page) {
  const fixture = createStudentFixture();
  await page.context().addCookies([{ name: fixture.sessionCookieName, value: fixture.sessionToken, url: "http://127.0.0.1:5174", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/");
  await expect(page).toHaveURL(/\/app\/home$/);
  await expect(page.getByRole("heading", { name: "مرحبًا بك" })).toBeVisible();
  return fixture;
}

test("Student shell provides stable mobile destinations, focus, history and actionable offline state", async ({ page }) => {
  const fixture = await openAuthenticatedStudent(page);

  await expect(page.locator(".aw-product-shell")).toHaveAttribute("dir", "rtl");
  const phoneNav = page.getByRole("navigation", { name: "التنقل الرئيسي للطالب على الهاتف" });
  await expect(phoneNav).toBeVisible();
  await expect(phoneNav.getByRole("link")).toHaveCount(4);
  await expect(phoneNav.getByRole("link", { name: "الرئيسية" })).toHaveAttribute("aria-current", "page");
  await expect(phoneNav.getByRole("link", { name: "مكتبتي" })).toBeVisible();
  await expect(page.getByRole("link", { name: "الإشعارات", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "حسابي", exact: true })).toBeVisible();
  await expect(page.locator(".student-network-warning")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);

  await phoneNav.getByRole("link", { name: "التعلّم" }).click();
  await expect(page).toHaveURL(/\/app\/learn$/);
  await expect(page.locator("#route-content")).toBeFocused();
  await expect(page.getByRole("heading", { name: fixture.className })).toBeVisible();
  await expect(phoneNav.getByRole("link", { name: "التعلّم" })).toHaveAttribute("aria-current", "page");

  await page.goBack();
  await expect(page).toHaveURL(/\/app\/home$/);
  await expect(page.locator("#route-content")).toBeFocused();
  await expect(page.getByRole("heading", { name: "مرحبًا بك" })).toBeVisible();

  await phoneNav.getByRole("link", { name: "مكتبتي" }).click();
  await expect(page).toHaveURL(/\/app\/library$/);
  await expect(page.getByRole("region", { name: "مكتبتي" })).toBeVisible();
  await expect(phoneNav.getByRole("link", { name: "مكتبتي" })).toHaveAttribute("aria-current", "page");

  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.locator(".student-network-warning")).toHaveText("غير متصل");
  await page.context().setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.locator(".student-network-warning")).toHaveCount(0);
});

test("Student shell adapts navigation for tablet and desktop without overflow", async ({ page }) => {
  await openAuthenticatedStudent(page);

  await page.setViewportSize({ width: 768, height: 1024 });
  const adaptiveNav = page.getByRole("navigation", { name: "التنقل الرئيسي للطالب" });
  await expect(adaptiveNav).toBeVisible();
  await expect(page.getByRole("navigation", { name: "التنقل الرئيسي للطالب على الهاتف" })).toBeHidden();
  await expect(adaptiveNav.getByRole("link", { name: "الرئيسية" })).toHaveAttribute("aria-current", "page");
  await expect(adaptiveNav.getByRole("link", { name: "مكتبتي" })).toBeVisible();
  await expect(adaptiveNav.getByRole("link", { name: "تقدمي" })).toHaveCount(0);
  await expect(adaptiveNav.getByRole("link", { name: "الحساب" })).toHaveCount(0);
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
  await expect(adaptiveNav.getByRole("link", { name: "تقدمي" })).toBeVisible();
  await expect(adaptiveNav.getByRole("link", { name: "الحساب" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await adaptiveNav.getByRole("link", { name: "مكتبتي" }).click();
  await expect(page).toHaveURL(/\/app\/library$/);
  await expect(page.locator("#route-content")).toBeFocused();
  await expect(adaptiveNav.getByRole("link", { name: "مكتبتي" })).toHaveAttribute("aria-current", "page");

  await adaptiveNav.getByRole("link", { name: "تقدمي" }).click();
  await expect(page).toHaveURL(/\/app\/progress$/);
  await expect(page.getByRole("heading", { name: "سيظهر تقدمك هنا" })).toBeVisible();
});

test("Home matches the approved statistics and quick-access composition with left-only decoration", async ({ page }, testInfo) => {
  await openAuthenticatedStudent(page);

  await expect(page.getByRole("heading", { name: "إحصائياتك" })).toBeVisible();
  await expect(page.locator(".student-home-reference-stat")).toHaveCount(4);
  await expect(page.getByText("الدروس", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("النماذج", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("المحفوظات", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("التنزيلات", { exact: true }).first()).toBeVisible();

  await expect(page.getByRole("heading", { name: "الوصول السريع" })).toBeVisible();
  await expect(page.locator(".student-home-reference-quick")).toHaveCount(4);
  await expectNoHorizontalOverflow(page);

  const decoration = await page.locator(".student-shell").evaluate((element) => {
    const before = getComputedStyle(element, "::before");
    const after = getComputedStyle(element, "::after");
    return { beforeLeft: before.left, beforeRight: before.right, afterDisplay: after.display };
  });
  expect(decoration.beforeLeft).not.toBe("auto");
  expect(decoration.beforeRight).toBe("auto");
  expect(decoration.afterDisplay).toBe("none");

  for (const viewport of [
    { name: "phone", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1366, height: 900 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath(`student-home-reference-${viewport.name}.png`), fullPage: true });
  }
});
