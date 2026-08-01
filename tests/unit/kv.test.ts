import { describe, expect, test } from "vitest";
import {
  KV_FRAME_COUNT,
  KV_HEIGHT,
  KV_NEUTRAL_FRAME,
  KV_PROJECT_FRAMES,
  KV_WIDTH,
  containRect,
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
