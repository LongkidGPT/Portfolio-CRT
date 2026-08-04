import { describe, expect, it } from "vitest";

import {
  MOBILE_KV_PROJECT_FRAMES,
  mobileKvFrameSrc,
  stepMobileKvFrame,
} from "@/lib/portfolio/kv-mobile";

describe("mobile KV frame calibration", () => {
  it("uses the five approved project frames", () => {
    expect(MOBILE_KV_PROJECT_FRAMES).toEqual({
      about: 63,
      business: 135,
      "brand-system": 131,
      "product-launch": 96,
      "launch-event": 120,
    });
  });

  it("normalizes frame paths around the sequence", () => {
    expect(mobileKvFrameSrc(193)).toBe("/kv-mobile/frames/frame-000.webp");
    expect(mobileKvFrameSrc(-1)).toBe("/kv-mobile/frames/frame-192.webp");
  });

  it("moves toward a target without jumping directly to it", () => {
    const next = stepMobileKvFrame(63, 135, 1000 / 60);
    expect(next).toBeGreaterThan(63);
    expect(next).toBeLessThan(135);
  });
});
