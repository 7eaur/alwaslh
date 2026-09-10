import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { logoutRealAdminSession } from "./stage13e-real-api.mjs";

const enabled = process.env.STAGE13G_E2E === "1";
test.skip(!enabled, "Stage13G browser fixture is only available in the Stage13G integration workflow");

const adminIdentifier = process.env.STAGE13G_ADMIN_IDENTIFIER ?? "stage13g-admin-ui";
const adminPassword = process.env.STAGE13G_ADMIN_PASSWORD ?? "Stage13gAdminUiPass123!";
const apiBase = process.env.STAGE13E_E2E_API_BASE_URL ?? "http://127.0.0.1:3000";

async function login(page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await page.getByLabel("معرّف المدير").fill(adminIdentifier);
  await page.getByLabel("كلمة المرور").fill(adminPassword);
  await page.getByRole("button", { name: "دخول آمن" }).click();
  await expect(page.getByRole("heading", { name: "لوحة التشغيل", exact: true })).toBeVisible();
}

async function openReports(page) {
  await page.getByRole("button", { name: "الملفات والتقارير" }).click();
  await expect(page.getByRole("heading", { name: "الملفات والتقارير", exact: true })).toBeVisible();
}

async function unusedImportCodes(page) {
  const response = await page.context().request.get(
    `${apiBase}/v1/admin/access/codes?type=full_access&limit=100&offset=0`,
  );
  expect(response.ok()).toBe(true);
  const payload = await response.json();
  const existing = new Set(payload.codes.map((item) => item.code));
  const candidates = ["010101", "020202", "030303", "040404", "050505", "060606"];
  const available = candidates.filter((candidate) => !existing.has(candidate));
  expect(available.length).toBeGreaterThanOrEqual(2);
  return available.slice(0, 2);
}

function toArabicDigits(value) {
  const digits = "٠١٢٣٤٥٦٧٨٩";
  return [...value].map((digit) => digits[Number(digit)]).join("");
}

test("Files workspace imports row-by-row and exports the complete filtered inventory as safe CSV", async ({ page }) => {
  await login(page);
  const [firstCode, secondCode] = await unusedImportCodes(page);
  await openReports(page);

  const csv = [
    "code,duration_days",
    `${toArabicDigits(firstCode)},90`,
    `${firstCode},90`,
    "12345,90",
    `${secondCode},120`,
    "",
  ].join("\r\n");

  await page.getByLabel("ملف CSV").setInputFiles({
    name: "stage13g-full-access.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv, "utf8"),
  });
  await expect(page.getByText("4 صف جاهز للإرسال", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "استيراد الصفوف الصالحة" }).click();

  await expect(page.getByText("اكتمل الاستيراد: 2 كود مضاف و2 صف مرفوض.", { exact: true })).toBeVisible();
  const summary = page.getByLabel("ملخص الاستيراد");
  await expect(summary).toContainText("المستلم 4");
  await expect(summary).toContainText("المضاف 2");
  await expect(summary).toContainText("المرفوض 2");
  await expect(page.getByLabel("أخطاء صفوف الاستيراد")).toContainText("مكرر داخل ملف الاستيراد");
  await expect(page.getByLabel("أخطاء صفوف الاستيراد")).toContainText("ستة أرقام فقط");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "تصدير CSV متوافق مع Excel" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const exported = await readFile(path, "utf8");
  expect(exported.charCodeAt(0)).toBe(0xfeff);
  expect(exported).toContain("code,type,status,class_name,duration_days");
  expect(exported).toContain(firstCode);
  expect(exported).toContain(secondCode);
  await expect(page.getByText(/تم تجهيز \d+ كود في ملف CSV متوافق مع Excel/)).toBeVisible();
});

test("Files workspace prints all selected-scope cards and stays within a 390px viewport", async ({ page }) => {
  await page.addInitScript(() => {
    window.__stage13gPrinted = false;
    window.print = () => {
      window.__stage13gPrinted = true;
    };
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await openReports(page);

  await page.getByRole("button", { name: "طباعة البطاقات" }).click();
  await page.waitForFunction(() => window.__stage13gPrinted === true);
  await expect(page.locator(".print-code-card").first()).toBeAttached();
  await expect(page.getByText(/تم تجهيز \d+ بطاقة للطباعة أو الحفظ بصيغة PDF من المتصفح/)).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test("Files workspace returns to login after the real Admin session expires", async ({ page }) => {
  await login(page);
  await openReports(page);
  await logoutRealAdminSession(page);
  await page.getByRole("button", { name: "تصدير CSV متوافق مع Excel" }).click();
  await expect(page.getByRole("heading", { name: "دخول المدير" })).toBeVisible();
  await expect(page.getByRole("button", { name: "الملفات والتقارير" })).toHaveCount(0);
});
