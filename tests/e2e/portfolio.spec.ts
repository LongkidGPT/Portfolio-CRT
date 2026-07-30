import { expect, test } from "@playwright/test";

test("opens and closes a shareable project overlay", async ({ page }) => {
  await page.goto("/");
  if (await page.getByRole("button", { name: "Next project" }).isVisible()) {
    await page.getByRole("button", { name: "Next project" }).click();
  }
  await page.getByRole("link", { name: "Open BUSINESS" }).click();
  await page.waitForTimeout(160);
  await expect(page).toHaveURL(/\/$/);
  const portraitOpacity = await page
    .getByRole("img", { name: "Interactive CRT portrait" })
    .evaluate((element) => Number.parseFloat(getComputedStyle(element.parentElement!).opacity));
  expect(portraitOpacity).toBeGreaterThan(0);
  expect(portraitOpacity).toBeLessThan(1);

  await expect(page).toHaveURL(/\/work\/business$/);
  await expect(page.getByRole("dialog", { name: "Business Context" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(120);
  await expect(page).toHaveURL(/\/work\/business$/);
  await expect(page).toHaveURL(/\/$/);
  await page.waitForTimeout(120);
  const returnOpacity = await page
    .getByRole("img", { name: "Interactive CRT portrait" })
    .evaluate((element) => Number.parseFloat(getComputedStyle(element.parentElement!).opacity));
  expect(returnOpacity).toBeGreaterThan(0);
  expect(returnOpacity).toBeLessThan(1);
});

test("direct URL renders a standalone case page", async ({ page }) => {
  await page.goto("/work/product-launch");
  await expect(page.getByRole("heading", { name: "SOLIX Product Launch" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
