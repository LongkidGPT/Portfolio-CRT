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
    return 1;
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
  expect(onProgress).toHaveBeenLastCalledWith("brand-system", 80, 0);

  scroller.scrollTop = 100;
  fireEvent.scroll(scroller);
  expect(onProgress).toHaveBeenLastCalledWith("brand-system", 80, 0);

  now = 15000;
  act(() => vi.advanceTimersByTime(15000));
  expect(onProgress).toHaveBeenLastCalledWith("brand-system", 80, 15000);
});
