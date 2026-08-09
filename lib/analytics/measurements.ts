import type { ProjectId } from "@/lib/portfolio/projects";

interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export const HEATMAP_SEGMENT_COUNT = 10;

export function calculateScrollDepth({
  scrollTop,
  scrollHeight,
  clientHeight,
}: {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}) {
  const scrollable = scrollHeight - clientHeight;
  if (scrollable <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((scrollTop / scrollable) * 100)));
}

export function createActiveDwellClock(now: () => number = () => performance.now()) {
  let accumulated = 0;
  let activeSince: number | null = null;
  return {
    start() {
      if (activeSince === null) activeSince = now();
    },
    pause() {
      if (activeSince === null) return;
      accumulated += Math.max(0, now() - activeSince);
      activeSince = null;
    },
    read() {
      return Math.round(
        accumulated + (activeSince === null ? 0 : Math.max(0, now() - activeSince)),
      );
    },
  };
}

export function segmentIndexAtViewportCenter({
  scrollTop,
  scrollHeight,
  clientHeight,
}: ScrollMetrics) {
  if (scrollHeight <= clientHeight || scrollHeight <= 0) return 0;
  const center = Math.min(scrollHeight, Math.max(0, scrollTop + clientHeight / 2));
  return Math.min(
    HEATMAP_SEGMENT_COUNT - 1,
    Math.floor((center / scrollHeight) * HEATMAP_SEGMENT_COUNT),
  );
}

export function createSegmentDwellTracker(now: () => number = () => performance.now()) {
  const dwell = Array.from({ length: HEATMAP_SEGMENT_COUNT }, () => 0);
  let activeIndex: number | null = null;
  let startedAt = 0;
  const clampIndex = (index: number) => Math.min(
    HEATMAP_SEGMENT_COUNT - 1,
    Math.max(0, Math.floor(index)),
  );
  const flush = () => {
    if (activeIndex === null) return;
    const next = now();
    dwell[activeIndex] += Math.max(0, next - startedAt);
    startedAt = next;
  };

  return {
    start(index: number) {
      if (activeIndex !== null) flush();
      activeIndex = clampIndex(index);
      startedAt = now();
    },
    move(index: number) {
      if (activeIndex === null) return;
      flush();
      activeIndex = clampIndex(index);
    },
    pause() {
      flush();
      activeIndex = null;
    },
    read() {
      flush();
      return dwell.map(Math.round);
    },
  };
}

const CASE_PATHS: Readonly<Record<string, ProjectId>> = {
  "/about": "about",
  "/work/business": "business",
  "/work/brand-system": "brand-system",
  "/work/product-launch": "product-launch",
  "/work/launch-event": "launch-event",
};

export function projectIdFromPathname(pathname: string) {
  return CASE_PATHS[pathname] ?? null;
}
