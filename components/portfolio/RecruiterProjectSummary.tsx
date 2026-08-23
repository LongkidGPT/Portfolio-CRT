import type { RecruiterSummary } from "@/lib/portfolio/projects";
import styles from "./portfolio.module.css";

export default function RecruiterProjectSummary({
  summary,
  eyebrow,
  pageTitle,
  mobilePageTitle,
  hideTitle = false,
}: {
  summary: RecruiterSummary;
  eyebrow?: string;
  pageTitle?: string;
  mobilePageTitle?: string;
  hideTitle?: boolean;
}) {
  return (
    <section
      className={styles.recruiterSummaryShell}
      aria-labelledby={hideTitle ? undefined : "recruiter-project-title"}
      aria-label={hideTitle ? summary.title : undefined}
    >
      <div className={styles.recruiterSummary}>
        <header className={styles.recruiterSummaryHeader}>
          {hideTitle ? (
            <>
              <p className={styles.recruiterSummaryEyebrow}>{eyebrow}</p>
              <h1 className={styles.recruiterSummaryChapterTitle}>{pageTitle}</h1>
            </>
          ) : (
            <>
              <h1 id="recruiter-project-title" className={styles.recruiterSummaryDesktopTitle}>
                {summary.title}
              </h1>
              <p className={styles.recruiterSummaryDesktopSubtitle}>{summary.subtitle}</p>
              {mobilePageTitle ? (
                <h1 className={styles.recruiterSummaryMobileTitle}>{mobilePageTitle}</h1>
              ) : null}
            </>
          )}
        </header>

        {summary.showMeta !== false ? (
          <dl className={styles.recruiterSummaryMeta}>
            <div>
              <dt>业务目标</dt>
              <dd>{summary.objective}</dd>
            </div>
            <div>
              <dt>负责范围</dt>
              <dd>{summary.scope}</dd>
            </div>
          </dl>
        ) : null}

        <div className={styles.recruiterContributionHeading}>
          <span>核心设计贡献</span>
        </div>
        <ol className={styles.recruiterContributions}>
          {summary.contributions.map((contribution, index) => (
            <li key={contribution.title}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{contribution.title}</h2>
                <p>{contribution.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className={styles.recruiterValidation}>
          <span>{summary.validationLabel ?? "部分验证数据"}</span>
          {summary.validation.join(" · ")}
        </p>
      </div>
    </section>
  );
}
