import { describe, expect, it } from "vitest";
import { rulerWidthsForIndex } from "@/lib/portfolio/interactions";

describe("rulerWidthsForIndex", () => {
  it("returns equal short lines when no project is previewed", () => {
    expect(rulerWidthsForIndex(null, "left")).toEqual(Array(9).fill(18));
    expect(rulerWidthsForIndex(null, "right")).toEqual(Array(9).fill(18));
  });

  it("moves the longest left ruler line from top to bottom across five projects", () => {
    expect(rulerWidthsForIndex(0, "left").indexOf(168)).toBe(2);
    expect(rulerWidthsForIndex(2, "left").indexOf(168)).toBe(4);
    expect(rulerWidthsForIndex(4, "left").indexOf(168)).toBe(6);
  });

  it("keeps the left and right rulers symmetric for every project", () => {
    for (let projectIndex = 0; projectIndex < 5; projectIndex += 1) {
      expect(rulerWidthsForIndex(projectIndex, "right")).toEqual(
        rulerWidthsForIndex(projectIndex, "left"),
      );
    }
  });
});
