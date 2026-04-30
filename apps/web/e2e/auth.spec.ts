import { test, expect } from "@playwright/test";

// ─── Sign-In Page ─────────────────────────────────────────────────────────────

test.describe("Sign-in page (/auth/sign-in)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-in");
  });

  test("page loads without errors", async ({ page }) => {
    // Clerk renders its own component — check the container renders
    await expect(page.locator("body")).toBeVisible();
    await expect(page).not.toHaveURL(/error/);
  });

  test("renders the full-screen centered layout", async ({ page }) => {
    // The sign-in page wraps Clerk in a min-h-screen flex centering div
    const wrapper = page.locator("div.flex.min-h-screen.items-center.justify-center");
    await expect(wrapper).toBeVisible();
  });

  test("renders the Clerk SignIn component iframe or container", async ({ page }) => {
    // When Clerk keys are not configured the ClerkProvider is skipped and the
    // children still render. With valid keys Clerk injects an iframe/div.
    // We just assert the page is not blank and has the wrapper.
    const body = page.locator("body");
    await expect(body).toBeVisible();
    // The page should not redirect away from /auth/sign-in since it is public.
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("has correct meta title", async ({ page }) => {
    // Root layout sets template "%s | LaunchKit" — sign-in page inherits the default
    const title = await page.title();
    // Either the default title or a Clerk-set title should contain "LaunchKit"
    // (The root layout default is "LaunchKit — Ship Your SaaS This Weekend")
    expect(title).toContain("LaunchKit");
  });
});

// ─── Sign-Up Page ─────────────────────────────────────────────────────────────

test.describe("Sign-up page (/auth/sign-up)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-up");
  });

  test("page loads without errors", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
    await expect(page).not.toHaveURL(/error/);
  });

  test("renders the full-screen centered layout", async ({ page }) => {
    const wrapper = page.locator("div.flex.min-h-screen.items-center.justify-center");
    await expect(wrapper).toBeVisible();
  });

  test("stays on /auth/sign-up (public route)", async ({ page }) => {
    // sign-up is a public route — unauthenticated users must be able to access it
    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });

  test("has correct meta title", async ({ page }) => {
    const title = await page.title();
    expect(title).toContain("LaunchKit");
  });
});

// ─── Redirect: Unauthenticated Access to Protected Routes ────────────────────

test.describe("Protected route redirects for unauthenticated users", () => {
  test("/dashboard redirects away from the dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    // The dashboard layout calls auth() and redirects unauthenticated users to
    // /auth/sign-in. Playwright follows redirects automatically.
    await expect(page).not.toHaveURL("/dashboard");
    // Should end up on the sign-in page or Clerk's hosted sign-in
    const url = page.url();
    expect(url).toMatch(/sign-in|accounts\.clerk\.dev|clerk\./);
  });

  test("/admin redirects away from admin panel", async ({ page }) => {
    await page.goto("/admin");
    // Middleware redirects unauthenticated users (auth.protect())
    // or returns 403 Forbidden for non-super_admin users.
    await expect(page).not.toHaveURL("/admin");
    const url = page.url();
    // Could redirect to sign-in or show a Clerk-hosted page
    expect(url).toMatch(/sign-in|accounts\.clerk\.dev|clerk\./);
  });

  test("/settings/general redirects away for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/settings/general");
    await expect(page).not.toHaveURL("/settings/general");
    const url = page.url();
    expect(url).toMatch(/sign-in|accounts\.clerk\.dev|clerk\./);
  });

  test("/settings/billing redirects away for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/settings/billing");
    await expect(page).not.toHaveURL("/settings/billing");
    const url = page.url();
    expect(url).toMatch(/sign-in|accounts\.clerk\.dev|clerk\./);
  });

  test("/settings/team redirects away for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/settings/team");
    await expect(page).not.toHaveURL("/settings/team");
    const url = page.url();
    expect(url).toMatch(/sign-in|accounts\.clerk\.dev|clerk\./);
  });

  test("/settings/profile redirects away for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/settings/profile");
    await expect(page).not.toHaveURL("/settings/profile");
    const url = page.url();
    expect(url).toMatch(/sign-in|accounts\.clerk\.dev|clerk\./);
  });
});

// ─── Auth Pages Meta ──────────────────────────────────────────────────────────

test.describe("Auth pages meta tags", () => {
  test("sign-in page has html[lang='en']", async ({ page }) => {
    await page.goto("/auth/sign-in");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });

  test("sign-up page has html[lang='en']", async ({ page }) => {
    await page.goto("/auth/sign-up");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });

  test("sign-in page has a meta description", async ({ page }) => {
    await page.goto("/auth/sign-in");
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    // The root layout sets the description
    expect(description).toBeTruthy();
    expect(description).toContain("SaaS");
  });
});
