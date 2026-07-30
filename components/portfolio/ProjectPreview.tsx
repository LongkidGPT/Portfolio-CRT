import type { ProjectDefinition } from "@/lib/portfolio/projects";
import ReelText from "./ReelText";
import styles from "./portfolio.module.css";

export default function ProjectPreview({ project }: { project: ProjectDefinition }) {
  return (
    <section className={styles.preview} aria-live="polite">
      <div key={project.id}>
        <h1><ReelText text={project.title} /></h1>
        <p className={styles.projectYear}><ReelText text={project.year} /></p>
        <p className={styles.projectSummary}><ReelText text={project.summary} /></p>
      </div>
    </section>
  );
}
