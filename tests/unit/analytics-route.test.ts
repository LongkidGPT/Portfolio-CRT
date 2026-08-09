import { beforeEach, expect, test, vi } from "vitest";
import { GET } from "@/app/api/analytics/summary/route";
import { queryBranchEvents } from "@/lib/analytics/posthog-query";

vi.mock("@/lib/analytics/posthog-query", () => ({ queryBranchEvents: vi.fn() }));

beforeEach(() => {
  vi.stubEnv("POSTHOG_PERSONAL_API_KEY", "phx_secret");
  vi.stubEnv("POSTHOG_PROJECT_ID", "12345");
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://us.i.posthog.com");
  vi.mocked(queryBranchEvents).mockReset().mockResolvedValue([]);
});

test("returns only an anonymized no-store branch summary", async () => {
  const response = await GET(new Request("https://portfolio.test/api/analytics/summary?branch=%2Fanker-visual"));
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toEqual({ branchId: "/anker-visual", totalVisits: 0, updatedAt: null, visitors: [] });
  expect(queryBranchEvents).toHaveBeenCalledWith(expect.objectContaining({ personalApiKey: "phx_secret" }), "/anker-visual");
});

test("rejects invalid branches and missing server configuration", async () => {
  expect((await GET(new Request("https://portfolio.test/api/analytics/summary?branch=%2Fbad%27"))).status).toBe(400);
  vi.stubEnv("POSTHOG_PERSONAL_API_KEY", "");
  expect((await GET(new Request("https://portfolio.test/api/analytics/summary?branch=%2F"))).status).toBe(503);
});

test("hides PostHog failure details", async () => {
  vi.mocked(queryBranchEvents).mockRejectedValue(new Error("phx_secret leaked upstream"));
  const response = await GET(new Request("https://portfolio.test/api/analytics/summary?branch=%2F"));
  expect(response.status).toBe(502);
  expect(JSON.stringify(await response.json())).not.toContain("phx_secret");
});
