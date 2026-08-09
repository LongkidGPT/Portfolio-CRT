import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "analytics.spec.ts",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4181", trace: "retain-on-failure" },
  webServer: {
    command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 4181",
    url: "http://127.0.0.1:4181",
    reuseExistingServer: false,
    env: {
      ...process.env,
      NEXT_PUBLIC_POSTHOG_TOKEN: "phc_browser_test",
      NEXT_PUBLIC_POSTHOG_HOST: "https://us.i.posthog.com",
      NEXT_PUBLIC_ANALYTICS_CARD_VISIBLE: "true",
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
});
