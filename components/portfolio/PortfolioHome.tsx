"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { PROJECTS, getProjectById, type ProjectId } from "@/lib/portfolio/projects";
import { initialPortfolioState, portfolioReducer } from "@/lib/portfolio/state";
import type { Point } from "@/lib/portfolio/sprite";
import { KV_PROJECT_FRAMES } from "@/lib/portfolio/kv";
import { KV_SYNC_PROJECT_FRAMES } from "@/lib/portfolio/kv-sync-test";
import PortfolioChrome from "./PortfolioChrome";
import ProjectPreview from "./ProjectPreview";
import ProjectSelector from "./ProjectSelector";
import R3Portrait from "./R3Portrait";
import SpritePortrait from "./SpritePortrait";
import styles from "./portfolio.module.css";

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useDesktopR3() {
  const [desktop, setDesktop] = useState(true);

  useEffect(() => {
    const query = window.matchMedia?.("(min-width: 768px)");
    if (!query) return;
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return desktop;
}

export default function PortfolioHome() {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotionPreference();
  const desktopR3 = useDesktopR3();
  const [state, dispatch] = useReducer(portfolioReducer, initialPortfolioState);
  const [focusPoint, setFocusPoint] = useState<Point | null>(null);
  const [focusFrame, setFocusFrame] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (
      pathname === "/" &&
      (state.phase === "open" || state.phase === "closing")
    ) {
      dispatch({ type: "CLOSED" });
    } else if (pathname !== "/" && state.phase === "zooming") {
      dispatch({ type: "OPENED" });
    }
  }, [pathname, state.phase]);

  useEffect(() => {
    if (desktopR3) return;
    if (!window.matchMedia?.("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) => setFocusPoint({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [desktopR3]);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const preview = useCallback((id: ProjectId, point: Point) => {
    dispatch({ type: "PREVIEW", projectId: id });
    setFocusPoint(point);
    setFocusFrame(
      desktopR3 ? KV_SYNC_PROJECT_FRAMES[id] : KV_PROJECT_FRAMES[id],
    );
    router.prefetch(getProjectById(id).href);
  }, [desktopR3, router]);

  const open = useCallback((id: ProjectId) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    dispatch({ type: "OPEN_REQUESTED", projectId: id });
    timer.current = window.setTimeout(
      () => router.push(getProjectById(id).href),
      reduced ? 100 : 720,
    );
  }, [reduced, router]);

  return (
    <main className={styles.home} data-phase={state.phase} data-project={state.activeProject}>
      <PortfolioChrome
        activeIndex={PROJECTS.findIndex(({ id }) => id === state.activeProject)}
      />
      <div className={styles.previewStage}>
        <ProjectPreview project={getProjectById(state.activeProject)} />
      </div>
      <div className={styles.portraitStage}>
        {desktopR3 ? (
          <R3Portrait
            fixedFrame={focusFrame}
            motionReduced={reduced}
            className={styles.portrait}
          />
        ) : (
          <SpritePortrait
            focusPoint={focusPoint}
            focusFrame={focusFrame}
            motionReduced={reduced}
            className={styles.portrait}
          />
        )}
      </div>
      <ProjectSelector projects={PROJECTS} activeProject={state.activeProject} onPreview={preview} onOpen={open} onResumePointer={() => setFocusFrame(null)} />
    </main>
  );
}
