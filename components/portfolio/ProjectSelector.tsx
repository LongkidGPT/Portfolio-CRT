"use client";

import Link from "next/link";
import { useRef } from "react";
import type { CSSProperties } from "react";
import type { ProjectDefinition, ProjectId } from "@/lib/portfolio/projects";
import type { Point } from "@/lib/portfolio/sprite";
import styles from "./portfolio.module.css";

interface Props {
  projects: readonly ProjectDefinition[];
  activeProject: ProjectId;
  previewedProject: ProjectId | null;
  onPreview: (id: ProjectId, point: Point) => void;
  onOpen: (id: ProjectId) => void;
  onResumePointer: () => void;
}

function center(element: HTMLElement): Point {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export default function ProjectSelector({ projects, activeProject, previewedProject, onPreview, onOpen, onResumePointer }: Props) {
  const drag = useRef<{ x: number; time: number } | null>(null);
  const didDrag = useRef(false);
  const activeIndex = Math.max(0, projects.findIndex(({ id }) => id === activeProject));

  const previewIndex = (index: number, element: HTMLElement) => {
    const project = projects[(index + projects.length) % projects.length];
    onPreview(project.id, center(element));
  };

  return (
    <nav className={styles.selector} aria-label="Portfolio projects">
      <div
        className={styles.selectorViewport}
        onPointerDown={(event) => {
          drag.current = { x: event.clientX, time: performance.now() };
          didDrag.current = false;
        }}
        onPointerUp={(event) => {
          if (!drag.current) return;
          const distance = event.clientX - drag.current.x;
          const elapsed = Math.max(1, performance.now() - drag.current.time);
          if (Math.abs(distance) >= 50 || Math.abs(distance / elapsed) * 1000 >= 500) {
            didDrag.current = true;
            previewIndex(activeIndex + (distance < 0 ? 1 : -1), event.currentTarget);
          }
          drag.current = null;
        }}
      >
        <div
          className={styles.selectorTrack}
          style={{ "--active-index": activeIndex } as CSSProperties}
        >
          {projects.map((project) => (
            <Link
              key={project.id}
              href={project.href}
              prefetch={false}
              className={styles.projectLink}
              aria-label={`Open ${project.label}`}
              data-project-id={project.id}
              data-previewed={project.id === previewedProject ? "" : undefined}
              onPointerEnter={(event) => onPreview(project.id, center(event.currentTarget))}
              onPointerLeave={onResumePointer}
              onTouchStart={(event) => onPreview(project.id, center(event.currentTarget))}
              onFocus={(event) => onPreview(project.id, center(event.currentTarget))}
              onBlur={onResumePointer}
              onClick={(event) => {
                if (didDrag.current) {
                  event.preventDefault();
                  didDrag.current = false;
                  return;
                }
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                if (event.detail > 0) event.currentTarget.blur();
                onOpen(project.id);
              }}
            >
              <span className={styles.buttonArtwork} aria-hidden="true">
                {/* Final raster artwork is supplied as-is; optimization would alter state pixels. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.buttonDefault}
                  alt=""
                  draggable={false}
                  data-state="default"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.buttonActive}
                  alt=""
                  draggable={false}
                  data-state="active"
                />
                {project.id === "business" ? (
                  <span className={styles.designLogicLabel} aria-hidden="true">
                    DESIGN LOGIC
                  </span>
                ) : null}
              </span>
              <span className={styles.mobileMeta}>
                <strong>{project.title}</strong><small>{project.year}</small>
                <small>{project.summary}</small><b>VIEW ↗</b>
              </span>
            </Link>
          ))}
        </div>
      </div>
      <div className={styles.carouselControls}>
        <button type="button" aria-label="Previous project" onClick={(event) => previewIndex(activeIndex - 1, event.currentTarget)}>←</button>
        <div className={styles.dots}>
          {projects.map((project, index) => (
            <button
              key={project.id}
              type="button"
              aria-label={`Preview ${project.label}`}
              aria-pressed={index === activeIndex}
              onClick={(event) => previewIndex(index, event.currentTarget)}
            />
          ))}
        </div>
        <button type="button" aria-label="Next project" onClick={(event) => previewIndex(activeIndex + 1, event.currentTarget)}>→</button>
      </div>
    </nav>
  );
}
