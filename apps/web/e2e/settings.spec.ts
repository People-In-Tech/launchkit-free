import { test, expect } from "@playwright/test";

/**
 * Settings page tests.
 *
 * All settings routes require authentication (each page calls auth() and
 * redirects unauthenticated users to /auth/sign-in). Unauthenticated redirect
 * tests run in CI. Tests that verify actual page content are skipped until
 * Clerk test tokens are configured.
 *
 * To enable skipped tests:
 *   1. Set CLERK_TESTING=1 in your environment
 *   2. Use @clerk/testing to inject a session cookie before navigating
 */

// ─── Unauthenticated redirects (runs in CI without auth) ─────────────────────

test.describe("Settings routes: unauthenticated redirect", () => {
  const settingsRoutes = [
    "/settings/general",
    "/settings/billing",
    "/settings/team",
    "/settings/profile",
  ];

  for (const route of settingsRoutes) {
    test(`${route} redirects unauthenticated users to sign-in`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page).not.toHaveURL(route);
      const url = page.url();
      expect(url).toMatch(/sign-in|accounts\.clerk\.dev|clerk\./);
    });
  }
});

// ─── General Settings (/settings/general) ────────────────────────────────────

test.describe("Settings: General (/settings/general)", () => {
  // Requires Clerk test tokens - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test.beforeEach(async ({ page }) => {
    // TODO: inject Clerk session cookie via @clerk/testing helpers
    await page.goto("/settings/general");
  });

  test("shows the General Settings H1", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "General Settings" })
    ).toBeVisible();
  });

  test("shows the sub-heading description", async ({ page }) => {
    await expect(
      page.getByText("Manage your workspace settings.")
    ).toBeVisible();
  });

  test("shows the Workspace Name card with input", async ({ page }) => {
    await expect(page.getByText("Workspace Name")).toBeVisible();
    await expect(
      page.getByText("This is the display name for your workspace.")
    ).toBeVisible();
    await expect(
      page.locator('input[placeholder="Workspace name"]')
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Save Changes" })).toBeVisible();
  });

  test("shows the Danger Zone card with delete button", async ({ page }) => {
    await expect(page.getByText("Danger Zone")).toBeVisible();
    await expect(
      page.getByText("Irreversible and destructive actions.")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Delete Workspace" })
    ).toBeVisible();
  });
});

// ─── Billing Settings (/settings/billing) ────────────────────────────────────

test.describe("Settings: Billing (/settings/billing)", () => {
  // Requires Clerk test tokens - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test.beforeEach(async ({ page }) => {
    // TODO: inject Clerk session cookie
    await page.goto("/settings/billing");
  });

  test("shows the Billing H1", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
  });

  test("shows the subscription sub-heading", async ({ page }) => {
    await expect(
      page.getByText("Manage your subscription and payment methods.")
    ).toBeVisible();
  });

  test("shows Current Plan card with free plan details", async ({ page }) => {
    await expect(page.getByText("Current Plan")).toBeVisible();
    await expect(
      page.getByText("You are currently on the Free plan.")
    ).toBeVisible();
    await expect(page.getByText("$0")).toBeVisible();
    await expect(page.getByText("/month").first()).toBeVisible();
    await expect(page.getByText("1 project")).toBeVisible();
    await expect(page.getByText("100 AI credits/month")).toBeVisible();
    await expect(page.getByText("Community support")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Upgrade to Pro" })
    ).toBeVisible();
  });

  test("shows Payment Method card", async ({ page }) => {
    await expect(page.getByText("Payment Method")).toBeVisible();
    await expect(
      page.getByText("No payment method on file.")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Payment Method" })
    ).toBeVisible();
  });

  test("shows Billing History card", async ({ page }) => {
    await expect(page.getByText("Billing History")).toBeVisible();
    await expect(page.getByText("No invoices yet.")).toBeVisible();
  });
});

// ─── Team Settings (/settings/team) ──────────────────────────────────────────

test.describe("Settings: Team (/settings/team)", () => {
  // Requires Clerk test tokens - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test.beforeEach(async ({ page }) => {
    // TODO: inject Clerk session cookie
    await page.goto("/settings/team");
  });

  test("shows the Team Management H1", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Team Management" })
    ).toBeVisible();
  });

  test("shows the team description", async ({ page }) => {
    await expect(
      page.getByText("Invite members and manage roles.")
    ).toBeVisible();
  });

  test("renders the Clerk OrganizationProfile component", async ({ page }) => {
    // Clerk renders OrganizationProfile — when keys are available it injects
    // its own UI. We just verify the page is not blank.
    await expect(page.locator("body")).toBeVisible();
    await expect(page).toHaveURL("/settings/team");
  });
});

// ─── Profile Settings (/settings/profile) ────────────────────────────────────

test.describe("Settings: Profile (/settings/profile)", () => {
  // Requires Clerk test tokens - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test.beforeEach(async ({ page }) => {
    // TODO: inject Clerk session cookie
    await page.goto("/settings/profile");
  });

  test("shows the Profile H1", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  });

  test("shows the profile description", async ({ page }) => {
    await expect(
      page.getByText("Manage your personal profile.")
    ).toBeVisible();
  });

  test("renders the Clerk UserProfile component area", async ({ page }) => {
    // Clerk renders UserProfile — verify the page loads at the correct URL
    await expect(page).toHaveURL("/settings/profile");
    await expect(page.locator("body")).toBeVisible();
  });
});
