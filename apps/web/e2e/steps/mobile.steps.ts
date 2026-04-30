import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ICustomWorld } from "../fixtures/world";

Then("the stack configurator should be visible", async function (this: ICustomWorld) {
  await expect(
    this.page.getByText("Configure your stack").first()
  ).toBeVisible();
});

Then(
  "the terminal block should not overflow horizontally",
  async function (this: ICustomWorld) {
    const terminal = this.page.locator(".bg-zinc-950").first();
    const box = await terminal.boundingBox();
    const viewport = this.page.viewportSize();
    if (box && viewport) {
      expect(box.width).toBeLessThanOrEqual(viewport.width);
    }
  }
);

Then(
  "the command {string} should be visible",
  async function (this: ICustomWorld, text: string) {
    await expect(
      this.page.getByText(text).first()
    ).toBeVisible();
  }
);

Then("the prompts page should load", async function (this: ICustomWorld) {
  await expect(this.page.locator("body")).toBeVisible();
  await expect(this.page).not.toHaveURL(/error/);
});

Then("prompt cards should be visible", async function (this: ICustomWorld) {
  // Prompt cards are rendered by PromptLibrary
  const cards = this.page.locator("[class*='rounded-']").filter({ hasText: /prompt/i });
  await expect(cards.first()).toBeVisible({ timeout: 5000 });
});

Then(
  "at least one prompt image should be displayed",
  async function (this: ICustomWorld) {
    const images = this.page.locator("img[src*='/prompts/']");
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  }
);
