import { shortestFrameDelta } from "@/lib/portfolio/sprite";

export const KV_SYNC_FRAME_COUNT = 193;
export const KV_SYNC_WIDTH = 1470;
export const KV_SYNC_HEIGHT = 630;
export const KV_SYNC_NEUTRAL_FRAME = 174;
export const KV_SYNC_HEAD_ANCHOR = { x: 0.598, y: 0.423 } as const;

const KV_SYNC_NEUTRAL_ZONE = { x: 0.14, y: 0.18 } as const;
const KV_SYNC_NEUTRAL_BLEND = 0.5;

const FULL_FRAME_KEYS = [
  [0, 52],
  [45, 38],
  [90, 24],
  [135, 178],
  [180, 152],
  [225, 118],
  [270, 96],
  [315, 74],
  [360, 52],
] as const;

function normalizeFrameValue(frame: number): number {
  return (
    ((frame % KV_SYNC_FRAME_COUNT) + KV_SYNC_FRAME_COUNT) %
    KV_SYNC_FRAME_COUNT
  );
}

export function kvSyncFrameSrc(frame: number): string {
  const normalized =
    Math.round(normalizeFrameValue(frame)) % KV_SYNC_FRAME_COUNT;

  return `/kv-sync-test/frames/frame-${normalized.toString().padStart(3, "0")}.webp`;
}

export function frameForKvSyncAngle(angle: number): number {
  const normalized = ((angle % 360) + 360) % 360;

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

      return normalizeFrameValue(interpolated);
    }
  }

  return FULL_FRAME_KEYS[0][1];
}

export function frameForKvSyncPointer(
  angle: number,
  normalizedX: number,
  normalizedY: number,
): number {
  const zoneDistance = Math.max(
    Math.abs(normalizedX) / KV_SYNC_NEUTRAL_ZONE.x,
    Math.abs(normalizedY) / KV_SYNC_NEUTRAL_ZONE.y,
  );

  if (zoneDistance <= 1) {
    return KV_SYNC_NEUTRAL_FRAME;
  }

  const directionalFrame = frameForKvSyncAngle(angle);
  if (zoneDistance >= 1 + KV_SYNC_NEUTRAL_BLEND) return directionalFrame;

  const linearProgress = (zoneDistance - 1) / KV_SYNC_NEUTRAL_BLEND;
  const smoothProgress =
    linearProgress * linearProgress * (3 - 2 * linearProgress);
  const delta = shortestFrameDelta(
    directionalFrame,
    KV_SYNC_NEUTRAL_FRAME,
    KV_SYNC_FRAME_COUNT,
  );

  return normalizeFrameValue(KV_SYNC_NEUTRAL_FRAME + delta * smoothProgress);
}

export function stepKvSyncFrame(
  current: number,
  target: number,
  elapsedMs: number,
): number {
  const delta = shortestFrameDelta(target, current, KV_SYNC_FRAME_COUNT);
  if (Math.abs(delta) < 0.12) return normalizeFrameValue(target);

  const seconds = Math.min(Math.max(elapsedMs, 0), 32) / 1000;
  if (seconds === 0) return normalizeFrameValue(current);

  const easedStep = delta * (1 - Math.exp(-seconds / 0.08));
  const maxStep = 90 * seconds;
  const step = Math.max(-maxStep, Math.min(maxStep, easedStep));

  return normalizeFrameValue(current + step);
}
