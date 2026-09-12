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
  await expect(page.getByRole("heading", { name: "نظرة عامة", exact: true })).toBeVisible();
}

async function openDiagnostics(page) {
  const diagnosticsResponse = page.waitForResponse(
    (response) => response.url().endsWith("/v1/admin/operations/diagnostics") && response.status() === 200,
  );
  await page.getByRole("link", { name: "التشخيص المتقدم", exact: true }).click();
  await expect(page.getByRole("heading", { name: "التشخيص المتقدم", exact: true })).toBeVisible();
  return (await diagnosticsResponse).json();
}

test("Diagnostics stays advanced-only while Audit remains a separate operator workflow", async ({ page }) => {
  await login(page);
  const diagnostics = await openDiagnostics(page);

  await expect(page.getByRole("heading", { name: "حالة مسارات العمل", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "إعدادات التشغيل", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "حالة الأمان والجلسات", exact: true })).toBeVisible();
  await expect(page.getByText("القيم السرية غير متاحة للمتصفح.", { exact: false })).toBeVisible();

  const publicProjection = JSON.stringify(diagnostics);
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

  const auditResponse = page.waitForResponse(
    (response) => response.url().includes("/v1/admin/operations/audit") && response.status() === 200,
  );
  await page.getByRole("link", { name: "سجل التدقيق", exact: true }).click();
  await expect(page.getByRole("heading", { name: "سجل التدقيق", exact: true })).toBeVisible();
  const initialAudit = await (await auditResponse).json();
  expect(initialAudit.page.total).toBeGreaterThan(0);

  const accessResponse = page.waitForResponse(
    (response) => response.url().includes("/v1/admin/operations/audit") && response.url().includes("source=access") && response.status() === 200,
  );
  await page.getByLabel("المصدر").selectOption("access");
  const accessBody = await (await accessResponse).json();
  expect(accessBody.page.total).toBeGreaterThan(0);
  expect(accessBody.entries.every((entry) => entry.source === "access")).toBe(true);
  await expect(page.locator(".operations-source-badge").filter({ hasText: "الوصول" }).first()).toBeVisible();
  await expect(page.getByLabel("نوع الحدث (اختياري)")).toHaveCount(0);
});

test("Diagnostics returns to login when the real Admin session expires", async ({ page }) => {
  await login(page);
  await openDiagnostics(page);
  await logoutRealAdminSession(page);
  await page.getByRole("button", { name: "تحديث الحالة", exact: true }).click();
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "التشخيص المتقدم", exact: true })).toHaveCount(0);
});

test("Diagnostics and Audit stay within a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await openDiagnostics(page);
  await page.getByRole("link", { name: "سجل التدقيق", exact: true }).click();
  await expect(page.getByRole("heading", { name: "سجل التدقيق", exact: true })).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});
