import { expect, test } from "@playwright/test";
import { logoutRealAdminSession } from "./stage13e-real-api.mjs";

const enabled = process.env.STAGE13F_E2E === "1";
test.skip(!enabled, "Stage13F browser fixture is only available in the Stage13F integration workflow");

const adminIdentifier = process.env.STAGE13F_ADMIN_IDENTIFIER ?? "stage13f-admin-ui";
const adminPassword = process.env.STAGE13F_ADMIN_PASSWORD ?? "Stage13fAdminUiPass123!";
const approvedOutputId = process.env.STAGE13F_E2E_OUTPUT_ID ?? "13000000-0000-4000-8000-000000000004";

async function login(page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await page.getByLabel("معرّف المدير").fill(adminIdentifier);
  await page.getByLabel("كلمة المرور").fill(adminPassword);
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.getByRole("heading", { name: "الصفوف والمواد والدروس" })).toBeVisible();
}

async function openQuestionBank(page) {
  await page.getByRole("button", { name: "بنك الأسئلة" }).click();
  await expect(page.getByRole("heading", { name: "بنك الأسئلة", exact: true })).toBeVisible();
}

async function selectFixtureScope(panel) {
  await panel.getByLabel("الصف").selectOption({ label: "الصف التجريبي لبنك الأسئلة" });
  await panel.getByLabel("المادة").selectOption({ label: "العلوم التجريبية" });
  await panel.getByLabel("درس الطاقة التجريبي").check();
}

test("Question Bank reaches later pages and publishes a reviewed durable question", async ({ page }) => {
  await login(page);
  await openQuestionBank(page);

  const pagination = page.getByRole("navigation", { name: "صفحات بنك الأسئلة" });
  await expect(pagination).toContainText("1–30 من 33");
  await pagination.getByRole("button", { name: "التالي" }).click();
  await expect(page.getByText("سؤال الصفحة الثانية في بنك الأسئلة", { exact: true })).toBeVisible();

  await pagination.getByRole("button", { name: "السابق" }).click();
  const filters = page.getByRole("form", { name: "فلترة بنك الأسئلة" });
  await filters.getByLabel("الحالة").selectOption("review");
  await filters.getByRole("button", { name: "تطبيق" }).click();

  const reviewCard = page.locator(".qb-question-card").filter({ hasText: "أي الخيارات يمثل وحدة قياس الطاقة؟" });
  await expect(reviewCard).toBeVisible();
  await reviewCard.click();
  const detail = page.locator(".qb-detail");
  await expect(detail.locator(".qb-detail-heading .qb-status-review")).toBeVisible();
  await expect(detail.getByText("الجول", { exact: true }).first()).toBeVisible();

  await detail.getByRole("button", { name: "نشر النسخة" }).click();
  await expect(page.getByText("نُشرت النسخة التي كانت قيد المراجعة.", { exact: true })).toBeVisible();
  await expect(detail.locator(".qb-detail-heading .qb-status-published")).toBeVisible();
});

test("Question Bank creates, reviews and publishes a manual direct question through the real API", async ({ page }) => {
  await login(page);
  await openQuestionBank(page);

  await page.getByRole("button", { name: "سؤال يدوي جديد" }).click();
  const editor = page.locator(".qb-editor-panel");
  await expect(editor.getByRole("heading", { name: "إنشاء سؤال يدوي" })).toBeVisible();
  await selectFixtureScope(editor);
  await editor.getByLabel("نص السؤال").fill("ما المقصود بالطاقة الحركية في السؤال اليدوي؟");
  await editor.getByLabel("النوع").selectOption("direct");
  await editor.getByLabel("حالة الإجابة").selectOption("known");
  await editor.getByLabel("الإجابة النصية").fill("طاقة يمتلكها الجسم بسبب حركته");
  await editor.getByLabel("التوضيح (اختياري)").fill("تزداد الطاقة الحركية بزيادة الكتلة أو السرعة.");
  await editor.getByRole("button", { name: "حفظ كمسودة" }).click();

  await expect(page.getByText("تم إنشاء السؤال كمسودة. لم يصل إلى النشر بعد.", { exact: true })).toBeVisible();
  const detail = page.locator(".qb-detail");
  await expect(detail.getByRole("heading", { name: "تفاصيل السؤال" })).toBeVisible();
  await expect(detail.getByRole("heading", { name: "ما المقصود بالطاقة الحركية في السؤال اليدوي؟", exact: true })).toBeVisible();
  await detail.getByRole("button", { name: "إرسال للمراجعة" }).click();
  await expect(page.getByText("أُرسل السؤال للمراجعة.", { exact: true })).toBeVisible();
  await detail.getByRole("button", { name: "نشر النسخة" }).click();
  await expect(page.getByText("نُشرت النسخة التي كانت قيد المراجعة.", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "الصفوف والمواد والدروس" })).toBeVisible();
  await openQuestionBank(page);
  const search = page.getByRole("form", { name: "فلترة بنك الأسئلة" });
  await search.getByLabel("بحث في نص السؤال").fill("الطاقة الحركية");
  await search.getByRole("button", { name: "تطبيق" }).click();
  await expect(page.locator(".qb-question-card").filter({ hasText: "ما المقصود بالطاقة الحركية في السؤال اليدوي؟" })).toBeVisible();
});

test("Question Bank imports only the pre-approved AI fixture as a draft with provenance", async ({ page }) => {
  await login(page);
  await openQuestionBank(page);

  await page.getByRole("button", { name: "استيراد مخرج AI" }).click();
  const editor = page.locator(".qb-editor-panel");
  await expect(editor.getByRole("heading", { name: "استيراد مخرج AI معتمد" })).toBeVisible();
  await editor.getByLabel("معرف مخرج AI").fill(approvedOutputId);
  await selectFixtureScope(editor);
  await editor.getByRole("button", { name: "استيراد كمسودات" }).click();

  await expect(page.getByText("تم استيراد 1 سؤال كمسودات قابلة للمراجعة.", { exact: true })).toBeVisible();
  const detail = page.locator(".qb-detail");
  await expect(detail.getByRole("heading", { name: "ما التحول الرئيس للطاقة الموضح في المصدر؟", exact: true })).toBeVisible();
  const sourceEvidence = detail.locator(".qb-source-list article").filter({ hasText: "صفحة 1" });
  await expect(sourceEvidence).toBeVisible();
  await expect(sourceEvidence).toContainText("تحول الطاقة");

  await detail.getByText("مرجع AI", { exact: true }).click();
  await expect(detail.getByText("stage13f-question-generation · v1", { exact: true })).toBeVisible();
  await expect(detail.getByText("قرار اعتماد #1", { exact: true })).toBeVisible();

  // Replaying the exact approved output must not duplicate the Question Bank mapping.
  await page.getByRole("button", { name: "استيراد مخرج AI" }).click();
  const replayEditor = page.locator(".qb-editor-panel");
  await replayEditor.getByLabel("معرف مخرج AI").fill(approvedOutputId);
  await selectFixtureScope(replayEditor);
  await replayEditor.getByRole("button", { name: "استيراد كمسودات" }).click();
  await expect(
    page.getByText("هذا المخرج سبق استيراده؛ عُرضت الروابط الموجودة بدون إنشاء نسخ مكررة.", { exact: true }),
  ).toBeVisible();
});

test("Question Bank returns to login after the real Admin session expires", async ({ page }) => {
  await login(page);
  await openQuestionBank(page);
  const refresh = page.getByRole("button", { name: "تحديث" });
  await expect(refresh).toBeEnabled();

  await logoutRealAdminSession(page);
  await refresh.click();

  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await expect(page.getByRole("button", { name: "بنك الأسئلة" })).toHaveCount(0);
});

test("Question Bank stays within a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await openQuestionBank(page);

  const publishedCard = page.locator(".qb-question-card").filter({ hasText: "ما تعريف الطاقة في هذا الاختبار؟" });
  await expect(publishedCard).toBeVisible();
  await publishedCard.click();
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});
