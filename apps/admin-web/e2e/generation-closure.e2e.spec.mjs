import { expect, test } from "@playwright/test";

const enabled = process.env.STAGE13F_E2E === "1";
test.skip(!enabled, "Stage13F browser fixture is only available in the Stage13F integration workflow");

const adminIdentifier = process.env.STAGE13F_ADMIN_IDENTIFIER ?? "stage13f-admin-ui";
const adminPassword = process.env.STAGE13F_ADMIN_PASSWORD ?? "Stage13fAdminUiPass123!";
const closureJobType = "stage13f_e2e_generation_closure";
const generatedPrompt = "ما الفكرة التي يثبتها مصدر إغلاق مسار التوليد؟";

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

test("approved generated lesson questions apply from AI Reviews into Question Bank with page provenance", async ({ page }) => {
  await login(page);

  await page.goto("/app/reviews/ai");
  await expect(page.getByRole("heading", { name: "مراجعات الذكاء الاصطناعي", exact: true })).toBeVisible();

  const job = page.locator(`.ai-review-job[data-job-type="${closureJobType}"]`).first();
  await expect(job).toBeVisible();
  await job.click();
  await expect(page.locator(".ai-review-job-detail")).toBeVisible();

  const unit = page.locator(".ai-review-unit").first();
  await expect(unit).toBeVisible();
  await unit.click();
  await expect(page.getByRole("heading", { name: "مراجعة النتيجة" })).toBeVisible();
  await expect(page.getByText(generatedPrompt, { exact: true })).toBeVisible();

  const application = page.getByRole("region", { name: "تطبيق النتيجة المعتمدة" });
  await expect(application).toBeVisible();
  const apply = application.getByRole("button", { name: "تطبيق النتيجة على الدرس", exact: true });
  await expect(apply).toBeEnabled();
  await apply.click();
  await expect(page.getByRole("status")).toContainText("أضيفت 1 مسودة إلى بنك الأسئلة");
  await expect(page.getByRole("status")).toContainText("لا يتم نشر الأسئلة تلقائيًا");

  await openQuestionBank(page);
  const filters = page.locator(".qb-filter-bar");
  await filters.getByPlaceholder("ابحث في نص السؤال").fill(generatedPrompt);
  await filters.getByRole("button", { name: "تطبيق المرشحات" }).click();

  const card = page.locator(".qb-question-card").filter({ hasText: generatedPrompt });
  await expect(card).toBeVisible();
  await card.click();

  const detail = page.getByTestId("question-detail-page");
  await expect(detail.getByRole("heading", { name: generatedPrompt, exact: true })).toBeVisible();
  await expect(detail.locator(".qb-status-draft").first()).toBeVisible();
  const sourceEvidence = detail.locator(".qb-source-list article").filter({ hasText: "صفحة 1" });
  await expect(sourceEvidence).toBeVisible();
  await expect(sourceEvidence).toContainText("تحول الطاقة");
});
