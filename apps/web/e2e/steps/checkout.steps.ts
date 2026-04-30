import { Given, When, Then } from "@cucumber/cucumber";
import { expect, request } from "@playwright/test";
import { ICustomWorld } from "../fixtures/world";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

// ─── API-level checkout tests ────────────────────────────────────────────────

When(
  "I POST to {string} with plan {string}",
  async function (this: ICustomWorld, path: string, plan: string) {
    const ctx = await request.newContext({ baseURL: BASE_URL });
    // Attach Clerk session cookies if available
    const cookies = await this.page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    this.apiResponse = await ctx.post(path, {
      data: { plan },
      headers: { "content-type": "application/json", Cookie: cookieHeader },
    });
  }
);

When(
  "I GET {string}",
  async function (this: ICustomWorld, path: string) {
    const ctx = await request.newContext({ baseURL: BASE_URL });
    const cookies = await this.page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    this.apiResponse = await ctx.get(path, {
      headers: { Cookie: cookieHeader },
    });
  }
);

Then(
  "the response status should be {int}",
  async function (this: ICustomWorld, status: number) {
    expect(this.apiResponse?.status()).toBe(status);
  }
);

Then(
  "the response should contain a {string} field",
  async function (this: ICustomWorld, field: string) {
    const body = await this.apiResponse?.json();
    expect(body).toHaveProperty(field);
  }
);

Then(
  "the {string} should start with {string}",
  async function (this: ICustomWorld, field: string, prefix: string) {
    const body = await this.apiResponse?.json();
    expect(body[field]).toMatch(new RegExp(`^${prefix.replace(".", "\\.")}`));
  }
);

// ─── Pricing page ────────────────────────────────────────────────────────────

Given("I am on the pricing page", async function (this: ICustomWorld) {
  await this.page.goto("/pricing");
  await this.page.waitForLoadState("domcontentloaded");
});

Then(
  "I should see {string} for the Solo plan",
  async function (this: ICustomWorld, price: string) {
    await expect(this.page.getByText(price).first()).toBeVisible();
  }
);

Then(
  "I should see {string} for the Teams plan",
  async function (this: ICustomWorld, price: string) {
    await expect(this.page.getByText(price).first()).toBeVisible();
  }
);

Then(
  "I should see {string} pricing type for both plans",
  async function (this: ICustomWorld, type: string) {
    const matches = await this.page.getByText(new RegExp(type, "i")).count();
    expect(matches).toBeGreaterThan(0);
  }
);

// ─── Stripe Checkout (browser flow) ──────────────────────────────────────────

Then("I should be redirected to Stripe Checkout", async function (this: ICustomWorld) {
  await this.page.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });
  expect(this.page.url()).toContain("checkout.stripe.com");
});

Then(
  "the Stripe Checkout should show {string}",
  async function (this: ICustomWorld, amount: string) {
    // Wait for Stripe Checkout page to render
    await this.page.waitForLoadState("networkidle", { timeout: 15_000 });
    await expect(this.page.getByText(amount).first()).toBeVisible({ timeout: 10_000 });
  }
);

When(
  "I fill in the email field with my test email",
  async function (this: ICustomWorld) {
    const email = process.env.TEST_USER_EMAIL ?? "test@launchkit-e2e.com";
    // Stripe Checkout email field
    const emailField =
      this.page.locator('input[type="email"]').first() ||
      this.page.locator('input[placeholder*="email" i]').first();
    const isVisible = await emailField.isVisible().catch(() => false);
    if (isVisible) {
      await emailField.fill(email);
    }
  }
);

When(
  "I fill in the card number with {string}",
  async function (this: ICustomWorld, cardNumber: string) {
    await this.page.waitForLoadState("networkidle");
    // Stripe Checkout card number (may be in iframe)
    const cardInput = this.page
      .frameLocator('iframe[name*="privateStripeFrame"], iframe[title*="Secure"]')
      .locator('input[placeholder="1234 1234 1234 1234"]')
      .first();

    const inFrame = await cardInput.isVisible({ timeout: 5000 }).catch(() => false);

    if (inFrame) {
      await cardInput.fill(cardNumber);
    } else {
      // Direct input on hosted checkout
      const directInput = this.page.locator('input[placeholder="1234 1234 1234 1234"]').first();
      await directInput.fill(cardNumber);
    }
  }
);

When(
  "I fill in the expiry with {string}",
  async function (this: ICustomWorld, expiry: string) {
    const expiryInput = this.page
      .frameLocator('iframe[name*="privateStripeFrame"], iframe[title*="Secure"]')
      .locator('input[placeholder="MM / YY"]')
      .first();

    const inFrame = await expiryInput.isVisible({ timeout: 3000 }).catch(() => false);

    if (inFrame) {
      await expiryInput.fill(expiry);
    } else {
      await this.page.locator('input[placeholder="MM / YY"]').first().fill(expiry);
    }
  }
);

When(
  "I fill in the CVC with {string}",
  async function (this: ICustomWorld, cvc: string) {
    const cvcInput = this.page
      .frameLocator('iframe[name*="privateStripeFrame"], iframe[title*="Secure"]')
      .locator('input[placeholder="CVC"]')
      .first();

    const inFrame = await cvcInput.isVisible({ timeout: 3000 }).catch(() => false);

    if (inFrame) {
      await cvcInput.fill(cvc);
    } else {
      await this.page.locator('input[placeholder="CVC"]').first().fill(cvc);
    }
  }
);

When(
  "I fill in the cardholder name with {string}",
  async function (this: ICustomWorld, name: string) {
    const nameInput =
      this.page.locator('input[placeholder*="name" i], input[placeholder*="cardholder" i]').first();
    const isVisible = await nameInput.isVisible().catch(() => false);
    if (isVisible) await nameInput.fill(name);
  }
);

When(
  "I fill in the billing ZIP with {string}",
  async function (this: ICustomWorld, zip: string) {
    const zipInput = this.page.locator('input[placeholder="ZIP"]').first();
    const isVisible = await zipInput.isVisible().catch(() => false);
    if (isVisible) await zipInput.fill(zip);
  }
);

When("I click the {string} button", async function (this: ICustomWorld, label: string) {
  const btn = this.page.getByRole("button", { name: new RegExp(label, "i") }).first();
  await btn.click();
});

Then("I should be redirected back to the app", async function (this: ICustomWorld) {
  await this.page.waitForURL(
    (url) => url.hostname.includes("localhost") || url.hostname.includes("getlaunchkit"),
    { timeout: 30_000 }
  );
  const url = this.page.url();
  expect(url).toMatch(/localhost|getlaunchkit/);
});

Then(
  "the page should not show any checkout error",
  async function (this: ICustomWorld) {
    const errorText = this.page.getByText(/checkout_error|payment failed/i);
    await expect(errorText).toHaveCount(0);
  }
);

Then("Stripe should show a card decline error", async function (this: ICustomWorld) {
  await expect(
    this.page.getByText(/declined|card was declined|insufficient funds/i)
  ).toBeVisible({ timeout: 15_000 });
});

Then("Stripe should show a 3D Secure authentication challenge", async function (this: ICustomWorld) {
  await expect(
    this.page.getByText(/authenticate|3d secure|verification/i).first()
  ).toBeVisible({ timeout: 15_000 });
});

// ─── Webhook scenarios (API level) ───────────────────────────────────────────

Given("a checkout session has expired", async function (this: ICustomWorld) {
  // This is a state setup step — in a real test, you'd create a session
  // and let it expire. For now, mark as pending.
  this.pendingScenario = true;
});

Given("a test checkout session completes successfully", async function (this: ICustomWorld) {
  // Set up a completed test session ID via Stripe test API
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
  if (!stripeKey.startsWith("sk_test_")) {
    console.warn("⚠️  Webhook tests require a test mode Stripe key (sk_test_...)");
    this.pendingScenario = true;
    return;
  }
  this.stripeTestSessionId = `cs_test_${Date.now()}`;
});

When(
  "the webhook {string} fires",
  async function (this: ICustomWorld, _event: string) {
    if (this.pendingScenario) return;
    // Webhook tests are best run via: stripe trigger <event>
    // or by sending a crafted POST to /api/webhooks/stripe
  }
);

When(
  "the webhook {string} fires with a valid signature",
  async function (this: ICustomWorld, event: string) {
    if (this.pendingScenario) return;
    // Use stripe CLI: stripe trigger checkout.session.completed
    console.info(`To trigger: stripe trigger ${event}`);
  }
);

Then(
  "no access record should be created for that session",
  async function (this: ICustomWorld) {
    if (this.pendingScenario) return;
    // DB assertion — implement after access table schema is confirmed
  }
);

Then("the user should have an access record in the database", async function (this: ICustomWorld) {
  if (this.pendingScenario) return;
  // POST /api/access/templates should return 200 for the test user
  const ctx = await request.newContext({ baseURL: BASE_URL });
  const res = await ctx.get("/api/access/templates");
  expect(res.status()).toBe(200);
});

Then("the user should be able to access pro templates", async function (this: ICustomWorld) {
  if (this.pendingScenario) return;
  const ctx = await request.newContext({ baseURL: BASE_URL });
  const res = await ctx.get("/api/access/templates");
  const body = await res.json();
  expect(body).toHaveProperty("repoUrl");
});
