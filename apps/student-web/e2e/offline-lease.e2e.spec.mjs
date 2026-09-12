import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import ts from "typescript";

const lifecycleCode = "654322";
const expiryCode = "654323";
const lifecyclePassword = `Stage16-${crypto.randomUUID()}!`;
const expiryPassword = `Stage16-${crypto.randomUUID()}!`;
const offlineStoreModuleSource = ts.transpileModule(
  readFileSync(resolve(process.cwd(), "src/offline-store.ts"), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;

function runAuthFixture(action, profileId) {
  const apiDirectory = resolve(process.cwd(), "../api");
  const output = execFileSync(
    process.execPath,
    ["--import", "tsx", "tests/browser-auth-fixture.ts", action, profileId],
    {
      cwd: apiDirectory,
      env: process.env,
      encoding: "utf8",
    },
  );
  return JSON.parse(output);
}

async function readOfflineLeases(page) {
  return page.evaluate(() =>
    new Promise((resolveValue, reject) => {
      const request = indexedDB.open("alwaslh-student-offline");
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("leases")) {
          db.createObjectStore("leases", { keyPath: "scopeKey" });
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("leases", "readonly");
        const read = transaction.objectStore("leases").getAll();
        read.onerror = () => reject(read.error);
        read.onsuccess = () => {
          db.close();
          resolveValue(read.result);
        };
      };
    }),
  );
}

async function putOfflineLease(page, record) {
  await page.evaluate(
    (value) =>
      new Promise((resolveValue, reject) => {
        const request = indexedDB.open("alwaslh-student-offline");
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains("leases")) {
            db.createObjectStore("leases", { keyPath: "scopeKey" });
          }
        };
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction("leases", "readwrite");
          transaction.objectStore("leases").put(value);
          transaction.onerror = () => reject(transaction.error);
          transaction.oncomplete = () => {
            db.close();
            resolveValue();
          };
        };
      }),
    record,
  );
}

function cloneLeaseRecord(record, profileId, deviceId) {
  return {
    ...record,
    scopeKey: `${profileId}:${deviceId}`,
    profileId,
    deviceId,
    lease: {
      ...record.lease,
      profileId,
      deviceId,
    },
  };
}

function expectSameOrRefreshedLeaseRecord(actual, baseline) {
  expect(actual).toBeTruthy();
  expect(actual.scopeKey).toBe(baseline.scopeKey);
  expect(actual.profileId).toBe(baseline.profileId);
  expect(actual.deviceId).toBe(baseline.deviceId);
  expect(actual.lease.version).toBe(baseline.lease.version);
  expect(actual.lease.profileId).toBe(baseline.lease.profileId);
  expect(actual.lease.deviceId).toBe(baseline.lease.deviceId);
  expect(
    actual.lease.grants.map(({ entitlementId, scope, classId }) => ({ entitlementId, scope, classId })),
  ).toEqual(
    baseline.lease.grants.map(({ entitlementId, scope, classId }) => ({ entitlementId, scope, classId })),
  );
  expect(Date.parse(actual.lease.issuedAt)).toBeGreaterThanOrEqual(Date.parse(baseline.lease.issuedAt));
  expect(Date.parse(actual.lease.expiresAt)).toBeGreaterThanOrEqual(Date.parse(baseline.lease.expiresAt));
  expect(actual.observedAtClientMs).toBeGreaterThanOrEqual(baseline.observedAtClientMs);
  expect(actual.lastSeenClientMs).toBeGreaterThanOrEqual(baseline.lastSeenClientMs);
}

async function expectAuthenticatedHome(page) {
  await expect(page).toHaveURL(/\/app\/home$/);
  await expect(page.getByRole("heading", { name: "ماذا تريد أن تفعل الآن؟" })).toBeVisible();
}

async function activateStudent(page, code, password) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "تفعيل حساب جديد" })).toBeVisible();
  await page.getByLabel("رمز الوصول الكامل").fill(code);

  const verifyPromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/activation/verify") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "متابعة التفعيل" }).click();
  expect((await verifyPromise).status()).toBe(200);

  await page.getByLabel("كلمة المرور الخاصة بك").fill(password);
  await page.getByLabel("تأكيد كلمة المرور").fill(password);
  const completePromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/activation/complete") && response.request().method() === "POST",
  );
  const leasePromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/offline/lease") && response.request().method() === "GET",
  );
  await page.getByRole("button", { name: "إنشاء الحساب والمتابعة" }).click();
  const [completeResponse, leaseResponse] = await Promise.all([completePromise, leasePromise]);
  expect(completeResponse.status()).toBe(201);
  expect(leaseResponse.status()).toBe(200);
  await expectAuthenticatedHome(page);

  return {
    activation: await completeResponse.json(),
    lease: (await leaseResponse.json()).lease,
  };
}

async function switchToLogin(page) {
  await page.locator(".student-auth-switch").getByRole("button", { name: "لدي حساب بالفعل" }).click();
  await expect(page.getByRole("heading", { name: "لدي حساب بالفعل" })).toBeVisible();
}

async function loginStudent(page, code, password, expectedPurpose) {
  await switchToLogin(page);
  await page.getByLabel("معرّف الحساب").fill(code);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(password);

  const startPromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/login/start") && response.request().method() === "POST",
  );
  const completePromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/login/complete") && response.request().method() === "POST",
  );
  const leasePromise = page.waitForResponse(
    (response) => response.url().includes("/v1/student/offline/lease") && response.request().method() === "GET",
  );
  await page.locator(".student-entry-form").getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  const [startResponse, completeResponse, leaseResponse] = await Promise.all([
    startPromise,
    completePromise,
    leasePromise,
  ]);
  expect(startResponse.status()).toBe(200);
  expect((await startResponse.json()).purpose).toBe(expectedPurpose);
  expect(completeResponse.status()).toBe(200);
  expect(leaseResponse.status()).toBe(200);
  await expectAuthenticatedHome(page);

  return {
    login: await completeResponse.json(),
    lease: (await leaseResponse.json()).lease,
  };
}

async function openAccount(page) {
  if (!/\/app\/account$/.test(page.url())) {
    await page.getByRole("link", { name: "حسابي", exact: true }).click();
  }
  await expect(page).toHaveURL(/\/app\/account$/);
  await expect(page.getByRole("heading", { name: "وصولك الحالي" })).toBeVisible();
}

async function refreshAccess(page) {
  await openAccount(page);
  const refresh = page.locator(".access-section").getByRole("button", { name: "تحديث" });
  await expect(refresh).toBeEnabled();
  await refresh.click();
}

test("offline lease persists and cleanup stays scoped across logout and device rebind", async ({ page, context }) => {
  const { activation, lease } = await activateStudent(page, lifecycleCode, lifecyclePassword);
  expect(lease.profileId).toBe(activation.profile.id);
  expect(lease.deviceId).toBe(activation.deviceId);

  const initialRecords = await readOfflineLeases(page);
  const currentRecord = initialRecords.find((record) => record.scopeKey === `${lease.profileId}:${lease.deviceId}`);
  expect(currentRecord).toBeTruthy();
  expect(currentRecord.lease.version).toBe(lease.version);
  expect(currentRecord.lease.profileId).toBe(lease.profileId);
  expect(currentRecord.lease.deviceId).toBe(lease.deviceId);
  expect(
    currentRecord.lease.grants.map(({ entitlementId, scope, classId }) => ({ entitlementId, scope, classId })),
  ).toEqual(lease.grants.map(({ entitlementId, scope, classId }) => ({ entitlementId, scope, classId })));
  expect(Date.parse(currentRecord.lease.issuedAt)).toBeGreaterThanOrEqual(Date.parse(lease.issuedAt));
  expect(Date.parse(currentRecord.lease.expiresAt)).toBeGreaterThanOrEqual(Date.parse(lease.expiresAt));

  await page.route("**/v1/student/offline/lease", (route) => route.abort());
  await page.reload();
  await expectAuthenticatedHome(page);
  const persistedRecords = await readOfflineLeases(page);
  const persistedCurrentScope = persistedRecords.filter((record) => record.scopeKey === currentRecord.scopeKey);
  expect(persistedCurrentScope).toHaveLength(1);
  expectSameOrRefreshedLeaseRecord(persistedCurrentScope[0], currentRecord);
  await page.unroute("**/v1/student/offline/lease");

  const staleDeviceId = "00000000-0000-4000-8000-000000000016";
  const otherProfileId = "00000000-0000-4000-8000-000000000099";
  const otherDeviceId = "00000000-0000-4000-8000-000000000098";
  const staleSameProfile = cloneLeaseRecord(currentRecord, lease.profileId, staleDeviceId);
  const otherAccount = cloneLeaseRecord(currentRecord, otherProfileId, otherDeviceId);
  await putOfflineLease(page, staleSameProfile);
  await putOfflineLease(page, otherAccount);

  await openAccount(page);
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(page.getByText("أنت غير متصل الآن", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await expect(page.getByRole("heading", { name: "لدي حساب بالفعل" })).toBeVisible();
  await expect.poll(async () => (await readOfflineLeases(page)).some((record) => record.scopeKey === currentRecord.scopeKey)).toBe(false);
  let afterOfflineLogout = await readOfflineLeases(page);
  expect(afterOfflineLogout.some((record) => record.scopeKey === staleSameProfile.scopeKey)).toBe(true);
  expect(afterOfflineLogout.some((record) => record.scopeKey === otherAccount.scopeKey)).toBe(true);

  await context.setOffline(false);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await page.evaluate(async () => {
    await fetch("/v1/auth/logout", { method: "POST", credentials: "include" });
  });
  const relogin = await loginStudent(page, lifecycleCode, lifecyclePassword, "login");
  expect(relogin.lease.profileId).toBe(lease.profileId);
  expect(relogin.lease.deviceId).toBe(lease.deviceId);

  const reset = runAuthFixture("device-rebind", lease.profileId);
  expect(reset.status).toBe("device_rebind_allowed");
  await refreshAccess(page);
  await expect(page.getByText("انتهت جلستك. سجّل الدخول مرة أخرى للمتابعة بأمان.", { exact: true })).toBeVisible();
  await expect.poll(async () => (await readOfflineLeases(page)).some((record) => record.scopeKey === currentRecord.scopeKey)).toBe(false);
  afterOfflineLogout = await readOfflineLeases(page);
  expect(afterOfflineLogout.some((record) => record.scopeKey === staleSameProfile.scopeKey)).toBe(true);
  expect(afterOfflineLogout.some((record) => record.scopeKey === otherAccount.scopeKey)).toBe(true);

  const rebound = await loginStudent(page, lifecycleCode, lifecyclePassword, "device_rebind");
  expect(rebound.lease.profileId).toBe(lease.profileId);
  expect(rebound.lease.deviceId).not.toBe(lease.deviceId);

  const reboundRecords = await readOfflineLeases(page);
  const sameProfileRecords = reboundRecords.filter((record) => record.profileId === lease.profileId);
  expect(sameProfileRecords).toHaveLength(1);
  expect(sameProfileRecords[0].deviceId).toBe(rebound.lease.deviceId);
  expect(reboundRecords.some((record) => record.scopeKey === otherAccount.scopeKey)).toBe(true);
});

test("server-side session expiry removes only the active lease scope", async ({ page }) => {
  const { activation, lease } = await activateStudent(page, expiryCode, expiryPassword);
  const records = await readOfflineLeases(page);
  const currentRecord = records.find((record) => record.scopeKey === `${lease.profileId}:${lease.deviceId}`);
  expect(currentRecord).toBeTruthy();

  const otherProfileId = "00000000-0000-4000-8000-000000000097";
  const otherDeviceId = "00000000-0000-4000-8000-000000000096";
  const otherAccount = cloneLeaseRecord(currentRecord, otherProfileId, otherDeviceId);
  await putOfflineLease(page, otherAccount);

  const recovery = runAuthFixture("temporary-password", activation.profile.id);
  expect(recovery.temporaryPassword).toEqual(expect.any(String));
  await refreshAccess(page);
  await expect(page.getByText("انتهت جلستك. سجّل الدخول مرة أخرى للمتابعة بأمان.", { exact: true })).toBeVisible();

  await expect.poll(async () => (await readOfflineLeases(page)).some((record) => record.scopeKey === currentRecord.scopeKey)).toBe(false);
  const afterExpiry = await readOfflineLeases(page);
  expect(afterExpiry.some((record) => record.scopeKey === otherAccount.scopeKey)).toBe(true);
});

test("clock rollback beyond tolerance is rejected by the real offline-store module in Chromium", async ({ page }) => {
  await page.goto("/");
  const now = Date.now();
  const profileId = "00000000-0000-4000-8000-000000000095";
  const deviceId = "00000000-0000-4000-8000-000000000094";
  const record = {
    scopeKey: `${profileId}:${deviceId}`,
    profileId,
    deviceId,
    lease: {
      version: 1,
      profileId,
      deviceId,
      issuedAt: new Date(now - 60_000).toISOString(),
      expiresAt: new Date(now + 60 * 60 * 1000).toISOString(),
      grants: [],
    },
    observedAtClientMs: now,
    lastSeenClientMs: now + 10 * 60 * 1000,
  };
  await putOfflineLease(page, record);

  const evaluation = await page.evaluate(
    async ({ source, expectedProfileId, expectedDeviceId, clientNowMs }) => {
      const moduleUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
      try {
        const offlineStore = await import(moduleUrl);
        const loaded = await offlineStore.loadOfflineLease(expectedProfileId, expectedDeviceId, clientNowMs);
        if (!loaded) return null;
        return offlineStore.evaluateStoredOfflineLease(loaded, clientNowMs);
      } finally {
        URL.revokeObjectURL(moduleUrl);
      }
    },
    {
      source: offlineStoreModuleSource,
      expectedProfileId: profileId,
      expectedDeviceId: deviceId,
      clientNowMs: now,
    },
  );

  expect(evaluation).toEqual({ status: "clock_rollback", estimatedServerTimeMs: null });
});
