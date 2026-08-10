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
      </article>
    );
  }

  return null;
}
