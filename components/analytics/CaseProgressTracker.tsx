"use client";

import { useEffect } from "react";
import {
  calculateScrollDepth,
  createActiveDwellClock,
  projectIdFromPathname,
} from "@/lib/analytics/measurements";
import type { ProjectId } from "@/lib/portfolio/projects";

export default function CaseProgressTracker({
  pathname,
  onProgress,
  now = () => performance.now(),
}: {
  pathname: string;
  onProgress: (projectId: ProjectId, maxDepth: number, activeDwellMs: number) => void;
  now?: () => number;
}) {
  useEffect(() => {
    const projectId = projectIdFromPathname(pathname);
    if (!projectId) return;

    const root = document.querySelector<HTMLElement>("[data-analytics-scroll-root]");
    const target: Window | HTMLElement = root ?? window;
    const clock = createActiveDwellClock(now);
    let maxDepth = 0;
    let lastReportedDepth = -5;
    let frame = 0;

    const readDepth = () => {
      if (root) {
        return calculateScrollDepth({
          scrollTop: root.scrollTop,
          scrollHeight: root.scrollHeight,
          clientHeight: root.clientHeight,
        });
      }
      const documentElement = document.documentElement;
      return calculateScrollDepth({
        scrollTop: window.scrollY || documentElement.scrollTop,
        scrollHeight: documentElement.scrollHeight,
        clientHeight: window.innerHeight,
      });
    };

    const emit = (force = false) => {
      maxDepth = Math.max(maxDepth, readDepth());
      if (!force && maxDepth < lastReportedDepth + 5) return;
      lastReportedDepth = maxDepth;
      onProgress(projectId, maxDepth, clock.read());
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        emit();
      });
    };

    const visibilityChanged = () => {
      if (document.visibilityState === "hidden") {
        clock.pause();
        emit(true);
      } else {
        clock.start();
      }
    };

    if (document.visibilityState !== "hidden") clock.start();
    target.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", visibilityChanged);
    const heartbeat = window.setInterval(() => emit(true), 15_000);
    emit(true);

    return () => {
      clock.pause();
      emit(true);
      target.removeEventListener("scroll", schedule);
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.clearInterval(heartbeat);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [now, onProgress, pathname]);

  return null;
}
