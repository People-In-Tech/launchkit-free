import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

/**
 * BDD / Gherkin test configuration using playwright-bdd.
 * Run with: npx playwright test --config=playwright.bdd.config.ts
 *
 * Tags:
 *   --grep @smoke           → critical path only (fast, ~2 min)
 *   --grep @checkout        → Stripe checkout flows (requires stripe CLI)
 *   --grep @mobile          → mobile viewport tests
 *   --grep @webhook         → webhook integration tests
 */

const testDir = defineBddConfig({
  paths: ["e2e/features/**/*.feature"],
  require: ["e2e/steps/**/*.ts", "e2e/fixtures/**/*.ts"],
  worldParameters: {},
});

export default defineConfig({
  testDir,

  /* Maximum time a single step can run */
  timeout: 45_000,

  /* Fail the build on CI if test.only left in source */
  forbidOnly: !!process.env.CI,

  /* Retry on CI */
  retries: process.env.CI ? 1 : 0,

  /* Serial on CI to avoid race conditions with Stripe webhooks */
  workers: process.env.CI ? 1 : 2,

  reporter: [
    ["html", { outputFolder: "playwright-report-bdd", open: "never" }],
    ["list"],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    /* Allow Playwright to follow cross-origin redirects (Stripe Checkout) */
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  },

  projects: [
    {
      name: "chromium-bdd",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-bdd",
      use: { ...devices["iPhone 14 Pro"] },
      grep: /@mobile/,
    },
  ],

  /* Start the dev server before running tests */
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    },
  },
});
