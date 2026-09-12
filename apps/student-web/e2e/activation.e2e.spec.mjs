import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const accountCode = "654321";
const accountCodeArabic = "٦٥٤٣٢١";
const initialPassword = `Stage14-${crypto.randomUUID()}!`;
const privatePassword = `Stage14-${crypto.randomUUID()}!`;

function runAuthFixture(action, profileId) {
  const apiDirectory = resolve(process.cwd(), "../api");
  const output = execFileSync(process.execPath, ["--import", "tsx", "tests/browser-auth-fixture.ts", action, profileId], { cwd: apiDirectory, env: process.env, encoding: "utf8" });
  return JSON.parse(output);
}

function runAccessFixture(action, profileId) {
  const apiDirectory = resolve(process.cwd(), "../api");
  const fixture = resolve(process.cwd(), "e2e/access-fixture.ts");
  const output = execFileSync(process.execPath, ["--import", "tsx", fixture, action, profileId], { cwd: apiDirectory, env: process.env, encoding: "utf8" });
  return JSON.parse(output);
}

function toArabicIndic(value) {
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return value.replace(/\d/g, (digit) => digits[Number(digit)]);
}

async function storedPublicKey(page, accountIdentifier) {
  return page.evaluate(({ dbName, storeName, identifier }) => new Promise((resolveValue, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, "readonly");
      const read = transaction.objectStore(storeName).get(identifier);
      read.onerror = () => reject(read.error);
      read.onsuccess = () => { const value = read.result?.publicKeySpki ?? null; db.close(); resolveValue(value); };
    };
  }), { dbName: "alwaslh-student-device", storeName: "device-keys", identifier: accountIdentifier });
}

async function switchToLogin(page) {
  await page.locator(".mode-switch").getByRole("button", { name: "لدي حساب بالفعل" }).click();
  await expect(page.getByRole("heading", { name: "لدي حساب بالفعل" })).toBeVisible();
}

async function fillLogin(page, password) {
  await page.getByLabel("معرّف الحساب").fill(accountCodeArabic);
  await expect(page.getByLabel("معرّف الحساب")).toHaveValue(accountCode);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(password);
}

async function openAccount(page) {
  if (!/\/app\/account$/.test(page.url())) await page.getByRole("link", { name: "حسابي", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/account$/);
  await expect(page.getByRole("heading", { name: "وصولك الحالي" })).toBeVisible();
}

test("student activation, recovery, device access and canonical curriculum work at 390px", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "تفعيل حساب جديد" })).toBeVisible();

  await page.getByLabel("رمز الوصول الكامل").fill("999999");
  const invalidVerifyPromise = page.waitForResponse((response) => response.url().includes("/v1/student/activation/verify") && response.request().method() === "POST");
  await page.getByRole("button", { name: "متابعة التفعيل" }).click();
  expect((await invalidVerifyPromise).status()).toBe(404);
  await expect(page.getByRole("alert")).toContainText("كود التفعيل غير موجود");

  await page.getByLabel("رمز الوصول الكامل").fill(accountCodeArabic);
  await expect(page.getByLabel("رمز الوصول الكامل")).toHaveValue(accountCode);
  const verifyPromise = page.waitForResponse((response) => response.url().includes("/v1/student/activation/verify") && response.request().method() === "POST");
  await page.getByRole("button", { name: "متابعة التفعيل" }).click();
  const verify = await verifyPromise;
  expect(verify.status()).toBe(200);
  expect((await verify.json()).accountIdentifier).toBe(accountCode);
  await expect(page.locator(".form-alert.is-success").filter({ hasText: "تم التحقق من الرمز" })).toBeVisible();

  await page.getByLabel("كلمة المرور الخاصة بك").fill(initialPassword);
  await page.getByLabel("تأكيد كلمة المرور").fill(initialPassword);
  const completePromise = page.waitForResponse((response) => response.url().includes("/v1/student/activation/complete") && response.request().method() === "POST");
  await page.getByRole("button", { name: "إنشاء الحساب وتسجيل هذا الجهاز" }).click();
  const activationResponse = await completePromise;
  expect(activationResponse.status()).toBe(201);
  const activation = await activationResponse.json();
  expect(activation.profile.role).toBe("student");
  expect(activation.deviceId).toMatch(/^[0-9a-f-]{36}$/);
  const studentProfileId = activation.profile.id;

  await expect(page.getByText("تم تسجيل الدخول", { exact: true })).toBeVisible();
  await openAccount(page);
  await expect(page.getByText("كل المحتوى المتاح", { exact: true })).toBeVisible();
  await expect(page.getByText(/لديك وصول كامل/)).toBeVisible();
  await expect(page.getByLabel("رمز الصف")).toHaveCount(0);
  const firstPublicKey = await storedPublicKey(page, accountCode);
  expect(firstPublicKey).toEqual(expect.any(String));
  expect(firstPublicKey.length).toBeGreaterThan(80);

  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await switchToLogin(page);
  await fillLogin(page, initialPassword);
  const loginStartPromise = page.waitForResponse((response) => response.url().includes("/v1/student/login/start") && response.request().method() === "POST");
  const loginCompletePromise = page.waitForResponse((response) => response.url().includes("/v1/student/login/complete") && response.request().method() === "POST");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  const loginStart = await loginStartPromise;
  const loginComplete = await loginCompletePromise;
  expect(loginStart.status()).toBe(200);
  expect((await loginStart.json()).purpose).toBe("login");
  expect(loginComplete.status()).toBe(200);
  await expect(page.getByText("تم تسجيل الدخول", { exact: true })).toBeVisible();
  expect(await storedPublicKey(page, accountCode)).toBe(firstPublicKey);

  const recovery = runAuthFixture("temporary-password", studentProfileId);
  expect(recovery.temporaryPassword).toEqual(expect.any(String));
  expect(recovery.expiresInHours).toBeGreaterThan(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: "تفعيل حساب جديد" })).toBeVisible();
  await switchToLogin(page);
  await fillLogin(page, recovery.temporaryPassword);
  const recoveryStartPromise = page.waitForResponse((response) => response.url().includes("/v1/student/login/start") && response.request().method() === "POST");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  const recoveryStart = await recoveryStartPromise;
  expect(recoveryStart.status()).toBe(200);
  const recoveryChallenge = await recoveryStart.json();
  expect(recoveryChallenge.purpose).toBe("password_change");
  expect(recoveryChallenge.mustChangePassword).toBe(true);
  expect(recoveryChallenge.requiresDeviceRegistration).toBe(false);
  await expect(page.getByText(/كلمة المرور التي أدخلتها مؤقتة/)).toBeVisible();

  await page.getByLabel("كلمة المرور الخاصة بك").fill(privatePassword);
  await page.getByLabel("تأكيد كلمة المرور").fill(privatePassword);
  const recoveryCompletePromise = page.waitForResponse((response) => response.url().includes("/v1/student/login/complete") && response.request().method() === "POST");
  await page.getByRole("button", { name: "حفظ كلمة المرور والدخول" }).click();
  const recoveryComplete = await recoveryCompletePromise;
  expect(recoveryComplete.status()).toBe(200);
  await expect(page.getByText("تم تسجيل الدخول", { exact: true })).toBeVisible();
  expect(await storedPublicKey(page, accountCode)).toBe(firstPublicKey);

  const reset = runAuthFixture("device-rebind", studentProfileId);
  expect(reset.status).toBe("device_rebind_allowed");
  await page.reload();
  await expect(page.getByRole("heading", { name: "تفعيل حساب جديد" })).toBeVisible();
  await switchToLogin(page);
  await fillLogin(page, privatePassword);
  const rebindStartPromise = page.waitForResponse((response) => response.url().includes("/v1/student/login/start") && response.request().method() === "POST");
  const rebindCompletePromise = page.waitForResponse((response) => response.url().includes("/v1/student/login/complete") && response.request().method() === "POST");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  const rebindStart = await rebindStartPromise;
  const rebindComplete = await rebindCompletePromise;
  expect(rebindStart.status()).toBe(200);
  const rebindChallenge = await rebindStart.json();
  expect(rebindChallenge.purpose).toBe("device_rebind");
  expect(rebindChallenge.requiresDeviceRegistration).toBe(true);
  expect(rebindComplete.status()).toBe(200);
  await expect(page.getByText("تم تسجيل الدخول", { exact: true })).toBeVisible();

  const reboundPublicKey = await storedPublicKey(page, accountCode);
  expect(reboundPublicKey).toEqual(expect.any(String));
  expect(reboundPublicKey).not.toBe(firstPublicKey);

  const classAccess = runAccessFixture("prepare-class-access", studentProfileId);
  expect(classAccess.code).toMatch(/^\d{7}$/);
  expect(classAccess.classId).toMatch(/^[0-9a-f-]{36}$/);
  expect(classAccess.lessonTitles).toEqual(["مدخل إلى الفيزياء", "القوة والحركة", "قوانين نيوتن"]);

  await page.reload();
  await openAccount(page);
  await expect(page.getByText("لا توجد صفوف مفعّلة لحسابك الآن", { exact: true })).toBeVisible();
  await page.getByLabel("رمز الصف").fill(toArabicIndic(classAccess.code));
  await expect(page.getByLabel("رمز الصف")).toHaveValue(classAccess.code);
  const redeemPromise = page.waitForResponse((response) => response.url().includes("/v1/student/access/redeem") && response.request().method() === "POST");
  const curriculumPromise = page.waitForResponse((response) => response.url().includes("/v1/student/curriculum") && response.status() === 200);
  await page.getByRole("button", { name: "تفعيل الصف" }).click();
  const redeem = await redeemPromise;
  expect(redeem.status()).toBe(200);
  expect((await redeem.json()).entitlement.classId).toBe(classAccess.classId);
  await curriculumPromise;
  await expect(page).toHaveURL(/\/app\/learn$/);
  await expect(page.getByText("تم تفعيل الصف. أصبح محتواه متاحًا في التعلم.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: classAccess.className })).toBeVisible();
  const subjectLink = page.getByRole("link", { name: new RegExp(classAccess.subjectName) });
  await expect(subjectLink).toBeVisible();
  await subjectLink.click();
  await expect(page).toHaveURL(/\/app\/learn\/subjects\/[^/]+$/);
  await expect(page.getByRole("heading", { name: classAccess.subjectName })).toBeVisible();
  await expect(page.getByRole("heading", { name: classAccess.sectionTitle })).toBeVisible();
  await expect(page.getByText("درس غير منشور يجب ألا يظهر", { exact: true })).toHaveCount(0);
  await expect(page.locator(".lesson-link .lesson-copy strong")).toHaveText(classAccess.lessonTitles);

  const bodyMetrics = await page.locator("body").evaluate((body) => ({ scrollWidth: body.scrollWidth, clientWidth: body.clientWidth }));
  expect(bodyMetrics.scrollWidth).toBeLessThanOrEqual(bodyMetrics.clientWidth + 1);

  await page.getByRole("link", { name: "التعلم", exact: true }).first().click();
  await expect(page).toHaveURL(/\/app\/learn$/);
  await page.evaluate(async () => { await fetch("/v1/auth/logout", { method: "POST", credentials: "include" }); });
  await openAccount(page);
  const expiredRequest = page.waitForResponse((response) => response.url().includes("/v1/student/access/entitlements") && response.status() === 401);
  await page.locator(".student-account-section").first().getByRole("button", { name: "تحديث", exact: true }).click();
  await expiredRequest;
  await expect(page.getByRole("heading", { name: "لدي حساب بالفعل" })).toBeVisible();
  await expect(page.getByText("انتهت جلستك. سجّل الدخول مرة أخرى للمتابعة بأمان.", { exact: true })).toBeVisible();
});
