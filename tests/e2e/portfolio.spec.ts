import { expect, test } from "@playwright/test";

test("tracks the pointer and locks all five R3 project poses", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.setViewportSize({ width: 1470, height: 630 });
  await page.goto("/");

  const portrait = page.getByRole("img", {
    name: "Interactive R3 full-frame portrait",
  });
  await expect(portrait).toHaveAttribute("data-loaded", "193", {
    timeout: 15_000,
  });
  await expect(portrait).toHaveAttribute("data-errors", "0");

  const pointerTargets = [
    { point: { x: 879, y: 0 }, frame: "52" },
    { point: { x: 1469, y: 266 }, frame: "20" },
    { point: { x: 879, y: 629 }, frame: "144" },
    { point: { x: 0, y: 266 }, frame: "100" },
    { point: { x: 879, y: 266 }, frame: "174" },
  ];

  for (const target of pointerTargets) {
    await page.mouse.move(target.point.x, target.point.y);
    await expect(portrait).toHaveAttribute("data-target-frame", target.frame);
  }

  const projectTargets = [
    ["ABOUT", "124"],
    ["BUSINESS", "134"],
    ["BRAND SYSTEM", "144"],
    ["PRODUCT LAUNCH", "150"],
    ["LAUNCH EVENT", "156"],
  ] as const;

  for (const [label, frame] of projectTargets) {
    await page.getByRole("link", { name: `Open ${label}` }).hover();
    await expect(portrait).toHaveAttribute("data-target-frame", frame);
  }

  await page.mouse.move(879, 266);
  await expect(portrait).toHaveAttribute("data-target-frame", "174");
});

test("opens and closes a shareable project overlay", async ({ page }) => {
  await page.goto("/");
  if (await page.getByRole("button", { name: "Next project" }).isVisible()) {
    await page.getByRole("button", { name: "Next project" }).click();
  }
  await page.getByRole("link", { name: "Open BUSINESS" }).click();
  await page.waitForTimeout(160);
  await expect(page).toHaveURL(/\/$/);
  const portraitOpacity = await page
    .getByRole("img", {
      name: /Interactive (?:R3 full-frame|CRT) portrait/,
    })
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
    .getByRole("img", {
      name: /Interactive (?:R3 full-frame|CRT) portrait/,
    })
    .evaluate((element) => Number.parseFloat(getComputedStyle(element.parentElement!).opacity));
  expect(returnOpacity).toBeGreaterThan(0);
  expect(returnOpacity).toBeLessThan(1);
});

test("direct URL renders a standalone case page", async ({ page }) => {
  await page.goto("/work/product-launch");
  await expect(page.getByRole("heading", { name: "SOLIX Product Launch" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
