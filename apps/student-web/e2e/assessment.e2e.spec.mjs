import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

function createAssessmentFixture() {
  const apiDirectory = resolve(process.cwd(), "../api");
  const fixture = resolve(process.cwd(), "e2e/assessment-fixture.ts");
  const output = execFileSync(process.execPath, ["--import", "tsx", fixture], {
    cwd: apiDirectory,
    env: process.env,
    encoding: "utf8",
  });
  return JSON.parse(output);
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.locator("body").evaluate((body) => ({
    scrollWidth: body.scrollWidth,
    clientWidth: body.clientWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function openVersionA(page, card, fixture, mode) {
  await card.getByLabel("النموذج").selectOption({ label: fixture.versionALabel });
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/v1/student/quizzes/${fixture.quizId}/sessions`) &&
      response.request().method() === "POST" &&
      response.status() === 200,
  );
  await card.getByRole("button", { name: mode === "practice" ? "بدء تدريب" : "بدء اختبار" }).click();
  const response = await responsePromise;
  return response.json();
}

test("Student Practice/Test uses published snapshots, server feedback, resume and responsive UX", async ({ page }) => {
  const fixture = createAssessmentFixture();
  await page.context().addCookies([
    {
      name: fixture.sessionCookieName,
      value: fixture.sessionToken,
      url: "http://127.0.0.1:5174",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/");
  await expect(page.getByText("تم تسجيل الدخول", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "التدريبات والاختبارات" })).toBeVisible();
  await expect(page.getByRole("heading", { name: fixture.quizTitle })).toBeVisible();

  const learningSurfaceOrder = await page
    .locator(".curriculum-surface, .assessment-surface, .access-section")
    .evaluateAll((elements) => elements.map((element) => element.className));
  expect(learningSurfaceOrder[0]).toContain("curriculum-surface");
  expect(learningSurfaceOrder[1]).toContain("assessment-surface");
  expect(learningSurfaceOrder[2]).toContain("access-section");
  await expectNoHorizontalOverflow(page);

  const card = page.locator(`[data-quiz-id="${fixture.quizId}"]`);
  await expect(card).toBeVisible();
  await expect(card.getByText(fixture.className, { exact: false })).toBeVisible();
  await expect(card.getByText(fixture.subjectName, { exact: false })).toBeVisible();

  const practicePayload = await openVersionA(page, card, fixture, "practice");
  expect(practicePayload.assessment.version.id).toBe(fixture.versionAId);
  expect(practicePayload.assessment.session.mode).toBe("practice");
  expect(practicePayload.assessment.questions.every((question) => question.feedback === null)).toBe(true);
  expect(JSON.stringify(practicePayload)).not.toContain("isCorrect");
  expect(JSON.stringify(practicePayload)).not.toContain(fixture.directAnswer);

  await expect(page.getByRole("heading", { name: fixture.quizTitle })).toBeVisible();
  await expect(page.getByText(fixture.mcqPrompt, { exact: true })).toBeVisible();
  await page.getByRole("radio", { name: fixture.mcqCorrect }).check();
  await page.getByRole("button", { name: "حفظ وعرض النتيجة" }).click();
  await expect(page.getByText("إجابة صحيحة", { exact: true })).toBeVisible();
  await expect(page.getByText(fixture.mcqExplanation, { exact: true })).toBeVisible();
  await expect(page.getByText(`الطريقة: ${fixture.mcqMethod}`, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "السؤال التالي" }).click();
  await expect(page.getByText(fixture.directPrompt, { exact: true })).toBeVisible();
  await page.getByLabel("إجابتك").fill(`  ${fixture.directAnswer.replaceAll(" ", "   ")}  `);
  await page.getByRole("button", { name: "حفظ وعرض النتيجة" }).click();
  await expect(page.getByText("إجابة صحيحة", { exact: true })).toBeVisible();
  await expect(page.getByText(fixture.directExplanation, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "إنهاء تدريب" }).click();
  await expect(page.getByText(/(?:١٠٠|100)٪/, { exact: true })).toBeVisible();
  await expect(page.getByText(/2 صحيحة من 2 سؤال/)).toBeVisible();

  await page.getByRole("button", { name: "العودة إلى التدريبات والاختبارات" }).click();
  await expect(page.getByRole("heading", { name: "آخر المحاولات" })).toBeVisible();
  await expect(page.getByText(fixture.quizTitle, { exact: true }).last()).toBeVisible();

  const testCard = page.locator(`[data-quiz-id="${fixture.quizId}"]`);
  const testPayload = await openVersionA(page, testCard, fixture, "test");
  expect(testPayload.assessment.session.mode).toBe("test");
  expect(JSON.stringify(testPayload)).not.toContain(fixture.directAnswer);
  await expect(page.getByText(/لن تظهر صحة الإجابات قبل إنهاء الاختبار/)).toBeVisible();

  await page.getByRole("radio", { name: fixture.mcqWrong }).check();
  await page.getByRole("button", { name: "حفظ الإجابة" }).click();
  await expect(page.getByText("إجابة صحيحة", { exact: true })).toHaveCount(0);
  await expect(page.getByText("تحتاج مراجعة", { exact: true })).toHaveCount(0);

  await page.getByRole("radio", { name: fixture.mcqCorrect }).check();
  await page.getByRole("button", { name: "حفظ الإجابة" }).click();
  await expect(page.getByText("إجابة صحيحة", { exact: true })).toHaveCount(0);
  await expect(page.getByText(fixture.mcqExplanation, { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "السؤال التالي" }).click();
  await page.getByLabel("إجابتك").fill(fixture.directAnswer);
  await page.getByRole("button", { name: "حفظ الإجابة" }).click();
  await expect(page.getByText(fixture.directExplanation, { exact: true })).toHaveCount(0);
  await expect(page.getByText("إجابة صحيحة", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "إنهاء اختبار" }).click();
  await expect(page.getByText(/(?:١٠٠|100)٪/, { exact: true })).toBeVisible();
  await expect(page.getByText("إجابة صحيحة", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "السؤال السابق" }).click();
  await expect(page.getByText(fixture.mcqExplanation, { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 768, height: 1024 });
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole("heading", { name: fixture.quizTitle })).toBeVisible();
  await page.setViewportSize({ width: 1366, height: 900 });
  await expectNoHorizontalOverflow(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "العودة إلى التدريبات والاختبارات" }).click();
  const resumeCard = page.locator(`[data-quiz-id="${fixture.quizId}"]`);
  const firstResumeStart = await openVersionA(page, resumeCard, fixture, "practice");
  const resumeSessionId = firstResumeStart.assessment.session.id;
  await page.getByRole("radio", { name: fixture.mcqCorrect }).check();
  await page.getByRole("button", { name: "حفظ وعرض النتيجة" }).click();
  await page.getByRole("button", { name: "العودة إلى التدريبات والاختبارات" }).click();

  const secondResumeStart = await openVersionA(
    page,
    page.locator(`[data-quiz-id="${fixture.quizId}"]`),
    fixture,
    "practice",
  );
  expect(secondResumeStart.assessment.session.id).toBe(resumeSessionId);
  expect(secondResumeStart.assessment.progress.answeredCount).toBe(1);
  await expect(page.getByText("أُجيب عن 1 من 2 سؤال.")).toBeVisible();

  const directInput = page.getByLabel("إجابتك");
  if (!(await directInput.isVisible())) {
    await page.getByRole("button", { name: "السؤال التالي" }).click();
  }
  await expect(directInput).toBeEnabled();
  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByText(/انقطع الاتصال.*لن نحفظ إجابة أو ننهي محاولة/)).toBeVisible();
  await expect(directInput).toBeDisabled();

  const reconnectPromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/v1/student/assessment-sessions/${resumeSessionId}`) &&
      response.request().method() === "GET" &&
      response.status() === 200,
  );
  await page.context().setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await reconnectPromise;
  await expect(directInput).toBeEnabled();
  await expectNoHorizontalOverflow(page);

  await page.route(`**/v1/student/assessment-sessions/${resumeSessionId}`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "NOT_FOUND", message: "الاختبار غير متاح" } }),
      });
      return;
    }
    await route.continue();
  });
  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await page.context().setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.getByRole("heading", { name: "التدريبات والاختبارات" })).toBeVisible();
  await expect(page.getByText("الاختبار غير متاح", { exact: true })).toBeVisible();
  await expect(page.locator(".assessment-workspace")).toHaveCount(0);
});
