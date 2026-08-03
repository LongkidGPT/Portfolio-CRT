import { expect, test } from "@playwright/test";

test("tracks the pointer and locks all five R4 project poses", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");

  const portrait = page.getByRole("img", {
    name: "Interactive full-frame KV portrait",
  });
  await expect(portrait).toHaveAttribute("data-loaded", "193", {
    timeout: 15_000,
  });
  await expect(portrait).toHaveAttribute("data-errors", "0");

  const pointerTargets = [
    { point: { x: 1179, y: 0 }, frame: "52" },
    { point: { x: 1919, y: 516 }, frame: "20" },
    { point: { x: 1179, y: 1079 }, frame: "144" },
    { point: { x: 0, y: 516 }, frame: "100" },
    { point: { x: 1179, y: 516 }, frame: "174" },
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

  await page.mouse.move(1179, 516);
  await expect(portrait).toHaveAttribute("data-target-frame", "174");
});

test("fills standard and wide desktop viewports without letterboxing", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");

  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1440, height: 960 },
    { width: 1470, height: 630 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const portrait = page.getByRole("img", {
      name: "Interactive full-frame KV portrait",
    });
    await expect(portrait).toHaveAttribute("data-loaded", "193", {
      timeout: 15_000,
    });
    await expect(portrait).toHaveAttribute("data-errors", "0");
    expect(await portrait.boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }
});

test("restores the neutral selector and copies contact details", async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");

  const selector = page.getByRole("navigation", { name: "Portfolio projects" });
  await expect(selector.locator("a[data-previewed]")).toHaveCount(0);

  for (const side of ["left", "right"] as const) {
    const widths = await page
      .locator(`[aria-hidden="true"][data-side="${side}"] span`)
      .evaluateAll((lines) => lines.map((line) => getComputedStyle(line).width));
    expect(new Set(widths)).toEqual(new Set(["18px"]));
  }

  const business = page.getByRole("link", { name: "Open BUSINESS" });
  await business.hover();
  await expect(business).toHaveAttribute("data-previewed", "");

  await page.mouse.move(200, 180);
  await expect(selector.locator("a[data-previewed]")).toHaveCount(0);

  for (const [name, value] of [
    ["Copy email address", "longkid@sohu.com"],
    ["Copy phone number", "18520224719"],
    ["Copy WeChat ID", "lkchat1980"],
  ] as const) {
    await page.getByRole("button", { name }).click();
    await expect(page.getByText("COPIED")).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(value);
  }
});

test("pointer navigation does not retain a project focus frame", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.goto("/");

  await page.getByRole("link", { name: "Open BUSINESS" }).click();
  await expect(page).toHaveURL(/\/work\/business$/);
  await expect(page.getByRole("dialog", { name: "Business Context" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/$/);

  const business = page.getByRole("link", { name: "Open BUSINESS" });
  await expect(business).not.toBeFocused();
  expect(
    await business.evaluate((element) => getComputedStyle(element).outlineStyle),
  ).toBe("none");
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
      name: /Interactive (?:full-frame KV|CRT) portrait/,
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
      name: /Interactive (?:full-frame KV|CRT) portrait/,
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
