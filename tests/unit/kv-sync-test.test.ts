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
    expect([KV_SYNC_WIDTH, KV_SYNC_HEIGHT]).toEqual([1920, 1080]);
    expect(KV_SYNC_HEAD_ANCHOR).toEqual({ x: 0.614, y: 0.478 });
  });

  it("assigns each formal control to its matched R5 pose", () => {
    expect(KV_SYNC_PROJECT_FRAMES).toEqual({
      about: 118,
      business: 128,
      "brand-system": 140,
      "product-launch": 154,
      "launch-event": 157,
    });
  });

  it("normalizes frame paths around the sequence boundary", () => {
    expect(kvSyncFrameSrc(0)).toBe("/kv-desktop-r5/frames/frame-000.webp");
    expect(kvSyncFrameSrc(192)).toBe("/kv-desktop-r5/frames/frame-192.webp");
    expect(kvSyncFrameSrc(193)).toBe("/kv-desktop-r5/frames/frame-000.webp");
    expect(kvSyncFrameSrc(-1)).toBe("/kv-desktop-r5/frames/frame-192.webp");
  });

  it.each([
    [0, 73],
    [45, 65],
    [90, 64],
    [135, 154],
    [180, 140],
    [225, 118],
    [270, 117],
    [315, 93],
    [360, 73],
  ])("maps %d degrees to its visually matched R5 frame %d", (angle, frame) => {
    expect(frameForKvSyncAngle(angle)).toBe(frame);
  });

  it.each([
    [0.386, -0.478, 45],
    [0.386, 0.522, 135],
    [-0.614, 0.522, 225],
    [-0.614, -0.478, 315],
    [0.386, 0, 90],
    [0, 0.522, 180],
  ])(
    "normalizes a viewport edge vector (%f, %f) to %d degrees",
    (normalizedX, normalizedY, angle) => {
      expect(angleForKvSyncPointer(normalizedX, normalizedY)).toBeCloseTo(
        angle,
        5,
      );
    },
  );

  it.each([
    [0.386, -0.478],
    [0.386, -0.24],
    [0.386, 0],
    [0.386, 0.26],
    [0.386, 0.522],
  ])(
    "keeps every right-side pointer position inside the right-facing R5 frame band",
    (normalizedX, normalizedY) => {
      const angle = angleForKvSyncPointer(normalizedX, normalizedY);
      const frame = frameForKvSyncPointer(angle, normalizedX, normalizedY);
      expect(frame).toBeGreaterThanOrEqual(49);
      expect(frame).toBeLessThanOrEqual(69);
    },
  );

  it.each([
    [-0.614, -0.478],
    [-0.614, -0.24],
    [-0.614, 0],
    [-0.614, 0.26],
    [-0.614, 0.522],
  ])(
    "keeps every left-side pointer position inside the left-facing R5 frame band",
    (normalizedX, normalizedY) => {
      const angle = angleForKvSyncPointer(normalizedX, normalizedY);
      const frame = frameForKvSyncPointer(angle, normalizedX, normalizedY);
      expect(frame).toBeGreaterThanOrEqual(93);
      expect(frame).toBeLessThanOrEqual(118);
    },
  );

  it("keeps the complete monitor area on the neutral frame", () => {
    expect(frameForKvSyncPointer(135, 0.13, 0.16)).toBe(80);
    expect(frameForKvSyncPointer(45, -0.13, -0.16)).toBe(80);
  });

  it("keeps clear horizontal pointer positions facing horizontally", () => {
    expect(frameForKvSyncPointer(90, 0.3, 0)).toBe(59);
    expect(frameForKvSyncPointer(270, -0.3, 0)).toBe(105);
  });

  it("preserves vertical tracking outside the monitor area", () => {
    expect(frameForKvSyncPointer(0, 0, -0.3)).toBe(73);
    expect(frameForKvSyncPointer(180, 0, 0.3)).toBe(140);
  });

  it("enters the matching side band immediately outside the monitor boundary", () => {
    const nearBoundary = frameForKvSyncPointer(90, 0.15, 0);
    expect(nearBoundary).toBe(59);
  });

  it("eases into and out of a directional band without an instantaneous jump", () => {
    const transitions = [
      [80, 59],
      [80, 105],
      [59, 80],
      [105, 80],
    ] as const;

    for (const [current, target] of transitions) {
      const next = stepKvSyncFrame(current, target, 1000 / 60);
      expect(Math.abs(shortestFrameDelta(next, current, 193))).toBeLessThanOrEqual(
        1.51,
      );
      expect(Math.abs(shortestFrameDelta(target, next, 193))).toBeLessThan(
        Math.abs(shortestFrameDelta(target, current, 193)),
      );
    }
  });

  it.each([59, 105])(
    "settles on side frame %d within 300ms from the neutral pose",
    (target) => {
      let current = 80;
      for (let index = 0; index < 18; index += 1) {
        current = stepKvSyncFrame(current, target, 1000 / 60);
      }
      expect(Math.abs(shortestFrameDelta(target, current, 193))).toBeLessThan(3);
    },
  );

  it("eases smoothly while the pointer remains in the same directional band", () => {
    const nextRight = stepKvSyncFrame(49, 69, 1000 / 60);
    expect(nextRight).toBeGreaterThan(49);
    expect(nextRight).toBeLessThanOrEqual(50.5);

    const nextLeft = stepKvSyncFrame(118, 93, 1000 / 60);
    expect(nextLeft).toBeLessThan(118);
    expect(nextLeft).toBeGreaterThanOrEqual(116.5);
  });
});
