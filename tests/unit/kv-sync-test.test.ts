import { describe, expect, it } from "vitest";

import {
  KV_SYNC_FRAME_COUNT,
  KV_SYNC_HEIGHT,
  KV_SYNC_WIDTH,
  frameForKvSyncAngle,
  frameForKvSyncPointer,
  kvSyncFrameSrc,
} from "@/lib/portfolio/kv-sync-test";

describe("KV synchronization test mapping", () => {
  it("uses every frame from the 193-frame source video", () => {
    expect(KV_SYNC_FRAME_COUNT).toBe(193);
    expect([KV_SYNC_WIDTH, KV_SYNC_HEIGHT]).toEqual([1280, 720]);
  });

  it("normalizes frame paths around the sequence boundary", () => {
    expect(kvSyncFrameSrc(0)).toBe("/kv-sync-test/frames/frame-000.webp");
    expect(kvSyncFrameSrc(192)).toBe("/kv-sync-test/frames/frame-192.webp");
    expect(kvSyncFrameSrc(193)).toBe("/kv-sync-test/frames/frame-000.webp");
    expect(kvSyncFrameSrc(-1)).toBe("/kv-sync-test/frames/frame-192.webp");
  });

  it.each([
    [0, 65],
    [90, 30],
    [180, 138],
    [270, 103],
    [360, 65],
  ])("maps %d degrees to source frame %d", (angle, frame) => {
    expect(frameForKvSyncAngle(angle)).toBe(frame);
  });

  it("keeps the complete monitor area on the neutral frame", () => {
    expect(frameForKvSyncPointer(135, 0.13, 0.16)).toBe(174);
    expect(frameForKvSyncPointer(45, -0.13, -0.16)).toBe(174);
  });

  it("keeps clear horizontal pointer positions facing horizontally", () => {
    expect(frameForKvSyncPointer(112, 0.3, 0.12)).toBe(30);
    expect(frameForKvSyncPointer(248, -0.3, 0.12)).toBe(103);
  });

  it("preserves vertical tracking outside the monitor area", () => {
    expect(frameForKvSyncPointer(0, 0, -0.3)).toBe(65);
    expect(frameForKvSyncPointer(180, 0, 0.3)).toBe(138);
  });
});
