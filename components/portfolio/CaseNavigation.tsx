"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FEATURED_CASE,
  FEATURED_CASE_NAVIGATION,
  getProjectById,
  type ProjectDefinition,
} from "@/lib/portfolio/projects";
import styles from "./portfolio.module.css";

export default function CaseNavigation({ project }: { project: ProjectDefinition }) {
  const isOverview = project.id === "about";
  const backHref = isOverview ? "/" : FEATURED_CASE.overviewHref;
  const backLabel = isOverview ? "← BACK TO WORK" : "← PROJECT OVERVIEW";
  const [chaptersOpen, setChaptersOpen] = useState(false);

  useEffect(() => {
    if (!chaptersOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setChaptersOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [chaptersOpen]);

  return (
    <header className={styles.caseNavigation}>
      <div className={styles.caseNavigationInner}>
        <Link href={backHref} className={styles.caseBackLink} aria-label={backLabel}>
          <span aria-hidden="true">←</span>
          <span className={styles.caseBackText}>{isOverview ? "BACK TO WORK" : "PROJECT OVERVIEW"}</span>
        </Link>

        <p className={styles.caseMobileCurrent}>{project.label}</p>

        <nav className={styles.caseChapterNav} aria-label="Featured case chapter navigation">
          {FEATURED_CASE_NAVIGATION.map((item) => {
            const target = getProjectById(item.id);
            const active = item.id === project.id;
            return (
              <Link
                key={item.id}
                href={target.href}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className={styles.caseChapterMenuButton}
          aria-expanded={chaptersOpen}
          aria-controls="case-chapter-menu"
          aria-label="Open chapter menu"
          onClick={() => setChaptersOpen(true)}
        >
          <span aria-hidden="true">CH</span>
        </button>
      </div>

      {chaptersOpen && (
        <div className={styles.caseChapterDrawerLayer}>
          <button
            type="button"
            className={styles.caseChapterDrawerBackdrop}
            aria-label="Close chapter menu"
            onClick={() => setChaptersOpen(false)}
          />
          <section
            id="case-chapter-menu"
            className={styles.caseChapterDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-chapter-menu-title"
          >
            <header>
              <p id="case-chapter-menu-title">CHAPTERS</p>
              <button type="button" aria-label="Close chapter menu" onClick={() => setChaptersOpen(false)}>
                ×
              </button>
            </header>
            <nav aria-label="Mobile featured case chapter navigation">
              {FEATURED_CASE_NAVIGATION.map((item) => {
                const target = getProjectById(item.id);
                const active = item.id === project.id;
                return (
                  <Link
                    key={item.id}
                    href={target.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setChaptersOpen(false)}
                  >
                    <span>{target.label}</span>
                    <span aria-hidden="true">{active ? "●" : "↗"}</span>
                  </Link>
                );
              })}
            </nav>
          </section>
        </div>
      )}
    </header>
  );
}
