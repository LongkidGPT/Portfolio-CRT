import type {
  MobilePreviewCopy,
  PreviewCopy,
  ProjectDefinition,
} from "@/lib/portfolio/projects";
import ReelText from "./ReelText";
import styles from "./portfolio.module.css";

function ReelLines({ lines }: { lines: readonly string[] }) {
  return lines.map((line) => (
    <span className={styles.previewLine} key={line}>
      <ReelText text={line} />
    </span>
  ));
}

export default function ProjectPreview({
  project,
  desktopCopy,
  mobileCopy: mobileCopyOverride,
}: {
  project: ProjectDefinition;
  desktopCopy?: PreviewCopy;
  mobileCopy?: MobilePreviewCopy;
}) {
  const copy = desktopCopy ?? project.previewCopy;
  const mobileCopy = mobileCopyOverride ?? project.mobilePreviewCopy;
  const mobileSecondLayer = typeof mobileCopy.secondLayer === "string"
    ? [mobileCopy.secondLayer]
    : mobileCopy.secondLayer;

  return (
    <section className={styles.preview} aria-live="polite">
      <div key={`${project.id}:${copy.eyebrow}`}>
        <div className={styles.previewDesktop} data-preview-layout="desktop">
          <p className={styles.previewEyebrow}>
            <ReelText text={copy.eyebrow} />
          </p>
          <h1 className={styles.previewHeadline}>
            <ReelLines lines={copy.headlineLines} />
          </h1>
          <span
            className={styles.previewDivider}
            data-preview-divider="true"
            aria-hidden="true"
          />
          <div className={styles.previewSubhead}>
            <ReelLines lines={copy.subheadLines} />
          </div>
          {copy.bodyLines.length > 0 && (
            <div className={styles.previewBody} data-preview-body="true">
              <ReelLines lines={copy.bodyLines} />
            </div>
          )}
        </div>
        <div className={styles.previewMobile} data-preview-layout="mobile">
          <p className={styles.mobilePreviewFirst}>
            <ReelText text={mobileCopy.firstLayer} />
          </p>
          <h1 className={styles.mobilePreviewSecond}>
            <ReelLines lines={mobileSecondLayer} />
          </h1>
        </div>
      </div>
    </section>
  );
}
