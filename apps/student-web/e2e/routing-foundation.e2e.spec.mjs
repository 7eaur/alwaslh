import { expect, test } from "@playwright/test";

test("Student shell supports direct URLs, route focus and browser history", async ({ page }) => {
  await page.goto("/missing-route");

  await expect(page).toHaveURL(/\/missing-route$/);
  await expect(page.getByRole("heading", { name: "هذه الصفحة غير متاحة" })).toBeVisible();
  await expect(page.locator("#route-content")).toBeFocused();

  await page.getByRole("link", { name: "العودة إلى مساحة الطالب" }).click();
  await expect(page).toHaveURL(/\/app$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/missing-route$/);
  await expect(page.getByRole("heading", { name: "هذه الصفحة غير متاحة" })).toBeVisible();
});

test("Student root resolves to the canonical app route", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/app$/);
});
