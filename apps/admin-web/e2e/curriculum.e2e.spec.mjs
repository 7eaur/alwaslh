import { expect, test } from "@playwright/test";

const adminIdentifier = "stage13-admin-ui";
const adminPassword = "Stage13AdminUiPass123!";

async function login(page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await page.getByLabel("معرّف المدير").fill(adminIdentifier);
  await page.getByLabel("كلمة المرور").fill(adminPassword);
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.getByRole("heading", { name: "الصفوف والمواد والدروس" })).toBeVisible();
}

async function waitForSaved(page) {
  await expect(page.getByText("تم حفظ التغيير وتحديث بيانات المنهج.")).toBeVisible();
}

test("admin signs in and manages the curriculum hierarchy without destructive deletes", async ({ page }) => {
  await login(page);

  await page.getByText("إضافة صف جديد", { exact: true }).click();
  const classForm = page.locator('form[aria-label="نموذج إضافة صف"]');
  await classForm.getByLabel("اسم الصف").fill("الصف الإداري التجريبي");
  await classForm.getByLabel("المعرّف القصير").fill("admin-test-class");
  await classForm.getByLabel("الترتيب (اختياري)").fill("2");
  await classForm.getByRole("button", { name: "حفظ الصف" }).click();
  await waitForSaved(page);

  await page.getByText("إضافة مادة جديدة", { exact: true }).click();
  const subjectForm = page.locator('form[aria-label="نموذج إضافة مادة"]');
  await subjectForm.getByLabel("اسم المادة").fill("العلوم الإدارية التجريبية");
  await subjectForm.getByLabel("المعرّف القصير").fill("admin-test-science");
  await subjectForm.getByRole("button", { name: "حفظ المادة" }).click();
  await waitForSaved(page);

  await page.getByText("ربط مادة بصف", { exact: true }).click();
  const offeringForm = page.locator('form[aria-label="نموذج ربط مادة بصف"]');
  await offeringForm.getByLabel("الصف للربط").selectOption({ label: "الصف الإداري التجريبي" });
  await offeringForm.getByLabel("المادة للربط").selectOption({ label: "العلوم الإدارية التجريبية" });
  await offeringForm.getByLabel("الترتيب (اختياري)").fill("4");
  await offeringForm.getByRole("button", { name: "إنشاء الربط" }).click();
  await waitForSaved(page);

  await page.getByLabel("الصف").selectOption({ label: /الصف الإداري التجريبي/ });
  await page.getByLabel("المادة ضمن الصف").selectOption({ label: "العلوم الإدارية التجريبية" });
  await expect(page.getByRole("heading", { name: "العلوم الإدارية التجريبية" })).toBeVisible();

  await page.getByText("إضافة وحدة أو قسم", { exact: true }).click();
  const sectionForm = page.locator('form[aria-label="نموذج إضافة وحدة"]');
  await sectionForm.getByLabel("اسم الوحدة").fill("الوحدة التجريبية");
  await sectionForm.getByLabel("المعرّف القصير").fill("admin-test-unit");
  await sectionForm.getByLabel("الترتيب (اختياري)").fill("5");
  await sectionForm.getByRole("button", { name: "حفظ الوحدة" }).click();
  await waitForSaved(page);

  await page.getByText("إضافة درس", { exact: true }).click();
  const lessonForm = page.locator('form[aria-label="نموذج إضافة درس"]');
  await lessonForm.getByLabel("عنوان الدرس").fill("الدرس الإداري الأول");
  await lessonForm.getByLabel("المعرّف القصير").fill("admin-test-lesson");
  await lessonForm.getByLabel("الوحدة (اختيارية)").selectOption({ label: "الوحدة التجريبية" });
  await lessonForm.getByLabel("الترتيب (اختياري)").fill("6");
  await lessonForm.getByRole("button", { name: "حفظ الدرس" }).click();
  await waitForSaved(page);
  await expect(page.getByText("الدرس الإداري الأول", { exact: true })).toBeVisible();

  await page.getByLabel("قسم درس الدرس الإداري الأول").selectOption("");
  await waitForSaved(page);
  const unsectioned = page.locator("section.section-card").filter({
    has: page.getByRole("heading", { name: "دروس بدون قسم" }),
  });
  await expect(unsectioned).toContainText("الدرس الإداري الأول");

  await page.getByText("تعديل اسم الدرس الدرس الإداري الأول", { exact: true }).click();
  const renameInput = page.getByLabel("تعديل اسم الدرس الدرس الإداري الأول");
  await renameInput.fill("الدرس الإداري المحدّث");
  await renameInput.locator("xpath=ancestor::form").getByRole("button", { name: "حفظ" }).click();
  await waitForSaved(page);
  await expect(page.getByText("الدرس الإداري المحدّث", { exact: true })).toBeVisible();

  await page.getByLabel("حالة درس الدرس الإداري المحدّث").selectOption("inactive");
  await waitForSaved(page);
  const updatedLessonRow = page.getByText("الدرس الإداري المحدّث", { exact: true }).locator("xpath=ancestor::li");
  await expect(updatedLessonRow.getByText("غير نشط", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "الصفوف والمواد والدروس" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toHaveCount(0);
  await page.getByLabel("الصف").selectOption({ label: /الصف الإداري التجريبي/ });
  await page.getByLabel("المادة ضمن الصف").selectOption({ label: "العلوم الإدارية التجريبية" });
  await expect(page.getByText("الدرس الإداري المحدّث", { exact: true })).toBeVisible();

  await expect(page.getByRole("button", { name: /حذف/ })).toHaveCount(0);
  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
});

test("admin curriculum remains usable at a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expect(page.getByText("المنهج والمحتوى", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "الصفوف والمواد والدروس" })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});
