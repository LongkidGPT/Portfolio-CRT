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
  const currentHierarchy = isOverview
    ? "PROJECT OVERVIEW"
    : `PROJECT OVERVIEW / ${project.label}`;

  return (
    <header className={styles.caseNavigation}>
      <div className={styles.caseNavigationPrimary}>
        <Link href={backHref} className={styles.caseBackLink}>{backLabel}</Link>
        <div className={styles.caseHierarchy}>
          <p>
            <Link href="/">WORK</Link> / {FEATURED_CASE.shortTitle}
          </p>
          <strong>{currentHierarchy}</strong>
        </div>
      </div>
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
    </header>
  );
}
