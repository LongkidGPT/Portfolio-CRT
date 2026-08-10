import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import { useAnalytics } from "@/components/analytics/useAnalytics";
import { sendAnalyticsEvent } from "@/lib/analytics/client";

vi.mock("next/navigation", () => ({ usePathname: () => "/anker-visual" }));
vi.mock("@/lib/analytics/client", () => ({ sendAnalyticsEvent: vi.fn() }));
vi.mock("@/components/analytics/CaseProgressTracker", () => ({
  default: ({ onProgress }: {
    onProgress: (
      projectId: "brand-system",
      caseViewId: string,
      maxDepth: number,
      activeDwellMs: number,
      segmentDwellMs: number[],
    ) => void;
  }) => (
    <button
      type="button"
      onClick={() => onProgress(
        "brand-system",
        "case-view-1",
        84,
        42000,
        [0, 1000, 4000, 8000, 12000, 9000, 5000, 2000, 1000, 0],
      )}
    >
      Track case
    </button>
  ),
}));

function Probe() {
  const analytics = useAnalytics();
  return (
    <>
      <span>{analytics.branchId}</span>
      <button
        type="button"
        onClick={() => analytics.trackProjectClick({
          id: "brand-system",
          label: "BRAND SYSTEM",
        })}
      >
        Track project
      </button>
    </>
  );
}

beforeEach(() => {
  const createStorage = () => {
    const values = new Map<string, string>();
    return {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
      key: () => null,
      get length() { return values.size; },
    } satisfies Storage;
  };
  Object.defineProperty(window, "localStorage", { value: createStorage(), configurable: true });
  Object.defineProperty(window, "sessionStorage", { value: createStorage(), configurable: true });
  vi.mocked(sendAnalyticsEvent).mockReset();
  vi.spyOn(globalThis.crypto, "randomUUID")
    .mockReturnValueOnce("00000000-0000-4000-8000-000000000001")
    .mockReturnValueOnce("00000000-0000-4000-8000-000000000002");
});

afterEach(() => vi.restoreAllMocks());

test("does not create analytics events for automated browser sessions", async () => {
  Object.defineProperty(navigator, "webdriver", { value: true, configurable: true });
  render(
    <AnalyticsProvider config={{ token: "phc_test", host: "https://us.i.posthog.com" }}>
      <Probe />
    </AnalyticsProvider>,
  );

  await Promise.resolve();
  expect(sendAnalyticsEvent).not.toHaveBeenCalled();
  Object.defineProperty(navigator, "webdriver", { value: false, configurable: true });
});

test("starts one branch-scoped session and exposes the stable branch", async () => {
  render(
    <AnalyticsProvider config={{ token: "phc_test", host: "https://us.i.posthog.com" }}>
      <Probe />
    </AnalyticsProvider>,
  );

  expect(screen.getByText("/anker-visual")).toBeVisible();
  await waitFor(() => {
    expect(sendAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({ token: expect.any(String) }),
      expect.objectContaining({
        event: "portfolio_session_started",
        branch_id: "/anker-visual",
        visitor_id: "00000000-0000-4000-8000-000000000001",
        session_id: "00000000-0000-4000-8000-000000000002",
      }),
      expect.anything(),
    );
  });
});

test("tracks a deliberate project activation with its approved id and label", async () => {
  render(
    <AnalyticsProvider config={{ token: "phc_test", host: "https://us.i.posthog.com" }}>
      <Probe />
    </AnalyticsProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Track project" }));

  await waitFor(() => {
    expect(sendAnalyticsEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        event: "portfolio_project_clicked",
        project_id: "brand-system",
        project_label: "BRAND SYSTEM",
      }),
      expect.anything(),
    );
  });
});

test("tracks a case view with its ten segment dwell snapshot", async () => {
  render(
    <AnalyticsProvider config={{ token: "phc_test", host: "https://us.i.posthog.com" }}>
      <Probe />
    </AnalyticsProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Track case" }));

  await waitFor(() => {
    expect(sendAnalyticsEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        event: "portfolio_case_progress",
        project_id: "brand-system",
        case_view_id: "case-view-1",
        max_scroll_depth: 84,
        active_dwell_ms: 42000,
        segment_dwell_ms: [0, 1000, 4000, 8000, 12000, 9000, 5000, 2000, 1000, 0],
      }),
      expect.anything(),
    );
  });
});

test("reports foreground session dwell without counting hidden-tab time", async () => {
  vi.useFakeTimers();
  render(
    <AnalyticsProvider config={{ token: "phc_test", host: "https://us.i.posthog.com" }}>
      <Probe />
    </AnalyticsProvider>,
  );

  vi.advanceTimersByTime(15_000);
  expect(sendAnalyticsEvent).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      event: "portfolio_session_progress",
      active_dwell_ms: 15_000,
    }),
    expect.anything(),
  );

  Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
  vi.advanceTimersByTime(30_000);
  const progress = vi.mocked(sendAnalyticsEvent).mock.calls
    .map(([, event]) => event)
    .filter((event) => event.event === "portfolio_session_progress");
  expect(progress.at(-1)).toMatchObject({ active_dwell_ms: 15_000 });
  vi.useRealTimers();
});
