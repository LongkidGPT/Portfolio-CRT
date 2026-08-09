import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import type { BranchAnalyticsSummary } from "@/lib/analytics/types";

const SUMMARY: BranchAnalyticsSummary = {
  branchId: "/anker-visual",
  totalVisits: 12,
  updatedAt: "2026-08-09T11:00:00.000Z",
  visitors: [{
    label: "VISITOR-02",
    sessions: [{
      label: "VISIT-01",
      startedAt: "2026-08-09T10:00:00.000Z",
      lastSeenAt: "2026-08-09T10:01:00.000Z",
      activeDwellMs: 58000,
      projectClicks: { about: 1, business: 2, "brand-system": 1, "product-launch": 0, "launch-event": 0 },
      cases: { "brand-system": { maxDepth: 84, activeDwellMs: 42000 } },
      contactClicks: { email: 1, phone: 0, wechat: 1 },
    }],
  }],
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

test("loads the current branch and expands into anonymized detail", async () => {
  const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify(SUMMARY), { status: 200 }));
  render(<AnalyticsCard branchId="/anker-visual" fetcher={fetcher} />);

  await waitFor(() => expect(screen.getByRole("button", { name: /live signal/i })).toHaveTextContent("12"));
  expect(fetcher).toHaveBeenCalledWith(
    "/api/analytics/summary?branch=%2Fanker-visual",
    expect.objectContaining({ cache: "no-store" }),
  );

  fireEvent.click(screen.getByRole("button", { name: /live signal/i }));
  expect(await screen.findByText("VISITOR-02")).toBeVisible();
  expect(screen.getByText("DESIGN LOGIC")).toBeVisible();
  expect(screen.getByText("2 CLICKS")).toBeVisible();
  expect(screen.getByText("BRAND SYSTEM · 84%")).toBeVisible();
  expect(screen.getByText("ACTIVE 00:58")).toBeVisible();
  expect(screen.queryByText(/HOME DEPTH/i)).not.toBeInTheDocument();
});

test("refreshes every thirty seconds only while expanded", async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify(SUMMARY), { status: 200 }));
  render(<AnalyticsCard branchId="/anker-visual" fetcher={fetcher} />);
  await act(async () => Promise.resolve());
  const initialCalls = fetcher.mock.calls.length;

  fireEvent.click(screen.getByRole("button", { name: /live signal/i }));
  await act(async () => Promise.resolve());
  const expandedCalls = fetcher.mock.calls.length;
  expect(expandedCalls).toBeGreaterThan(initialCalls);

  act(() => vi.advanceTimersByTime(30_000));
  expect(fetcher.mock.calls.length).toBeGreaterThan(expandedCalls);

  fireEvent.click(screen.getByRole("button", { name: /close analytics/i }));
  const collapsedCalls = fetcher.mock.calls.length;
  act(() => vi.advanceTimersByTime(60_000));
  expect(fetcher).toHaveBeenCalledTimes(collapsedCalls);
});

test("shows a contained unavailable state without throwing", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 502 }));
  render(<AnalyticsCard branchId="/" fetcher={fetcher} />);
  fireEvent.click(screen.getByRole("button", { name: /live signal/i }));
  expect(await screen.findByText("TEMPORARILY UNAVAILABLE")).toBeVisible();
});
