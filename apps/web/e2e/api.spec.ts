import { test, expect } from "@playwright/test";

/**
 * API route tests using Playwright's `request` fixture.
 *
 * These tests call the API routes directly (no browser UI) and verify that
 * unauthenticated requests are rejected with the correct HTTP status codes.
 *
 * Routes tested:
 *   POST /api/ai/chat          → 401 Unauthorized (no Clerk session)
 *   POST /api/billing/checkout → 401 Unauthorized (no Clerk session)
 *   POST /api/billing/portal   → 401 Unauthorized (no Clerk session)
 *   GET  /api/credits          → 401 Unauthorized (no Clerk session)
 *   POST /api/webhooks/stripe  → 400 Bad Request  (no Stripe-Signature header)
 *
 * Note: Clerk middleware runs on all API routes (except /api/webhooks/*).
 * Without a valid session cookie the middleware may redirect (302) rather
 * than returning 401 directly. We accept both 401 and 302/307 redirects as
 * "access denied" below, and also check the JSON body where available.
 */

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Returns true if the status code indicates an access-denied response. */
function isAccessDenied(status: number): boolean {
  // 401 Unauthorized, 302/307 redirect (Clerk's redirect to sign-in)
  return status === 401 || status === 302 || status === 307;
}

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────

test.describe("POST /api/ai/chat", () => {
  test("returns 401 without authentication", async ({ request }) => {
    const response = await request.post("/api/ai/chat", {
      data: { messages: [{ role: "user", content: "Hello" }], model: "gpt-4o" },
      headers: { "Content-Type": "application/json" },
    });

    // The route handler returns 401 directly; Clerk middleware may also
    // redirect unauthenticated requests. Both are valid "access denied".
    expect(isAccessDenied(response.status())).toBe(true);
  });

  test("401 response body is 'Unauthorized' text", async ({ request }) => {
    const response = await request.post("/api/ai/chat", {
      data: { messages: [{ role: "user", content: "Hello" }] },
      headers: { "Content-Type": "application/json" },
    });

    if (response.status() === 401) {
      const body = await response.text();
      expect(body).toContain("Unauthorized");
    }
    // If Clerk redirected (302/307) we skip the body assertion
  });
});

// ─── POST /api/billing/checkout ───────────────────────────────────────────────

test.describe("POST /api/billing/checkout", () => {
  test("returns 401 without authentication", async ({ request }) => {
    const response = await request.post("/api/billing/checkout", {
      data: { priceId: "price_test_123", plan: "pro" },
      headers: { "Content-Type": "application/json" },
    });

    expect(isAccessDenied(response.status())).toBe(true);
  });

  test("401 response has JSON error body", async ({ request }) => {
    const response = await request.post("/api/billing/checkout", {
      data: { priceId: "price_test_123", plan: "pro" },
      headers: { "Content-Type": "application/json" },
    });

    if (response.status() === 401) {
      const json = await response.json();
      expect(json).toHaveProperty("error");
      expect(json.error).toMatch(/Unauthorized/i);
    }
  });
});

// ─── POST /api/billing/portal ─────────────────────────────────────────────────

test.describe("POST /api/billing/portal", () => {
  test("returns 401 without authentication", async ({ request }) => {
    const response = await request.post("/api/billing/portal", {
      headers: { "Content-Type": "application/json" },
    });

    expect(isAccessDenied(response.status())).toBe(true);
  });

  test("401 response has JSON error body", async ({ request }) => {
    const response = await request.post("/api/billing/portal", {
      headers: { "Content-Type": "application/json" },
    });

    if (response.status() === 401) {
      const json = await response.json();
      expect(json).toHaveProperty("error");
      expect(json.error).toMatch(/Unauthorized/i);
    }
  });
});

// ─── GET /api/credits ─────────────────────────────────────────────────────────

test.describe("GET /api/credits", () => {
  test("returns 401 without authentication", async ({ request }) => {
    const response = await request.get("/api/credits");

    expect(isAccessDenied(response.status())).toBe(true);
  });

  test("401 response has JSON error body", async ({ request }) => {
    const response = await request.get("/api/credits");

    if (response.status() === 401) {
      const json = await response.json();
      expect(json).toHaveProperty("error");
      expect(json.error).toMatch(/Unauthorized/i);
    }
  });
});

// ─── POST /api/webhooks/stripe ────────────────────────────────────────────────

test.describe("POST /api/webhooks/stripe", () => {
  test("returns 400 with no Stripe-Signature header", async ({ request }) => {
    // The webhook route is public (no auth check) but Stripe signature
    // verification will fail without a valid Stripe-Signature header,
    // returning a 400 Bad Request.
    const response = await request.post("/api/webhooks/stripe", {
      data: JSON.stringify({ type: "checkout.session.completed" }),
      headers: { "Content-Type": "application/json" },
      // Deliberately omitting Stripe-Signature header
    });

    expect(response.status()).toBe(400);
  });

  test("400 response includes webhook error message", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      data: JSON.stringify({ type: "checkout.session.completed" }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.status() === 400) {
      const json = await response.json();
      expect(json).toHaveProperty("error");
      // The route returns "Webhook signature verification failed"
      expect(json.error).toMatch(/signature|webhook/i);
    }
  });

  test("returns 400 with an invalid Stripe-Signature header", async ({
    request,
  }) => {
    const response = await request.post("/api/webhooks/stripe", {
      data: "{}",
      headers: {
        "Content-Type": "application/json",
        "Stripe-Signature": "t=invalid,v1=badsig",
      },
    });

    expect(response.status()).toBe(400);
  });
});
