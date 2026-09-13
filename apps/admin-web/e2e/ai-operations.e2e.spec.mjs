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
const apiBaseUrl = process.env.STAGE13E_E2E_API_BASE_URL ?? "http://127.0.0.1:3000";
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
  await expect(page.getByRole("heading", { name: "نظرة عامة", exact: true })).toBeVisible();
}

async function openAiWorkspace(page) {
  await page.goto("/app/reviews/ai");
  await expect(page.getByRole("heading", { name: "مراجعات الذكاء الاصطناعي", exact: true })).toBeVisible();
}

async function openJob(page, jobType) {
  const card = page.locator(`.ai-review-job[data-job-type="${jobType}"]`).first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.locator(".ai-review-job-detail")).toBeVisible();
}

async function openSeededJob(page) {
  await openJob(page, requireFixture());
}

async function ensureDetailsOpen(summary) {
  const details = summary.locator("..");
  if ((await details.getAttribute("open")) === null) {
    await summary.click();
  }
}

test("Admin AI review navigates complete durable job, result and execution history without exposing pipeline labels", async ({ page }) => {
  await login(page);
  await openAiWorkspace(page);

  const jobsPagination = page.getByRole("navigation", { name: "صفحات مهام مراجعة الذكاء الاصطناعي" });
  await expect(jobsPagination).toContainText("1–30 من");
  await jobsPagination.getByRole("button", { name: "التالي" }).click();
  await openJob(page, requirePaginationFixture());

  await jobsPagination.getByRole("button", { name: "السابق" }).click();
  await openSeededJob(page);

  const unitsPagination = page.getByRole("navigation", { name: "صفحات نتائج مهمة الذكاء الاصطناعي" });
  await expect(unitsPagination).toContainText("1–50 من 51");
  await unitsPagination.getByRole("button", { name: "التالي" }).click();
  await expect(page.locator(".ai-review-unit").filter({ hasText: "النتيجة 51" })).toBeVisible();

  await unitsPagination.getByRole("button", { name: "السابق" }).click();
  await page.locator(".ai-review-unit").first().click();

  await ensureDetailsOpen(page.getByText("سجل التنفيذ (51)", { exact: true }));
  const attemptsPagination = page.getByRole("navigation", { name: "صفحات سجل تنفيذ النتيجة" });
  await expect(attemptsPagination).toContainText("1–50 من 51");
  await attemptsPagination.getByRole("button", { name: "التالي" }).click();
  await ensureDetailsOpen(page.getByText("سجل التنفيذ (51)", { exact: true }));
  await expect(page.getByText(/المحاولة 1 —/)).toBeVisible();

  await expect(page.getByText("fixture-provider", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/fixture-route-/)).toHaveCount(0);
});

test("Admin AI review keeps canonical human-review authority and survives reload", async ({ page }) => {
  await login(page);
  await openAiWorkspace(page);
  await openSeededJob(page);

  await expect(page.getByRole("button", { name: "إيقاف مؤقت" })).toBeVisible();
  await page.getByRole("button", { name: "إيقاف مؤقت" }).click();
  await expect(page.getByText("متوقفة مؤقتًا", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "استئناف" })).toBeVisible();

  await page.getByRole("button", { name: "استئناف" }).click();
  await expect(page.getByRole("button", { name: "إيقاف مؤقت" })).toBeVisible();

  const unit = page.locator(".ai-review-unit").first();
  await expect(unit).toBeVisible();
  await unit.click();
  await expect(page.getByRole("heading", { name: "مراجعة النتيجة" })).toBeVisible();

  await ensureDetailsOpen(page.getByText("سجل المراجعة (101)", { exact: true }));
  const reviewPagination = page.getByRole("navigation", { name: "صفحات سجل مراجعة النتيجة" });
  await expect(reviewPagination).toContainText("1–50 من 101");
  await reviewPagination.getByRole("button", { name: "التالي" }).click();
  await ensureDetailsOpen(page.getByText("سجل المراجعة (101)", { exact: true }));
  await expect(reviewPagination).toContainText("51–100 من 101");
  await reviewPagination.getByRole("button", { name: "التالي" }).click();
  await ensureDetailsOpen(page.getByText("سجل المراجعة (101)", { exact: true }));
  await expect(reviewPagination).toContainText("101–101 من 101");
  await expect(page.getByText("stage13e-e2e-review-1", { exact: true })).toBeVisible();

  const approve = page.getByRole("button", { name: "اعتماد بعد المراجعة" });
  await expect(approve).toBeVisible();
  await expect(approve).toBeEnabled();
  await approve.click();
  await expect(page.getByText("معتمد بعد المراجعة", { exact: true })).toBeVisible();
  await expect(page.getByText("لا توجد إجراءات أخرى متاحة لهذه النتيجة.", { exact: true })).toBeVisible();
  await ensureDetailsOpen(page.getByText("سجل المراجعة (102)", { exact: true }));
  await expect(reviewPagination).toContainText("101–102 من 102");

  await page.reload();
  await expect(page.getByRole("heading", { name: "مراجعات الذكاء الاصطناعي", exact: true })).toBeVisible();
  await openSeededJob(page);
  await page.locator(".ai-review-unit").first().click();
  await expect(page.getByText("معتمد بعد المراجعة", { exact: true })).toBeVisible();
  await ensureDetailsOpen(page.getByText("سجل المراجعة (102)", { exact: true }));
  await expect(page.getByRole("navigation", { name: "صفحات سجل مراجعة النتيجة" })).toContainText("1–50 من 102");
});

test("Admin AI review applies an approved lesson result without copying internal IDs", async ({ page }) => {
  await login(page);
  await openAiWorkspace(page);
  await openJob(page, "lesson_summary");

  await page.locator(".ai-review-unit").first().click();
  await expect(page.getByRole("heading", { name: "مراجعة النتيجة" })).toBeVisible();
  await expect(page.getByText("ملخص درس معتمد عبر مراجعات AI", { exact: true })).toBeVisible();

  const apply = page.getByRole("button", { name: "تطبيق النتيجة على الدرس" });
  await expect(apply).toBeVisible();
  await expect(apply).toBeEnabled();
  await apply.click();

  await expect(page.getByRole("status")).toContainText("تم تحديث ملخص الدرس");
  await expect(page.getByText(/Output ID|UUID|Job:/)).toHaveCount(0);

  const curriculumResponse = await page.context().request.get(`${apiBaseUrl}/v1/admin/curriculum`);
  expect(curriculumResponse.ok()).toBeTruthy();
  const curriculumPayload = await curriculumResponse.json();
  const appliedLesson = curriculumPayload.curriculum.lessons.find(
    (lesson) => lesson.slug === "stage13e-ai-apply-lesson",
  );
  expect(appliedLesson?.summary).toBe("ملخص درس معتمد عبر مراجعات AI");
  expect(appliedLesson?.contentRevision).toBe("2");
});

test("Admin AI review returns to login after the real Admin session expires", async ({ page }) => {
  await login(page);
  await openAiWorkspace(page);
  const refresh = page.getByRole("button", { name: "تحديث الحالة" });
  await expect(refresh).toBeEnabled();

  await logoutRealAdminSession(page);
  await refresh.click();

  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "مراجعات الذكاء الاصطناعي", exact: true })).toHaveCount(0);
});

test("Admin AI review refreshes canonical review state after a real 409 race", async ({ page }) => {
  const jobType = requireRaceFixture();
  await login(page);
  const fixture = await findTerminalOpenReviewFixture(page, jobType);
  await openAiWorkspace(page);
  await openJob(page, jobType);

  const unit = page.locator(".ai-review-unit").nth(fixture.unitIndex);
  await expect(unit).toBeVisible();
  await unit.click();
  await expect(page.getByRole("heading", { name: "مراجعة النتيجة" })).toBeVisible();

  const staleApprove = page.getByRole("button", { name: "اعتماد بعد المراجعة" });
  await expect(staleApprove).toBeVisible();
  await expect(staleApprove).toBeEnabled();

  await terminateReviewOutOfBand(page, fixture.outputId);
  await staleApprove.click();

  await expect(
    page.getByText("سبق أن تغيرت حالة المراجعة أو لم يعد القرار صالحًا. تم تحديث النتيجة من الخادم.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("مرفوض", { exact: true })).toBeVisible();
  await expect(page.getByText("لا توجد إجراءات أخرى متاحة لهذه النتيجة.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "اعتماد بعد المراجعة" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "رفض المخرَج" })).toHaveCount(0);
});

test("Admin AI review stays within a 390px viewport", async ({ page }) => {
  requireFixture();
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await openAiWorkspace(page);
  await openSeededJob(page);
  await page.locator(".ai-review-unit").first().click();
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});
