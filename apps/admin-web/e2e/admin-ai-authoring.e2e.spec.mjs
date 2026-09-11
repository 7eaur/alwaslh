import { expect, test } from "@playwright/test";
import { logoutRealAdminSession } from "./stage13e-real-api.mjs";

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
  await expect(page.getByRole("heading", { name: "لوحة التشغيل", exact: true })).toBeVisible();
}

async function openAuthoring(page) {
  const curriculum = page.waitForResponse(
    (response) => response.url().endsWith("/v1/admin/curriculum") && response.status() === 200,
  );
  const quizzes = page.waitForResponse(
    (response) => response.url().includes("/v1/admin/quizzes?") && response.status() === 200,
  );
  const questions = page.waitForResponse(
    (response) => response.url().includes("/v1/admin/question-bank?") && response.status() === 200,
  );
  await page.getByRole("button", { name: "توليد المحتوى بالذكاء الاصطناعي", exact: true }).click();
  await Promise.all([curriculum, quizzes, questions]);
  await expect(
    page.getByRole("heading", { name: "توليد المحتوى بالذكاء الاصطناعي", exact: true }),
  ).toBeVisible();
}

function panelByLabelledBy(page, titleId) {
  return page.locator(`section.authoring-panel[aria-labelledby="${titleId}"]`);
}

test("G-D queues selected lessons and independent quiz versions through the real API", async ({ page }) => {
  await login(page);
  await openAuthoring(page);

  const lessonPanel = panelByLabelledBy(page, "lesson-authoring-title");
  await lessonPanel.getByLabel("الصف", { exact: true }).selectOption({ label: "صف التوليد G-D" });
  await lessonPanel.getByLabel("المادة", { exact: true }).selectOption({ label: "مادة التوليد G-D" });
  await lessonPanel.getByLabel("درس التوليد الأول", { exact: true }).check();

  const lessonResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith("/v1/admin/authoring/lessons/generate") && response.status() === 202,
  );
  await lessonPanel.getByRole("button", { name: "إنشاء مهمة التوليد", exact: true }).click();
  const lessonBody = await (await lessonResponse).json();
  expect(lessonBody.totalUnits).toBe(1);
  await expect(page.getByText(/راجع المخرجات في «عمليات AI والمراجعة»/)).toBeVisible();

  const quizPanel = panelByLabelledBy(page, "quiz-authoring-title");
  const quizDetailResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      /\/v1\/admin\/quizzes\/[0-9a-f-]+$/i.test(new URL(response.url()).pathname) &&
      response.status() === 200,
  );
  await quizPanel.getByLabel("اختبار مسودة", { exact: true }).selectOption({ label: "اختبار التوليد G-D" });
  await quizDetailResponse;

  let versionCards = quizPanel.locator(".authoring-version-card");
  await expect(versionCards).toHaveCount(1);
  await versionCards.nth(0).getByLabel("درس التوليد الثاني", { exact: true }).uncheck();
  await quizPanel.getByRole("button", { name: "إضافة نموذج", exact: true }).click();
  versionCards = quizPanel.locator(".authoring-version-card");
  await expect(versionCards).toHaveCount(2);
  await versionCards.nth(1).getByLabel("درس التوليد الأول", { exact: true }).uncheck();
  await versionCards.nth(1).getByLabel("خلط الخيارات", { exact: true }).uncheck();

  const quizResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      /\/v1\/admin\/quizzes\/[0-9a-f-]+\/generate$/i.test(new URL(response.url()).pathname) &&
      response.status() === 202,
  );
  await quizPanel.getByRole("button", { name: "إنشاء مهام النماذج", exact: true }).click();
  const response = await quizResponse;
  const quizBody = await response.json();
  const requestBody = response.request().postDataJSON();
  expect(quizBody.totalUnits).toBe(2);
  expect(requestBody.versions).toHaveLength(2);
  expect(requestBody.versions[0].lessonIds).toHaveLength(1);
  expect(requestBody.versions[1].lessonIds).toHaveLength(1);
  expect(requestBody.versions[0].lessonIds[0]).not.toBe(requestBody.versions[1].lessonIds[0]);
  expect(requestBody.versions[0].shuffleOptions).toBe(true);
  expect(requestBody.versions[1].shuffleOptions).toBe(false);
});

test("G-D exports only selected versions and opens the authenticated print view", async ({ page }) => {
  await login(page);
  await openAuthoring(page);

  const exportPanel = panelByLabelledBy(page, "special-export-title");
  const detailResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      /\/v1\/admin\/quizzes\/[0-9a-f-]+$/i.test(new URL(response.url()).pathname) &&
      response.status() === 200,
  );
  await exportPanel
    .getByLabel("اختبار قيد المراجعة أو منشور", { exact: true })
    .selectOption({ label: "اختبار التصدير G-D" });
  await detailResponse;

  const downloadButton = exportPanel.getByRole("button", {
    name: "تنزيل CSV للنماذج المحددة",
    exact: true,
  });
  await exportPanel.getByRole("button", { name: "إلغاء التحديد", exact: true }).click();
  await expect(downloadButton).toBeDisabled();
  await exportPanel.getByRole("button", { name: "تحديد الكل", exact: true }).click();
  await expect(downloadButton).toBeEnabled();
  await exportPanel.getByLabel("نسخة الطباعة", { exact: true }).selectOption("answer_key");

  const exportResponse = page.waitForResponse(
    (response) => response.url().includes("/specialized-export?") && response.status() === 200,
  );
  const download = page.waitForEvent("download");
  await downloadButton.click();
  const bundle = await (await exportResponse).json();
  expect(bundle.csv).toContain("ما الفكرة الأساسية في درس التوليد الأول؟");
  expect((await download).suggestedFilename()).toMatch(/\.csv$/);

  const popupPromise = page.waitForEvent("popup");
  await exportPanel.getByRole("button", { name: "فتح الطباعة / حفظ PDF", exact: true }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  await expect(popup.locator("body")).toContainText("اختبار التصدير G-D");
  await expect(popup.locator("body")).toContainText("الفكرة الصحيحة");
});

test("G-D stays responsive and returns to login after the real Admin session expires", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await openAuthoring(page);

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);

  await logoutRealAdminSession(page);
  await page.getByRole("button", { name: "تحديث البيانات", exact: true }).click();
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "توليد المحتوى بالذكاء الاصطناعي", exact: true }),
  ).toHaveCount(0);
});
