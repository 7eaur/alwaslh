import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:5174",
    viewport: { width: 390, height: 844 },
    locale: "ar-YE",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "npm run start --prefix ../api",
      url: "http://127.0.0.1:3000/health",
      timeout: 20_000,
      reuseExistingServer: false,
    },
    {
      command: "npm run preview -- --host 127.0.0.1",
      url: "http://127.0.0.1:5174",
      timeout: 20_000,
      reuseExistingServer: false,
    },
  ],
});
