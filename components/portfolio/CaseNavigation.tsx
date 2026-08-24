import Link from "next/link";
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

  return (
    <>
      <header className={styles.caseNavigation} id="case-navigation">
        <div className={styles.caseNavigationInner}>
        <Link href={backHref} className={styles.caseBackLink} aria-label={backLabel}>
          <span aria-hidden="true">←</span>
          <span className={styles.caseBackText}>{isOverview ? "BACK TO WORK" : "PROJECT OVERVIEW"}</span>
        </Link>

        <p className={styles.caseMobileCurrent}>{FEATURED_CASE.shortTitle}</p>

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

        <a
          href="#case-chapter-menu"
          className={styles.caseChapterMenuButton}
          aria-controls="case-chapter-menu"
          aria-label="Open chapter menu"
          role="button"
        >
          <span className={styles.caseChapterMenuIcon} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </a>
        </div>
      </header>

      <div className={styles.caseChapterDrawerLayer} id="case-chapter-menu">
          <a
            href="#case-navigation"
            className={styles.caseChapterDrawerBackdrop}
            aria-label="Close chapter menu"
          />
          <div
            className={styles.caseChapterDrawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-chapter-menu-title"
          >
            <header>
              <p id="case-chapter-menu-title">CHAPTERS</p>
              <a href="#case-navigation" aria-label="Close chapter menu" role="button">
                ×
              </a>
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
                  >
                    {active ? (
                      <span
                        className={styles.caseChapterDrawerCurrentLabel}
                        data-label={target.label}
                        aria-label={target.label}
                      />
                    ) : (
                      <span>{target.label}</span>
                    )}
                    <span aria-hidden="true">{active ? "●" : "↗"}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
      </div>
    </>
  );
}
