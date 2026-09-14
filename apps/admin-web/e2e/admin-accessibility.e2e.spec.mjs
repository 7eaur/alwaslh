import { expect, test } from "@playwright/test";

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

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));

  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 1);
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport + 1);
}

test("admin shell preserves RTL, keyboard focus visibility, and responsive width", async ({ page }) => {
  await login(page);

  const productShell = page.locator(".aw-product-shell--admin");
  await expect(productShell).toHaveAttribute("dir", "rtl");

  // RouteFocus intentionally places programmatic focus on the page-content landmark.
  // Move backwards/forwards with the keyboard so :focus-visible is exercised through
  // the same input modality a keyboard user actually uses.
  const routeContent = page.locator("#route-content");
  await expect(routeContent).toBeFocused();

  const skipLink = page.getByRole("link", { name: "انتقل إلى المحتوى" });
  await page.keyboard.press("Shift+Tab");
  await expect(skipLink).toBeFocused();
  const skipOutline = await skipLink.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(skipOutline).not.toBe("none");

  const firstNavigationLink = page.getByRole("navigation", { name: "أقسام الإدارة" }).getByRole("link").first();
  await page.keyboard.press("Tab");
  await expect(firstNavigationLink).toBeFocused();
  const navOutline = await firstNavigationLink.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(navOutline).not.toBe("none");

  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);

  await page.goto("/app/content");
  await expect(page.locator("#route-content")).toBeFocused();
  await expect(page.locator(".aw-product-shell--admin")).toHaveAttribute("dir", "rtl");
  await expectNoHorizontalOverflow(page);
});
