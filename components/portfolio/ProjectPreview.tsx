"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ProjectDefinition } from "@/lib/portfolio/projects";
import styles from "./portfolio.module.css";

export default function ProjectPreview({ project }: { project: ProjectDefinition }) {
  const reduced = useReducedMotion();
  return (
    <section className={styles.preview} aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={project.id}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduced ? 0.1 : 0.32 }}
        >
          <h1>{project.title}</h1>
          <p className={styles.projectYear}>{project.year}</p>
          <p className={styles.projectSummary}>{project.summary}</p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
