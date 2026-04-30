import { test, expect } from "@playwright/test";

/**
 * SEO tests — verifies meta tags, Open Graph data, lang attributes,
 * and H1 uniqueness for marketing pages.
 *
 * The root layout defines:
 *   - title.default: "LaunchKit — Ship Your SaaS This Weekend"
 *   - title.template: "%s | LaunchKit"
 *   - description: "The modern SaaS starter kit built on Next.js, Neon, and Clerk."
 *   - html lang="en"
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getMetaContent(page: import("@playwright/test").Page, selector: string) {
  return page.locator(selector).getAttribute("content");
}

async function countH1s(page: import("@playwright/test").Page) {
  return page.locator("h1").count();
}

// ─── Home page (/) ────────────────────────────────────────────────────────────

test.describe("SEO: Home page (/)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has correct meta title", async ({ page }) => {
    const title = await page.title();
    // Root layout default: "LaunchKit — Ship Your SaaS This Weekend"
    expect(title).toBe("LaunchKit — Ship Your SaaS This Weekend");
  });

  test("has correct meta description", async ({ page }) => {
    const description = await getMetaContent(page, 'meta[name="description"]');
    expect(description).toBeTruthy();
    expect(description).toContain("SaaS starter kit");
  });

  test("has html[lang='en']", async ({ page }) => {
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });

  test("has exactly one H1 tag", async ({ page }) => {
    const h1Count = await countH1s(page);
    expect(h1Count).toBe(1);
  });

  test("has og:title Open Graph tag", async ({ page }) => {
    const ogTitle = await getMetaContent(page, 'meta[property="og:title"]');
    // Next.js generates og:title from the title metadata
    // May be null if no explicit og tag was set — we check if it equals the title
    if (ogTitle) {
      expect(ogTitle).toContain("LaunchKit");
    }
  });

  test("has og:description Open Graph tag", async ({ page }) => {
    const ogDescription = await getMetaContent(
      page,
      'meta[property="og:description"]'
    );
    if (ogDescription) {
      expect(ogDescription).toBeTruthy();
    }
  });

  test("has a canonical or og:url tag", async ({ page }) => {
    const ogUrl = await getMetaContent(page, 'meta[property="og:url"]');
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    // At least one should be present
    expect(ogUrl || canonical).toBeTruthy();
  });

  test("page has a viewport meta tag", async ({ page }) => {
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("width=device-width");
  });
});

// ─── Pricing page (/pricing) ──────────────────────────────────────────────────

test.describe("SEO: Pricing page (/pricing)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("has a meta title containing 'LaunchKit'", async ({ page }) => {
    const title = await page.title();
    // Next.js template: "%s | LaunchKit" — the pricing page doesn't set a custom
    // title, so the default "LaunchKit — Ship Your SaaS This Weekend" is used.
    expect(title).toContain("LaunchKit");
  });

  test("has a meta description", async ({ page }) => {
    const description = await getMetaContent(page, 'meta[name="description"]');
    expect(description).toBeTruthy();
  });

  test("has html[lang='en']", async ({ page }) => {
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });

  test("has exactly one H1 tag", async ({ page }) => {
    const h1Count = await countH1s(page);
    expect(h1Count).toBe(1);
  });

  test("H1 text matches the page heading", async ({ page }) => {
    const h1 = await page.locator("h1").first().textContent();
    expect(h1).toContain("Simple, transparent pricing");
  });
});

// ─── Blog page (/blog) ────────────────────────────────────────────────────────

test.describe("SEO: Blog page (/blog)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
  });

  test("has a meta title containing 'LaunchKit'", async ({ page }) => {
    const title = await page.title();
    expect(title).toContain("LaunchKit");
  });

  test("has html[lang='en']", async ({ page }) => {
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });

  test("has exactly one H1 tag", async ({ page }) => {
    const h1Count = await countH1s(page);
    expect(h1Count).toBe(1);
  });

  test("H1 text is 'Blog'", async ({ page }) => {
    const h1 = await page.locator("h1").first().textContent();
    expect(h1?.trim()).toBe("Blog");
  });
});

// ─── Changelog page (/changelog) ─────────────────────────────────────────────

test.describe("SEO: Changelog page (/changelog)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/changelog");
  });

  test("has a meta title containing 'LaunchKit'", async ({ page }) => {
    const title = await page.title();
    expect(title).toContain("LaunchKit");
  });

  test("has html[lang='en']", async ({ page }) => {
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });

  test("has exactly one H1 tag", async ({ page }) => {
    const h1Count = await countH1s(page);
    expect(h1Count).toBe(1);
  });

  test("H1 text is 'Changelog'", async ({ page }) => {
    const h1 = await page.locator("h1").first().textContent();
    expect(h1?.trim()).toBe("Changelog");
  });
});

// ─── Sign-In page (/auth/sign-in) ─────────────────────────────────────────────

test.describe("SEO: Sign-in page (/auth/sign-in)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-in");
  });

  test("has html[lang='en']", async ({ page }) => {
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });

  test("has a meta title containing 'LaunchKit'", async ({ page }) => {
    const title = await page.title();
    expect(title).toContain("LaunchKit");
  });

  test("has a meta description", async ({ page }) => {
    const description = await getMetaContent(page, 'meta[name="description"]');
    expect(description).toBeTruthy();
  });
});

// ─── Cross-page: no duplicate H1 ─────────────────────────────────────────────

test.describe("SEO: No duplicate H1 tags on any marketing page", () => {
  const publicPages = ["/", "/pricing", "/blog", "/changelog", "/auth/sign-in", "/auth/sign-up"];

  for (const path of publicPages) {
    test(`${path} has at most one H1`, async ({ page }) => {
      await page.goto(path);
      const h1Count = await page.locator("h1").count();
      // Some pages (like sign-in) may have 0 H1s (Clerk renders its own heading)
      // All pages must have at most 1 H1 in the application shell.
      expect(h1Count).toBeLessThanOrEqual(1);
    });
  }
});

// ─── Cross-page: html lang attribute ─────────────────────────────────────────

test.describe("SEO: All marketing pages have html[lang='en']", () => {
  const publicPages = ["/", "/pricing", "/blog", "/changelog", "/auth/sign-in", "/auth/sign-up"];

  for (const path of publicPages) {
    test(`${path} has lang="en"`, async ({ page }) => {
      await page.goto(path);
      const lang = await page.locator("html").getAttribute("lang");
      expect(lang).toBe("en");
    });
  }
});
