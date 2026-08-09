import type { ProjectId } from "@/lib/portfolio/projects";

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
