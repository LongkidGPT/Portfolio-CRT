import { expect, test } from "vitest";
import {
  calculateScrollDepth,
  createActiveDwellClock,
  createSegmentDwellTracker,
  projectIdFromPathname,
  segmentIndexAtViewportCenter,
} from "@/lib/analytics/measurements";

test("calculates maximum document progress against the scrollable distance", () => {
  expect(calculateScrollDepth({ scrollTop: 450, scrollHeight: 1000, clientHeight: 500 })).toBe(90);
  expect(calculateScrollDepth({ scrollTop: 900, scrollHeight: 1000, clientHeight: 500 })).toBe(100);
  expect(calculateScrollDepth({ scrollTop: 0, scrollHeight: 500, clientHeight: 500 })).toBe(0);
});

test("counts only foreground intervals", () => {
  let now = 0;
  const clock = createActiveDwellClock(() => now);
  clock.start();
  now += 1000;
  clock.pause();
  now += 5000;
  clock.start();
  now += 500;
  expect(clock.read()).toBe(1500);
});

test("maps the viewport center into ten vertical page segments", () => {
  expect(segmentIndexAtViewportCenter({ scrollTop: 0, scrollHeight: 2000, clientHeight: 500 })).toBe(1);
  expect(segmentIndexAtViewportCenter({ scrollTop: 1500, scrollHeight: 2000, clientHeight: 500 })).toBe(8);
  expect(segmentIndexAtViewportCenter({ scrollTop: 0, scrollHeight: 500, clientHeight: 500 })).toBe(0);
  expect(segmentIndexAtViewportCenter({ scrollTop: 0, scrollHeight: 0, clientHeight: 500 })).toBe(0);
});

test("accumulates active dwell in the selected segment and pauses in the background", () => {
  let now = 0;
  const tracker = createSegmentDwellTracker(() => now);
  tracker.start(1);
  now = 1000;
  tracker.move(4);
  now = 2500;
  tracker.pause();
  now = 8000;

  expect(tracker.read()).toEqual([0, 1000, 0, 0, 1500, 0, 0, 0, 0, 0]);
});

test("returns a defensive heatmap copy and clamps invalid segment indexes", () => {
  let now = 0;
  const tracker = createSegmentDwellTracker(() => now);
  tracker.start(99);
  now = 500;
  const first = tracker.read();
  first[9] = 0;

  expect(tracker.read()[9]).toBe(500);
});

test.each([
  ["/about", "about"],
  ["/work/business", "business"],
  ["/work/brand-system", "brand-system"],
  ["/", null],
  ["/work/unknown", null],
] as const)("maps %s to its case id", (pathname, expected) => {
  expect(projectIdFromPathname(pathname)).toBe(expected);
});
