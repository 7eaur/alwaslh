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

async function capture(page, name) {
  const viewports = [
    { suffix: "phone", width: 390, height: 844 },
    { suffix: "desktop", width: 1366, height: 900 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const metrics = await page.locator("body").evaluate((body) => ({
      scrollWidth: body.scrollWidth,
      clientWidth: body.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    await page.screenshot({
      path: `test-results/ux-b04-${name}-${viewport.suffix}.png`,
      fullPage: true,
    });
  }

  await page.setViewportSize({ width: 390, height: 844 });
}

async function openQuiz(page, fixture) {
  const row = page.locator(`[data-quiz-id="${fixture.quizId}"]`);
  await expect(row).toBeVisible();
  await row.getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`/app/practice/quizzes/${fixture.quizId}$`));
  await expect(page.getByRole("heading", { name: fixture.quizTitle })).toBeVisible();
}

async function startPractice(page, fixture) {
  await page.getByRole("combobox", { name: "مجموعة الأسئلة" }).selectOption({ label: fixture.versionALabel });
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(`/v1/student/quizzes/${fixture.quizId}/sessions`) &&
      response.request().method() === "POST" &&
      response.status() === 200,
  );
  await page.getByRole("button", { name: "ابدأ التدريب" }).click();
  const response = await responsePromise;
  const payload = await response.json();
  await expect(page).toHaveURL(new RegExp(`/app/practice/attempts/${payload.assessment.session.id}$`));
  await expect(page.getByRole("heading", { name: fixture.quizTitle })).toBeVisible();
}

test("B04 visual QA covers Library, Quiz detail, Attempt and Result on phone and desktop", async ({ page }) => {
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

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/practice");
  await expect(page.getByRole("heading", { name: "التدريب والاختبارات" })).toBeVisible();
  await capture(page, "library");

  await openQuiz(page, fixture);
  await capture(page, "quiz-detail");

  await startPractice(page, fixture);
  await expect(page.locator(".student-bottom-nav")).not.toBeVisible();
  await expect(page.locator(".student-adaptive-nav")).not.toBeVisible();
  await expect(page.getByText(fixture.mcqPrompt, { exact: true })).toBeVisible();
  await capture(page, "attempt");

  await page.getByRole("radio", { name: fixture.mcqCorrect }).check();
  await page.getByRole("button", { name: "تحقق من إجابتي" }).click();
  await expect(page.getByText("إجابة صحيحة", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "السؤال التالي" }).click();
  await page.getByLabel("إجابتك").fill(fixture.directAnswer);
  await page.getByRole("button", { name: "تحقق من إجابتي" }).click();
  await expect(page.getByText("إجابة صحيحة", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "إنهاء تدريب" }).click();
  await expect(page.getByRole("heading", { name: "راجع ما أجبت عنه" })).toBeVisible();
  await expect(page.getByText(/(?:١٠٠|100)٪/, { exact: true })).toBeVisible();
  await capture(page, "result");
});
