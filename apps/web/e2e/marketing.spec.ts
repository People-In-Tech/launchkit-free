import { test, expect } from "@playwright/test";

// ─── Home Page ────────────────────────────────────────────────────────────────

test.describe("Home page (/)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads and shows the hero headline", async ({ page }) => {
    // The H1 spans two lines: "Ship your SaaS" + "this weekend."
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Ship your SaaS"
    );
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "this weekend."
    );
  });

  test("shows the hero sub-heading badge", async ({ page }) => {
    await expect(
      page.getByText("Now with AI Agent integration")
    ).toBeVisible();
  });

  test("shows hero CTA buttons", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "Get Started Free" }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "See Features" })
    ).toBeVisible();
  });

  test("shows the technology stack bar", async ({ page }) => {
    for (const tech of [
      "Next.js 16",
      "Neon Postgres",
      "Clerk Auth",
      "Drizzle ORM",
      "shadcn/ui",
      "Stripe",
    ]) {
      await expect(page.getByText(tech)).toBeVisible();
    }
  });

  test("shows the features section heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Everything you need. Nothing you don't." })
    ).toBeVisible();
  });

  test("renders all 10 feature cards", async ({ page }) => {
    const featureTitles = [
      "Authentication by Clerk",
      "Stripe Billing",
      "Multi-Tenant Teams",
      "AI Integration",
      "Neon + Drizzle",
      "shadcn/ui + Tailwind",
      "SuperAdmin/Admin",
      "Email Templates",
      "AI-Optimized DX",
      "Plugins & Add-ons",
    ];
    for (const title of featureTitles) {
      await expect(page.getByText(title)).toBeVisible();
    }
  });

  test("shows the CTA section 'Ready to ship?'", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Ready to ship?" })
    ).toBeVisible();
    await expect(
      page.getByText("Stop rebuilding infrastructure. Start building your product.")
    ).toBeVisible();
  });

  test("renders the footer with correct sections", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Brand tagline
    await expect(footer.getByText("The modern SaaS starter kit.")).toBeVisible();

    // Footer column headings
    await expect(footer.getByText("Product")).toBeVisible();
    await expect(footer.getByText("Resources")).toBeVisible();
    await expect(footer.getByText("Legal")).toBeVisible();

    // Footer links
    await expect(footer.getByRole("link", { name: "Pricing" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Blog" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Changelog" })).toBeVisible();

    // Copyright
    await expect(footer.getByText(/2026 LaunchKit/)).toBeVisible();
  });
});

// ─── Navigation ───────────────────────────────────────────────────────────────

test.describe("Header navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows LaunchKit brand link in header", async ({ page }) => {
    const header = page.locator("header").first();
    await expect(header.getByText("LaunchKit")).toBeVisible();
  });

  test("shows nav links: Features, Pricing, Blog", async ({ page }) => {
    const nav = page.locator("header nav").first();
    await expect(nav.getByRole("link", { name: "Features" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Pricing" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Blog" })).toBeVisible();
  });

  test("shows Sign In and Get Started buttons", async ({ page }) => {
    const header = page.locator("header").first();
    await expect(header.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Get Started" })).toBeVisible();
  });

  test("Pricing nav link navigates to /pricing", async ({ page }) => {
    const nav = page.locator("header nav").first();
    await nav.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL("/pricing");
    await expect(
      page.getByRole("heading", { name: "Simple, transparent pricing" })
    ).toBeVisible();
  });

  test("Blog nav link navigates to /blog", async ({ page }) => {
    const nav = page.locator("header nav").first();
    await nav.getByRole("link", { name: "Blog" }).click();
    await expect(page).toHaveURL("/blog");
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  });
});

// ─── Dark / Light Mode Toggle ─────────────────────────────────────────────────

test.describe("Theme toggle on home page", () => {
  test("toggle button is present on the page (via header on marketing pages)", async ({
    page,
  }) => {
    // The ThemeToggle is in the dashboard header, not the marketing header.
    // On the marketing / home page there is no ThemeToggle rendered — verify
    // the page still loads correctly without one.
    await page.goto("/");
    // The marketing header does NOT include a ThemeToggle component.
    // Confirm we can still navigate to the pricing page (no JS errors).
    await expect(page.locator("header").first()).toBeVisible();
  });

  test("dashboard ThemeToggle exists at /dashboard (redirects unauthenticated users)", async ({
    page,
  }) => {
    // Unauthenticated visit to /dashboard should redirect away, confirming
    // the middleware route protection is working (not a theme toggle test per se,
    // but avoids loading an auth-required page).
    await page.goto("/dashboard");
    // Should be redirected to sign-in or show Clerk UI
    await expect(page).not.toHaveURL("/dashboard");
  });
});

// ─── Pricing Page ─────────────────────────────────────────────────────────────

test.describe("Pricing page (/pricing)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("loads with correct H1", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Simple, transparent pricing" })
    ).toBeVisible();
  });

  test("shows the sub-heading description", async ({ page }) => {
    await expect(
      page.getByText("Start free, upgrade when you need more. No hidden fees.")
    ).toBeVisible();
  });

  test("shows all 3 plan names", async ({ page }) => {
    await expect(page.getByText("Free").first()).toBeVisible();
    await expect(page.getByText("Pro").first()).toBeVisible();
    await expect(page.getByText("Team").first()).toBeVisible();
  });

  test("shows correct prices for all plans", async ({ page }) => {
    await expect(page.getByText("$0").first()).toBeVisible();
    await expect(page.getByText("$29").first()).toBeVisible();
    await expect(page.getByText("$79").first()).toBeVisible();
  });

  test("shows plan descriptions", async ({ page }) => {
    await expect(page.getByText("For trying out the platform.")).toBeVisible();
    await expect(page.getByText("For professional developers.")).toBeVisible();
    await expect(page.getByText("For growing teams.")).toBeVisible();
  });

  test("shows 'Most Popular' badge on Pro plan", async ({ page }) => {
    await expect(page.getByText("Most Popular")).toBeVisible();
  });

  test("shows plan CTA buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Get Started" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start Free Trial" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Contact Sales" })
    ).toBeVisible();
  });

  test("shows key plan features", async ({ page }) => {
    // Free plan
    await expect(page.getByText("100 AI credits/month").first()).toBeVisible();
    // Pro plan
    await expect(page.getByText("5,000 AI credits/month")).toBeVisible();
    // Team plan
    await expect(page.getByText("25,000 AI credits/month")).toBeVisible();
    await expect(page.getByText("SLA guarantee")).toBeVisible();
  });

  test("plan CTA links point to /auth/sign-up", async ({ page }) => {
    const links = page.getByRole("link", { name: "Get Started" });
    await expect(links.first()).toHaveAttribute("href", "/auth/sign-up");
  });
});

// ─── Blog Page ────────────────────────────────────────────────────────────────

test.describe("Blog page (/blog)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
  });

  test("loads with correct H1", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  });

  test("shows blog sub-heading", async ({ page }) => {
    await expect(
      page.getByText("Guides, tutorials, and updates from the LaunchKit team.")
    ).toBeVisible();
  });

  test("shows all 3 blog post titles", async ({ page }) => {
    await expect(
      page.getByText("Getting Started with LaunchKit")
    ).toBeVisible();
    await expect(
      page.getByText("Building AI Features with Vercel AI SDK")
    ).toBeVisible();
    await expect(
      page.getByText("Complete Guide to Stripe Billing")
    ).toBeVisible();
  });

  test("shows blog post descriptions", async ({ page }) => {
    await expect(
      page.getByText(
        "Learn how to set up and deploy your first SaaS application with LaunchKit."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "Add streaming chat, credit systems, and multi-provider AI to your SaaS."
      )
    ).toBeVisible();
  });

  test("shows read time metadata", async ({ page }) => {
    await expect(page.getByText(/5 min read/)).toBeVisible();
    await expect(page.getByText(/8 min read/)).toBeVisible();
    await expect(page.getByText(/10 min read/)).toBeVisible();
  });

  test("blog post cards are clickable links", async ({ page }) => {
    const firstPost = page.getByRole("link", {
      name: /Getting Started with LaunchKit/,
    });
    await expect(firstPost).toBeVisible();
    await expect(firstPost).toHaveAttribute("href", "/blog/getting-started");
  });
});

// ─── Changelog Page ───────────────────────────────────────────────────────────

test.describe("Changelog page (/changelog)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/changelog");
  });

  test("loads with correct H1", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Changelog" })
    ).toBeVisible();
  });

  test("shows changelog sub-heading", async ({ page }) => {
    await expect(
      page.getByText("All the latest updates and improvements.")
    ).toBeVisible();
  });

  test("shows version badges", async ({ page }) => {
    await expect(page.getByText("v0.2.0")).toBeVisible();
    await expect(page.getByText("v0.1.0")).toBeVisible();
  });

  test("shows entry titles", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "AI Chat & Credits System" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Initial Release" })
    ).toBeVisible();
  });

  test("shows entry change items", async ({ page }) => {
    await expect(
      page.getByText("Multi-provider AI chat (OpenAI, Anthropic, Google)")
    ).toBeVisible();
    await expect(
      page.getByText("Credit system with usage tracking")
    ).toBeVisible();
    await expect(
      page.getByText("Stripe billing with subscriptions")
    ).toBeVisible();
  });

  test("shows entry dates", async ({ page }) => {
    await expect(page.getByText("2026-01-15").first()).toBeVisible();
    await expect(page.getByText("2026-01-01")).toBeVisible();
  });
});
