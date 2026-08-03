import { expect, test } from "@playwright/test";

test("renders complete synchronized source frames on the isolated route", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop validation route");
  await page.setViewportSize({ width: 1470, height: 630 });
  await page.goto("/kv-sync-test");

  const canvas = page.getByRole("img", {
    name: "Full-frame KV synchronization test",
  });
  await expect(canvas).toHaveAttribute("data-frame", /\d+/);
  await expect(canvas).toHaveAttribute("data-loaded", "193");
  await expect(canvas).toHaveAttribute("data-errors", "0");
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
  expect(await canvas.boundingBox()).toMatchObject({
    x: 0,
    y: 0,
    width: 1470,
    height: 630,
  });

  for (const [x, y, frame] of [
    [903, 1, "52"],
    [1469, 1, "36"],
    [1469, 301, "20"],
    [1469, 629, "156"],
    [903, 629, "144"],
    [1, 629, "124"],
    [1, 301, "100"],
    [1, 1, "76"],
    [903, 301, "174"],
  ] as const) {
    await page.mouse.move(x, y);
    await expect(canvas).toHaveAttribute("data-target-frame", frame);
    await expect(canvas).toHaveAttribute("data-frame", frame);
    await expect(canvas).toHaveAttribute("data-errors", "0");
  }
});
