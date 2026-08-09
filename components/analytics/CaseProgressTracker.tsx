"use client";

import { useEffect } from "react";
import {
  calculateScrollDepth,
  createActiveDwellClock,
  createSegmentDwellTracker,
  projectIdFromPathname,
  segmentIndexAtViewportCenter,
} from "@/lib/analytics/measurements";
import type { ProjectId } from "@/lib/portfolio/projects";

export default function CaseProgressTracker({
  pathname,
  onProgress,
  now = () => performance.now(),
}: {
  pathname: string;
  onProgress: (
    projectId: ProjectId,
    caseViewId: string,
    maxDepth: number,
    activeDwellMs: number,
    segmentDwellMs: number[],
  ) => void;
  now?: () => number;
}) {
  useEffect(() => {
    const projectId = projectIdFromPathname(pathname);
    if (!projectId) return;

    const root = document.querySelector<HTMLElement>("[data-analytics-scroll-root]");
    const target: Window | HTMLElement = root ?? window;
    const clock = createActiveDwellClock(now);
    const segmentTracker = createSegmentDwellTracker(now);
    const caseViewId = crypto.randomUUID();
    let maxDepth = 0;
    let lastReportedDepth = -5;
    let frame = 0;

    const readMetrics = () => {
      if (root) {
        return {
          scrollTop: root.scrollTop,
          scrollHeight: root.scrollHeight,
          clientHeight: root.clientHeight,
        };
      }
      const documentElement = document.documentElement;
      return {
        scrollTop: window.scrollY || documentElement.scrollTop,
        scrollHeight: documentElement.scrollHeight,
        clientHeight: window.innerHeight,
      };
    };

    const emit = (force = false) => {
      const metrics = readMetrics();
      maxDepth = Math.max(maxDepth, calculateScrollDepth(metrics));
      if (!force && maxDepth < lastReportedDepth + 5) return;
      lastReportedDepth = maxDepth;
      onProgress(projectId, caseViewId, maxDepth, clock.read(), segmentTracker.read());
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        segmentTracker.move(segmentIndexAtViewportCenter(readMetrics()));
        emit();
      });
    };

    const visibilityChanged = () => {
      if (document.visibilityState === "hidden") {
        clock.pause();
        segmentTracker.pause();
        emit(true);
      } else {
        clock.start();
        segmentTracker.start(segmentIndexAtViewportCenter(readMetrics()));
      }
    };

    if (document.visibilityState !== "hidden") {
      clock.start();
      segmentTracker.start(segmentIndexAtViewportCenter(readMetrics()));
    }
    target.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", visibilityChanged);
    const heartbeat = window.setInterval(() => emit(true), 15_000);
    emit(true);

    return () => {
      clock.pause();
      segmentTracker.pause();
      emit(true);
      target.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.clearInterval(heartbeat);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [now, onProgress, pathname]);

  return null;
}
