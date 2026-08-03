import { describe, expect, it } from "vitest";

import {
  KV_SYNC_FRAME_COUNT,
  KV_SYNC_HEAD_ANCHOR,
  KV_SYNC_HEIGHT,
  KV_SYNC_WIDTH,
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

  it("normalizes frame paths around the sequence boundary", () => {
    expect(kvSyncFrameSrc(0)).toBe("/kv-sync-test/frames/frame-000.webp");
    expect(kvSyncFrameSrc(192)).toBe("/kv-sync-test/frames/frame-192.webp");
    expect(kvSyncFrameSrc(193)).toBe("/kv-sync-test/frames/frame-000.webp");
    expect(kvSyncFrameSrc(-1)).toBe("/kv-sync-test/frames/frame-192.webp");
  });

  it.each([
    [0, 52],
    [90, 24],
    [180, 152],
    [270, 96],
    [360, 52],
  ])("maps %d degrees to source frame %d", (angle, frame) => {
    expect(frameForKvSyncAngle(angle)).toBe(frame);
  });

  it("keeps the complete monitor area on the neutral frame", () => {
    expect(frameForKvSyncPointer(135, 0.13, 0.16)).toBe(174);
    expect(frameForKvSyncPointer(45, -0.13, -0.16)).toBe(174);
  });

  it("keeps clear horizontal pointer positions facing horizontally", () => {
    expect(frameForKvSyncPointer(90, 0.3, 0)).toBe(24);
    expect(frameForKvSyncPointer(270, -0.3, 0)).toBe(96);
  });

  it("preserves vertical tracking outside the monitor area", () => {
    expect(frameForKvSyncPointer(0, 0, -0.3)).toBe(52);
    expect(frameForKvSyncPointer(180, 0, 0.3)).toBe(152);
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
