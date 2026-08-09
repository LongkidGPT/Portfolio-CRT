import { expect, test } from "vitest";
import {
  calculateScrollDepth,
  createActiveDwellClock,
  projectIdFromPathname,
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

test.each([
  ["/about", "about"],
  ["/work/business", "business"],
  ["/work/brand-system", "brand-system"],
  ["/", null],
  ["/work/unknown", null],
] as const)("maps %s to its case id", (pathname, expected) => {
  expect(projectIdFromPathname(pathname)).toBe(expected);
});
