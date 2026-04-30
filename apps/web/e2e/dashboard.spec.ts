import { test, expect } from "@playwright/test";

/**
 * Dashboard tests — most require an authenticated Clerk session.
 *
 * Tests that need auth are marked with test.skip and a comment explaining
 * how to enable them. The redirect-verification tests run without auth.
 *
 * To enable skipped tests:
 *   1. Set CLERK_TESTING=1 in your environment
 *   2. Configure CLERK_TEST_USER_ID / test token in Clerk dashboard
 *   3. Use @clerk/testing to inject a session cookie before navigating
 */

// ─── Unauthenticated behaviour (runs in CI without auth) ──────────────────────

test.describe("Dashboard: unauthenticated redirect", () => {
  test("/dashboard redirects unauthenticated users to sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    // DashboardLayout calls auth() then redirect('/auth/sign-in')
    await expect(page).not.toHaveURL("/dashboard");
    const url = page.url();
    expect(url).toMatch(/sign-in|accounts\.clerk\.dev|clerk\./);
  });

  test("/dashboard/ai redirects unauthenticated users to sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard/ai");
    await expect(page).not.toHaveURL("/dashboard/ai");
    const url = page.url();
    expect(url).toMatch(/sign-in|accounts\.clerk\.dev|clerk\./);
  });
});

// ─── Authenticated: Dashboard layout ─────────────────────────────────────────

test.describe("Dashboard layout (authenticated)", () => {
  // Requires Clerk test tokens - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test.beforeEach(async ({ page }) => {
    // TODO: inject Clerk session cookie via @clerk/testing helpers
    // e.g. await clerkSetup({ page }); await clerk.signIn({ ... });
    await page.goto("/dashboard");
  });

  test("dashboard layout has a sidebar visible on desktop", async ({ page }) => {
    // Sidebar is hidden on mobile (hidden md:flex), visible on desktop
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
  });

  test("sidebar shows the LaunchKit brand link", async ({ page }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar.getByText("LaunchKit")).toBeVisible();
  });

  test("sidebar main nav has Dashboard, AI Chat, Analytics, Documents links", async ({
    page,
  }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "AI Chat" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Analytics" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Documents" })).toBeVisible();
  });

  test("sidebar settings section has General, Billing, Team, Profile links", async ({
    page,
  }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar.getByRole("link", { name: "General" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Billing" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Team" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Profile" })).toBeVisible();
  });

  test("sidebar has MAIN and SETTINGS section labels", async ({ page }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar.getByText("Main", { exact: false })).toBeVisible();
    await expect(sidebar.getByText("Settings", { exact: false })).toBeVisible();
  });

  test("dashboard header shows 'Dashboard' title and theme toggle", async ({
    page,
  }) => {
    const header = page.locator("header").first();
    await expect(header.getByText("Dashboard")).toBeVisible();
    // ThemeToggle renders a button with sr-only text "Toggle theme"
    await expect(
      header.getByRole("button", { name: "Toggle theme" })
    ).toBeVisible();
  });
});

// ─── Authenticated: Dashboard home page ───────────────────────────────────────

test.describe("Dashboard home page (/dashboard)", () => {
  // Requires Clerk test tokens - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test.beforeEach(async ({ page }) => {
    // TODO: inject Clerk session
    await page.goto("/dashboard");
  });

  test("shows the Dashboard H1", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("shows 'Welcome back' sub-heading", async ({ page }) => {
    await expect(
      page.getByText("Welcome back. Here's an overview of your workspace.")
    ).toBeVisible();
  });

  test("shows the 4 stat cards: AI Credits, Team Members, API Calls, Current Plan", async ({
    page,
  }) => {
    await expect(page.getByText("AI Credits")).toBeVisible();
    await expect(page.getByText("Team Members")).toBeVisible();
    await expect(page.getByText("API Calls")).toBeVisible();
    await expect(page.getByText("Current Plan")).toBeVisible();
  });

  test("shows the Recent Activity card", async ({ page }) => {
    await expect(page.getByText("Recent Activity")).toBeVisible();
    await expect(page.getByText("AI chat created")).toBeVisible();
    await expect(page.getByText("Team member invited")).toBeVisible();
  });

  test("shows the Quick Actions card with correct action links", async ({
    page,
  }) => {
    await expect(page.getByText("Quick Actions")).toBeVisible();
    await expect(page.getByRole("link", { name: "New AI Chat" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Invite Team" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View Analytics" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Manage Billing" })
    ).toBeVisible();
  });
});

// ─── Authenticated: AI Chat page (/dashboard/ai) ─────────────────────────────

test.describe("AI Chat page (/dashboard/ai)", () => {
  // Requires Clerk test tokens - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test.beforeEach(async ({ page }) => {
    // TODO: inject Clerk session
    await page.goto("/dashboard/ai");
  });

  test("renders the AI Chat card with title", async ({ page }) => {
    await expect(page.getByText("AI Chat")).toBeVisible();
  });

  test("shows model selector dropdown", async ({ page }) => {
    const select = page.locator("select");
    await expect(select).toBeVisible();
    // Default model is GPT-4o
    await expect(select).toHaveValue("gpt-4o");
  });

  test("shows available models in selector", async ({ page }) => {
    const options = await page.locator("select option").allTextContents();
    expect(options).toContain("GPT-4o (OpenAI)");
    expect(options).toContain("GPT-4o Mini (OpenAI)");
    expect(options).toContain("Claude 3.5 Sonnet (Anthropic)");
    expect(options).toContain("Gemini Pro (Google)");
  });

  test("shows empty state with 'Start a conversation' message", async ({
    page,
  }) => {
    await expect(page.getByText("Start a conversation")).toBeVisible();
    await expect(page.getByText(/Ask anything. Powered by/)).toBeVisible();
  });

  test("shows the message input field", async ({ page }) => {
    await expect(
      page.locator('input[placeholder="Type a message..."]')
    ).toBeVisible();
  });

  test("shows the send button (disabled when input is empty)", async ({
    page,
  }) => {
    const sendButton = page.locator('button[type="submit"]');
    await expect(sendButton).toBeDisabled();
  });

  test("send button enables when user types a message", async ({ page }) => {
    const input = page.locator('input[placeholder="Type a message..."]');
    await input.fill("Hello, AI!");
    const sendButton = page.locator('button[type="submit"]');
    await expect(sendButton).toBeEnabled();
  });
});
