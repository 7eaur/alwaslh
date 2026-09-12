import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

function createAssessmentFixture() {
  const apiDirectory = resolve(process.cwd(), "../api");
  const fixture = resolve(process.cwd(), "e2e/assessment-fixture.ts");
  const output = execFileSync(process.execPath, ["--import", "tsx", fixture], { cwd: apiDirectory, env: process.env, encoding: "utf8" });
  return JSON.parse(output);
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.locator("body").evaluate((body) => ({ scrollWidth: body.scrollWidth, clientWidth: body.clientWidth }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function openQuizDetail(page, fixture) {
  const row = page.locator(`[data-quiz-id="${fixture.quizId}"]`);
  await expect(row).toBeVisible();
  await expect(row.getByText(fixture.className, { exact: false })).toBeVisible();
  await expect(row.getByText(fixture.subjectName, { exact: false })).toBeVisible();
  await row.getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`/app/practice/quizzes/${fixture.quizId}$`));
  await expect(page.getByRole("heading", { name: fixture.quizTitle })).toBeVisible();
}

async function startVersionA(page, fixture, mode) {
  await page.getByRole("combobox", { name: "مجموعة الأسئلة" }).selectOption({ label: fixture.versionALabel });
  await expect(page.getByText(`المجموعة المختارة: ${fixture.versionALabel}`, { exact: true })).toBeVisible();
  const responsePromise = page.waitForResponse((response) => response.url().includes(`/v1/student/quizzes/${fixture.quizId}/sessions`) && response.request().method() === "POST" && response.status() === 200);
  await page.getByRole("button", { name: mode === "practice" ? "ابدأ التدريب" : "ابدأ الاختبار" }).click();
  const payload = await (await responsePromise).json();
  await expect(page).toHaveURL(new RegExp(`/app/practice/attempts/${payload.assessment.session.id}$`));
  return payload;
}

async function returnToPractice(page) {
  const exit = page.getByRole("link", { name: "الخروج من المحاولة والعودة إلى التدريب" });
  if (await exit.isVisible()) await exit.click();
  else await page.getByRole("link", { name: "العودة إلى التدريب", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/practice$/);
  await expect(page.getByRole("heading", { name: "التدريب والاختبارات" })).toBeVisible();
}

test("Student Practice/Test uses routed focused attempts, published snapshots, server feedback and resume", async ({ page }) => {
  const fixture = createAssessmentFixture();
  await page.context().addCookies([{ name: fixture.sessionCookieName, value: fixture.sessionToken, url: "http://127.0.0.1:5174", httpOnly: true, sameSite: "Lax" }]);

  await page.goto("/");
  await expect(page).toHaveURL(/\/app\/home$/);
  await expect(page.getByRole("heading", { name: "ماذا تريد أن تفعل الآن؟" })).toBeVisible();
  await page.getByRole("link", { name: "التدريب", exact: true }).first().click();
  await expect(page).toHaveURL(/\/app\/practice$/);
  await expect(page.getByRole("heading", { name: "التدريب والاختبارات" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/ux-b04-library-phone.png", fullPage: true });

  await openQuizDetail(page, fixture);
  await page.screenshot({ path: "test-results/ux-b04-quiz-detail-phone.png", fullPage: true });
  const practicePayload = await startVersionA(page, fixture, "practice");
  expect(practicePayload.assessment.version.id).toBe(fixture.versionAId);
  expect(practicePayload.assessment.session.mode).toBe("practice");
  expect(practicePayload.assessment.questions.every((question) => question.feedback === null)).toBe(true);
  expect(JSON.stringify(practicePayload)).not.toContain("isCorrect");
  expect(JSON.stringify(practicePayload)).not.toContain(fixture.directAnswer);

  await expect(page.getByRole("heading", { name: fixture.quizTitle })).toBeVisible();
  await expect(page.locator(".student-bottom-nav")).not.toBeVisible();
  await expect(page.locator(".student-adaptive-nav")).not.toBeVisible();
  await expect(page.getByText(fixture.mcqPrompt, { exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/ux-b04-attempt-phone.png", fullPage: true });
  await page.getByRole("radio", { name: fixture.mcqCorrect }).check();
  await page.getByRole("button", { name: "تحقق من إجابتي" }).click();
  await expect(page.getByText("إجابة صحيحة", { exact: true })).toBeVisible();
  await expect(page.getByText(fixture.mcqExplanation, { exact: true })).toBeVisible();
  await expect(page.getByText(`الطريقة: ${fixture.mcqMethod}`, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "السؤال التالي" }).click();
  await page.getByLabel("إجابتك").fill(`  ${fixture.directAnswer.replaceAll(" ", "   ")}  `);
  await page.getByRole("button", { name: "تحقق من إجابتي" }).click();
  await expect(page.getByText("إجابة صحيحة", { exact: true })).toBeVisible();
  await expect(page.getByText(fixture.directExplanation, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "إنهاء تدريب" }).click();
  await expect(page.getByText(/(?:١٠٠|100)٪/, { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "راجع ما أجبت عنه" })).toBeVisible();
  await page.screenshot({ path: "test-results/ux-b04-result-phone.png", fullPage: true });

  const completedUrl = page.url();
  await page.reload();
  await expect(page).toHaveURL(completedUrl);
  await expect(page.getByText(/(?:١٠٠|100)٪/, { exact: true })).toBeVisible();

  await returnToPractice(page);
  await expect(page.getByRole("heading", { name: "آخر المحاولات" })).toBeVisible();
  await openQuizDetail(page, fixture);
  const testPayload = await startVersionA(page, fixture, "test");
  expect(testPayload.assessment.session.mode).toBe("test");
  await expect(page.getByText("في الاختبار يظهر التصحيح بعد إنهاء جميع الأسئلة.", { exact: true })).toBeVisible();

  await page.getByRole("radio", { name: fixture.mcqWrong }).check();
  await page.getByRole("button", { name: "حفظ الإجابة" }).click();
  await expect(page.getByText("إجابة صحيحة", { exact: true })).toHaveCount(0);
  await page.getByRole("radio", { name: fixture.mcqCorrect }).check();
  await page.getByRole("button", { name: "حفظ الإجابة" }).click();
  await page.getByRole("button", { name: "السؤال التالي" }).click();
  await page.getByLabel("إجابتك").fill(fixture.directAnswer);
  await page.getByRole("button", { name: "حفظ الإجابة" }).click();
  await page.getByRole("button", { name: "إنهاء اختبار" }).click();
  await expect(page.getByText(/(?:١٠٠|100)٪/, { exact: true })).toBeVisible();
  await expect(page.getByText("إجابة صحيحة", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 768, height: 1024 });
  await expectNoHorizontalOverflow(page);
  await page.setViewportSize({ width: 1366, height: 900 });
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/ux-b04-result-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });

  await returnToPractice(page);
  await openQuizDetail(page, fixture);
  const firstResumeStart = await startVersionA(page, fixture, "practice");
  const resumeSessionId = firstResumeStart.assessment.session.id;
  await page.getByRole("radio", { name: fixture.mcqCorrect }).check();
  await page.getByRole("button", { name: "تحقق من إجابتي" }).click();
  await page.getByRole("link", { name: "الخروج من المحاولة والعودة إلى التدريب" }).click();
  await openQuizDetail(page, fixture);
  const secondResumeStart = await startVersionA(page, fixture, "practice");
  expect(secondResumeStart.assessment.session.id).toBe(resumeSessionId);
  expect(secondResumeStart.assessment.progress.answeredCount).toBe(1);

  const directInput = page.getByLabel("إجابتك");
  if (!(await directInput.isVisible())) await page.getByRole("button", { name: "السؤال التالي" }).click();
  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByText(/انقطع الاتصال.*الحفظ والإنهاء متوقفان/)).toBeVisible();
  await expect(directInput).toBeDisabled();

  const reconnectPromise = page.waitForResponse((response) => response.url().includes(`/v1/student/assessment-sessions/${resumeSessionId}`) && response.request().method() === "GET" && response.status() === 200);
  await page.context().setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await reconnectPromise;
  await expect(directInput).toBeEnabled();

  await page.route(`**/v1/student/assessment-sessions/${resumeSessionId}`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: { code: "NOT_FOUND", message: "internal assessment unavailable" } }) });
      return;
    }
    await route.continue();
  });
  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await page.context().setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(page.getByText("هذه المحاولة لم تعد متاحة", { exact: true })).toBeVisible();
  await expect(page.getByText("هذه المحاولة أو الاختبار لم يعد متاحًا. ارجع إلى التدريب واختر اختبارًا متاحًا.", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("internal assessment unavailable");
  await expect(page.getByRole("link", { name: "العودة إلى التدريب", exact: true })).toBeVisible();
});
