import { expect, test } from "@playwright/test";
import { logoutRealAdminSession } from "./stage13e-real-api.mjs";

const enabled = process.env.STAGE13F_E2E === "1";
test.skip(!enabled, "Stage13F browser fixture is only available in the Stage13F integration workflow");

const adminIdentifier = process.env.STAGE13F_ADMIN_IDENTIFIER ?? "stage13f-admin-ui";
const adminPassword = process.env.STAGE13F_ADMIN_PASSWORD ?? "Stage13fAdminUiPass123!";
const approvedOutputId = process.env.STAGE13F_E2E_OUTPUT_ID ?? "13000000-0000-4000-8000-000000000004";
const regenerationOutputId = process.env.STAGE13F_E2E_REGEN_OUTPUT_ID ?? "13000000-0000-4000-8000-000000000007";

async function login(page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await page.getByLabel("معرّف المدير").fill(adminIdentifier);
  await page.getByLabel("كلمة المرور").fill(adminPassword);
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.getByRole("heading", { name: "نظرة عامة", exact: true })).toBeVisible();
}

async function openQuestionBank(page) {
  await page.goto("/app/questions");
  await expect(page.getByRole("heading", { name: "بنك الأسئلة", exact: true })).toBeVisible();
}

async function openQuestionManager(page) {
  await page.goto("/app/questions/manage");
  await expect(page.getByRole("heading", { name: "بنك الأسئلة", exact: true })).toBeVisible();
}

async function openQuizBuilder(page) {
  await page.goto("/app/quizzes");
  await expect(page.getByRole("heading", { name: "منشئ الاختبارات والنماذج", exact: true })).toBeVisible();
}

async function searchQuestion(page, text) {
  const filters = page.locator(".qb-filter-bar");
  await filters.getByPlaceholder("ابحث في نص السؤال").fill(text);
  await filters.getByRole("button", { name: "تطبيق المرشحات" }).click();
}

async function selectFixtureScope(panel) {
  await panel.getByLabel("الصف").selectOption({ label: "الصف التجريبي لبنك الأسئلة" });
  await panel.getByLabel("المادة").selectOption({ label: "العلوم التجريبية" });
  await panel.getByLabel("درس الطاقة التجريبي").check();
}

test("Question Bank list routes to durable detail, supports direct deep link, and publishes reviewed authority", async ({ page }) => {
  await login(page);
  await openQuestionBank(page);

  const pagination = page.locator(".qb-pagination");
  await expect(pagination).toContainText("1–30 من 33");
  await pagination.getByRole("button", { name: "التالي" }).click();
  await expect(page.getByText("سؤال الصفحة الثانية في بنك الأسئلة", { exact: true })).toBeVisible();
  await pagination.getByRole("button", { name: "السابق" }).click();

  const filters = page.locator(".qb-filter-bar");
  await filters.getByLabel("الحالة").selectOption("review");
  await filters.getByRole("button", { name: "تطبيق المرشحات" }).click();

  const reviewCard = page.locator(".qb-question-card").filter({ hasText: "أي الخيارات يمثل وحدة قياس الطاقة؟" });
  await expect(reviewCard).toBeVisible();
  await reviewCard.click();
  await expect(page).toHaveURL(/\/app\/questions\/[0-9a-f-]+$/);

  const directUrl = page.url();
  const detail = page.getByTestId("question-detail-page");
  await expect(page.getByRole("heading", { name: "تفاصيل السؤال", exact: true })).toBeVisible();
  await expect(detail.getByRole("heading", { name: "أي الخيارات يمثل وحدة قياس الطاقة؟", exact: true })).toBeVisible();
  await expect(detail.locator(".qb-status-review")).toBeVisible();
  await expect(detail.getByText("الجول", { exact: true }).first()).toBeVisible();

  await page.goto(directUrl);
  await expect(page.getByTestId("question-detail-page")).toBeVisible();
  await expect(page.getByRole("heading", { name: "أي الخيارات يمثل وحدة قياس الطاقة؟", exact: true })).toBeVisible();

  await page.getByTestId("question-detail-page").getByRole("button", { name: "نشر النسخة" }).click();
  await expect(page.getByText("نُشرت النسخة التي كانت قيد المراجعة.", { exact: true })).toBeVisible();
  await expect(page.getByTestId("question-detail-page").locator(".qb-status-published")).toBeVisible();
});

test("Question Bank routed editor creates a revision and preserves submit-review/reject authority", async ({ page }) => {
  await login(page);
  await openQuestionBank(page);
  await searchQuestion(page, "سؤال الصفحة الثانية في بنك الأسئلة");

  const card = page.locator(".qb-question-card").filter({ hasText: "سؤال الصفحة الثانية في بنك الأسئلة" });
  await expect(card).toBeVisible();
  await card.click();

  const detail = page.getByTestId("question-detail-page");
  await detail.getByRole("button", { name: "إنشاء نسخة معدلة" }).click();
  const editor = page.getByTestId("question-detail-editor");
  await expect(editor).toBeVisible();
  await editor.getByLabel("نص السؤال").fill("سؤال الصفحة الثانية بعد التعديل المساري");
  await editor.getByRole("button", { name: "حفظ النسخة الجديدة" }).click();

  await expect(page.getByText("حُفظ التعديل في نسخة مسودة جديدة مع إبقاء النسخ السابقة محفوظة.", { exact: true })).toBeVisible();
  await expect(detail.getByRole("heading", { name: "سؤال الصفحة الثانية بعد التعديل المساري", exact: true })).toBeVisible();
  await expect(detail.locator(".qb-status-draft")).toBeVisible();

  await detail.getByRole("button", { name: "إرسال للمراجعة" }).click();
  await expect(page.getByText("أُرسل السؤال للمراجعة.", { exact: true })).toBeVisible();
  await expect(detail.locator(".qb-status-review")).toBeVisible();

  await detail.getByLabel("سبب الإرجاع").fill("إثبات مسار الإرجاع قبل النشر");
  await detail.getByRole("button", { name: "إرجاع للمسودة" }).click();
  await expect(page.getByText("أُعيد السؤال إلى المسودة مع حفظ سبب القرار.", { exact: true })).toBeVisible();
  await expect(detail.locator(".qb-status-draft")).toBeVisible();
});

test("Question Bank routed detail applies an approved regeneration to the same question identity", async ({ page }) => {
  await login(page);
  await openQuestionBank(page);
  await searchQuestion(page, "سؤال تجريبي رقم 30 لملء الصفحة الأولى");

  const card = page.locator(".qb-question-card").filter({ hasText: "سؤال تجريبي رقم 30 لملء الصفحة الأولى" });
  await expect(card).toBeVisible();
  await card.click();

  const detail = page.getByTestId("question-detail-page");
  await expect(detail.locator(".qb-status-published")).toBeVisible();
  await expect(detail.getByText("إجابة تجريبية 30", { exact: false })).toBeVisible();
  const itemUrl = page.url();

  await detail.getByRole("button", { name: "تطبيق إعادة توليد معتمدة" }).click();
  const regeneration = page.getByTestId("question-detail-regeneration");
  await regeneration.getByLabel("معرف مخرج إعادة التوليد المعتمد").fill(regenerationOutputId);
  await regeneration.getByRole("button", { name: "إنشاء Draft revision" }).click();

  await expect(page.getByText("تم إنشاء Draft revision جديدة لنفس هوية السؤال من مخرج إعادة التوليد المعتمد.", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(itemUrl);
  await expect(detail.getByRole("heading", { name: "كيف يمكن صياغة السؤال التجريبي رقم 30 بصورة بديلة؟", exact: true })).toBeVisible();
  await expect(detail.locator(".qb-status-draft")).toBeVisible();
  await expect(detail.locator("summary").filter({ hasText: "سجل النسخ" })).toContainText("2");
});

test("Question Bank manual create remains reachable through the temporary manager and lands in routed lifecycle", async ({ page }) => {
  await login(page);
  await openQuestionManager(page);

  await page.getByRole("button", { name: "سؤال يدوي جديد" }).click();
  const editor = page.locator(".qb-editor-panel").filter({ hasText: "إنشاء سؤال يدوي" });
  await expect(editor.getByRole("heading", { name: "إنشاء سؤال يدوي" })).toBeVisible();
  await selectFixtureScope(editor);
  await editor.getByLabel("نص السؤال").fill("ما المقصود بالطاقة الحركية في السؤال اليدوي؟");
  await editor.getByLabel("النوع").selectOption("direct");
  await editor.getByLabel("حالة الإجابة").selectOption("known");
  await editor.getByLabel("الإجابة النصية").fill("طاقة يمتلكها الجسم بسبب حركته");
  await editor.getByLabel("التوضيح (اختياري)").fill("تزداد الطاقة الحركية بزيادة الكتلة أو السرعة.");
  await editor.getByRole("button", { name: "حفظ كمسودة" }).click();
  await expect(page.getByText("تم إنشاء السؤال كمسودة. لم يصل إلى النشر بعد.", { exact: true })).toBeVisible();

  await openQuestionBank(page);
  await searchQuestion(page, "الطاقة الحركية في السؤال اليدوي");
  await page.locator(".qb-question-card").filter({ hasText: "ما المقصود بالطاقة الحركية في السؤال اليدوي؟" }).click();
  const detail = page.getByTestId("question-detail-page");
  await detail.getByRole("button", { name: "إرسال للمراجعة" }).click();
  await expect(page.getByText("أُرسل السؤال للمراجعة.", { exact: true })).toBeVisible();
  await detail.getByRole("button", { name: "نشر النسخة" }).click();
  await expect(page.getByText("نُشرت النسخة التي كانت قيد المراجعة.", { exact: true })).toBeVisible();
});

test("Question Bank imports only the pre-approved AI fixture through the temporary manager with provenance", async ({ page }) => {
  await login(page);
  await openQuestionManager(page);

  await page.getByRole("button", { name: "استيراد مخرج AI" }).click();
  const editor = page.locator(".qb-editor-panel").filter({ hasText: "استيراد مخرج AI معتمد" });
  await expect(editor.getByRole("heading", { name: "استيراد مخرج AI معتمد" })).toBeVisible();
  await editor.getByLabel("معرف مخرج AI").fill(approvedOutputId);
  await selectFixtureScope(editor);
  await editor.getByRole("button", { name: "استيراد كمسودات" }).click();
  await expect(page.getByText("تم استيراد 1 سؤال كمسودات قابلة للمراجعة.", { exact: true })).toBeVisible();

  await openQuestionBank(page);
  await searchQuestion(page, "ما التحول الرئيس للطاقة الموضح في المصدر؟");
  await page.locator(".qb-question-card").filter({ hasText: "ما التحول الرئيس للطاقة الموضح في المصدر؟" }).click();
  const detail = page.getByTestId("question-detail-page");
  await expect(detail.getByRole("heading", { name: "ما التحول الرئيس للطاقة الموضح في المصدر؟", exact: true })).toBeVisible();
  const sourceEvidence = detail.locator(".qb-source-list article").filter({ hasText: "صفحة 1" });
  await expect(sourceEvidence).toContainText("تحول الطاقة");
});

test("Question Bank returns to login after the real Admin session expires", async ({ page }) => {
  await login(page);
  await openQuestionBank(page);
  const refresh = page.getByRole("button", { name: "تحديث" });
  await expect(refresh).toBeEnabled();
  await logoutRealAdminSession(page);
  await refresh.click();
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "بنك الأسئلة", exact: true })).toHaveCount(0);
});

test("Question Bank routed detail stays within a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await openQuestionBank(page);
  await searchQuestion(page, "ما تعريف الطاقة في هذا الاختبار؟");
  await page.locator(".qb-question-card").filter({ hasText: "ما تعريف الطاقة في هذا الاختبار؟" }).click();
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test("Quiz Builder creates a model from published Question Bank revisions and publishes immutable snapshots", async ({ page }) => {
  await login(page);
  await openQuizBuilder(page);

  await page.getByRole("button", { name: "اختبار جديد" }).click();
  const createEditor = page.locator(".qz-editor-panel").filter({ hasText: "إنشاء اختبار جديد" });
  await expect(createEditor.getByRole("heading", { name: "إنشاء اختبار جديد" })).toBeVisible();
  await createEditor.getByLabel("عنوان الاختبار").fill("اختبار الطاقة المنشور من منشئ الاختبارات");
  await createEditor.getByLabel("الوصف").fill("اختبار متكامل يتحقق من snapshot منشورة من بنك الأسئلة.");
  await selectFixtureScope(createEditor);
  await createEditor.getByRole("button", { name: "حفظ كمسودة" }).click();

  await expect(page.getByText("تم إنشاء الاختبار كمسودة. أضف نموذجًا من الأسئلة المنشورة قبل المراجعة.", { exact: true })).toBeVisible();
  const detail = page.getByTestId("quiz-builder-detail");
  await expect(detail.getByRole("heading", { name: "اختبار الطاقة المنشور من منشئ الاختبارات" })).toBeVisible();
  await expect(detail.getByTestId("quiz-status")).toHaveText("مسودة");

  await detail.getByRole("button", { name: "إضافة نموذج" }).click();
  const versionEditor = page.locator(".qz-editor-panel").filter({ hasText: "إضافة نموذج اختبار" });
  const candidate = versionEditor.locator(".qz-candidate-card").filter({ hasText: "ما تعريف الطاقة في هذا الاختبار؟" });
  await expect(candidate).toBeVisible();
  await candidate.locator('input[type="checkbox"]').check();
  await versionEditor.getByRole("button", { name: "إنشاء النموذج" }).click();

  await expect(page.getByText("تم إنشاء نموذج الاختبار من revisions منشورة وثابتة.", { exact: true })).toBeVisible();
  await detail.getByRole("button", { name: "إرسال للمراجعة" }).click();
  await expect(detail.getByTestId("quiz-status")).toHaveText("قيد المراجعة");
  await detail.getByRole("button", { name: "نشر الاختبار" }).click();
  await expect(detail.getByTestId("quiz-status")).toHaveText("منشور");
  await expect(detail.getByRole("button", { name: "إضافة نموذج" })).toHaveCount(0);
  await expect(detail.getByRole("button", { name: "تعديل الأسئلة" })).toHaveCount(0);
});

test("Quiz Builder stays within a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await openQuizBuilder(page);
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});
