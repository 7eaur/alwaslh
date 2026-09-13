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
  await expect(page.getByRole("heading", { name: "نظرة عامة", exact: true })).toBeVisible();
}

async function openStudents(page) {
  await page.goto("/app/students");
  await expect(page.getByRole("heading", { name: "الطلاب", exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: "أكواد الوصول" })).toHaveCount(0);
}

async function openAccessCodes(page) {
  await page.goto("/app/access-codes");
  await expect(page.getByRole("heading", { name: "الطلاب والوصول", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "أكواد الوصول" }).click();
  await expect(page.getByRole("heading", { name: "أكواد الوصول", exact: true })).toBeVisible();
}

test("Focused student route performs recovery, device rebind and entitlement revoke through the real API", async ({
  page,
}) => {
  await login(page);
  await openStudents(page);

  const studentCard = page.getByRole("button", { name: /طالب الوصول التجريبي/ });
  await expect(studentCard).toBeVisible();
  await studentCard.click();

  const detail = page.locator(".access-detail-panel");
  await expect(detail.getByRole("heading", { name: "طالب الوصول التجريبي", exact: true })).toBeVisible();
  await expect(detail.getByRole("button", { name: "إلغاء الصلاحية" })).toBeVisible();

  await detail.getByRole("button", { name: "إصدار كلمة مرور مؤقتة" }).click();
  const temporaryPassword = detail.locator(".temporary-password-box");
  await expect(temporaryPassword).toBeVisible();
  await expect(temporaryPassword.locator("code")).toHaveText(/^Tmp-/);
  await expect(detail.getByText(/تم إصدار كلمة مرور مؤقتة صالحة لمدة 24 ساعة/)).toBeVisible();

  await detail.getByRole("button", { name: "السماح بإعادة ربط الجهاز" }).click();
  await expect(detail.getByText("تم السماح بإعادة ربط جهاز جديد للطالب.", { exact: true })).toBeVisible();
  await expect(temporaryPassword).toBeVisible();

  await detail.getByRole("button", { name: "إلغاء الصلاحية" }).click();
  await expect(
    detail.getByText("تم إلغاء الصلاحية وتسجيل العملية في سجل الوصول.", { exact: true }),
  ).toBeVisible();
  await expect(detail.getByRole("button", { name: "إلغاء الصلاحية" })).toHaveCount(0);
  await expect(detail.getByText(/موقوف · تنتهي/)).toBeVisible();
});

test("Access-code route generates and non-destructively revokes unused codes", async ({ page }) => {
  await login(page);
  await openAccessCodes(page);

  const generation = page.getByRole("form", { name: "توليد أكواد الوصول" });
  await generation.getByLabel("العدد").fill("2");
  await generation.getByLabel("المدة بالأيام").fill("30");
  await generation.getByRole("button", { name: "توليد الأكواد" }).click();

  const generated = page.locator(".generated-code-panel");
  await expect(generated).toBeVisible();
  await expect(generated.locator(".generated-code-grid code")).toHaveCount(2);
  await expect(page.getByText("تم توليد 2 كود. احتفظ بالنسخة المعروضة قبل مغادرة الصفحة.", { exact: true })).toBeVisible();

  const selection = page.getByText("تحديد الأكواد غير المستخدمة في الصفحة", { exact: true }).locator("..");
  await selection.locator('input[type="checkbox"]').check();
  const revokeButton = page.getByRole("button", { name: /إيقاف المحدد/ });
  await expect(revokeButton).toBeEnabled();
  await revokeButton.click();
  await expect(page.getByText(/تم إيقاف \d+ كود/)).toBeVisible();

  const filters = page.getByRole("form", { name: "فلترة أكواد الوصول" });
  await filters.getByLabel("نوع الكود").selectOption("class_access");
  await expect(filters.getByLabel("الصف")).toBeVisible();
  await filters.getByLabel("الصف").selectOption({ label: "الصف التجريبي للوصول" });
  await expect(page.locator(".access-code-card").first()).toContainText("الصف التجريبي للوصول");
});

test("Focused student route returns to login after the real Admin session expires", async ({ page }) => {
  await login(page);
  await openStudents(page);

  const filters = page.getByRole("form", { name: "فلترة حسابات الطلاب" });
  const search = filters.getByLabel("بحث بالمعرّف أو الاسم");
  await expect(filters.getByRole("button", { name: "تطبيق البحث" })).toBeEnabled();
  await logoutRealAdminSession(page);
  await search.fill("stage13g");
  await filters.getByRole("button", { name: "تطبيق البحث" }).click();

  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "الطلاب", exact: true })).toHaveCount(0);
});

test("Student and access-code routes stay within a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await openStudents(page);

  let dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);

  await openAccessCodes(page);
  dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});