export const KV_FRAME_COUNT = 72;
export const KV_WIDTH = 1470;
export const KV_HEIGHT = 630;
export const KV_NEUTRAL_FRAME = 54;
export const KV_HEAD_ANCHOR = { x: 0.62, y: 0.43 } as const;
export const KV_PROJECT_FRAMES = {
  about: 20,
  business: 18,
  "brand-system": 15,
  "product-launch": 13,
  "launch-event": 11,
} as const;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function kvFrameSrc(index: number): string {
  const normalized =
    ((Math.round(index) % KV_FRAME_COUNT) + KV_FRAME_COUNT) % KV_FRAME_COUNT;

  return `/kv/frames/frame-${String(normalized).padStart(3, "0")}.webp`;
}

export function containRect(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): Rect {
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;

  return {
    x: (targetWidth - width) / 2,
    y: (targetHeight - height) / 2,
    width,
    height,
  };
}
