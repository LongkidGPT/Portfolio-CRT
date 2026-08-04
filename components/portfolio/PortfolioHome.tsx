"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { PROJECTS, getProjectById, type ProjectId } from "@/lib/portfolio/projects";
import { initialPortfolioState, portfolioReducer } from "@/lib/portfolio/state";
import { KV_PROJECT_FRAMES } from "@/lib/portfolio/kv";
import { KV_SYNC_PROJECT_FRAMES } from "@/lib/portfolio/kv-sync-test";
import PortfolioChrome from "./PortfolioChrome";
import FullFramePortrait from "./FullFramePortrait";
import MobileFramePortrait from "./MobileFramePortrait";
import ProjectPreview from "./ProjectPreview";
import ProjectSelector from "./ProjectSelector";
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

function useDesktopFullFrame() {
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
  const desktopFullFrame = useDesktopFullFrame();
  const [state, dispatch] = useReducer(portfolioReducer, initialPortfolioState);
  const [previewedProject, setPreviewedProject] = useState<ProjectId | null>(null);
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

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const preview = useCallback((id: ProjectId) => {
    dispatch({ type: "PREVIEW", projectId: id });
    setPreviewedProject(id);
    setFocusFrame(
      desktopFullFrame ? KV_SYNC_PROJECT_FRAMES[id] : KV_PROJECT_FRAMES[id],
    );
    router.prefetch(getProjectById(id).href);
  }, [desktopFullFrame, router]);

  const resumePointer = useCallback(() => {
    if (!desktopFullFrame) return;
    dispatch({ type: "PREVIEW", projectId: "about" });
    setPreviewedProject(null);
    setFocusFrame(null);
  }, [desktopFullFrame]);

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
        activeIndex={previewedProject === null
          ? null
          : PROJECTS.findIndex(({ id }) => id === previewedProject)}
      />
      <div className={styles.previewStage}>
        <ProjectPreview project={getProjectById(state.activeProject)} />
      </div>
      <div className={styles.portraitStage}>
        {desktopFullFrame ? (
          <FullFramePortrait
            fixedFrame={focusFrame}
            motionReduced={reduced}
            className={styles.portrait}
          />
        ) : (
          <MobileFramePortrait className={styles.portrait} />
        )}
      </div>
      <ProjectSelector
        projects={PROJECTS}
        activeProject={state.activeProject}
        previewedProject={previewedProject}
        activatedProject={state.phase === "zooming" ? state.activeProject : null}
        onPreview={preview}
        onOpen={open}
        onResumePointer={resumePointer}
      />
    </main>
  );
}
