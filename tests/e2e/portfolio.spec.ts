import { expect, test } from "@playwright/test";

test("opens and closes a shareable project overlay", async ({ page }) => {
  await page.goto("/");
  if (await page.getByRole("button", { name: "Next project" }).isVisible()) {
    await page.getByRole("button", { name: "Next project" }).click();
  }
  await page.getByRole("link", { name: "Open BUSINESS" }).click();
  await expect(page).toHaveURL(/\/work\/business$/);
  await expect(page.getByRole("dialog", { name: "Business Context" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/$/);
});

test("direct URL renders a standalone case page", async ({ page }) => {
  await page.goto("/work/product-launch");
  await expect(page.getByRole("heading", { name: "SOLIX Product Launch" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
