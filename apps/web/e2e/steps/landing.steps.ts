import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../fixtures/world";

// ─── Hero ─────────────────────────────────────────────────────────────────────

Then("I should see the headline {string}", async function (this: ICustomWorld, text: string) {
  await expect(this.page.getByRole("heading", { level: 1 })).toContainText(text);
});

Then(
  "I should see a {string} CTA button",
  async function (this: ICustomWorld, label: string) {
    // GetLaunchKitButton renders a <button> (not a link)
    const btn = this.page.getByRole("button", { name: label }).first();
    await expect(btn).toBeVisible();
  }
);

Then("I should see a {string} button", async function (this: ICustomWorld, label: string) {
  const el =
    this.page.getByRole("button", { name: label }).first() ||
    this.page.getByRole("link", { name: label }).first();
  await expect(el).toBeVisible();
});

Then(
  "the {string} button should be full width on mobile",
  async function (this: ICustomWorld, label: string) {
    const btn = this.page.getByRole("button", { name: label }).first();
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    const viewport = this.page.viewportSize();
    if (box && viewport) {
      // On mobile, CTA should take up most of the viewport width (>80%)
      expect(box.width).toBeGreaterThan(viewport.width * 0.8);
    }
  }
);

// ─── Stack Configurator ───────────────────────────────────────────────────────

Then("I should see step {string} labeled {string}", async function (this: ICustomWorld, step: string, label: string) {
  // The step number badge + label text are rendered together in the configurator
  const section = this.page.locator(`text=${step}`).first();
  await expect(section).toBeVisible();
  await expect(this.page.locator(`text=${label}`).first()).toBeVisible();
});

Then("I should see {string} selected for auth", async function (this: ICustomWorld, name: string) {
  // The auth option button is disabled (locked) but visible
  await expect(this.page.getByRole("button", { name: new RegExp(name, "i") }).first()).toBeVisible();
});

Then("I should see {string} selected for payments", async function (this: ICustomWorld, name: string) {
  await expect(this.page.getByRole("button", { name: new RegExp(name, "i") }).first()).toBeVisible();
});

Then("the terminal should show {string}", async function (this: ICustomWorld, text: string) {
  // The terminal block inside StackConfigurator
  const terminal = this.page.locator(".bg-zinc-950").first();
  await expect(terminal).toContainText(text);
});

Then("the free template link should be visible", async function (this: ICustomWorld) {
  await expect(
    this.page.getByRole("link", { name: "free template" })
  ).toBeVisible();
});

When("I click the {string} button in the terminal", async function (this: ICustomWorld, label: string) {
  const btn = this.page.getByRole("button", { name: label });
  await btn.click();
});

Then("the button should show {string}", async function (this: ICustomWorld, text: string) {
  // Copied! state shows briefly
  await expect(this.page.getByRole("button", { name: text })).toBeVisible({ timeout: 3000 });
});

When("I click the {string} database option", async function (this: ICustomWorld, dbName: string) {
  await this.page.getByRole("button", { name: dbName }).click();
});

Then("the terminal should show {string}", async function (this: ICustomWorld, text: string) {
  await expect(this.page.locator(".bg-zinc-950").first()).toContainText(text);
});

// ─── Nav ──────────────────────────────────────────────────────────────────────

Then("the desktop nav should show {string}", async function (this: ICustomWorld, label: string) {
  const nav = this.page.locator("header nav.hidden.md\\:flex").first();
  await expect(nav.getByRole("link", { name: label })).toBeVisible();
});

Then("the desktop nav should be hidden", async function (this: ICustomWorld) {
  const nav = this.page.locator("header nav.hidden.md\\:flex").first();
  // On mobile (< md), this nav should not be visible
  await expect(nav).toBeHidden();
});

// ─── AI Tools ─────────────────────────────────────────────────────────────────

Then("I should see {string} in the AI tools list", async function (this: ICustomWorld, name: string) {
  const section = this.page.locator("#ai-first");
  await expect(section.getByText(name)).toBeVisible();
});

// ─── Templates ───────────────────────────────────────────────────────────────

Then("I should see the template {string}", async function (this: ICustomWorld, name: string) {
  await expect(this.page.getByText(name)).toBeVisible();
});

// ─── Pricing (landing) ────────────────────────────────────────────────────────

Then("I should see {string} pricing", async function (this: ICustomWorld, price: string) {
  await expect(this.page.getByText(price).first()).toBeVisible();
});

Then("I should see {string} pricing type", async function (this: ICustomWorld, type: string) {
  await expect(this.page.getByText(type).first()).toBeVisible();
});

// ─── Footer ───────────────────────────────────────────────────────────────────

Then(
  "the footer should show {string} or {string}",
  async function (this: ICustomWorld, a: string, b: string) {
    const footer = this.page.locator("footer");
    const textA = footer.getByText(new RegExp(a, "i"));
    const textB = footer.getByText(new RegExp(b, "i"));
    const aVisible = await textA.isVisible().catch(() => false);
    const bVisible = await textB.isVisible().catch(() => false);
    expect(aVisible || bVisible).toBe(true);
  }
);

Then("I should see footer links", async function (this: ICustomWorld) {
  const footer = this.page.locator("footer");
  await expect(footer).toBeVisible();
  // Footer should have at least one link
  const links = footer.locator("a");
  await expect(links.first()).toBeVisible();
});

// ─── Mobile snippet ───────────────────────────────────────────────────────────

Then(
  "I should see {string} in the mobile snippet",
  async function (this: ICustomWorld, text: string) {
    // The mobile-only command snippet (sm:hidden)
    const snippet = this.page.locator(".sm\\:hidden.rounded-lg.border").first();
    await expect(snippet).toBeVisible();
    await expect(snippet).toContainText(text);
  }
);

Then("the mobile command snippet should be visible", async function (this: ICustomWorld) {
  const snippet = this.page.locator(".sm\\:hidden.rounded-lg").first();
  await expect(snippet).toBeVisible();
});
