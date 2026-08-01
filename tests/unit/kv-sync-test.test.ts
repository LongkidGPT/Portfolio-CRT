import { describe, expect, it } from "vitest";

import {
  KV_SYNC_FRAME_COUNT,
  KV_SYNC_HEIGHT,
  KV_SYNC_WIDTH,
  frameForKvSyncAngle,
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
    [0, 138],
    [90, 30],
    [180, 65],
    [270, 103],
    [360, 138],
  ])("maps %d degrees to source frame %d", (angle, frame) => {
    expect(frameForKvSyncAngle(angle)).toBe(frame);
  });
});
