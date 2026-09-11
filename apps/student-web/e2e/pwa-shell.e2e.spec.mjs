import { expect, test } from "@playwright/test";

test("Student app shell installs safely and reloads offline without caching protected API", async ({ page, context }) => {
  await page.goto("/");

  const manifestResponse = await page.request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest.name).toContain("الوسيلة الذكية");
  expect(manifest.start_url).toBe("/");
  expect(manifest.display).toBe("standalone");
  expect(manifest.dir).toBe("rtl");

  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) throw new Error("service_worker_unavailable");
    await navigator.serviceWorker.ready;
  });
  await page.reload();

  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true);

  const cacheState = await page.evaluate(async () => {
    const names = await caches.keys();
    const urls = (
      await Promise.all(
        names.map(async (name) => {
          const cache = await caches.open(name);
          return (await cache.keys()).map((request) => request.url);
        }),
      )
    ).flat();
    return { names, urls };
  });

  expect(cacheState.names).toContain("alwaslh-student-shell-v1");
  expect(cacheState.urls.some((url) => new URL(url).pathname.startsWith("/v1/"))).toBe(false);
  expect(cacheState.urls.some((url) => new URL(url).pathname.startsWith("/assets/"))).toBe(true);

  await page.evaluate(async () => {
    await fetch("/v1/stage16-cache-probe").catch(() => undefined);
  });
  const protectedApiCached = await page.evaluate(async () => {
    const names = await caches.keys();
    for (const name of names) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      if (keys.some((request) => new URL(request.url).pathname.startsWith("/v1/"))) return true;
    }
    return false;
  });
  expect(protectedApiCached).toBe(false);

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle("الوسيلة الذكية — مساحة الطالب");
  await expect(page.getByRole("heading", { name: "نحتاج اتصالًا للتحقق من الحساب" })).toBeVisible();
  await context.setOffline(false);
});
