import Link from "next/link";
import type { CSSProperties } from "react";
import type { ProjectDefinition } from "@/lib/portfolio/projects";
import RecruiterProjectSummary from "./RecruiterProjectSummary";
import CaseNavigation from "./CaseNavigation";
import ProgressiveCaseSlices from "./ProgressiveCaseSlices";
import styles from "./portfolio.module.css";

const EMPTY_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const OVERVIEW_LINKS = [
  {
    label: "00 BUSINESS CONTEXT",
    href: "/work/anker-ifa-2025/business",
    desktop: { left: 19.0278, top: 61.5675, width: 12.7778, height: 2.3135 },
    mobile: { left: 9.0351, top: 62.7723, width: 19.8246, height: 6.0396 },
  },
  {
    label: "01 BRAND SYSTEM",
    href: "/work/anker-ifa-2025/brand-system",
    desktop: { left: 23.3333, top: 83.4278, width: 9.4444, height: 2.3135 },
    mobile: { left: 14.4737, top: 85.693, width: 15.614, height: 5.9901 },
  },
  {
    label: "02 PRODUCT LAUNCH",
    href: "/work/anker-ifa-2025/product-launch",
    desktop: { left: 45.2083, top: 83.4278, width: 9.4444, height: 2.3135 },
    mobile: { left: 42.1053, top: 85.693, width: 15.614, height: 5.9901 },
  },
  {
    label: "03 LAUNCH EVENT",
    href: "/work/anker-ifa-2025/launch-event",
    desktop: { left: 67.0833, top: 83.4278, width: 9.5139, height: 2.3135 },
    mobile: { left: 69.7368, top: 85.693, width: 15.7018, height: 5.9901 },
  },
] as const;

function hotspotStyle(link: (typeof OVERVIEW_LINKS)[number]) {
  return {
    "--desktop-left": `${link.desktop.left}%`,
    "--desktop-top": `${link.desktop.top}%`,
    "--desktop-width": `${link.desktop.width}%`,
    "--desktop-height": `${link.desktop.height}%`,
    "--mobile-left": `${link.mobile.left}%`,
    "--mobile-top": `${link.mobile.top}%`,
    "--mobile-width": `${link.mobile.width}%`,
    "--mobile-height": `${link.mobile.height}%`,
  } as CSSProperties;
}

function casePathLabel(project: ProjectDefinition) {
  const caseIds = ["business", "brand-system", "product-launch", "launch-event"] as const;
  const index = caseIds.indexOf(project.id as (typeof caseIds)[number]);
  return index === -1
    ? undefined
    : `PROJECT OVERVIEW / ${String(index).padStart(2, "0")} ${project.label}`;
}

export default function CaseTemplate({ project }: { project: ProjectDefinition }) {
  if (project.caseArtwork) {
    return (
      <article
        className={`${styles.caseArtwork} ${project.id === "about" ? styles.caseArtworkOverview : ""}`}
      >
        <CaseNavigation project={project} />
        {project.recruiterSummary && (
          <RecruiterProjectSummary
            summary={project.recruiterSummary}
            hideTitle={project.id !== "about"}
            contextLabel={casePathLabel(project)}
          />
        )}
        <div className={styles.caseArtworkMedia}>
          {project.caseArtwork.desktopSlices ? (
            <>
              <div className={styles.caseDesktopSlices}>
                <ProgressiveCaseSlices
                  slices={project.caseArtwork.desktopSlices}
                  alt={project.caseArtwork.alt}
                  media="(min-width: 768px)"
                  className={styles.caseSliceStack}
                />
              </div>
              {project.caseArtwork.mobileSlices ? (
                <div className={styles.caseMobileSlices}>
                  <ProgressiveCaseSlices
                    slices={project.caseArtwork.mobileSlices}
                    alt={`${project.caseArtwork.alt} mobile`}
                    media="(max-width: 767px)"
                    className={styles.caseSliceStack}
                  />
                </div>
              ) : (
                <picture className={styles.caseMobileArtwork}>
                  <source
                    media="(max-width: 767px)"
                    srcSet={project.caseArtwork.mobile.src}
                  />
                  <img
                    src={EMPTY_PIXEL}
                    alt={`${project.caseArtwork.alt} mobile`}
                    width={project.caseArtwork.mobile.width}
                    height={project.caseArtwork.mobile.height}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </picture>
              )}
            </>
          ) : (
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet={project.caseArtwork.mobile.src}
                width={project.caseArtwork.mobile.width}
                height={project.caseArtwork.mobile.height}
              />
              {/* Supplied case-study artwork is intentionally rendered without reflowing its contents. */}
              <img
                src={project.caseArtwork.src}
                alt={project.caseArtwork.alt}
                width={project.caseArtwork.width}
                height={project.caseArtwork.height}
                decoding="async"
                fetchPriority="high"
              />
            </picture>
          )}
          {project.id === "about" && OVERVIEW_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.overviewHotspot}
              style={hotspotStyle(link)}
              aria-label={`Open ${link.label} chapter`}
            />
          ))}
        </div>
      </article>
    );
  }

  return null;
}
