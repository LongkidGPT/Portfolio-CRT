import { describe, expect, test } from "vitest";
import {
  KV_FRAME_COUNT,
  KV_HEIGHT,
  KV_NEUTRAL_FRAME,
  KV_PROJECT_FRAMES,
  KV_WIDTH,
  containRect,
  kvFrameSrc,
} from "@/lib/portfolio/kv";

describe("KV frame helpers", () => {
  test("exposes the generated sequence contract", () => {
    expect({
      frameCount: KV_FRAME_COUNT,
      width: KV_WIDTH,
      height: KV_HEIGHT,
      neutralFrame: KV_NEUTRAL_FRAME,
    }).toEqual({ frameCount: 72, width: 1470, height: 630, neutralFrame: 54 });
  });

  test("normalizes frame paths around the direction ring", () => {
    expect(kvFrameSrc(0)).toBe("/kv/frames/frame-000.webp");
    expect(kvFrameSrc(71)).toBe("/kv/frames/frame-071.webp");
    expect(kvFrameSrc(72)).toBe("/kv/frames/frame-000.webp");
    expect(kvFrameSrc(-1)).toBe("/kv/frames/frame-071.webp");
  });

  test("assigns the five project controls to five fixed directions", () => {
    expect(KV_PROJECT_FRAMES).toEqual({
      about: 20,
      business: 18,
      "brand-system": 15,
      "product-launch": 13,
      "launch-event": 11,
    });
  });

  test("contains a 7:3 KV inside a portrait canvas without distortion", () => {
    const result = containRect(1470, 630, 390, 844);

    expect(result.x).toBe(0);
    expect(result.y).toBeCloseTo(338.43, 2);
    expect(result.width).toBe(390);
    expect(result.height).toBeCloseTo(167.14, 2);
  });
});
