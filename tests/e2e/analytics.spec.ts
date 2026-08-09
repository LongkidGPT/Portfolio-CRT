import { expect, test } from "@playwright/test";

const SUMMARY = {
  branchId: "/",
  totalVisits: 12,
  updatedAt: "2026-08-09T11:00:00.000Z",
  visitors: [{
    label: "VISITOR-02",
    sessions: [{
      label: "VISIT-01",
      startedAt: "2026-08-09T10:00:00.000Z",
      lastSeenAt: "2026-08-09T10:01:00.000Z",
      activeDwellMs: 58000,
      projects: {
        about: { clicks: 1, activeDwellMs: 0, maxDepth: 0 },
        business: { clicks: 2, activeDwellMs: 0, maxDepth: 0 },
        "brand-system": {
          clicks: 1,
          activeDwellMs: 42000,
          maxDepth: 84,
          segmentDwellMs: [0, 1000, 4000, 8000, 12000, 9000, 5000, 2000, 1000, 0],
        },
        "product-launch": { clicks: 0, activeDwellMs: 0, maxDepth: 0 },
        "launch-event": { clicks: 0, activeDwellMs: 0, maxDepth: 0 },
      },
    }],
  }],
};

test("captures explicit project and case events and renders the branch card", async ({ page }, testInfo) => {
  const events: Array<{ event: string; properties: Record<string, unknown> }> = [];
  await page.route("https://us.i.posthog.com/**", async (route) => {
    events.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, body: "{}" });
  });
  await page.route("**/api/analytics/summary?**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(SUMMARY) });
  });

  await page.goto("/");
  const launcher = page.getByRole("button", { name: /open live signal analytics/i });
  await expect(launcher).toContainText("12");
  await launcher.click();
  await expect(page.getByText("VISITOR-02")).toBeVisible();

  const panel = page.getByRole("region", { name: "Live Signal analytics panel" });
  await expect(panel.getByText("BRANCH", { exact: true })).toHaveCount(0);
  await expect(panel.getByText("TOTAL VISITS", { exact: true })).toHaveCount(0);
  await expect(panel.getByText(/CONTACT CLICKS/i)).toHaveCount(0);
  await panel.getByRole("button", { name: /brand system metrics/i }).click();
  await expect(panel.getByText("1 CLICK")).toBeVisible();
  await expect(panel.getByText("00:42")).toBeVisible();
  await expect(panel.getByText("84%")).toBeVisible();
  await expect(panel.getByRole("img", { name: /page segment/i })).toHaveCount(10);

  const box = await panel.boundingBox();
  const viewport = page.viewportSize()!;
  expect(box).not.toBeNull();
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width + 1);
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height + 1);

  await page.getByRole("button", { name: "Close analytics" }).click();
  await page.getByRole("link", { name: "Open DESIGN LOGIC" }).click();
  await expect(page).toHaveURL(/\/work\/business$/);
  await expect.poll(() => events.filter(({ event }) => event === "portfolio_project_clicked").length).toBe(1);
  expect(events.find(({ event }) => event === "portfolio_project_clicked")?.properties).toMatchObject({ branch_id: "/", project_id: "business" });

  if (testInfo.project.name === "desktop") {
    const scroller = page.locator("[data-analytics-scroll-root]");
    await scroller.evaluate((element) => { element.scrollTop = Math.max(1, element.scrollHeight / 2); element.dispatchEvent(new Event("scroll")); });
    await expect.poll(() => events.some(({ event }) => event === "portfolio_case_progress")).toBe(true);
    const progress = events.findLast(({ event }) => event === "portfolio_case_progress");
    expect(progress?.properties).toMatchObject({
      project_id: "business",
      case_view_id: expect.any(String),
      segment_dwell_ms: expect.any(Array),
    });
    expect(progress?.properties.segment_dwell_ms).toHaveLength(10);
  }
});
