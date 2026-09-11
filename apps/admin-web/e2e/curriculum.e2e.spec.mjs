import { expect, test } from "@playwright/test";

const adminIdentifier = "stage13-admin-ui";
const adminPassword = "Stage13AdminUiPass123!";
const testClassOptionLabel = "الصف الإداري التجريبي — نشط";
const testSubjectOptionLabel = "العلوم الإدارية التجريبية";

async function openCurriculum(page) {
  await page.getByRole("button", { name: "المنهج والمحتوى", exact: true }).click();
  await expect(page.getByRole("heading", { name: "الصفوف والمواد والدروس" })).toBeVisible();
}

async function login(page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await page.getByLabel("معرّف المدير").fill(adminIdentifier);
  await page.getByLabel("كلمة المرور").fill(adminPassword);
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.getByRole("heading", { name: "لوحة التشغيل", exact: true })).toBeVisible();
  await openCurriculum(page);
}

async function waitForSaved(page) {
  await expect(page.getByText("تم حفظ التغيير وتحديث بيانات المنهج.")).toBeVisible();
}

async function selectTestOffering(page) {
  const selectors = page.locator(".selector-row").getByRole("combobox");
  await selectors.nth(0).selectOption({ label: testClassOptionLabel });
  await selectors.nth(1).selectOption({ label: testSubjectOptionLabel });
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
  await subjectForm.getByLabel("اسم المادة").fill(testSubjectOptionLabel);
  await subjectForm.getByLabel("المعرّف القصير").fill("admin-test-science");
  await subjectForm.getByRole("button", { name: "حفظ المادة" }).click();
  await waitForSaved(page);

  await page.getByText("ربط مادة بصف", { exact: true }).click();
  const offeringForm = page.locator('form[aria-label="نموذج ربط مادة بصف"]');
  await offeringForm.getByLabel("الصف للربط").selectOption({ label: "الصف الإداري التجريبي" });
  await offeringForm.getByLabel("المادة للربط").selectOption({ label: testSubjectOptionLabel });
  await offeringForm.getByLabel("الترتيب (اختياري)").fill("4");
  await offeringForm.getByRole("button", { name: "إنشاء الربط" }).click();
  await waitForSaved(page);

  await selectTestOffering(page);
  await expect(page.getByRole("heading", { name: testSubjectOptionLabel })).toBeVisible();

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

  const lessonRow = unsectioned.getByText("الدرس الإداري الأول", { exact: true }).locator("xpath=ancestor::li");
  await lessonRow.locator("summary").filter({ hasText: "تعديل اسم الدرس الدرس الإداري الأول" }).click();
  const renameInput = lessonRow.getByLabel("تعديل اسم الدرس الدرس الإداري الأول");
  await renameInput.fill("الدرس الإداري المحدّث");
  await renameInput.locator("xpath=ancestor::form").getByRole("button", { name: "حفظ" }).click();
  await waitForSaved(page);
  await expect(page.getByText("الدرس الإداري المحدّث", { exact: true })).toBeVisible();

  await page.getByLabel("حالة درس الدرس الإداري المحدّث").selectOption("inactive");
  await waitForSaved(page);
  const updatedLessonRow = page.getByText("الدرس الإداري المحدّث", { exact: true }).locator("xpath=ancestor::li");
  await expect(updatedLessonRow.locator(".status-badge")).toHaveText("غير نشط");

  await page.reload();
  await expect(page.getByRole("heading", { name: "لوحة التشغيل", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toHaveCount(0);
  await openCurriculum(page);
  await selectTestOffering(page);
  await expect(page.getByText("الدرس الإداري المحدّث", { exact: true })).toBeVisible();

  await expect(page.getByRole("button", { name: /حذف/ })).toHaveCount(0);
  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
});

test("admin reviews source media and pending OCR through the operations workspace", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: "الوسائط وOCR" }).click();

  await expect(page.getByRole("heading", { name: "الوسائط وOCR" })).toBeVisible();
  await expect(page.getByText("كتاب تشغيل الوسائط التجريبي", { exact: true })).toBeVisible();

  const metrics = page.locator(".content-metrics");
  await expect(metrics.locator(".metric-card").filter({ hasText: "المستندات" })).toContainText("1");
  await expect(metrics.locator(".metric-card").filter({ hasText: "OCR للمراجعة" })).toContainText("1");

  const documentCard = page.locator("article.content-document-card").filter({
    has: page.getByText("كتاب تشغيل الوسائط التجريبي", { exact: true }),
  });
  await documentCard.getByRole("button", { name: "فتح التفاصيل" }).click();

  const assetRow = page.locator("article.asset-row").filter({
    has: page.getByText("001.jpg", { exact: true }),
  });
  await expect(assetRow.getByText("4 نسخ معالجة", { exact: true })).toBeVisible();
  await expect(assetRow.locator(".status-badge.media-ready")).toHaveText("جاهز");

  await assetRow.getByRole("button", { name: /بانتظار المراجعة/ }).click();
  await expect(page.getByRole("heading", { name: "001.jpg" })).toBeVisible();
  await expect(page.locator("pre.ocr-source-text")).toHaveText("نص خام يحتاج المراجعة");

  const reviewedText = page.getByLabel("النص بعد المراجعة");
  await reviewedText.fill("نص مصحح ومعتمد من الإدارة");
  await page.getByRole("button", { name: "اعتماد النص" }).click();

  await expect(page.locator(".ocr-review-panel .status-badge")).toHaveText("معتمد");
  await expect(reviewedText).toHaveValue("نص مصحح ومعتمد من الإدارة");
  await expect(metrics.locator(".metric-card").filter({ hasText: "OCR للمراجعة" })).toContainText("0");
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