"use client";

import { useEffect, useState } from "react";

import styles from "./mobile-frame-calibration.module.css";
import {
  MOBILE_KV_FRAME_COUNT,
  MOBILE_KV_NEUTRAL_FRAME,
  mobileKvFrameSrc,
} from "@/lib/portfolio/kv-mobile";
import { PROJECTS, type ProjectId } from "@/lib/portfolio/projects";

const STORAGE_KEY = "portfolio-mobile-frame-calibration";
const PROJECT_IDS = PROJECTS.map(({ id }) => id);
const INITIAL_FRAMES = Object.fromEntries(
  PROJECT_IDS.map((id) => [id, MOBILE_KV_NEUTRAL_FRAME]),
) as Record<ProjectId, number>;

function normalizeFrame(frame: number) {
  return ((frame % MOBILE_KV_FRAME_COUNT) + MOBILE_KV_FRAME_COUNT)
    % MOBILE_KV_FRAME_COUNT;
}

export default function MobileFrameCalibration() {
  const [activeProject, setActiveProject] = useState<ProjectId>("about");
  const [frames, setFrames] = useState(INITIAL_FRAMES);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const frame = frames[activeProject];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storage = window.localStorage;
        const saved = storage?.getItem(STORAGE_KEY);
        if (saved) setFrames({ ...INITIAL_FRAMES, ...JSON.parse(saved) });
      } catch {
        window.localStorage?.removeItem(STORAGE_KEY);
      }
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(frames));
  }, [frames, hydrated]);

  const selectFrame = (next: number) => {
    setFrames((current) => ({
      ...current,
      [activeProject]: normalizeFrame(next),
    }));
  };

  const nearbyFrames = Array.from(
    { length: 9 },
    (_, index) => normalizeFrame(frame + index - 4),
  );

  return (
    <main className={styles.page}>
      <section className={styles.preview}>
        {/* Calibration must display the exact extracted source pixels. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mobileKvFrameSrc(frame)}
          alt={`${PROJECTS.find(({ id }) => id === activeProject)?.label} frame ${frame}`}
        />
        <span>FRAME {String(frame).padStart(3, "0")} / 192</span>
      </section>

      <section className={styles.panel}>
        <header>
          <p>MOBILE KV · FRAME CALIBRATION</p>
          <h1>为五个项目选择形象画面</h1>
          <span>选择会自动保存在当前浏览器中。</span>
        </header>

        <nav className={styles.projects} aria-label="Calibration projects">
          {PROJECTS.map((project) => (
            <button
              key={project.id}
              type="button"
              data-active={project.id === activeProject ? "" : undefined}
              onClick={() => setActiveProject(project.id)}
            >
              <span>{project.label}</span>
              <b>{String(frames[project.id]).padStart(3, "0")}</b>
            </button>
          ))}
        </nav>

        <div className={styles.scrubber}>
          <button type="button" onClick={() => selectFrame(frame - 1)} aria-label="Previous frame">←</button>
          <input
            type="range"
            min="0"
            max={MOBILE_KV_FRAME_COUNT - 1}
            value={frame}
            aria-label="Frame"
            onChange={(event) => selectFrame(Number(event.currentTarget.value))}
          />
          <button type="button" onClick={() => selectFrame(frame + 1)} aria-label="Next frame">→</button>
        </div>

        <div className={styles.frames} aria-label="Nearby frames">
          {nearbyFrames.map((nearbyFrame) => (
            <button
              key={nearbyFrame}
              type="button"
              data-active={nearbyFrame === frame ? "" : undefined}
              onClick={() => selectFrame(nearbyFrame)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mobileKvFrameSrc(nearbyFrame)} alt="" />
              <span>{String(nearbyFrame).padStart(3, "0")}</span>
            </button>
          ))}
        </div>

        <div className={styles.summary}>
          <div>
            {PROJECTS.map((project) => (
              <p key={project.id}>
                <span>{project.label}</span>
                <b>{String(frames[project.id]).padStart(3, "0")}</b>
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(JSON.stringify(frames));
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? "已复制" : "复制帧位数据"}
          </button>
        </div>
      </section>
    </main>
  );
}
