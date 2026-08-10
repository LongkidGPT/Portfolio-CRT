import Link from "next/link";
import type { CSSProperties } from "react";
import type { ProjectDefinition } from "@/lib/portfolio/projects";
import styles from "./portfolio.module.css";

const RESPONSIVE_SIZES =
  "(max-width: 767px) calc(100vw - 36px), min(calc(100vw - 48px), 870px)";

function netlifyImage(src: string, width: number) {
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&fm=webp&q=86`;
}

function responsiveSource(src: string, widths: readonly number[]) {
  return widths.map((width) => `${netlifyImage(src, width)} ${width}w`).join(", ");
}

const OVERVIEW_LINKS = [
  {
    label: "DESIGN LOGIC",
    href: "/work/business",
    desktop: { left: 19.0972, top: 61.5666, width: 12.7083, height: 2.3135 },
    mobile: { left: 9.1228, top: 47.0436, width: 19.7368, height: 4.4856 },
  },
  {
    label: "BRAND SYSTEM",
    href: "/work/brand-system",
    desktop: { left: 17.5694, top: 83.4278, width: 9.4444, height: 2.3135 },
    mobile: { left: 7.193, top: 64.1705, width: 15.614, height: 4.4856 },
  },
  {
    label: "PRODUCT LAUNCH",
    href: "/work/product-launch",
    desktop: { left: 39.5139, top: 83.4278, width: 9.4444, height: 2.3135 },
    mobile: { left: 34.9123, top: 64.1705, width: 15.614, height: 4.4856 },
  },
  {
    label: "LAUNCH EVENT",
    href: "/work/launch-event",
    desktop: { left: 61.3889, top: 83.4278, width: 9.4444, height: 2.3135 },
    mobile: { left: 62.5439, top: 64.1705, width: 15.614, height: 4.4856 },
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

export default function CaseTemplate({ project }: { project: ProjectDefinition }) {
  if (project.caseArtwork) {
    const useImageCdn = process.env.NETLIFY === "true";
    const mobileSrcSet = useImageCdn
      ? responsiveSource(project.caseArtwork.mobile.src, [420, 840, 1170])
      : project.caseArtwork.mobile.src;
    const desktopSrcSet = useImageCdn
      ? responsiveSource(project.caseArtwork.src, [870, 1740])
      : undefined;

    return (
      <article className={styles.caseArtwork}>
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet={mobileSrcSet}
            sizes={RESPONSIVE_SIZES}
            width={project.caseArtwork.mobile.width}
            height={project.caseArtwork.mobile.height}
          />
          {/* Supplied case-study artwork is intentionally rendered without reflowing its contents. */}
          <img
            src={useImageCdn
              ? netlifyImage(project.caseArtwork.src, 870)
              : project.caseArtwork.src}
            srcSet={desktopSrcSet}
            sizes={RESPONSIVE_SIZES}
            alt={project.caseArtwork.alt}
            width={project.caseArtwork.width}
            height={project.caseArtwork.height}
            decoding="async"
          />
        </picture>
        {project.id === "about" && OVERVIEW_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.overviewHotspot}
            style={hotspotStyle(link)}
            aria-label={`Open ${link.label} case`}
          />
        ))}
      </article>
    );
  }

  return null;
}
