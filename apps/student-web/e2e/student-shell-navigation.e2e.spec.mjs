  await adaptiveNav.getByRole("link", { name: "مكتبتي" }).click();
  await expect(page).toHaveURL(/\/app\/library$/);
  await expect(page.locator("#route-content")).toBeFocused();
  await expect(adaptiveNav.getByRole("link", { name: "مكتبتي" })).toHaveAttribute("aria-current", "page");

  await adaptiveNav.getByRole("link", { name: "تقدمي" }).click();
  await expect(page).toHaveURL(/\/app\/progress$/);
  await expect(page.getByRole("heading", { name: "سيظهر تقدمك هنا" })).toBeVisible();
});

test("Home matches the approved statistics and quick-access composition with left-only decoration", async ({ page }, testInfo) => {
  await openAuthenticatedStudent(page);

  await expect(page.getByRole("heading", { name: "إحصائياتك" })).toBeVisible();
  await expect(page.locator(".student-home-reference-stat")).toHaveCount(4);
  await expect(page.getByText("الدروس", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("النماذج", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("المحفوظات", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("التنزيلات", { exact: true }).first()).toBeVisible();

  await expect(page.getByRole("heading", { name: "الوصول السريع" })).toBeVisible();
  await expect(page.locator(".student-home-reference-quick")).toHaveCount(4);
  await expectNoHorizontalOverflow(page);

  const decoration = await page.locator(".student-shell").evaluate((element) => {
    const before = getComputedStyle(element, "::before");
    const after = getComputedStyle(element, "::after");
    return {
      beforeLeft: before.left,
      beforeWidth: before.width,
      beforeDisplay: before.display,
      beforePointerEvents: before.pointerEvents,
      afterDisplay: after.display,
    };
  });
  expect(decoration.beforeDisplay).not.toBe("none");
  expect(decoration.beforeLeft).not.toBe("auto");
  expect(Number.parseFloat(decoration.beforeLeft)).toBeGreaterThanOrEqual(0);
  expect(Number.parseFloat(decoration.beforeWidth)).toBeGreaterThan(0);
  expect(decoration.beforePointerEvents).toBe("none");
  expect(decoration.afterDisplay).toBe("none");

  for (const viewport of [
    { name: "phone", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1366, height: 900 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: testInfo.outputPath(`student-home-reference-${viewport.name}.png`), fullPage: true });
  }
});