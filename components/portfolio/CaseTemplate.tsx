import Link from "next/link";
import { PROJECTS, type ProjectDefinition } from "@/lib/portfolio/projects";
import MediaPlaceholder from "./MediaPlaceholder";
import styles from "./portfolio.module.css";

export default function CaseTemplate({ project }: { project: ProjectDefinition }) {
  if (project.id === "brand-system") {
    return (
      <article className={styles.brandSystemCase}>
        {/* Supplied case-study artwork is intentionally rendered at its native 2× layout width. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kv/cases/brand-system/goal-01.jpg"
          alt="Brand system case study"
          width="2880"
          height="28394"
          decoding="async"
        />
      </article>
    );
  }

  const cases = PROJECTS.filter((item) => item.kind === "case");
  const index = cases.findIndex((item) => item.id === project.id);
  const next = cases[(index + 1) % cases.length];

  return (
    <article className={styles.caseTemplate}>
      <header className={styles.caseHero}>
        <p>{project.label} / {project.year}</p>
        <h1>{project.title}</h1>
        <p>{project.summary}</p>
      </header>
      <nav className={styles.chapterNav} aria-label="Case chapters">
        {["Overview", "Process", "System", "Result"].map((item, i) => (
          <a key={item} href={`#chapter-${i + 1}`}>0{i + 1} / {item}</a>
        ))}
      </nav>
      {project.media.map((slot, indexValue) => (
        <section key={slot.id} id={`chapter-${indexValue + 1}`} className={styles.caseChapter}>
          <div><span>0{indexValue + 1}</span><h2>{slot.label}</h2></div>
          <p>CONTENT STRUCTURE / COPY AND FINAL MEDIA WILL BE PROVIDED.</p>
          <MediaPlaceholder slot={slot} />
        </section>
      ))}
      <section className={styles.metrics} id="chapter-4">
        {["METRIC 01", "METRIC 02", "METRIC 03", "METRIC 04"].map((metric) => (
          <div key={metric}><span>{metric}</span><strong>—</strong></div>
        ))}
      </section>
      <Link className={styles.nextCase} href={next.href}>
        NEXT CASE <strong>{next.label} ↗</strong>
      </Link>
    </article>
  );
}
