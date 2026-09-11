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
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.getByRole("heading", { name: "لوحة التشغيل", exact: true })).toBeVisible();
}

test("Operations dashboard uses real metrics/activity and manages a global notification end to end", async ({ page }) => {
  await login(page);

  const studentMetric = page.locator(".metric-row").filter({ hasText: "الطلاب النشطون" });
  await expect(studentMetric).toBeVisible();
  await expect(studentMetric.locator("strong")).not.toHaveText("0");
  await expect(page.getByText("تسجيل دخول ناجح", { exact: true }).first()).toBeVisible();

  await page.getByRole("tab", { name: "الإشعارات" }).click();
  const compose = page.getByRole("form", { name: "إنشاء إشعار عام" });
  await compose.getByLabel("العنوان").fill("إشعار Chromium التشغيلي");
  await compose.getByLabel("الرسالة").fill("رسالة تشغيلية منشورة من واجهة الإدارة عبر API الحقيقي.");
  await compose.getByLabel("الأهمية").selectOption("warning");
  await compose.getByLabel("مسار داخلي (اختياري)").fill("/student");
  await compose.getByRole("button", { name: "نشر الإشعار" }).click();

  await expect(
    page.getByText("تم نشر الإشعار في المستودع المشترك مع تجربة الطالب.", { exact: true }),
  ).toBeVisible();
  const notification = page.locator(".notification-item").filter({ hasText: "إشعار Chromium التشغيلي" });
  await expect(notification).toBeVisible();
  await expect(notification.getByText("تنبيه", { exact: true })).toBeVisible();
  await expect(notification.locator("code")).toHaveText("/student");

  await page.getByRole("tab", { name: "نظرة تشغيلية" }).click();
  await expect(page.getByText("إشعار Chromium التشغيلي", { exact: true })).toBeVisible();

  await page.getByRole("tab", { name: "الإشعارات" }).click();
  const refreshedNotification = page.locator(".notification-item").filter({ hasText: "إشعار Chromium التشغيلي" });
  await refreshedNotification.getByRole("button", { name: "حذف" }).click();
  await refreshedNotification.getByRole("button", { name: "تأكيد الحذف" }).click();
  await expect(page.getByText("تم حذف الإشعار وتوقف ظهوره للطلاب.", { exact: true })).toBeVisible();
  await expect(page.locator(".notification-item").filter({ hasText: "إشعار Chromium التشغيلي" })).toHaveCount(0);
});

test("Operations dashboard returns to login after the real Admin session expires", async ({ page }) => {
  await login(page);
  const refresh = page.getByRole("button", { name: "تحديث" });
  await expect(refresh).toBeEnabled();

  await logoutRealAdminSession(page);
  await refresh.click();

  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await expect(page.getByRole("button", { name: "لوحة التشغيل" })).toHaveCount(0);
});

test("Operations and notifications stay within a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.getByRole("tab", { name: "الإشعارات" }).click();
  await expect(page.getByRole("heading", { name: "إشعار عام جديد", exact: true })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});
