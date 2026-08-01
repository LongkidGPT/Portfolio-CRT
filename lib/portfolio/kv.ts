export const KV_FRAME_COUNT = 72;
export const KV_WIDTH = 1470;
export const KV_HEIGHT = 630;
export const KV_NEUTRAL_FRAME = 65;
export const KV_HEAD_ANCHOR = { x: 0.5, y: 0.33 } as const;
export const KV_PROJECT_FRAMES = {
  about: 32,
  business: 30,
  "brand-system": 27,
  "product-launch": 25,
  "launch-event": 22,
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

export function portraitRect(targetWidth: number, targetHeight: number): Rect {
  if (targetWidth <= 767) {
    const height = targetHeight * 0.49;
    const width = height * (KV_WIDTH / KV_HEIGHT);

    return {
      x: (targetWidth - width) / 2,
      y: targetHeight * 0.1,
      width,
      height,
    };
  }

  const contained = containRect(KV_WIDTH, KV_HEIGHT, targetWidth, targetHeight);

  return {
    x: contained.x + targetWidth * 0.176,
    y: contained.y + targetHeight * 0.14,
    width: contained.width * 0.86,
    height: contained.height * 0.86,
  };
}
