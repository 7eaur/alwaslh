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

  return { classItem, subject, lesson };
}

async function createRoutedQuiz(page) {
  const { classItem, subject, lesson } = await loadQuizScope(page);
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
  return { quizId: created.quizId, title, classId: classItem.id, subjectId: subject.id, lessonId: lesson.id };
}

async function createPublishedQuestion(page, scope, prompt) {
  const correctAnswer = "الإجابة الصحيحة";
  const createResponse = await page.context().request.post(`${apiBaseUrl}/v1/admin/question-bank/manual`, {
    data: {
      classId: scope.classId,
      subjectId: scope.subjectId,
      lessonIds: [scope.lessonId],
      question: {
        prompt,
        type: "multiple_choice",
        options: [correctAnswer, "مشتت أول", "مشتت ثان", "مشتت ثالث"],
        correctOptionIndex: 0,
        answerText: correctAnswer,
        answerStatus: "known",
        difficulty: "easy",
        explanation: "سؤال fixture حقيقي لاختبار تركيب نموذج الاختبار.",
        method: null,
      },
    },
  });
  expect(createResponse.ok()).toBeTruthy();
  const created = await createResponse.json();
  expect(created.itemId).toBeTruthy();

  const submitResponse = await page.context().request.post(
    `${apiBaseUrl}/v1/admin/question-bank/${created.itemId}/submit-review`,
  );
  expect(submitResponse.ok()).toBeTruthy();

  const publishResponse = await page.context().request.post(`${apiBaseUrl}/v1/admin/question-bank/${created.itemId}/publish`);
  expect(publishResponse.ok()).toBeTruthy();
  return created;
}

async function openVersionEditor(page, mode) {
  await expect(
    page.getByRole("heading", { name: mode === "add" ? "إضافة نموذج اختبار" : "تعديل أسئلة النموذج", exact: true }),
  ).toBeVisible();
}

async function selectCandidate(page, prompt, checked) {
  const candidate = page.locator(".qz-candidate-card").filter({ hasText: prompt }).first();
  await expect(candidate).toBeVisible();
  const checkbox = candidate.getByRole("checkbox");
  if (checked) await checkbox.check();
  else await checkbox.uncheck();
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
  await expect(page.getByRole("button", { name: "إضافة نموذج" })).toBeVisible();

  await page.goto(`/app/quizzes/${quizId}`);
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(page.getByTestId("quiz-status")).toHaveText("مسودة");

  await page.reload();
  await expect(page).toHaveURL(new RegExp(`/app/quizzes/${quizId}$`));
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "إرسال للمراجعة" })).toBeVisible();
});

test("Quiz Builder manages draft versions on the canonical entity route and locks them outside draft", async ({ page }) => {
  await login(page);
  const scope = await createRoutedQuiz(page);
  const firstPrompt = `سؤال منشور أول ${Date.now()}`;
  const secondPrompt = `سؤال منشور بديل ${Date.now()}`;
  await createPublishedQuestion(page, scope, firstPrompt);
  await createPublishedQuestion(page, scope, secondPrompt);

  await page.goto(`/app/quizzes/${scope.quizId}`);
  await expect(page.getByTestId("quiz-status")).toHaveText("مسودة");

  await page.getByRole("button", { name: "إضافة نموذج" }).click();
  await openVersionEditor(page, "add");
  await page.getByLabel("اسم النموذج").fill("نموذج إثبات Chromium");
  await page.getByLabel("بحث في الأسئلة المنشورة").fill(firstPrompt);
  await page.getByRole("button", { name: "بحث", exact: true }).click();
  await selectCandidate(page, firstPrompt, true);
  await page.getByRole("button", { name: "إنشاء النموذج" }).click();
  await expect(page.getByRole("status")).toContainText("تم إنشاء نموذج الاختبار");

  let versionCard = page.locator(".qz-version-card").filter({ hasText: "نموذج إثبات Chromium" }).first();
  await expect(versionCard).toContainText(firstPrompt);

  await versionCard.getByRole("button", { name: "تعديل الأسئلة" }).click();
  await openVersionEditor(page, "replace");
  await page.getByLabel("بحث في الأسئلة المنشورة").fill("");
  await page.getByRole("button", { name: "بحث", exact: true }).click();
  await selectCandidate(page, firstPrompt, false);
  await selectCandidate(page, secondPrompt, true);
  await page.getByRole("button", { name: "حفظ أسئلة النموذج" }).click();
  await expect(page.getByRole("status")).toContainText("تم تحديث أسئلة النموذج");

  versionCard = page.locator(".qz-version-card").filter({ hasText: "نموذج إثبات Chromium" }).first();
  await expect(versionCard).toContainText(secondPrompt);
  await expect(versionCard).not.toContainText(firstPrompt);

  await versionCard.getByRole("button", { name: "حذف النموذج" }).click();
  await expect(page.getByRole("status")).toContainText("تم حذف النموذج من المسودة");
  await expect(page.locator(".qz-version-card").filter({ hasText: "نموذج إثبات Chromium" })).toHaveCount(0);

  await page.getByRole("button", { name: "إضافة نموذج" }).click();
  await page.getByLabel("اسم النموذج").fill("نموذج ثابت بعد المراجعة");
  await page.getByLabel("بحث في الأسئلة المنشورة").fill(secondPrompt);
  await page.getByRole("button", { name: "بحث", exact: true }).click();
  await selectCandidate(page, secondPrompt, true);
  await page.getByRole("button", { name: "إنشاء النموذج" }).click();
  await expect(page.locator(".qz-version-card").filter({ hasText: "نموذج ثابت بعد المراجعة" })).toBeVisible();

  await page.getByRole("button", { name: "إرسال للمراجعة" }).click();
  await expect(page.getByTestId("quiz-status")).toHaveText("قيد المراجعة");
  await expect(page.getByRole("button", { name: "إضافة نموذج" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "تعديل الأسئلة" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "حذف النموذج" })).toHaveCount(0);
});
