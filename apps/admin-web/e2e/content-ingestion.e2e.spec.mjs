import { expect, test } from "@playwright/test";

const enabled = process.env.STAGE13D_E2E === "1";
test.skip(!enabled, "Stage13D browser fixture is only available in the dedicated workflow");

const adminIdentifier = "stage13d-admin-ui";
const adminPassword = "Stage13dAdminUiPass123!";
const lessonTitle = "درس الرفع المختلط التجريبي";
const lessonOption = "الصف التجريبي للرفع · المادة التجريبية للرفع · درس الرفع المختلط التجريبي";

function buildPdf() {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 240 180] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    null,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  const stream = "BT /F1 18 Tf 24 90 Td (Stage13D mixed PDF) Tj ET";
  objects[3] = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`;
  let output = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(output));
    output += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(output);
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    output += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(output);
}

const png = Buffer.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 2, 0, 0, 0, 2, 8, 2, 0,
  0, 0, 253, 212, 154, 115, 0, 0, 0, 22, 73, 68, 65, 84, 120, 156, 99, 252, 207, 192, 192, 192, 192,
  192, 196, 192, 192, 192, 192, 192, 0, 0, 13, 29, 1, 3, 106, 194, 155, 233, 0, 0, 0, 0, 73, 69, 78, 68,
  174, 66, 96, 130,
]);

async function login(page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await page.getByLabel("معرّف المدير").fill(adminIdentifier);
  await page.getByLabel("كلمة المرور").fill(adminPassword);
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.getByRole("heading", { name: "نظرة عامة", exact: true })).toBeVisible();
}

async function openIngestion(page) {
  await page.goto("/app/content");
  await expect(page.getByRole("heading", { name: "رفع المحتوى ومعالجته" })).toBeVisible();
}

function publicationCount(panel, label) {
  return panel.locator(".task-metric").filter({ hasText: label });
}

test("admin preserves mixed file order, processes, reviews, publishes and keeps durable history", async ({ page }) => {
  await login(page);
  await openIngestion(page);
  const uploadPanel = page.locator('section[aria-labelledby="new-ingestion-title"]');
  await uploadPanel.getByLabel("الدرس").selectOption({ label: lessonOption });
  await page.locator('input[type="file"]').setInputFiles([
    { name: "01-cover.png", mimeType: "image/png", buffer: png },
    { name: "02-pages.pdf", mimeType: "application/pdf", buffer: buildPdf() },
    { name: "03-summary.png", mimeType: "image/png", buffer: png },
  ]);
  await expect(page.locator(".selected-file-list strong")).toHaveText([
    "01-cover.png",
    "02-pages.pdf",
    "03-summary.png",
  ]);
  await page.getByRole("button", { name: "إنشاء المهمة ورفع الملفات" }).click();
  await expect(page.getByText("اكتمل رفع الملفات بالترتيب المحدد. ابدأ المعالجة عندما تكون جاهزًا.")).toBeVisible();
  await expect(page.locator(".task-detail .ingestion-status")).toHaveText("جاهز للمعالجة");
  await expect(page.locator(".task-item-list strong")).toHaveText([
    "01-cover.png",
    "02-pages.pdf",
    "03-summary.png",
  ]);
  await page.getByRole("button", { name: "بدء المعالجة" }).click();
  await expect(page.locator(".task-detail .ingestion-status")).toHaveText("اكتملت المعالجة", { timeout: 30_000 });
  await expect(page.locator(".task-metric").filter({ hasText: "الوسائط الناتجة" })).toContainText("3");
  await page.getByRole("button", { name: "ربط بالدرس كمسودة" }).click();
  await expect(
    page.getByText("تم ربط الوسائط بالدرس كمسودة. يمكنك الآن إدارة مراجعة محتوى الدرس ونشره من لوحة قرار النشر."),
  ).toBeVisible();

  const publication = page.locator("section.lesson-publication-panel");
  await expect(publicationCount(publication, "مسودة")).toContainText("3");
  await publication.getByRole("button", { name: "إرسال المسودات للمراجعة" }).click();
  await expect(publicationCount(publication, "قيد المراجعة")).toContainText("3");
  await expect(publication.getByText("تم إرسال مسودات الدرس إلى المراجعة.")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await publication.getByRole("button", { name: "نشر محتوى المراجعة" }).click();
  await expect(publicationCount(publication, "منشور")).toContainText("3");
  await expect(publication.getByText("تم نشر محتوى المراجعة للطلاب.")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "رفع المحتوى ومعالجته" })).toBeVisible();
  const reloadedPublication = page.locator("section.lesson-publication-panel");
  await expect(publicationCount(reloadedPublication, "منشور")).toContainText("3");

  const historyTask = page.locator(".history-task").filter({ hasText: lessonTitle }).first();
  await expect(historyTask).toBeVisible();
  await historyTask.click();
  await page.getByRole("button", { name: "أرشفة المهمة" }).click();
  await expect(page.getByText("تمت أرشفة المهمة مع الاحتفاظ بتاريخها.")).toBeVisible();
  await page.getByLabel("إظهار المؤرشف").check();
  await expect(page.locator(".history-task").filter({ hasText: lessonTitle }).first()).toContainText("مؤرشفة");
});

test("content ingestion workspace remains usable at a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await openIngestion(page);
  await expect(page.getByRole("heading", { name: "مهمة رفع جديدة" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "نشر محتوى الدرس" })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});
