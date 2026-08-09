import { expect, test, vi } from "vitest";
import { queryBranchEvents } from "@/lib/analytics/posthog-query";

test("queries the PostHog project with a server-only key and bounded branch predicate", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
    results: [[
      "portfolio_session_started",
      "2026-08-09T10:00:00Z",
      "/anker-visual",
      "visitor-a",
      "session-a",
      "/anker-visual",
      null,
      null,
      null,
      "case-view-1",
      "[0,1000,0,0,0,0,0,0,0,0]",
    ]],
  }), { status: 200, headers: { "Content-Type": "application/json" } }));

  const rows = await queryBranchEvents({
    personalApiKey: "phx_secret",
    projectId: "12345",
    host: "https://us.i.posthog.com",
  }, "/anker-visual", fetcher);

  const [url, request] = fetcher.mock.calls[0];
  expect(url).toBe("https://us.posthog.com/api/projects/12345/query/");
  expect(request.headers.Authorization).toBe("Bearer phx_secret");
  const query = JSON.parse(request.body).query.query as string;
  expect(query).toContain("properties.branch_id = '/anker-visual'");
  expect(query).toContain("properties.case_view_id");
  expect(query).toContain("properties.segment_dwell_ms");
  expect(query).not.toContain("portfolio_contact_clicked");
  expect(query).not.toContain("properties.contact_type");
  expect(query).toContain("LIMIT 5000");
  expect(rows[0]).toMatchObject({
    branchId: "/anker-visual",
    visitorId: "visitor-a",
    caseViewId: "case-view-1",
    segmentDwellMs: [0, 1000, 0, 0, 0, 0, 0, 0, 0, 0],
  });
});

test("drops malformed heatmap arrays while keeping legacy case metrics", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
    results: [[
      "portfolio_case_progress",
      "2026-08-09T10:00:00Z",
      "/anker-visual",
      "visitor-a",
      "session-a",
      "/work/brand-system",
      "brand-system",
      84,
      42000,
      null,
      "[1000,-1]",
    ]],
  }), { status: 200, headers: { "Content-Type": "application/json" } }));

  const [event] = await queryBranchEvents({
    personalApiKey: "phx_secret",
    projectId: "12345",
    host: "https://us.i.posthog.com",
  }, "/anker-visual", fetcher);

  expect(event).toMatchObject({ maxScrollDepth: 84, activeDwellMs: 42000 });
  expect(event.segmentDwellMs).toBeUndefined();
});

test("rejects an unsafe branch before making a request", async () => {
  const fetcher = vi.fn();
  await expect(queryBranchEvents({
    personalApiKey: "phx_secret",
    projectId: "12345",
    host: "https://us.i.posthog.com",
  }, "/bad' OR 1=1", fetcher)).rejects.toThrow("Invalid branch");
  expect(fetcher).not.toHaveBeenCalled();
});
