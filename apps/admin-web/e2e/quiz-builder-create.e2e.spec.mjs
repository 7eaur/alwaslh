import { expect, test } from "@playwright/test";

const enabled = process.env.STAGE13E_E2E === "1";
test.skip(!enabled, "Stage13E browser fixture is only available in the combined integration workflow");

const adminIdentifier = process.env.STAGE13E_ADMIN_IDENTIFIER ?? "stage13e-admin-ui";
const adminPassword = process.env.STAGE13E_ADMIN_PASSWORD ?? "Stage13eAdminUiPass123!";
const apiBaseUrl = process.env.STAGE13E_E2E_API_BASE_URL ?? "http://127.0.0.1:3000";

async function login(page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await page.getByLabel("معرّف المدير").fill(adminIdentifier);
  await page.getByLabel("كلمة المرور").fill(adminPassword);
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.getByRole("heading", { name: "نظرة عامة", exact: true })).toBeVisible();
}

async function loadQuizScope(page) {
  const response = await page.context().request.get(`${apiBaseUrl}/v1/admin/curriculum`);
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  const curriculum = payload.curriculum;
  const lesson = curriculum.lessons.find((item) => item.slug === "stage13e-ai-apply-lesson");
  expect(lesson).toBeTruthy();
  return { classId: lesson.classId, subjectId: lesson.subjectId, lessonId: lesson.id, lessonTitle: lesson.title };
}

test("Quiz Builder create route creates a real quiz and lands on canonical entity route", async ({ page }) => {
  await login(page);
  const scope = await loadQuizScope(page);
  const title = `اختبار إنشاء موجه ${Date.now()}`;

  await page.goto("/app/quizzes/manage");
  await expect(page.getByRole("heading", { name: "إنشاء اختبار", exact: true })).toBeVisible();

  await page.getByLabel("عنوان الاختبار").fill(title);
  await page.getByLabel("الوصف").fill("اختبار حقيقي لإثبات مسار الإنشاء الموجه إلى صفحة الكيان.");
  await page.getByLabel("الصف").selectOption(scope.classId);
  await page.getByLabel("المادة").selectOption(scope.subjectId);
  await page.getByRole("checkbox", { name: scope.lessonTitle }).check();
  await page.getByRole("button", { name: "إنشاء الاختبار", exact: true }).click();

  await expect(page).toHaveURL(/\/app\/quizzes\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(page.getByTestId("quiz-status")).toHaveText("مسودة");

  const quizId = page.url().split("/").pop();
  const response = await page.context().request.get(`${apiBaseUrl}/v1/admin/quizzes/${quizId}`);
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  expect(payload.quiz.title).toBe(title);
  expect(payload.lessons.map((lesson) => lesson.id)).toContain(scope.lessonId);
});
