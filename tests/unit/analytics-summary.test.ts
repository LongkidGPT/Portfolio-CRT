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

test("builds anonymized per-session clicks, case depth, dwell, and contact counts", () => {
  const rows: PostHogEventRow[] = [
    row({ timestamp: "2026-08-09T10:00:00.000Z" }),
    row({ event: "portfolio_project_clicked", timestamp: "2026-08-09T10:00:01.000Z", projectId: "business" }),
    row({ event: "portfolio_project_clicked", timestamp: "2026-08-09T10:00:02.000Z", projectId: "business" }),
    row({ event: "portfolio_case_progress", timestamp: "2026-08-09T10:00:03.000Z", projectId: "brand-system", maxScrollDepth: 45, activeDwellMs: 12000 }),
    row({ event: "portfolio_case_progress", timestamp: "2026-08-09T10:00:04.000Z", projectId: "brand-system", maxScrollDepth: 84, activeDwellMs: 42000 }),
    row({ event: "portfolio_session_progress", timestamp: "2026-08-09T10:00:05.000Z", activeDwellMs: 58000 }),
    row({ event: "portfolio_contact_clicked", timestamp: "2026-08-09T10:00:06.000Z", contactType: "wechat" }),
    row({ visitorId: "raw-visitor-b", sessionId: "raw-session-b", timestamp: "2026-08-09T11:00:00.000Z" }),
  ];

  const summary = buildBranchSummary(rows, "/anker-visual");

  expect(summary.totalVisits).toBe(2);
  expect(summary.visitors.map(({ label }) => label)).toEqual(["VISITOR-01", "VISITOR-02"]);
  expect(summary.visitors[0].sessions[0]).toMatchObject({
    label: "VISIT-01",
    activeDwellMs: 58000,
    projectClicks: { about: 0, business: 2, "brand-system": 0, "product-launch": 0, "launch-event": 0 },
    cases: { "brand-system": { maxDepth: 84, activeDwellMs: 42000 } },
    contactClicks: { email: 0, phone: 0, wechat: 1 },
  });
  expect(JSON.stringify(summary)).not.toContain("raw-visitor");
  expect(JSON.stringify(summary)).not.toContain("raw-session");
});

test("ignores malformed and cross-branch events", () => {
  const summary = buildBranchSummary([
    row({ branchId: "/other" }),
    row({ visitorId: "", sessionId: "" }),
  ], "/anker-visual");
  expect(summary).toMatchObject({ branchId: "/anker-visual", totalVisits: 0, visitors: [] });
});
