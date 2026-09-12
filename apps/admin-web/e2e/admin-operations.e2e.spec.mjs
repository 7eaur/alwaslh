import { expect, test } from "@playwright/test";
import { logoutRealAdminSession } from "./stage13e-real-api.mjs";

const enabled = process.env.STAGE13G_E2E === "1";
test.skip(!enabled, "Stage13G browser fixture is only available in the Stage13G integration workflow");

const adminIdentifier = process.env.STAGE13G_ADMIN_IDENTIFIER ?? "stage13g-admin-ui";
const adminPassword = process.env.STAGE13G_ADMIN_PASSWORD ?? "Stage13gAdminUiPass123!";

async function login(page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await page.getByLabel("معرّف المدير").fill(adminIdentifier);
  await page.getByLabel("كلمة المرور").fill(adminPassword);
  const attentionResponse = page.waitForResponse(
    (response) => response.url().includes("/v1/admin/operations/attention") && response.status() === 200,
  );
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.getByRole("heading", { name: "نظرة عامة", exact: true })).toBeVisible();
  return (await attentionResponse).json();
}

async function openHealthFromOverview(page) {
  await page
    .getByRole("navigation", { name: "مسارات عمل سريعة" })
    .getByRole("link", { name: "الحالة والمشكلات", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "الحالة والمشكلات", exact: true })).toBeVisible();
}

test("Overview is attention-first and notification management remains a real end-to-end workflow", async ({ page }) => {
  const attention = await login(page);
  expect(attention).toHaveProperty("review");
  expect(attention).toHaveProperty("failures");
  expect(attention).toHaveProperty("support");
  expect(attention).toHaveProperty("recentActivity");
  expect(attention).not.toHaveProperty("settings");
  expect(attention).not.toHaveProperty("security");

  await expect(page.getByText("ما الذي يحتاج انتباهك الآن؟", { exact: false })).toBeVisible();
  await openHealthFromOverview(page);

  await page.getByRole("link", { name: "إدارة الإشعارات", exact: true }).click();
  await expect(page.getByRole("heading", { name: "إشعارات الطلاب", exact: true })).toBeVisible();

  const compose = page.getByRole("form", { name: "إنشاء إشعار عام" });
  await compose.getByLabel("العنوان").fill("إشعار Chromium التشغيلي");
  await compose.getByLabel("الرسالة").fill("رسالة تشغيلية منشورة من واجهة الإدارة عبر API الحقيقي.");
  await compose.getByLabel("الأهمية").selectOption("warning");
  await compose.getByLabel("وجهة داخل التطبيق (اختياري)").fill("/app/learn");
  await compose.getByRole("button", { name: "نشر الإشعار" }).click();

  await expect(page.getByText("تم نشر الإشعار للطلاب.", { exact: true })).toBeVisible();
  const notification = page.locator(".notification-item").filter({ hasText: "إشعار Chromium التشغيلي" });
  await expect(notification).toBeVisible();
  await expect(notification.getByText("تنبيه", { exact: true })).toBeVisible();
  await expect(notification.locator("code")).toHaveText("/app/learn");

  await notification.getByRole("button", { name: "حذف" }).click();
  await notification.getByRole("button", { name: "تأكيد الحذف" }).click();
  await expect(page.getByText("تم حذف الإشعار وتوقف ظهوره للطلاب.", { exact: true })).toBeVisible();
  await expect(page.locator(".notification-item").filter({ hasText: "إشعار Chromium التشغيلي" })).toHaveCount(0);
});

test("Overview returns to login after the real Admin session expires", async ({ page }) => {
  await login(page);
  const refresh = page.getByRole("button", { name: "تحديث", exact: true });
  await expect(refresh).toBeEnabled();

  await logoutRealAdminSession(page);
  await refresh.click();

  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "نظرة عامة", exact: true })).toHaveCount(0);
});

test("Overview, health, and notifications stay within a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await openHealthFromOverview(page);
  await page.getByRole("link", { name: "إدارة الإشعارات", exact: true }).click();
  await expect(page.getByRole("heading", { name: "إشعارات الطلاب", exact: true })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});
