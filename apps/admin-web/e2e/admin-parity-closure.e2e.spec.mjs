import { expect, test } from "@playwright/test";

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

test("contextual tools preserve lesson export and draft quiz metadata editing", async ({ page }) => {
  await login(page);

  await page.goto("/app/content/lesson-tools");
  const lessonPanel = page.locator('section[aria-labelledby="lesson-content-tools-title"]');
  await expect(lessonPanel.getByRole("heading", { name: "ملخص الدرس والتصدير" })).toBeVisible();
  await lessonPanel.locator("select").first().selectOption({ label: "درس التوليد الأول" });
  const revisionBefore = Number(await lessonPanel.locator(".parity-metric strong").textContent());
  const summary = `ملخص إغلاق G-D ${Date.now()}`;
  await lessonPanel.getByLabel("ملخص الدرس").fill(summary);
  await lessonPanel.getByRole("button", { name: "حفظ الملخص", exact: true }).click();
  await expect(lessonPanel.getByText(/تم حفظ الملخص/)).toBeVisible();
  const revisionAfterSave = Number(await lessonPanel.locator(".parity-metric strong").textContent());
  expect(revisionAfterSave).toBe(revisionBefore + 1);

  const contentDownload = page.waitForEvent("download");
  await lessonPanel.getByRole("button", { name: "تنزيل المحتوى CSV", exact: true }).click();
  expect((await contentDownload).suggestedFilename()).toMatch(/-content\.csv$/);
  const historyDownload = page.waitForEvent("download");
  await lessonPanel.getByRole("button", { name: "تنزيل السجل CSV", exact: true }).click();
  expect((await historyDownload).suggestedFilename()).toMatch(/-history\.csv$/);

  await lessonPanel.getByRole("button", { name: "مسح الملخص", exact: true }).click();
  await lessonPanel.getByRole("button", { name: "تأكيد المسح", exact: true }).click();
  await expect(lessonPanel.getByText(/تم مسح الملخص/)).toBeVisible();
  const revisionAfterClear = Number(await lessonPanel.locator(".parity-metric strong").textContent());
  expect(revisionAfterClear).toBe(revisionAfterSave + 1);

  await page.goto("/app/quizzes/metadata");
  const quizPanel = page.locator('section[aria-labelledby="quiz-metadata-title"]');
  await expect(quizPanel.getByRole("heading", { name: "بيانات الاختبار" })).toBeVisible();
  await quizPanel.locator("select").selectOption({ label: "اختبار التوليد G-D — مسودة" });
  const originalTitle = "اختبار التوليد G-D";
  const editedTitle = `اختبار التوليد G-D contextual ${Date.now()}`;
  await quizPanel.getByLabel("العنوان").fill(editedTitle);
  await quizPanel.getByLabel("الوصف").fill("تحقق من تحرير بيانات الاختبار ضمن سياق الاختبارات");
  await quizPanel.getByRole("button", { name: "حفظ بيانات الاختبار", exact: true }).click();
  await expect(quizPanel.getByText(/تم تحديث بيانات الاختبار/)).toBeVisible();
  await expect(quizPanel.getByLabel("العنوان")).toHaveValue(editedTitle);

  await quizPanel.getByLabel("العنوان").fill(originalTitle);
  await quizPanel.getByLabel("الوصف").fill("");
  await quizPanel.getByRole("button", { name: "حفظ بيانات الاختبار", exact: true }).click();
  await expect(quizPanel.getByLabel("العنوان")).toHaveValue(originalTitle);
});
