import { shortestFrameDelta } from "@/lib/portfolio/sprite";

export const KV_SYNC_FRAME_COUNT = 193;
export const KV_SYNC_WIDTH = 1280;
export const KV_SYNC_HEIGHT = 720;
export const KV_SYNC_NEUTRAL_FRAME = 174;
export const KV_SYNC_HEAD_ANCHOR = { x: 0.5, y: 0.33 } as const;

const FULL_FRAME_KEYS = [
  [0, 138],
  [45, 162],
  [90, 30],
  [135, 49],
  [180, 65],
  [225, 84],
  [270, 103],
  [315, 119],
  [360, 138],
] as const;

function normalizeFrame(frame: number): number {
  return (
    ((Math.round(frame) % KV_SYNC_FRAME_COUNT) + KV_SYNC_FRAME_COUNT) %
    KV_SYNC_FRAME_COUNT
  );
}

export function kvSyncFrameSrc(frame: number): string {
  return `/kv-sync-test/frames/frame-${normalizeFrame(frame)
    .toString()
    .padStart(3, "0")}.webp`;
}

export function frameForKvSyncAngle(angle: number): number {
  // Pointer direction and the filmed subject's facing direction use opposite
  // viewpoints, so rotate once before looking up the source-video pose.
  const normalized = (((angle + 180) % 360) + 360) % 360;

  for (let index = 0; index < FULL_FRAME_KEYS.length - 1; index += 1) {
    const [angleA, frameA] = FULL_FRAME_KEYS[index];
    const [angleB, frameB] = FULL_FRAME_KEYS[index + 1];

    if (normalized >= angleA && normalized <= angleB) {
      const progress = (normalized - angleA) / (angleB - angleA);
      const interpolated =
        frameA +
        shortestFrameDelta(
          frameB,
          frameA,
          KV_SYNC_FRAME_COUNT,
        ) *
          progress;

      return normalizeFrame(interpolated);
    }
  }

  return FULL_FRAME_KEYS[0][1];
}
