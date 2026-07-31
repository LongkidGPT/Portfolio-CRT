import { describe, expect, it } from "vitest";
import {
  frameForAngle,
  pointerAngle,
  shortestFrameDelta,
} from "@/lib/portfolio/sprite";

describe("sprite math", () => {
  it("maps cardinal angles around a 72-frame direction ring", () => {
    expect(frameForAngle(0, 72)).toBe(0);
    expect(frameForAngle(90, 72)).toBe(18);
    expect(frameForAngle(180, 72)).toBe(36);
    expect(frameForAngle(270, 72)).toBe(54);
    expect(frameForAngle(360, 72)).toBe(0);
  });

  it("supports calibrated source-frame offsets", () => {
    expect(frameForAngle(0, 72, 9)).toBe(9);
    expect(frameForAngle(315, 72, 9)).toBe(0);
  });

  it("takes the short path across the frame seam", () => {
    expect(shortestFrameDelta(1, 63, 64)).toBe(2);
    expect(shortestFrameDelta(63, 1, 64)).toBe(-2);
  });

  it("calculates direction around an explicit robot-head anchor", () => {
    const anchor = { x: 70, y: 35 };

    expect(pointerAngle({ x: 70, y: 0 }, anchor)).toBeCloseTo(0);
    expect(pointerAngle({ x: 100, y: 35 }, anchor)).toBeCloseTo(90);
    expect(pointerAngle({ x: 70, y: 70 }, anchor)).toBeCloseTo(180);
  });
});
