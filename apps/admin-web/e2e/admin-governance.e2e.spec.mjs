import { expect, test } from "@playwright/test";
import { logoutRealAdminSession } from "./stage13e-real-api.mjs";

const enabled = process.env.STAGE13G_E2E === "1";
test.skip(!enabled, "Stage13G browser fixture is only available in the Stage13G integration workflow");

const adminIdentifier = process.env.STAGE13G_ADMIN_IDENTIFIER ?? "stage13g-admin-ui";
const adminPassword = process.env.STAGE13G_ADMIN_PASSWORD ?? "Stage13gAdminUiPass123!";

async function login(page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await page.getByLabel("معرّف المدير").fill(adminIdentifier);
  await page.getByLabel("كلمة المرور").fill(adminPassword);
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.getByRole("heading", { name: "لوحة التشغيل", exact: true })).toBeVisible();
}

async function openGovernance(page) {
  const governanceResponse = page.waitForResponse(
    (response) => response.url().endsWith("/v1/admin/operations/governance") && response.status() === 200,
  );
  const auditResponse = page.waitForResponse(
    (response) => response.url().includes("/v1/admin/operations/audit") && response.status() === 200,
  );
  await page.getByRole("button", { name: "الحوكمة والأمان", exact: true }).click();
  await expect(page.getByRole("heading", { name: "الحوكمة والأمان", exact: true })).toBeVisible();
  return {
    governance: await (await governanceResponse).json(),
    audit: await (await auditResponse).json(),
  };
}

test("Governance reads safe live projections and filters the canonical audit feed", async ({ page }) => {
  await login(page);
  const initial = await openGovernance(page);

  await expect(page.getByRole("heading", { name: "تقارير الحالة", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "وضع الإعدادات", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "حالة الأمان", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "سجل التدقيق", exact: true })).toBeVisible();
  await expect(
    page.getByText("القيم السرية وعناوين الاتصال والمسارات غير متاحة للمتصفح.", { exact: false }),
  ).toBeVisible();

  const publicProjection = JSON.stringify(initial);
  for (const forbidden of [
    "postgresql://",
    "DATABASE_URL",
    "password_hash",
    "token_hash",
    "public_key_spki",
    "provider_metadata",
    "reviewed_output",
    "credential_alias",
    "provider_project_alias",
  ]) {
    expect(publicProjection).not.toContain(forbidden);
  }

  const accessResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/v1/admin/operations/audit") &&
      response.url().includes("source=access") &&
      response.status() === 200,
  );
  await page.getByLabel("المصدر").selectOption("access");
  const accessBody = await (await accessResponse).json();
  expect(accessBody.page.total).toBeGreaterThan(0);
  expect(accessBody.entries.every((entry) => entry.source === "access")).toBe(true);
  await expect(page.getByText("الوصول", { exact: true }).first()).toBeVisible();

  const eventResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/v1/admin/operations/audit") &&
      response.url().includes("source=access") &&
      response.url().includes("eventType=code_generated") &&
      response.status() === 200,
  );
  await page.getByLabel("نوع الحدث (اختياري)").fill("code_generated");
  await page.getByRole("button", { name: "تطبيق", exact: true }).click();
  const eventBody = await (await eventResponse).json();
  expect(eventBody.entries.every((entry) => entry.eventType === "code_generated")).toBe(true);
});

test("Governance returns to login when the real Admin session expires", async ({ page }) => {
  await login(page);
  await openGovernance(page);
  await logoutRealAdminSession(page);
  await page.getByRole("button", { name: "تحديث الحالة", exact: true }).click();
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await expect(page.getByRole("button", { name: "الحوكمة والأمان", exact: true })).toHaveCount(0);
});

test("Governance and audit stay within a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await openGovernance(page);

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});
