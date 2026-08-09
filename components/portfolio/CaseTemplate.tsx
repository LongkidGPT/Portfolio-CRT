import type { ProjectDefinition } from "@/lib/portfolio/projects";
import styles from "./portfolio.module.css";

export default function CaseTemplate({ project }: { project: ProjectDefinition }) {
  if (project.caseArtwork) {
    return (
      <article className={styles.caseArtwork}>
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
          />
        </picture>
      </article>
    );
  }

  return null;
}
