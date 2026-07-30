import { describe, expect, it } from "vitest";
import {
  frameForAngle,
  pointerAngle,
  shortestFrameDelta,
} from "@/lib/portfolio/sprite";

describe("sprite math", () => {
  it("maps cardinal angles to the expected sprite frames", () => {
    expect(frameForAngle(0)).toBe(0);
    expect(frameForAngle(90)).toBeCloseTo(20);
    expect(frameForAngle(180)).toBeCloseTo(38);
    expect(frameForAngle(270)).toBeCloseTo(54);
  });

  it("takes the short path across the frame seam", () => {
    expect(shortestFrameDelta(1, 63, 64)).toBe(2);
    expect(shortestFrameDelta(63, 1, 64)).toBe(-2);
  });

  it("calculates the angle from the sprite center to a point", () => {
    const bounds = { left: 0, top: 0, width: 100, height: 100 };

    expect(pointerAngle({ x: 50, y: 0 }, bounds)).toBeCloseTo(0);
    expect(pointerAngle({ x: 100, y: 50 }, bounds)).toBeCloseTo(90);
  });
});
