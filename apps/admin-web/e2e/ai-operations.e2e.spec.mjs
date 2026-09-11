import { expect, test } from "@playwright/test";
import {
  findTerminalOpenReviewFixture,
  logoutRealAdminSession,
  terminateReviewOutOfBand,
} from "./stage13e-real-api.mjs";

const enabled = process.env.STAGE13E_E2E === "1";
test.skip(!enabled, "Stage13E browser fixture is only available in the combined integration workflow");

const adminIdentifier = process.env.STAGE13E_ADMIN_IDENTIFIER ?? "stage13e-admin-ui";
const adminPassword = process.env.STAGE13E_ADMIN_PASSWORD ?? "Stage13eAdminUiPass123!";
const seededJobType = process.env.STAGE13E_E2E_JOB_TYPE;
const raceJobType = process.env.STAGE13E_E2E_RACE_JOB_TYPE;
const paginationJobType = process.env.STAGE13E_E2E_PAGINATION_JOB_TYPE;

function requireFixture() {
  if (!seededJobType) {
    throw new Error("STAGE13E_E2E_JOB_TYPE is required when STAGE13E_E2E=1; do not silently skip the real fixture");
  }
  return seededJobType;
}

function requireRaceFixture() {
  if (!raceJobType) {
    throw new Error(
      "STAGE13E_E2E_RACE_JOB_TYPE is required when STAGE13E_E2E=1; seed a separate terminal job with an open review output for the real 409 race",
    );
  }
  return raceJobType;
}

function requirePaginationFixture() {
  if (!paginationJobType) {
    throw new Error(
      "STAGE13E_E2E_PAGINATION_JOB_TYPE is required when STAGE13E_E2E=1; seed the durable history pagination marker",
    );
  }
  return paginationJobType;
}

async function login(page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await page.getByLabel("معرّف المدير").fill(adminIdentifier);
  await page.getByLabel("كلمة المرور").fill(adminPassword);
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.getByRole("heading", { name: "لوحة التشغيل", exact: true })).toBeVisible();
}

async function openAiWorkspace(page) {
  await page.getByRole("button", { name: "عمليات AI والمراجعة", exact: true }).click();
  await expect(page.getByRole("heading", { name: "عمليات AI", exact: true })).toBeVisible();
}

async function openJob(page, jobType) {
  const card = page.locator(".ai-job-card").filter({ hasText: jobType }).first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.getByRole("heading", { name: jobType })).toBeVisible();
}

async function openSeededJob(page) {
  await openJob(page, requireFixture());
}

test("Admin AI operations navigate complete durable job, unit and attempt history", async ({ page }) => {
  await login(page);
  await openAiWorkspace(page);

  const jobsPagination = page.getByRole("navigation", { name: "صفحات سجل مهام AI" });
  await expect(jobsPagination).toContainText("1–30 من");
  await jobsPagination.getByRole("button", { name: "التالي" }).click();
  await openJob(page, requirePaginationFixture());

  await jobsPagination.getByRole("button", { name: "السابق" }).click();
  await openSeededJob(page);

  const unitsPagination = page.getByRole("navigation", { name: "صفحات وحدات مهمة AI" });
  await expect(unitsPagination).toContainText("1–50 من 51");
  await unitsPagination.getByRole("button", { name: "التالي" }).click();
  await expect(page.locator(".ai-unit-card").filter({ hasText: "الوحدة 51" })).toBeVisible();

  await unitsPagination.getByRole("button", { name: "السابق" }).click();
  await page.locator(".ai-unit-card").first().click();

  const attemptsPagination = page.getByRole("navigation", { name: "صفحات محاولات وحدة AI" });
  await expect(attemptsPagination).toContainText("1–50 من 51");
  await attemptsPagination.getByRole("button", { name: "التالي" }).click();
  await expect(page.getByText("المحاولة 1", { exact: true })).toBeVisible();
});

test("Admin AI operations keep canonical review authority while navigating the full audit and survive reload", async ({ page }) => {
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

  const reviewPagination = page.getByRole("navigation", { name: "صفحات سجل مراجعة مخرج AI" });
  await expect(reviewPagination).toContainText("1–50 من 101");
  await reviewPagination.getByRole("button", { name: "التالي" }).click();
  await expect(reviewPagination).toContainText("51–100 من 101");
  await reviewPagination.getByRole("button", { name: "التالي" }).click();
  await expect(reviewPagination).toContainText("101–101 من 101");

  await page.getByText("سجل المراجعة (101)", { exact: true }).click();
  await expect(page.getByText("stage13e-e2e-review-1", { exact: true })).toBeVisible();

  // The displayed audit page contains the oldest revision, but action authority must
  // still come from the canonical latest revision queried independently by the server.
  const approve = page.getByRole("button", { name: "اعتماد بعد المراجعة" });
  await expect(approve).toBeVisible();
  await expect(approve).toBeEnabled();
  await approve.click();
  await expect(page.getByText("معتمد بعد المراجعة", { exact: true })).toBeVisible();
  await expect(page.getByText("لا توجد إجراءات مراجعة متاحة.", { exact: true })).toBeVisible();
  await expect(reviewPagination).toContainText("101–102 من 102");

  await page.reload();
  await expect(page.getByRole("heading", { name: "لوحة التشغيل", exact: true })).toBeVisible();
  await openAiWorkspace(page);
  await openSeededJob(page);
  await page.locator(".ai-unit-card").first().click();
  await expect(page.getByText("معتمد بعد المراجعة", { exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "صفحات سجل مراجعة مخرج AI" })).toContainText("1–50 من 102");
});

test("Admin AI operations return to login after the real Admin session expires", async ({ page }) => {
  await login(page);
  await openAiWorkspace(page);
  const refresh = page.getByRole("button", { name: "تحديث الحالة" });
  await expect(refresh).toBeEnabled();

  await logoutRealAdminSession(page);
  await refresh.click();

  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await expect(page.getByRole("button", { name: "عمليات AI والمراجعة" })).toHaveCount(0);
});

test("Admin AI operations refresh canonical review state after a real 409 race", async ({ page }) => {
  const jobType = requireRaceFixture();
  await login(page);
  const fixture = await findTerminalOpenReviewFixture(page, jobType);
  await openAiWorkspace(page);
  await openJob(page, jobType);

  const unit = page.locator(".ai-unit-card").nth(fixture.unitIndex);
  await expect(unit).toBeVisible();
  await unit.click();
  await expect(page.getByRole("heading", { name: "مراجعة المخرَج" })).toBeVisible();

  const staleApprove = page.getByRole("button", { name: "اعتماد بعد المراجعة" });
  await expect(staleApprove).toBeVisible();
  await expect(staleApprove).toBeEnabled();

  await terminateReviewOutOfBand(page, fixture.outputId);
  await staleApprove.click();

  await expect(
    page.getByText("سبق أن تغيرت حالة المراجعة أو لم يعد القرار صالحًا. تم تحديث المخرج من الخادم.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("مرفوض", { exact: true })).toBeVisible();
  await expect(page.getByText("لا توجد إجراءات مراجعة متاحة.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "اعتماد بعد المراجعة" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "رفض المخرَج" })).toHaveCount(0);
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