import { expect, test, vi } from "vitest";
import { sendAnalyticsEvent } from "@/lib/analytics/client";

const EVENT = {
  event: "portfolio_project_clicked" as const,
  branch_id: "/anker-visual",
  visitor_id: "visitor-a",
  session_id: "session-a",
  pathname: "/",
  timestamp: "2026-08-09T10:00:00.000Z",
  project_id: "brand-system" as const,
  project_label: "BRAND SYSTEM",
};

test("sends an explicit event using the public PostHog ingestion contract", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));

  sendAnalyticsEvent(
    { token: "phc_test", host: "https://us.i.posthog.com/" },
    EVENT,
    { fetcher },
  );

  await vi.waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
  const [url, request] = fetcher.mock.calls[0];
  expect(url).toBe("https://us.i.posthog.com/i/v0/e/");
  expect(request).toMatchObject({
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
  });
  expect(JSON.parse(request.body)).toEqual({
    token: "phc_test",
    event: "portfolio_project_clicked",
    timestamp: "2026-08-09T10:00:00.000Z",
    properties: {
      branch_id: "/anker-visual",
      visitor_id: "visitor-a",
      session_id: "session-a",
      pathname: "/",
      project_id: "brand-system",
      project_label: "BRAND SYSTEM",
      distinct_id: "visitor-a",
    },
  });
});

test("does nothing when public PostHog configuration is absent", () => {
  const fetcher = vi.fn();
  sendAnalyticsEvent(null, EVENT, { fetcher });
  expect(fetcher).not.toHaveBeenCalled();
});

test("uses sendBeacon for exit events without exposing the token in the URL", () => {
  const beacon = vi.fn().mockReturnValue(true);
  sendAnalyticsEvent(
    { token: "phc_test", host: "https://eu.i.posthog.com" },
    EVENT,
    { beacon, preferBeacon: true },
  );

  expect(beacon).toHaveBeenCalledOnce();
  expect(beacon.mock.calls[0][0]).toBe("https://eu.i.posthog.com/i/v0/e/");
  expect(beacon.mock.calls[0][1]).toBeInstanceOf(Blob);
});
