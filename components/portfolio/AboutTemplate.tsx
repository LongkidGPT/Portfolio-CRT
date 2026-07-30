import styles from "./portfolio.module.css";

const sections = [
  ["Profile", "PROFILE COPY / CONTENT PENDING"],
  ["Capabilities", "CAPABILITY MATRIX / CONTENT PENDING"],
  ["Experience", "EXPERIENCE TIMELINE / CONTENT PENDING"],
  ["Education", "EDUCATION DETAILS / CONTENT PENDING"],
  ["Contact", "CONTACT DETAILS / CONTENT PENDING"],
] as const;

export default function AboutTemplate() {
  return (
    <article className={styles.caseTemplate}>
      <header className={styles.caseHero}>
        <p>ABOUT / KID LONG</p><h1>Visual designer building systems for product launch.</h1>
      </header>
      {sections.map(([title, copy], index) => (
        <section className={styles.aboutSection} key={title}>
          <span>0{index + 1}</span><h2>{title}</h2><p>{copy}</p>
        </section>
      ))}
    </article>
  );
}
