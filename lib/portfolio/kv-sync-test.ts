import { shortestFrameDelta } from "@/lib/portfolio/sprite";
import type { ProjectId } from "@/lib/portfolio/projects";

export const KV_SYNC_FRAME_COUNT = 193;
export const KV_SYNC_WIDTH = 1920;
export const KV_SYNC_HEIGHT = 1080;
export const KV_SYNC_NEUTRAL_FRAME = 80;
export const KV_SYNC_HEAD_ANCHOR = { x: 0.614, y: 0.478 } as const;
export const KV_SYNC_PROJECT_FRAMES = {
  about: 118,
  business: 128,
  "brand-system": 140,
  "product-launch": 154,
  "launch-event": 157,
} as const satisfies Record<ProjectId, number>;

const KV_SYNC_NEUTRAL_ZONE = { x: 0.14, y: 0.18 } as const;
const KV_SYNC_NEUTRAL_BLEND = 0.5;
const KV_SYNC_RIGHT_FRAME_BAND = [49, 59, 69] as const;
const KV_SYNC_LEFT_FRAME_BAND = [93, 105, 118] as const;

const FULL_FRAME_KEYS = [
  [0, 73],
  [45, 65],
  [90, 64],
  [135, 154],
  [180, 140],
  [225, 118],
  [270, 117],
  [315, 93],
  [360, 73],
] as const;

function normalizeFrameValue(frame: number): number {
  return (
    ((frame % KV_SYNC_FRAME_COUNT) + KV_SYNC_FRAME_COUNT) %
    KV_SYNC_FRAME_COUNT
  );
}

function frameWithinSideBand(
  normalizedY: number,
  [top, middle, bottom]: readonly [number, number, number],
): number {
  if (normalizedY <= 0) {
    const progress = Math.min(
      1,
      Math.max(0, -normalizedY / KV_SYNC_HEAD_ANCHOR.y),
    );
    return middle + (top - middle) * progress;
  }

  const progress = Math.min(
    1,
    Math.max(0, normalizedY / (1 - KV_SYNC_HEAD_ANCHOR.y)),
  );
  return middle + (bottom - middle) * progress;
}

export function kvSyncFrameSrc(frame: number): string {
  const normalized =
    Math.round(normalizeFrameValue(frame)) % KV_SYNC_FRAME_COUNT;

  return `/kv-desktop-r5/frames/frame-${normalized.toString().padStart(3, "0")}.webp`;
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

export function angleForKvSyncPointer(
  normalizedX: number,
  normalizedY: number,
): number {
  const scaledX =
    normalizedX /
    (normalizedX >= 0
      ? 1 - KV_SYNC_HEAD_ANCHOR.x
      : KV_SYNC_HEAD_ANCHOR.x);
  const scaledY =
    normalizedY /
    (normalizedY >= 0
      ? 1 - KV_SYNC_HEAD_ANCHOR.y
      : KV_SYNC_HEAD_ANCHOR.y);

  return (
    (Math.atan2(scaledX, -scaledY) * 180) / Math.PI +
    360
  ) % 360;
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

  if (normalizedX > KV_SYNC_NEUTRAL_ZONE.x) {
    return frameWithinSideBand(normalizedY, KV_SYNC_RIGHT_FRAME_BAND);
  }

  if (normalizedX < -KV_SYNC_NEUTRAL_ZONE.x) {
    return frameWithinSideBand(normalizedY, KV_SYNC_LEFT_FRAME_BAND);
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
