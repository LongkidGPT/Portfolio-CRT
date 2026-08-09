import { expect, test } from "vitest";
import { buildBranchSummary } from "@/lib/analytics/summary";
import type { PostHogEventRow } from "@/lib/analytics/types";

const row = (overrides: Partial<PostHogEventRow>): PostHogEventRow => ({
  event: "portfolio_session_started",
  timestamp: "2026-08-09T10:00:00.000Z",
  branchId: "/anker-visual",
  visitorId: "raw-visitor-a",
  sessionId: "raw-session-a",
  pathname: "/anker-visual",
  ...overrides,
});

test("builds anonymized per-session project metrics and de-duplicates view snapshots", () => {
  const rows: PostHogEventRow[] = [
    row({ timestamp: "2026-08-09T10:00:00.000Z" }),
    row({ event: "portfolio_project_clicked", timestamp: "2026-08-09T10:00:01.000Z", projectId: "brand-system" }),
    row({ event: "portfolio_project_clicked", timestamp: "2026-08-09T10:00:02.000Z", projectId: "brand-system" }),
    row({
      event: "portfolio_case_progress",
      timestamp: "2026-08-09T10:00:03.000Z",
      projectId: "brand-system",
      caseViewId: "case-view-a",
      maxScrollDepth: 45,
      activeDwellMs: 12000,
      segmentDwellMs: [3000, 9000, 0, 0, 0, 0, 0, 0, 0, 0],
    }),
    row({
      event: "portfolio_case_progress",
      timestamp: "2026-08-09T10:00:04.000Z",
      projectId: "brand-system",
      caseViewId: "case-view-a",
      maxScrollDepth: 84,
      activeDwellMs: 42000,
      segmentDwellMs: [3000, 9000, 12000, 11000, 7000, 0, 0, 0, 0, 0],
    }),
    row({
      event: "portfolio_case_progress",
      timestamp: "2026-08-09T10:00:05.000Z",
      projectId: "brand-system",
      caseViewId: "case-view-b",
      maxScrollDepth: 60,
      activeDwellMs: 15000,
      segmentDwellMs: [0, 0, 0, 0, 1000, 6000, 4000, 2000, 1000, 1000],
    }),
    row({
      event: "portfolio_case_progress",
      timestamp: "2026-08-09T10:00:06.000Z",
      projectId: "product-launch",
      maxScrollDepth: 50,
      activeDwellMs: 5000,
    }),
    row({ event: "portfolio_session_progress", timestamp: "2026-08-09T10:00:07.000Z", activeDwellMs: 58000 }),
    row({ visitorId: "raw-visitor-b", sessionId: "raw-session-b", timestamp: "2026-08-09T11:00:00.000Z" }),
  ];

  const summary = buildBranchSummary(rows, "/anker-visual");

  expect(summary.totalVisits).toBe(2);
  expect(summary.visitors.map(({ label }) => label)).toEqual(["VISITOR-01", "VISITOR-02"]);
  expect(summary.visitors[0].sessions[0]).toMatchObject({
    label: "VISIT-01",
    activeDwellMs: 58000,
    projects: {
      about: { clicks: 0, activeDwellMs: 0, maxDepth: 0 },
      business: { clicks: 0, activeDwellMs: 0, maxDepth: 0 },
      "brand-system": {
        clicks: 2,
        activeDwellMs: 57000,
        maxDepth: 84,
        segmentDwellMs: [3000, 9000, 12000, 11000, 8000, 6000, 4000, 2000, 1000, 1000],
      },
      "product-launch": { clicks: 0, activeDwellMs: 5000, maxDepth: 50 },
      "launch-event": { clicks: 0, activeDwellMs: 0, maxDepth: 0 },
    },
  });
  expect(summary.visitors[0].sessions[0]).not.toHaveProperty("contactClicks");
  expect(summary.visitors[0].sessions[0].projects["product-launch"].segmentDwellMs).toBeUndefined();
  expect(JSON.stringify(summary)).not.toContain("raw-visitor");
  expect(JSON.stringify(summary)).not.toContain("raw-session");
  expect(JSON.stringify(summary)).not.toContain("case-view");
});

test("ignores malformed and cross-branch events", () => {
  const summary = buildBranchSummary([
    row({ branchId: "/other" }),
    row({ visitorId: "", sessionId: "" }),
  ], "/anker-visual");
  expect(summary).toMatchObject({ branchId: "/anker-visual", totalVisits: 0, visitors: [] });
});
