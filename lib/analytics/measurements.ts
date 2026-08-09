import type { ProjectId } from "@/lib/portfolio/projects";
import type { JourneyMatrixSnapshot } from "./types";

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

export function createJourneyMatrixTracker(
  sectionLabels: readonly string[],
  now: () => number = () => performance.now(),
  bucketMs = 5000,
) {
  const labels = [...sectionLabels];
  const cells = labels.map(() => [] as number[]);
  let activeSection: number | null = null;
  let startedAt = 0;
  let activeElapsedMs = 0;
  const safeBucketMs = Math.max(1, Math.round(bucketMs));
  const clampSection = (index: number) => Math.min(
    Math.max(0, labels.length - 1),
    Math.max(0, Math.floor(index)),
  );
  const flush = () => {
    if (activeSection === null || labels.length === 0) return;
    const next = now();
    let remaining = Math.max(0, next - startedAt);
    while (remaining > 0) {
      const bucketIndex = Math.floor(activeElapsedMs / safeBucketMs);
      const space = safeBucketMs - (activeElapsedMs % safeBucketMs);
      const amount = Math.min(space, remaining);
      cells[activeSection][bucketIndex] = (cells[activeSection][bucketIndex] ?? 0) + amount;
      activeElapsedMs += amount;
      remaining -= amount;
    }
    startedAt = next;
  };

  return {
    start(sectionIndex: number) {
      if (activeSection !== null) flush();
      if (labels.length === 0) return;
      activeSection = clampSection(sectionIndex);
      startedAt = now();
    },
    move(sectionIndex: number) {
      if (activeSection === null || labels.length === 0) return;
      flush();
      activeSection = clampSection(sectionIndex);
    },
    pause() {
      flush();
      activeSection = null;
    },
    read(): JourneyMatrixSnapshot {
      flush();
      const columnCount = Math.max(1, Math.ceil(activeElapsedMs / safeBucketMs));
      return {
        sectionLabels: labels,
        bucketMs: safeBucketMs,
        cells: cells.map((row) => Array.from(
          { length: columnCount },
          (_, index) => Math.round(row[index] ?? 0),
        )),
      };
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
