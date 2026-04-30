import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../fixtures/world";

// ─── Clerk Component ─────────────────────────────────────────────────────────

Then("the Clerk auth container should be present", async function (this: ICustomWorld) {
  // Clerk renders a div with class cl-rootBox or an iframe
  await this.page.waitForTimeout(1500); // Clerk loads async
  const clerkContainer =
    this.page.locator("[data-clerk-component]").first() ||
    this.page.locator(".cl-rootBox").first() ||
    this.page.locator("div.flex.min-h-screen.items-center.justify-center").first();
  await expect(clerkContainer).toBeVisible({ timeout: 8000 });
});

// ─── Redirect checks ─────────────────────────────────────────────────────────

Then(
  "I should be redirected to the sign-up page",
  async function (this: ICustomWorld) {
    await this.page.waitForURL(/sign-up/, { timeout: 10_000 });
    expect(this.page.url()).toContain("sign-up");
  }
);

// ─── CTA clicks ──────────────────────────────────────────────────────────────

When(
  "I click the {string} CTA button",
  async function (this: ICustomWorld, label: string) {
    // The GetLaunchKitButton renders as a <button>
    const btn = this.page.getByRole("button", { name: label }).first();
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await this.page.waitForLoadState("domcontentloaded");
  }
);

When("I click the {string} button", async function (this: ICustomWorld, label: string) {
  const el =
    (await this.page.getByRole("button", { name: label }).count()) > 0
      ? this.page.getByRole("button", { name: label }).first()
      : this.page.getByRole("link", { name: label }).first();
  await el.click();
  await this.page.waitForLoadState("domcontentloaded");
});
