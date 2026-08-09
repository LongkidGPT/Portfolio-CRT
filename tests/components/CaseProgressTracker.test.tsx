import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import CaseProgressTracker from "@/components/analytics/CaseProgressTracker";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

test("reports increasing overlay progress without lowering the recorded maximum", () => {
  vi.useFakeTimers();
  let now = 0;
  const onProgress = vi.fn();
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(now);
    return 0;
  });

  const { container } = render(
    <>
      <div data-analytics-scroll-root />
      <CaseProgressTracker pathname="/work/brand-system" now={() => now} onProgress={onProgress} />
    </>,
  );
  const scroller = container.querySelector<HTMLElement>("[data-analytics-scroll-root]")!;
  Object.defineProperties(scroller, {
    scrollTop: { value: 400, writable: true },
    scrollHeight: { value: 1000 },
    clientHeight: { value: 500 },
  });

  fireEvent.scroll(scroller);
  expect(onProgress).toHaveBeenLastCalledWith(
    "brand-system",
    expect.any(String),
    80,
    0,
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  );
  const caseViewId = onProgress.mock.calls.at(-1)?.[1];

  scroller.scrollTop = 100;
  fireEvent.scroll(scroller);
  expect(onProgress.mock.calls.at(-1)?.[1]).toBe(caseViewId);
  expect(onProgress.mock.calls.at(-1)?.[2]).toBe(80);

  now = 15000;
  act(() => vi.advanceTimersByTime(15000));
  expect(onProgress).toHaveBeenLastCalledWith(
    "brand-system",
    caseViewId,
    80,
    15000,
    [0, 0, 0, 15000, 0, 0, 0, 0, 0, 0],
  );
});
