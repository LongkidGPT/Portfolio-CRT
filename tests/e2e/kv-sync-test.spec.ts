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
  await expect(canvas).toHaveAttribute("data-loaded", /[1-9]\d*/);
  await expect(canvas).toHaveAttribute("data-errors", "0");
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);

  const initialFrame = await canvas.getAttribute("data-frame");
  await page.mouse.move(1400, 50);
  await expect(canvas).not.toHaveAttribute("data-frame", initialFrame ?? "174");

  for (const [x, y] of [
    [70, 50],
    [1400, 580],
    [70, 580],
  ] as const) {
    await page.mouse.move(x, y);
    await expect(canvas).toHaveAttribute("data-frame", /\d+/);
    await expect(canvas).toHaveAttribute("data-errors", "0");
  }
});
