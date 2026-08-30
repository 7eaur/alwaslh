import { expect, test } from "@playwright/test";

const accountCode = "654321";
const accountCodeArabic = "٦٥٤٣٢١";
const initialPassword = "StudentBrowser123!";
const resetPassword = "StudentBrowser456!";

test("student activates, sees entitlement, returns, resets password and signs in again", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "فعّل وصولك" })).toBeVisible();

  await page.getByLabel("رمز الوصول الكامل").fill("999999");
  await page.getByLabel("أنشئ كلمة مرور").fill(initialPassword);
  await page.getByLabel("تأكيد كلمة المرور").fill(initialPassword);

  const invalidResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/activate") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "تفعيل الحساب" }).click();
  const invalidResponse = await invalidResponsePromise;
  expect(invalidResponse.status()).toBe(404);
  await expect(page.getByRole("alert")).toContainText("كود التفعيل غير موجود");

  await page.getByLabel("رمز الوصول الكامل").fill(accountCodeArabic);
  await expect(page.getByLabel("رمز الوصول الكامل")).toHaveValue(accountCode);

  const activationResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/activate") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "تفعيل الحساب" }).click();
  const activationResponse = await activationResponsePromise;
  expect(activationResponse.status()).toBe(201);
  const activation = await activationResponse.json();
  expect(activation.profile.role).toBe("student");
  expect(activation.accountIdentifier).toBe(accountCode);

  await expect(page.getByText("تم تفعيل الحساب.")).toBeVisible();
  await expect(page.getByText(accountCode, { exact: true })).toBeVisible();
  await expect(page.getByText("وصول كامل", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toHaveJSProperty("scrollWidth", 0);

  const studentProfileId = activation.profile.id;

  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page.getByRole("heading", { name: "سجّل دخولك" })).toBeVisible();

  await page.getByLabel("معرّف الحساب").fill(accountCodeArabic);
  await page.getByLabel("كلمة المرور").fill(initialPassword);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page.getByText("جلسة طالب موثقة")).toBeVisible();
  await expect(page.getByText("وصول كامل", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page.getByRole("heading", { name: "سجّل دخولك" })).toBeVisible();

  const adminLogin = await request.post("/v1/auth/login", {
    data: { identifier: "stage8-admin", password: "Stage8AdminPass123!" },
  });
  expect(adminLogin.status()).toBe(200);

  const recoveryIssue = await request.post("/v1/admin/auth/recovery-token", {
    data: { profileId: studentProfileId },
  });
  expect(recoveryIssue.status()).toBe(200);
  const recovery = await recoveryIssue.json();
  expect(recovery.recoveryToken.length).toBeGreaterThanOrEqual(32);

  await page.getByRole("button", { name: "استرداد" }).click();
  await expect(page.getByRole("heading", { name: "غيّر كلمة المرور" })).toBeVisible();
  await page.getByLabel("رمز الاسترداد").fill(recovery.recoveryToken);
  await page.getByLabel("كلمة المرور الجديدة").fill(resetPassword);
  await page.getByLabel("تأكيد كلمة المرور").fill(resetPassword);
  await page.getByRole("button", { name: "تعيين كلمة مرور جديدة" }).click();

  await expect(page.getByRole("heading", { name: "سجّل دخولك" })).toBeVisible();
  await expect(page.getByText("تم تعيين كلمة مرور جديدة")).toBeVisible();

  await page.getByLabel("معرّف الحساب").fill(accountCode);
  await page.getByLabel("كلمة المرور").fill(initialPassword);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page.getByRole("alert")).toBeVisible();

  await page.getByLabel("كلمة المرور").fill(resetPassword);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page.getByText("جلسة طالب موثقة")).toBeVisible();
  await expect(page.getByText("وصول كامل", { exact: true })).toBeVisible();

  const bodyMetrics = await page.locator("body").evaluate((body) => ({
    scrollWidth: body.scrollWidth,
    clientWidth: body.clientWidth,
  }));
  expect(bodyMetrics.scrollWidth).toBeLessThanOrEqual(bodyMetrics.clientWidth + 1);
});
