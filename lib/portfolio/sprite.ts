const ANGLE_KEYS = [
  [0, 0],
  [22.5, 5],
  [45, 10],
  [67.5, 15],
  [90, 20],
  [112.5, 25],
  [135, 30],
  [157.5, 34],
  [180, 38],
  [202.5, 42],
  [225, 46],
  [247.5, 50],
  [270, 54],
  [292.5, 58],
  [315, 61],
  [337.5, 63],
  [360, 64],
] as const;

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function frameForAngle(angle: number): number {
  const normalized = ((angle % 360) + 360) % 360;

  for (let index = 0; index < ANGLE_KEYS.length - 1; index += 1) {
    const [angleA, frameA] = ANGLE_KEYS[index];
    const [angleB, frameB] = ANGLE_KEYS[index + 1];

    if (normalized >= angleA && normalized <= angleB) {
      const progress = (normalized - angleA) / (angleB - angleA);
      return frameA + (frameB - frameA) * progress;
    }
  }

  return 0;
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

export function pointerAngle(point: Point, bounds: Bounds): number {
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;

  return (
    (Math.atan2(point.x - centerX, -(point.y - centerY)) * 180) / Math.PI +
    360
  ) % 360;
}
