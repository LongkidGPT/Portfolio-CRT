import { expect, test } from "@playwright/test";

for (const viewport of [
  { name: "wide", width: 2048, height: 852 },
  { name: "large", width: 1920, height: 1080 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`${viewport.name} viewport has no horizontal overflow`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Viewport matrix runs once in desktop Chromium.");
    await page.setViewportSize(viewport);
    await page.goto("/");
    const sizes = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
    await expect(page.getByRole("img", { name: "Interactive CRT portrait" })).toBeVisible();
  });
}
