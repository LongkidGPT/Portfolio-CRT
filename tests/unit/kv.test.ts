import { describe, expect, test } from "vitest";
import {
  KV_FRAME_COUNT,
  KV_HEIGHT,
  KV_NEUTRAL_FRAME,
  KV_PROJECT_FRAMES,
  KV_WIDTH,
  containRect,
  coverRect,
  kvFrameSrc,
  portraitRect,
} from "@/lib/portfolio/kv";

describe("KV frame helpers", () => {
  test("exposes the generated sequence contract", () => {
    expect({
      frameCount: KV_FRAME_COUNT,
      width: KV_WIDTH,
      height: KV_HEIGHT,
      neutralFrame: KV_NEUTRAL_FRAME,
    }).toEqual({ frameCount: 72, width: 1470, height: 630, neutralFrame: 65 });
  });

  test("normalizes frame paths around the direction ring", () => {
    expect(kvFrameSrc(0)).toBe("/kv/frames/frame-000.webp");
    expect(kvFrameSrc(71)).toBe("/kv/frames/frame-071.webp");
    expect(kvFrameSrc(72)).toBe("/kv/frames/frame-000.webp");
    expect(kvFrameSrc(-1)).toBe("/kv/frames/frame-071.webp");
  });

  test("assigns the five project controls to five fixed directions", () => {
    expect(KV_PROJECT_FRAMES).toEqual({
      about: 32,
      business: 30,
      "brand-system": 27,
      "product-launch": 25,
      "launch-event": 22,
    });
  });

  test("contains a 7:3 KV inside a portrait canvas without distortion", () => {
    const result = containRect(1470, 630, 390, 844);

    expect(result.x).toBe(0);
    expect(result.y).toBeCloseTo(338.43, 2);
    expect(result.width).toBe(390);
    expect(result.height).toBeCloseTo(167.14, 2);
  });

  test.each([
    {
      target: [1920, 1080],
      want: { x: 0, y: 0, width: 1920, height: 1080 },
    },
    {
      target: [1440, 900],
      want: { x: -98.24, y: 0, width: 1600, height: 900 },
    },
    {
      target: [1440, 960],
      want: { x: -163.73, y: 0, width: 1706.67, height: 960 },
    },
    {
      target: [1470, 630],
      want: { x: 0, y: -94.11, width: 1470, height: 826.88 },
    },
  ])(
    "covers $target while preserving the R4 focal point",
    ({ target: [width, height], want }) => {
      const result = coverRect(1280, 720, width, height, {
        x: 0.614,
        y: 0.478,
      });

      expect(result.x).toBeCloseTo(want.x, 2);
      expect(result.y).toBeCloseTo(want.y, 2);
      expect(result.width).toBeCloseTo(want.width, 2);
      expect(result.height).toBeCloseTo(want.height, 2);
      expect(result.x).toBeLessThanOrEqual(0);
      expect(result.y).toBeLessThanOrEqual(0);
      expect(result.x + result.width).toBeGreaterThanOrEqual(width);
      expect(result.y + result.height).toBeGreaterThanOrEqual(height);
    },
  );

  test("places the transparent portrait to match the desktop composition", () => {
    const result = portraitRect(2048, 853);

    expect(result.x).toBeCloseTo(389.28, 1);
    expect(result.y).toBeCloseTo(119.42, 1);
    expect(result.width / result.height).toBeCloseTo(1470 / 630, 5);
    expect(result.height).toBeCloseTo(733.58, 1);
    expect(result.y + result.height).toBeCloseTo(853, 1);
  });

  test("enlarges the transparent portrait without distortion on mobile", () => {
    const result = portraitRect(390, 844);

    expect(result.x).toBeCloseTo(-287.49, 1);
    expect(result.y).toBeCloseTo(84.4, 1);
    expect(result.width / result.height).toBeCloseTo(1470 / 630, 5);
    expect(result.height).toBeCloseTo(413.56, 1);
  });
});
