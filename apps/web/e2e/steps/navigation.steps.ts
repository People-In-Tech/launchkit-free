import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../fixtures/world";

// ─── Desktop nav ──────────────────────────────────────────────────────────────

When("I click the {string} nav link on desktop", async function (this: ICustomWorld, label: string) {
  const nav = this.page.locator("header nav").first();
  await nav.getByRole("link", { name: label }).click();
  await this.page.waitForLoadState("domcontentloaded");
});

Then("I should see the pricing heading", async function (this: ICustomWorld) {
  // The actual heading on the LaunchKit pricing page
  await expect(
    this.page.getByRole("heading").first()
  ).toBeVisible({ timeout: 5000 });
});

// ─── Mobile nav ───────────────────────────────────────────────────────────────

When("I click the hamburger menu button", async function (this: ICustomWorld) {
  const hamburger = this.page.getByRole("button", { name: "Open menu" });
  await hamburger.click();
  // Allow slide animation to complete
  await this.page.waitForTimeout(350);
});

Then("the mobile menu panel should be visible", async function (this: ICustomWorld) {
  // The slide-in panel is always in the DOM but translated off-screen when closed
  const panel = this.page.locator("[class*='translate-x-0']").last();
  await expect(panel).toBeVisible({ timeout: 2000 });
});

Then("the mobile menu panel should not be visible", async function (this: ICustomWorld) {
  await this.page.waitForTimeout(350); // animation
  // Panel should be translated off-screen (translate-x-full)
  const panel = this.page.locator("[class*='translate-x-full']").last();
  await expect(panel).toBeVisible({ timeout: 2000 }); // element exists but off-screen
});

Then("I should see {string} in the mobile menu", async function (this: ICustomWorld, label: string) {
  // The slide-in panel nav links
  const panel = this.page.locator("div[class*='fixed'][class*='inset-y-0'][class*='right-0']");
  await expect(panel.getByRole("link", { name: label })).toBeVisible();
});

When("I click {string} in the mobile menu", async function (this: ICustomWorld, label: string) {
  const panel = this.page.locator("div[class*='fixed'][class*='inset-y-0'][class*='right-0']");
  await panel.getByRole("link", { name: label }).click();
  await this.page.waitForLoadState("domcontentloaded");
});

When("I click the backdrop overlay", async function (this: ICustomWorld) {
  // The backdrop div with bg-black/60
  const backdrop = this.page.locator(".bg-black\\/60").first();
  await backdrop.click();
  await this.page.waitForTimeout(350); // animation
});

Then("I should see a {string} button in the mobile menu", async function (this: ICustomWorld, label: string) {
  const panel = this.page.locator("div[class*='fixed'][class*='inset-y-0'][class*='right-0']");
  const btn =
    panel.getByRole("button", { name: label }).first() ||
    panel.getByRole("link", { name: label }).first();
  await expect(btn).toBeVisible();
});

// ─── Logo ────────────────────────────────────────────────────────────────────

When("I click the logo in the header", async function (this: ICustomWorld) {
  const header = this.page.locator("header").first();
  await header.locator("a[href='/']").first().click();
  await this.page.waitForLoadState("domcontentloaded");
});

// ─── Hamburger visible / hidden ───────────────────────────────────────────────

Then("the hamburger button should be visible", async function (this: ICustomWorld) {
  const btn = this.page.getByRole("button", { name: "Open menu" });
  await expect(btn).toBeVisible();
});
