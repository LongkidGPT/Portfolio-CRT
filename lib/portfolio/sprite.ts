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

export function pointerAngle(point: Point, anchor: Point): number {
  return (
    (Math.atan2(point.x - anchor.x, -(point.y - anchor.y)) * 180) /
      Math.PI +
    360
  ) % 360;
}
