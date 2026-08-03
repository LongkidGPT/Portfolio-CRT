import type { ProjectDefinition } from "@/lib/portfolio/projects";
import styles from "./portfolio.module.css";

export default function CaseTemplate({ project }: { project: ProjectDefinition }) {
  if (project.caseArtwork) {
    return (
      <article className={styles.caseArtwork}>
        {/* Supplied case-study artwork is intentionally rendered without reflowing its contents. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.caseArtwork.src}
          alt={project.caseArtwork.alt}
          width={project.caseArtwork.width}
          height={project.caseArtwork.height}
          decoding="async"
        />
      </article>
    );
  }

  return null;
}
