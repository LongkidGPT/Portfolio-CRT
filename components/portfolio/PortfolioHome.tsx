"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { PROJECTS, getProjectById, type ProjectId } from "@/lib/portfolio/projects";
import { initialPortfolioState, portfolioReducer } from "@/lib/portfolio/state";
import type { Point } from "@/lib/portfolio/sprite";
import PortfolioChrome from "./PortfolioChrome";
import ProjectPreview from "./ProjectPreview";
import ProjectSelector from "./ProjectSelector";
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

export default function PortfolioHome() {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotionPreference();
  const [state, dispatch] = useReducer(portfolioReducer, initialPortfolioState);
  const [focusPoint, setFocusPoint] = useState<Point | null>(null);
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
    if (!window.matchMedia?.("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) => setFocusPoint({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const preview = useCallback((id: ProjectId, point: Point) => {
    dispatch({ type: "PREVIEW", projectId: id });
    setFocusPoint(point);
    router.prefetch(getProjectById(id).href);
  }, [router]);

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
        <SpritePortrait focusPoint={focusPoint} motionReduced={reduced} className={styles.portrait} />
      </div>
      <ProjectSelector projects={PROJECTS} activeProject={state.activeProject} onPreview={preview} onOpen={open} />
    </main>
  );
}
