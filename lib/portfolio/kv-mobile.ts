import type { ProjectId } from "@/lib/portfolio/projects";
import { shortestFrameDelta } from "@/lib/portfolio/sprite";

export const MOBILE_KV_FRAME_COUNT = 193;
export const MOBILE_KV_WIDTH = 720;
export const MOBILE_KV_HEIGHT = 1280;
export const MOBILE_KV_NEUTRAL_FRAME = 124;
export const MOBILE_KV_PROJECT_FRAMES = {
  about: 63,
  business: 135,
  "brand-system": 131,
  "product-launch": 96,
  "launch-event": 120,
} as const satisfies Record<ProjectId, number>;

export function normalizeMobileKvFrame(frame: number): number {
  return (
    ((frame % MOBILE_KV_FRAME_COUNT) + MOBILE_KV_FRAME_COUNT) %
    MOBILE_KV_FRAME_COUNT
  );
}

export function mobileKvFrameSrc(index: number): string {
  const normalized = normalizeMobileKvFrame(Math.round(index));
  return `/kv-mobile/frames/frame-${String(normalized).padStart(3, "0")}.webp`;
}

export function stepMobileKvFrame(
  current: number,
  target: number,
  elapsedMs: number,
): number {
  const delta = shortestFrameDelta(
    target,
    current,
    MOBILE_KV_FRAME_COUNT,
  );
  if (Math.abs(delta) < 0.12) return normalizeMobileKvFrame(target);

  const seconds = Math.min(Math.max(elapsedMs, 0), 32) / 1000;
  if (seconds === 0) return normalizeMobileKvFrame(current);

  const easedStep = delta * (1 - Math.exp(-seconds / 0.06));
  const maxStep = 160 * seconds;
  const step = Math.max(-maxStep, Math.min(maxStep, easedStep));

  return normalizeMobileKvFrame(current + step);
}
