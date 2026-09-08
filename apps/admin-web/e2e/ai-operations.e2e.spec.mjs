import { expect, test } from "@playwright/test";

const enabled = process.env.STAGE13E_E2E === "1";
test.skip(!enabled, "Stage13E browser fixture is only available in the combined integration workflow");

const adminIdentifier = process.env.STAGE13E_ADMIN_IDENTIFIER ?? "stage13e-admin-ui";
const adminPassword = process.env.STAGE13E_ADMIN_PASSWORD ?? "Stage13eAdminUiPass123!";
const seededJobType = process.env.STAGE13E_E2E_JOB_TYPE;

function requireFixture() {
  if (!seededJobType) {
    throw new Error("STAGE13E_E2E_JOB_TYPE is required when STAGE13E_E2E=1; do not silently skip the real fixture");
  }
  return seededJobType;
}

async function login(page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await page.getByLabel("معرّف المدير").fill(adminIdentifier);
  await page.getByLabel("كلمة المرور").fill(adminPassword);
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.getByRole("heading", { name: "الصفوف والمواد والدروس" })).toBeVisible();
}

async function openAiWorkspace(page) {
  await page.getByRole("button", { name: "عمليات AI والمراجعة" }).click();
  await expect(page.getByRole("heading", { name: "عمليات AI" })).toBeVisible();
}

async function openSeededJob(page) {
  const jobType = requireFixture();
  const card = page.locator(".ai-job-card").filter({ hasText: jobType }).first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.getByRole("heading", { name: jobType })).toBeVisible();
}

test("Admin AI operations use server actions, persist review and survive reload", async ({ page }) => {
  await login(page);
  await openAiWorkspace(page);
  await openSeededJob(page);

  await expect(page.getByRole("button", { name: "إيقاف مؤقت" })).toBeVisible();
  await page.getByRole("button", { name: "إيقاف مؤقت" }).click();
  await expect(page.getByText("متوقفة مؤقتًا", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "استئناف" })).toBeVisible();

  await page.getByRole("button", { name: "استئناف" }).click();
  await expect(page.getByRole("button", { name: "إيقاف مؤقت" })).toBeVisible();

  const unit = page.locator(".ai-unit-card").first();
  await expect(unit).toBeVisible();
  await unit.click();
  await expect(page.getByRole("heading", { name: "مراجعة المخرَج" })).toBeVisible();
  await expect(page.getByRole("button", { name: "اعتماد بعد المراجعة" })).toBeVisible();
  await page.getByRole("button", { name: "اعتماد بعد المراجعة" }).click();
  await expect(page.getByText("معتمد بعد المراجعة", { exact: true })).toBeVisible();
  await expect(page.getByText("لا توجد إجراءات مراجعة متاحة.", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "الصفوف والمواد والدروس" })).toBeVisible();
  await openAiWorkspace(page);
  await openSeededJob(page);
  await page.locator(".ai-unit-card").first().click();
  await expect(page.getByText("معتمد بعد المراجعة", { exact: true })).toBeVisible();
});

test("Admin AI operations stay within a 390px viewport", async ({ page }) => {
  requireFixture();
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await openAiWorkspace(page);
  await openSeededJob(page);
  await page.locator(".ai-unit-card").first().click();
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});
