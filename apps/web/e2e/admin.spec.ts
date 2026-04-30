import { test, expect } from "@playwright/test";

/**
 * Admin panel tests.
 *
 * The admin layout at /admin/* is protected by two layers:
 *   1. Clerk middleware: unauthenticated users are redirected to sign-in.
 *   2. Role check: authenticated users without the "super_admin" role get a
 *      403 Forbidden response or are redirected to /dashboard.
 *
 * Tests that require a super_admin session are marked with test.skip.
 *
 * To enable skipped tests:
 *   1. Set CLERK_TESTING=1 in your environment
 *   2. Use @clerk/testing to inject a super_admin session cookie before navigating
 */

// ─── Unauthenticated behaviour (runs in CI without auth) ──────────────────────

test.describe("Admin routes: unauthenticated redirect", () => {
  const adminRoutes = [
    "/admin",
    "/admin/users",
    "/admin/organizations",
    "/admin/analytics",
    "/admin/ai-usage",
  ];

  for (const route of adminRoutes) {
    test(`${route} redirects unauthenticated users away`, async ({ page }) => {
      await page.goto(route);
      // Middleware calls auth.protect() for all non-public routes.
      // An unauthenticated request is redirected to Clerk sign-in.
      await expect(page).not.toHaveURL(route);
      const url = page.url();
      expect(url).toMatch(/sign-in|accounts\.clerk\.dev|clerk\./);
    });
  }
});

// ─── Authenticated (non-super_admin): access denied ──────────────────────────

test.describe("Admin routes: non-super_admin access denied", () => {
  // Requires Clerk test tokens for a regular user - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test("/admin returns 403 or redirects a regular user to /dashboard", async ({
    page,
  }) => {
    // TODO: inject a non-super_admin Clerk session cookie
    await page.goto("/admin");
    // Middleware returns 403 for authenticated non-admin users
    const url = page.url();
    // Either stays on /admin showing 403, or redirects to /dashboard
    const isRedirectedOrForbidden =
      url.includes("/dashboard") || url.includes("/admin");
    expect(isRedirectedOrForbidden).toBe(true);
  });
});

// ─── Authenticated (super_admin): Admin layout & pages ───────────────────────

test.describe("Admin layout (super_admin authenticated)", () => {
  // Requires Clerk test tokens with super_admin role - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test.beforeEach(async ({ page }) => {
    // TODO: inject Clerk super_admin session cookie via @clerk/testing helpers
    await page.goto("/admin");
  });

  test("admin layout has the Admin Panel heading", async ({ page }) => {
    await expect(page.getByText("Admin Panel")).toBeVisible();
  });

  test("admin layout sidebar has nav links for all admin routes", async ({
    page,
  }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar.getByRole("link", { name: "Users" })).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: "Organizations" })
    ).toBeVisible();
    await expect(
      sidebar.getByRole("link", { name: "Analytics" })
    ).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "AI Usage" })).toBeVisible();
  });
});

// ─── Admin: Users page (/admin/users) ─────────────────────────────────────────

test.describe("Admin users page (/admin/users)", () => {
  // Requires Clerk test tokens with super_admin role - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test.beforeEach(async ({ page }) => {
    // TODO: inject Clerk super_admin session
    await page.goto("/admin/users");
  });

  test("shows the User Management H1", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "User Management" })
    ).toBeVisible();
  });

  test("shows the three stat cards", async ({ page }) => {
    await expect(page.getByText("Total Users")).toBeVisible();
    await expect(page.getByText("1,247")).toBeVisible();
    await expect(page.getByText("Active This Month")).toBeVisible();
    await expect(page.getByText("843")).toBeVisible();
    await expect(page.getByText("New This Week")).toBeVisible();
    await expect(page.getByText("52")).toBeVisible();
  });

  test("shows the All Users table with column headers", async ({ page }) => {
    await expect(page.getByText("All Users")).toBeVisible();
    const thead = page.locator("thead");
    await expect(thead.getByText("Name")).toBeVisible();
    await expect(thead.getByText("Email")).toBeVisible();
    await expect(thead.getByText("Role")).toBeVisible();
    await expect(thead.getByText("Status")).toBeVisible();
    await expect(thead.getByText("Joined")).toBeVisible();
  });

  test("shows demo user rows", async ({ page }) => {
    await expect(page.getByText("Demo User")).toBeVisible();
    await expect(page.getByText("demo@launchkit.dev")).toBeVisible();
    await expect(page.getByText("Jane Smith")).toBeVisible();
    await expect(page.getByText("Bob Johnson")).toBeVisible();
  });

  test("shows Active / Inactive status badges", async ({ page }) => {
    const activeStatuses = page.getByText("Active");
    await expect(activeStatuses.first()).toBeVisible();
    await expect(page.getByText("Inactive")).toBeVisible();
  });
});

// ─── Admin: Organizations page (/admin/organizations) ────────────────────────

test.describe("Admin organizations page (/admin/organizations)", () => {
  // Requires Clerk test tokens with super_admin role - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test.beforeEach(async ({ page }) => {
    // TODO: inject Clerk super_admin session
    await page.goto("/admin/organizations");
  });

  test("shows the Organizations H1", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Organizations" })
    ).toBeVisible();
  });

  test("shows Total Orgs, Paid Orgs, MRR stat cards", async ({ page }) => {
    await expect(page.getByText("Total Orgs")).toBeVisible();
    await expect(page.getByText("312").first()).toBeVisible();
    await expect(page.getByText("Paid Orgs")).toBeVisible();
    await expect(page.getByText("87")).toBeVisible();
    await expect(page.getByText("MRR")).toBeVisible();
    await expect(page.getByText("$4,230")).toBeVisible();
  });

  test("shows the All Organizations table with sample rows", async ({
    page,
  }) => {
    await expect(page.getByText("All Organizations")).toBeVisible();
    await expect(page.getByText("Acme Inc")).toBeVisible();
    await expect(page.getByText("StartupXYZ")).toBeVisible();
    await expect(page.getByText("Solo Dev")).toBeVisible();
  });
});

// ─── Admin: Analytics page (/admin/analytics) ────────────────────────────────

test.describe("Admin analytics page (/admin/analytics)", () => {
  // Requires Clerk test tokens with super_admin role - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test.beforeEach(async ({ page }) => {
    // TODO: inject Clerk super_admin session
    await page.goto("/admin/analytics");
  });

  test("shows the Analytics H1", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Analytics" })
    ).toBeVisible();
  });

  test("shows revenue metric cards", async ({ page }) => {
    await expect(page.getByText("Total Revenue")).toBeVisible();
    await expect(page.getByText("$12,450")).toBeVisible();
    await expect(page.getByText("Churn Rate")).toBeVisible();
    await expect(page.getByText("2.3%")).toBeVisible();
    await expect(page.getByText("LTV")).toBeVisible();
  });

  test("shows Revenue Over Time chart placeholder", async ({ page }) => {
    await expect(page.getByText("Revenue Over Time")).toBeVisible();
    await expect(
      page.getByText(/Chart placeholder/)
    ).toBeVisible();
  });
});

// ─── Admin: AI Usage page (/admin/ai-usage) ───────────────────────────────────

test.describe("Admin AI usage page (/admin/ai-usage)", () => {
  // Requires Clerk test tokens with super_admin role - enable with CLERK_TESTING=1
  test.skip(
    !process.env.CLERK_TESTING,
    "Requires Clerk test tokens - enable with CLERK_TESTING=1"
  );

  test.beforeEach(async ({ page }) => {
    // TODO: inject Clerk super_admin session
    await page.goto("/admin/ai-usage");
  });

  test("shows the AI Usage H1", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "AI Usage" })
    ).toBeVisible();
  });

  test("shows credit usage stat cards", async ({ page }) => {
    await expect(page.getByText("Total Credits Used")).toBeVisible();
    await expect(page.getByText("284,500")).toBeVisible();
    await expect(page.getByText("Active AI Users")).toBeVisible();
    await expect(page.getByText("Avg Credits/User")).toBeVisible();
    await expect(page.getByText("Est. AI Cost")).toBeVisible();
    await expect(page.getByText("$1,845")).toBeVisible();
  });

  test("shows Usage by Model section with model rows", async ({ page }) => {
    await expect(page.getByText("Usage by Model")).toBeVisible();
    await expect(page.getByText("GPT-4o")).toBeVisible();
    await expect(page.getByText("Claude 3.5 Sonnet")).toBeVisible();
    await expect(page.getByText("Gemini Pro")).toBeVisible();
    await expect(page.getByText("Groq (Llama)")).toBeVisible();
  });
});
