export const MOBILE_KV_FRAME_COUNT = 193;
export const MOBILE_KV_WIDTH = 720;
export const MOBILE_KV_HEIGHT = 1280;
export const MOBILE_KV_NEUTRAL_FRAME = 124;

export function mobileKvFrameSrc(index: number): string {
  const normalized =
    ((Math.round(index) % MOBILE_KV_FRAME_COUNT) + MOBILE_KV_FRAME_COUNT) %
    MOBILE_KV_FRAME_COUNT;
  return `/kv-mobile/frames/frame-${String(normalized).padStart(3, "0")}.webp`;
}
