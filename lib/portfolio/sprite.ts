export interface Point {
  x: number;
  y: number;
}

export function frameForAngle(
  angle: number,
  frameCount: number,
  frameOffset = 0,
): number {
  const normalized = ((angle % 360) + 360) % 360;

  return (
    (((normalized / 360) * frameCount + frameOffset) % frameCount +
      frameCount) %
    frameCount
  );
}

export function shortestFrameDelta(
  target: number,
  current: number,
  count: number,
): number {
  let delta = target - current;

  if (delta > count / 2) delta -= count;
  if (delta < -count / 2) delta += count;

  return delta;
}

const POINTER_FRAME_KEYS = [
  [0, 51],
  [45, 60],
  [90, 11],
  [135, 18],
  [180, 24],
  [225, 31],
  [270, 38],
  [315, 44],
  [360, 51],
] as const;

export function frameForPointerAngle(angle: number): number {
  const normalized = ((angle % 360) + 360) % 360;

  for (let index = 0; index < POINTER_FRAME_KEYS.length - 1; index += 1) {
    const [angleA, frameA] = POINTER_FRAME_KEYS[index];
    const [angleB, frameB] = POINTER_FRAME_KEYS[index + 1];

    if (normalized >= angleA && normalized <= angleB) {
      const progress = (normalized - angleA) / (angleB - angleA);
      const frame =
        frameA + shortestFrameDelta(frameB, frameA, 72) * progress;

      return ((frame % 72) + 72) % 72;
    }
  }

  return POINTER_FRAME_KEYS[0][1];
}

export function pointerAngle(point: Point, anchor: Point): number {
  return (
    (Math.atan2(point.x - anchor.x, -(point.y - anchor.y)) * 180) /
      Math.PI +
    360
  ) % 360;
}
