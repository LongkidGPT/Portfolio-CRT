import { expect, test } from "@playwright/test";

test("tracks the pointer and locks all five R5 project poses", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");

  const portrait = page.getByRole("img", {
    name: "Interactive full-frame KV portrait",
  });
  await expect.poll(async () => Number(await portrait.getAttribute("data-loaded")), {
    timeout: 15_000,
  }).toBeGreaterThanOrEqual(6);
  await expect(portrait).toHaveAttribute("data-errors", "0");

  const pointerTargets = [
    { point: { x: 1179, y: 0 }, frame: "73" },
    { point: { x: 1919, y: 516 }, frame: "59" },
    { point: { x: 1179, y: 1079 }, frame: "140" },
    { point: { x: 0, y: 516 }, frame: "105" },
    { point: { x: 1179, y: 516 }, frame: "80" },
  ];

  for (const target of pointerTargets) {
    await page.mouse.move(target.point.x, target.point.y);
    await expect(portrait).toHaveAttribute("data-target-frame", target.frame);
  }

  const projectTargets = [
    ["ABOUT", "118"],
    ["DESIGN LOGIC", "128"],
    ["BRAND SYSTEM", "140"],
    ["PRODUCT LAUNCH", "154"],
    ["LAUNCH EVENT", "157"],
  ] as const;

  for (const [label, frame] of projectTargets) {
    await page.getByRole("link", { name: `Open ${label}` }).hover();
    await expect(portrait).toHaveAttribute("data-target-frame", frame);
  }

  const designLogicBox = await page
    .getByRole("link", { name: "Open DESIGN LOGIC" })
    .boundingBox();
  const brandSystemBox = await page
    .getByRole("link", { name: "Open BRAND SYSTEM" })
    .boundingBox();
  expect(designLogicBox?.width).toBeCloseTo(brandSystemBox?.width ?? 0, 1);

  await page.mouse.move(1179, 516);
  await expect(portrait).toHaveAttribute("data-target-frame", "80");
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
    await expect.poll(async () => Number(await portrait.getAttribute("data-loaded")), {
      timeout: 15_000,
    }).toBeGreaterThanOrEqual(6);
    await expect(portrait).toHaveAttribute("data-errors", "0");
    expect(await portrait.boundingBox()).toMatchObject({
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }
});

test("centers the full desktop project-card group", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const cards = page.getByRole("navigation", { name: "Portfolio projects" }).locator("a");
  const first = await cards.first().boundingBox();
  const last = await cards.last().boundingBox();

  expect(first).not.toBeNull();
  expect(last).not.toBeNull();
  const groupCenter = ((first?.x ?? 0) + (last?.x ?? 0) + (last?.width ?? 0)) / 2;
  expect(groupCenter).toBeCloseTo(720, 0);
});

test("mobile controls and swipe preview adjacent project cards", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile");
  await page.goto("/");

  const selector = page.getByRole("navigation", { name: "Portfolio projects" });
  await page.getByRole("button", { name: "Next project" }).click();
  const designLogic = page.getByRole("link", { name: "Open DESIGN LOGIC" });
  await expect(designLogic).toHaveAttribute("data-previewed", "");
  await expect(
    page.getByRole("heading", { name: "业务洞察与设计目标" }),
  ).toBeVisible();
  await expect(
    designLogic.locator('[src="/kv-mobile/cards/design-logic-default.png"]'),
  ).toHaveCSS("opacity", "1");
  await expect(
    designLogic.locator('[src="/kv-mobile/cards/design-logic-active.png"]'),
  ).toHaveCSS("opacity", "0");

  const viewport = selector.locator("div").first();
  await viewport.dispatchEvent("pointerdown", { clientX: 300 });
  await viewport.dispatchEvent("pointerup", { clientX: 100 });
  await expect(
    page.getByRole("link", { name: "Open BRAND SYSTEM" }),
  ).toHaveAttribute("data-previewed", "");
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

  const business = page.getByRole("link", { name: "Open DESIGN LOGIC" });
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

  await page.getByRole("link", { name: "Open DESIGN LOGIC" }).click();
  await expect(page).toHaveURL(/\/work\/business$/);
  await expect(page.getByRole("dialog", { name: "Business Context" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/$/);

  const business = page.getByRole("link", { name: "Open DESIGN LOGIC" });
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
  await page.getByRole("link", { name: "Open DESIGN LOGIC" }).click();
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
  await expect(page.getByRole("img", { name: "Product launch case study" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
