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

  for (const [x, y, frame] of [
    [735, 10, "65"],
    [1400, 208, "30"],
    [735, 620, "138"],
    [70, 208, "103"],
  ] as const) {
    await page.mouse.move(x, y);
    await expect(canvas).toHaveAttribute("data-frame", frame);
    await expect(canvas).toHaveAttribute("data-errors", "0");
  }
});
