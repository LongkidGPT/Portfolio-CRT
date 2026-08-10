"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { PROJECTS, getProjectById, type ProjectId } from "@/lib/portfolio/projects";
import { initialPortfolioState, portfolioReducer } from "@/lib/portfolio/state";
import {
  KV_SYNC_HEIGHT,
  KV_SYNC_NEUTRAL_FRAME,
  KV_SYNC_PROJECT_FRAMES,
  KV_SYNC_WIDTH,
  kvSyncFrameSrc,
} from "@/lib/portfolio/kv-sync-test";
import {
  MOBILE_KV_HEIGHT,
  MOBILE_KV_NEUTRAL_FRAME,
  MOBILE_KV_PROJECT_FRAMES,
  MOBILE_KV_WIDTH,
  mobileKvFrameSrc,
} from "@/lib/portfolio/kv-mobile";
import { useAnalytics } from "@/components/analytics/useAnalytics";
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
  const [desktop, setDesktop] = useState<boolean | null>(null);

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
  const { trackProjectClick } = useAnalytics();
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
      desktopFullFrame ? KV_SYNC_PROJECT_FRAMES[id] : null,
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
    const project = getProjectById(id);
    trackProjectClick({ id: project.id, label: project.label });
    dispatch({ type: "OPEN_REQUESTED", projectId: id });
    timer.current = window.setTimeout(
      () => router.push(getProjectById(id).href),
      reduced ? 100 : 720,
    );
  }, [reduced, router, trackProjectClick]);

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
        {desktopFullFrame === null ? (
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet={mobileKvFrameSrc(MOBILE_KV_NEUTRAL_FRAME)}
              width={MOBILE_KV_WIDTH}
              height={MOBILE_KV_HEIGHT}
            />
            <img
              className={styles.portrait}
              src={kvSyncFrameSrc(KV_SYNC_NEUTRAL_FRAME)}
              width={KV_SYNC_WIDTH}
              height={KV_SYNC_HEIGHT}
              alt="Portfolio CRT portrait"
              decoding="async"
            />
          </picture>
        ) : desktopFullFrame ? (
          <FullFramePortrait
            fixedFrame={focusFrame}
            motionReduced={reduced}
            className={styles.portrait}
          />
        ) : (
          <MobileFramePortrait
            fixedFrame={MOBILE_KV_PROJECT_FRAMES[state.activeProject]}
            motionReduced={reduced}
            className={styles.portrait}
          />
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
