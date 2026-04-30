import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../fixtures/world";

// ─── Navigation ───────────────────────────────────────────────────────────────

Given("I am on the landing page", async function (this: ICustomWorld) {
  await this.page.goto("/");
  await this.page.waitForLoadState("domcontentloaded");
});

Given("I navigate to {string}", async function (this: ICustomWorld, path: string) {
  await this.page.goto(path);
  await this.page.waitForLoadState("domcontentloaded");
});

When("I navigate to {string}", async function (this: ICustomWorld, path: string) {
  await this.page.goto(path);
  await this.page.waitForLoadState("domcontentloaded");
});

When("I am on the landing page", async function (this: ICustomWorld) {
  await this.page.goto("/");
  await this.page.waitForLoadState("domcontentloaded");
});

// ─── Viewport ────────────────────────────────────────────────────────────────

Given("I am viewing on a mobile viewport", async function (this: ICustomWorld) {
  await this.page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
});

// ─── Auth State ───────────────────────────────────────────────────────────────

Given("I am not signed in", async function (this: ICustomWorld) {
  // Clear all cookies/storage to ensure unauthenticated state
  await this.page.context().clearCookies();
  await this.page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

Given("I am signed in as a test user", async function (this: ICustomWorld) {
  // Use Clerk test session via storageState fixture
  // See: e2e/fixtures/auth.setup.ts for setup
  const authFile = process.env.TEST_AUTH_STATE ?? "e2e/.auth/user.json";
  try {
    await this.page.context().addCookies(
      require(authFile)?.cookies ?? []
    );
  } catch {
    // Auth file not set up yet — skip to sign-in flow
    const email = process.env.TEST_USER_EMAIL ?? "";
    const password = process.env.TEST_USER_PASSWORD ?? "";
    if (email && password) {
      await this.page.goto("/auth/sign-in");
      await this.page.waitForTimeout(2000); // Clerk loads async
    }
  }
});

Given("I am signed in as a free user", async function (this: ICustomWorld) {
  // Same as test user but without purchase record
  await this.page.context().clearCookies();
});

Given("I am signed in as a user who has purchased", async function (this: ICustomWorld) {
  const authFile = process.env.TEST_AUTH_STATE_BUYER ?? "e2e/.auth/buyer.json";
  try {
    await this.page.context().addCookies(
      require(authFile)?.cookies ?? []
    );
  } catch {
    // Fall back to basic auth state
  }
});

// ─── URL Assertions ───────────────────────────────────────────────────────────

Then("I should be on the {string} page", async function (this: ICustomWorld, path: string) {
  await expect(this.page).toHaveURL(new RegExp(path.replace("/", "\\/")));
});

Then("I should be redirected away from {string}", async function (this: ICustomWorld, path: string) {
  await this.page.waitForURL((url) => !url.pathname.startsWith(path), { timeout: 10_000 });
  await expect(this.page).not.toHaveURL(path);
});

Then("the redirect URL should contain {string}", async function (this: ICustomWorld, keyword: string) {
  const url = this.page.url();
  expect(url).toContain(keyword);
});

Then("the redirect URL should include a {string} param", async function (this: ICustomWorld, param: string) {
  const url = this.page.url();
  expect(url).toContain(param);
});

// ─── Page State ───────────────────────────────────────────────────────────────

Then("the page should not have any errors", async function (this: ICustomWorld) {
  await expect(this.page).not.toHaveURL(/error/);
  await expect(this.page.locator("body")).toBeVisible();
});

Then("the page should load without errors", async function (this: ICustomWorld) {
  await expect(this.page.locator("body")).toBeVisible();
  await expect(this.page).not.toHaveURL(/error/);
});

Then("the page title should contain {string}", async function (this: ICustomWorld, text: string) {
  await expect(this.page).toHaveTitle(new RegExp(text));
});

Then("the page lang should be {string}", async function (this: ICustomWorld, lang: string) {
  const pageLang = await this.page.locator("html").getAttribute("lang");
  expect(pageLang).toBe(lang);
});

// ─── Overflow / Mobile ────────────────────────────────────────────────────────

Then("the page should not have horizontal overflow", async function (this: ICustomWorld) {
  const hasOverflow = await this.page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasOverflow).toBe(false);
});

// ─── Scrolling ───────────────────────────────────────────────────────────────

When("I scroll to the stack configurator", async function (this: ICustomWorld) {
  await this.page.locator("text=Configure your stack").scrollIntoViewIfNeeded();
});

When("I scroll to the AI tools section", async function (this: ICustomWorld) {
  await this.page.locator("#ai-first").scrollIntoViewIfNeeded();
});

When("I scroll to the templates section", async function (this: ICustomWorld) {
  await this.page.locator("#templates").scrollIntoViewIfNeeded();
});

When("I scroll to the pricing section on the landing page", async function (this: ICustomWorld) {
  await this.page.locator("text=$149").first().scrollIntoViewIfNeeded();
});

When("I scroll to the footer", async function (this: ICustomWorld) {
  await this.page.locator("footer").scrollIntoViewIfNeeded();
});
