import { describe, expect, it } from "vitest";

import {
  KV_SYNC_FRAME_COUNT,
  KV_SYNC_HEAD_ANCHOR,
  KV_SYNC_HEIGHT,
  KV_SYNC_PROJECT_FRAMES,
  KV_SYNC_WIDTH,
  angleForKvSyncPointer,
  frameForKvSyncAngle,
  frameForKvSyncPointer,
  kvSyncFrameSrc,
  stepKvSyncFrame,
} from "@/lib/portfolio/kv-sync-test";
import { shortestFrameDelta } from "@/lib/portfolio/sprite";

describe("KV synchronization test mapping", () => {
  it("uses every frame from the 193-frame source video", () => {
    expect(KV_SYNC_FRAME_COUNT).toBe(193);
    expect([KV_SYNC_WIDTH, KV_SYNC_HEIGHT]).toEqual([1470, 630]);
    expect(KV_SYNC_HEAD_ANCHOR).toEqual({ x: 0.598, y: 0.423 });
  });

  it("assigns each formal control to its hand-calibrated R3 pose", () => {
    expect(KV_SYNC_PROJECT_FRAMES).toEqual({
      about: 124,
      business: 134,
      "brand-system": 144,
      "product-launch": 150,
      "launch-event": 156,
    });
  });

  it("normalizes frame paths around the sequence boundary", () => {
    expect(kvSyncFrameSrc(0)).toBe("/kv-sync-test/frames/frame-000.webp");
    expect(kvSyncFrameSrc(192)).toBe("/kv-sync-test/frames/frame-192.webp");
    expect(kvSyncFrameSrc(193)).toBe("/kv-sync-test/frames/frame-000.webp");
    expect(kvSyncFrameSrc(-1)).toBe("/kv-sync-test/frames/frame-192.webp");
  });

  it.each([
    [0, 52],
    [45, 36],
    [90, 20],
    [135, 156],
    [180, 144],
    [225, 124],
    [270, 100],
    [315, 76],
    [360, 52],
  ])("maps %d degrees to its visually calibrated R3 frame %d", (angle, frame) => {
    expect(frameForKvSyncAngle(angle)).toBe(frame);
  });

  it.each([
    [0.402, -0.423, 45],
    [0.402, 0.577, 135],
    [-0.598, 0.577, 225],
    [-0.598, -0.423, 315],
    [0.402, 0, 90],
    [0, 0.577, 180],
  ])(
    "normalizes a 21:9 edge vector (%f, %f) to %d degrees",
    (normalizedX, normalizedY, angle) => {
      expect(angleForKvSyncPointer(normalizedX, normalizedY)).toBeCloseTo(
        angle,
        5,
      );
    },
  );

  it("keeps the visual bottom-right corner on the R3 down-right keyframe", () => {
    const angle = angleForKvSyncPointer(0.402, 0.577);
    expect(frameForKvSyncPointer(angle, 0.402, 0.577)).toBe(156);
  });

  it("keeps the complete monitor area on the neutral frame", () => {
    expect(frameForKvSyncPointer(135, 0.13, 0.16)).toBe(174);
    expect(frameForKvSyncPointer(45, -0.13, -0.16)).toBe(174);
  });

  it("keeps clear horizontal pointer positions facing horizontally", () => {
    expect(frameForKvSyncPointer(90, 0.3, 0)).toBe(20);
    expect(frameForKvSyncPointer(270, -0.3, 0)).toBe(100);
  });

  it("preserves vertical tracking outside the monitor area", () => {
    expect(frameForKvSyncPointer(0, 0, -0.3)).toBe(52);
    expect(frameForKvSyncPointer(180, 0, 0.3)).toBe(144);
  });

  it("blends continuously outside the neutral monitor boundary", () => {
    const nearBoundary = frameForKvSyncPointer(90, 0.15, 0);
    expect(nearBoundary).not.toBe(174);
    expect(nearBoundary).not.toBe(24);
    expect(Math.abs(shortestFrameDelta(nearBoundary, 174, 193))).toBeLessThan(8);
  });

  it("limits each animation step while moving along the shortest frame path", () => {
    const next = stepKvSyncFrame(174, 24, 1000 / 60);
    expect(Math.abs(shortestFrameDelta(next, 174, 193))).toBeLessThanOrEqual(
      1.51,
    );
    expect(Math.abs(shortestFrameDelta(24, next, 193))).toBeLessThan(
      Math.abs(shortestFrameDelta(24, 174, 193)),
    );

    const reverse = stepKvSyncFrame(24, 174, 1000 / 60);
    expect(reverse).toBeLessThan(24);
  });
});
