import { expect, test } from "@playwright/test";

const accountCode = "654321";
const accountCodeArabic = "٦٥٤٣٢١";
const initialPassword = "StudentBrowser123!";

async function storedPublicKey(page, accountIdentifier) {
  return page.evaluate(
    ({ dbName, storeName, identifier }) =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(storeName, "readonly");
          const read = transaction.objectStore(storeName).get(identifier);
          read.onerror = () => reject(read.error);
          read.onsuccess = () => {
            const value = read.result?.publicKeySpki ?? null;
            db.close();
            resolve(value);
          };
        };
      }),
    { dbName: "alwaslh-student-device", storeName: "device-keys", identifier: accountIdentifier },
  );
}

test("student activation and returning login use the persisted browser device key", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "تفعيل حساب جديد" })).toBeVisible();

  await page.getByLabel("رمز الوصول الكامل").fill("999999");
  const invalidVerifyPromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/activation/verify") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "متابعة التفعيل" }).click();
  const invalidVerify = await invalidVerifyPromise;
  expect(invalidVerify.status()).toBe(404);
  await expect(page.getByRole("alert")).toContainText("كود التفعيل غير موجود");

  await page.getByLabel("رمز الوصول الكامل").fill(accountCodeArabic);
  await expect(page.getByLabel("رمز الوصول الكامل")).toHaveValue(accountCode);
  const verifyPromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/activation/verify") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "متابعة التفعيل" }).click();
  const verify = await verifyPromise;
  expect(verify.status()).toBe(200);
  expect((await verify.json()).accountIdentifier).toBe(accountCode);
  await expect(page.getByText(/دون استهلاكه/)).toBeVisible();

  await page.getByLabel("كلمة المرور الخاصة بك").fill(initialPassword);
  await page.getByLabel("تأكيد كلمة المرور").fill(initialPassword);
  const completePromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/activation/complete") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "إنشاء الحساب وتسجيل هذا الجهاز" }).click();
  const activationResponse = await completePromise;
  expect(activationResponse.status()).toBe(201);
  const activation = await activationResponse.json();
  expect(activation.profile.role).toBe("student");
  expect(activation.deviceId).toMatch(/^[0-9a-f-]{36}$/);

  await expect(page.getByText("تم تسجيل الدخول", { exact: true })).toBeVisible();
  await expect(page.getByText("وصول كامل", { exact: true })).toBeVisible();
  const firstPublicKey = await storedPublicKey(page, accountCode);
  expect(firstPublicKey).toEqual(expect.any(String));
  expect(firstPublicKey.length).toBeGreaterThan(80);

  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page.getByRole("heading", { name: "لدي حساب بالفعل" })).toBeVisible();
  await page.getByLabel("معرّف الحساب").fill(accountCodeArabic);
  await page.getByLabel("كلمة المرور").fill(initialPassword);

  const loginStartPromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/login/start") && response.request().method() === "POST",
  );
  const loginCompletePromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/login/complete") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  const loginStart = await loginStartPromise;
  const loginComplete = await loginCompletePromise;
  expect(loginStart.status()).toBe(200);
  expect((await loginStart.json()).purpose).toBe("login");
  expect(loginComplete.status()).toBe(200);

  await expect(page.getByText("تم تسجيل الدخول", { exact: true })).toBeVisible();
  await expect(page.getByText("وصول كامل", { exact: true })).toBeVisible();
  expect(await storedPublicKey(page, accountCode)).toBe(firstPublicKey);

  const bodyMetrics = await page.locator("body").evaluate((body) => ({
    scrollWidth: body.scrollWidth,
    clientWidth: body.clientWidth,
  }));
  expect(bodyMetrics.scrollWidth).toBeLessThanOrEqual(bodyMetrics.clientWidth + 1);
});
