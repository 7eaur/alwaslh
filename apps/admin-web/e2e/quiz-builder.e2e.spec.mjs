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

async function createRoutedQuiz(page) {
  const curriculumResponse = await page.context().request.get(`${apiBaseUrl}/v1/admin/curriculum`);
  expect(curriculumResponse.ok()).toBeTruthy();
  const payload = await curriculumResponse.json();
  const curriculum = payload.curriculum;

  const lesson = curriculum.lessons.find((item) => item.slug === "stage13e-ai-apply-lesson");
  expect(lesson).toBeTruthy();
  const classItem = curriculum.classes.find((item) => item.id === lesson.classId);
  const subject = curriculum.subjects.find((item) => item.id === lesson.subjectId);
  expect(classItem).toBeTruthy();
  expect(subject).toBeTruthy();

  const title = `اختبار مسار Quiz Builder ${Date.now()}`;
  const createResponse = await page.context().request.post(`${apiBaseUrl}/v1/admin/quizzes`, {
    data: {
      classId: classItem.id,
      subjectId: subject.id,
      lessonIds: [lesson.id],
      title,
      description: "اختبار حقيقي لإثبات ملكية المسار والربط العميق.",
      shuffleVersions: true,
    },
  });
  expect(createResponse.ok()).toBeTruthy();
  const created = await createResponse.json();
  expect(created.quizId).toBeTruthy();
  return { quizId: created.quizId, title };
}

test("Quiz Builder list opens the canonical entity route and direct deep link survives reload", async ({ page }) => {
  await login(page);
  const { quizId, title } = await createRoutedQuiz(page);

  await page.goto("/app/quizzes");
  await expect(page.getByRole("heading", { name: "الاختبارات", exact: true })).toBeVisible();
  const card = page.locator(".qz-quiz-card").filter({ hasText: title }).first();
  await expect(card).toBeVisible();
  await card.click();

  await expect(page).toHaveURL(new RegExp(`/app/quizzes/${quizId}$`));
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(page.getByTestId("quiz-status")).toHaveText("مسودة");
  await expect(page.getByRole("link", { name: "إدارة النماذج" })).toBeVisible();

  await page.goto(`/app/quizzes/${quizId}`);
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(page.getByTestId("quiz-status")).toHaveText("مسودة");

  await page.reload();
  await expect(page).toHaveURL(new RegExp(`/app/quizzes/${quizId}$`));
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "إرسال للمراجعة" })).toBeVisible();
});
