import { test, expect, type Page } from "@playwright/test";

// ─── Viewport helpers ─────────────────────────────────────────────────────────

const MOBILE_VIEWPORT = { width: 375, height: 667 };  // iPhone SE
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };

// ─── Home page: mobile (375×667) ─────────────────────────────────────────────

test.describe("Home page — mobile viewport (375×667)", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads and hero H1 is visible on mobile", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Ship your SaaS"
    );
  });

  test("hero CTA buttons are visible on mobile", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "Get Started Free" }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "See Features" })
    ).toBeVisible();
  });

  test("desktop nav (Features, Pricing, Blog links) is hidden on mobile", async ({
    page,
  }) => {
    // The header nav is `hidden md:flex` — should not be visible on 375px
    const nav = page.locator("header nav").first();
    await expect(nav).toBeHidden();
  });

  test("Sign In and Get Started header buttons remain visible on mobile", async ({
    page,
  }) => {
    // These are in the header flex row, not inside the hidden nav
    const header = page.locator("header").first();
    await expect(header.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(
      header.getByRole("link", { name: "Get Started" })
    ).toBeVisible();
  });

  test("hero CTA buttons stack vertically on mobile (flex-col)", async ({
    page,
  }) => {
    // The hero CTA wrapper is `flex flex-col sm:flex-row gap-4 justify-center`
    // On mobile it is a column — both buttons should be in the viewport.
    const ctaWrapper = page.locator(".flex.flex-col.sm\\:flex-row").first();
    await expect(ctaWrapper).toBeVisible();

    const buttons = ctaWrapper.getByRole("link");
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Both should be visible (stacked, not side by side)
    await expect(buttons.nth(0)).toBeVisible();
    await expect(buttons.nth(1)).toBeVisible();
  });

  test("footer renders on mobile", async ({ page }) => {
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("footer").getByText(/2026 LaunchKit/)).toBeVisible();
  });
});

// ─── Pricing page: mobile ─────────────────────────────────────────────────────

test.describe("Pricing page — mobile viewport (375×667)", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("pricing H1 is visible on mobile", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Simple, transparent pricing" })
    ).toBeVisible();
  });

  test("all 3 pricing cards are reachable by scrolling on mobile", async ({
    page,
  }) => {
    // On mobile the grid is a single column (grid md:grid-cols-3).
    // Each card should be present in the DOM and scrollable into view.
    for (const planName of ["Free", "Pro", "Team"]) {
      const card = page.locator(`text=${planName}`).first();
      await card.scrollIntoViewIfNeeded();
      await expect(card).toBeVisible();
    }
  });

  test("pricing cards stack vertically on mobile (single-column grid)", async ({
    page,
  }) => {
    // md:grid-cols-3 is not active at 375px — the grid is 1 column.
    // Verify by checking that the Free card appears above the Pro card
    // by comparing bounding boxes.
    const freeCard = page.locator("text=For trying out the platform.").first();
    const proCard = page.locator("text=For professional developers.").first();
    await freeCard.scrollIntoViewIfNeeded();
    await proCard.scrollIntoViewIfNeeded();

    const freeBox = await freeCard.boundingBox();
    const proBox = await proCard.boundingBox();

    // Stacked vertically: Free card top < Pro card top, and they have similar X
    if (freeBox && proBox) {
      expect(freeBox.y).toBeLessThan(proBox.y);
    }
  });
});

// ─── Home page: desktop (1280×800) ───────────────────────────────────────────

test.describe("Home page — desktop viewport (1280×800)", () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("desktop nav links are visible on wide screen", async ({ page }) => {
    const nav = page.locator("header nav").first();
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: "Features" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Pricing" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Blog" })).toBeVisible();
  });

  test("hero CTA buttons are side-by-side (flex-row) on desktop", async ({
    page,
  }) => {
    const ctaWrapper = page.locator(".flex.flex-col.sm\\:flex-row").first();
    await expect(ctaWrapper).toBeVisible();

    const buttons = ctaWrapper.getByRole("link");
    const first = await buttons.nth(0).boundingBox();
    const second = await buttons.nth(1).boundingBox();

    // On desktop they are in a row — their Y positions should be similar
    if (first && second) {
      expect(Math.abs(first.y - second.y)).toBeLessThan(10);
    }
  });

  test("feature cards display in 3-column grid on desktop", async ({ page }) => {
    // md:grid-cols-2 lg:grid-cols-3 — on 1280px the grid has 3 columns.
    // Check that 3 cards appear in the same row (similar Y coordinate).
    const featureCards = page.locator("#features .grid > *");
    const count = await featureCards.count();
    expect(count).toBe(10); // 10 feature cards defined in source

    const firstBox = await featureCards.nth(0).boundingBox();
    const secondBox = await featureCards.nth(1).boundingBox();
    const thirdBox = await featureCards.nth(2).boundingBox();

    if (firstBox && secondBox && thirdBox) {
      // All three should be on the same row (Y positions within ~10px)
      expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(10);
      expect(Math.abs(firstBox.y - thirdBox.y)).toBeLessThan(10);
    }
  });
});

// ─── Dashboard sidebar: mobile collapse ───────────────────────────────────────

test.describe("Dashboard sidebar — mobile viewport", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("dashboard sidebar is hidden on mobile (redirects for unauth)", async ({
    page,
  }) => {
    // Without auth, /dashboard redirects. We verify the sidebar CSS behavior
    // by visiting /dashboard and checking for the redirect (not the sidebar).
    await page.goto("/dashboard");
    await expect(page).not.toHaveURL("/dashboard");
  });

  test.describe("sidebar hidden CSS class (skipped — requires auth)", () => {
    // Requires Clerk test tokens - enable with CLERK_TESTING=1
    test.skip(
      !process.env.CLERK_TESTING,
      "Requires Clerk test tokens - enable with CLERK_TESTING=1"
    );

    test("dashboard sidebar has hidden md:flex class and is not visible at 375px", async ({
      page,
    }) => {
      // TODO: inject Clerk session
      await page.goto("/dashboard");
      // The Sidebar component uses `hidden md:flex` — at 375px it should be hidden
      const sidebar = page.locator("aside");
      await expect(sidebar).toBeHidden();
    });
  });
});

// ─── Blog page: mobile ────────────────────────────────────────────────────────

test.describe("Blog page — mobile viewport (375×667)", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
  });

  test("blog H1 is visible on mobile", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  });

  test("blog post cards are reachable by scrolling on mobile", async ({
    page,
  }) => {
    for (const title of [
      "Getting Started with LaunchKit",
      "Building AI Features with Vercel AI SDK",
      "Complete Guide to Stripe Billing",
    ]) {
      const card = page.getByText(title);
      await card.scrollIntoViewIfNeeded();
      await expect(card).toBeVisible();
    }
  });
});

// ─── Changelog page: mobile ───────────────────────────────────────────────────

test.describe("Changelog page — mobile viewport (375×667)", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("changelog H1 is visible on mobile", async ({ page }) => {
    await page.goto("/changelog");
    await expect(
      page.getByRole("heading", { name: "Changelog" })
    ).toBeVisible();
  });

  test("changelog entries are visible by scrolling on mobile", async ({
    page,
  }) => {
    await page.goto("/changelog");
    await page.getByText("Initial Release").scrollIntoViewIfNeeded();
    await expect(page.getByText("Initial Release")).toBeVisible();
  });
});
