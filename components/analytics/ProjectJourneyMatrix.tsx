import type { CSSProperties } from "react";
import type { JourneyMatrixSnapshot } from "@/lib/analytics/types";
import styles from "./analytics-card.module.css";

function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function formatAxis(milliseconds: number) {
  const seconds = Math.round(milliseconds / 1000);
  return seconds >= 60 ? `${Math.floor(seconds / 60)}M${seconds % 60 || ""}` : `${seconds}S`;
}

export default function ProjectJourneyMatrix({ value }: { value: JourneyMatrixSnapshot }) {
  const columnCount = value.cells[0]?.length ?? 0;
  if (columnCount < 1 || value.sectionLabels.length < 1) return null;
  const gridStyle = { "--journey-columns": columnCount } as CSSProperties;

  return (
    <div className={styles.journeyViewport} aria-label="Browsing journey matrix">
      <div className={styles.journeyMatrix} style={gridStyle}>
        <div className={styles.journeyAxis}>
          <span>SECTION</span>
          <div><span>START</span><span>{formatAxis(columnCount * value.bucketMs)}</span></div>
        </div>
        {value.sectionLabels.map((label, rowIndex) => (
          <div className={styles.journeyRow} key={label}>
            <span className={styles.journeyLabel}>{label}</span>
            <div className={styles.journeyCells}>
              {Array.from({ length: columnCount }, (_, columnIndex) => {
                const dwell = value.cells[rowIndex]?.[columnIndex] ?? 0;
                const intensity = dwell > 0 ? Math.max(0.16, Math.min(1, dwell / value.bucketMs)) : 0;
                const start = Math.round((columnIndex * value.bucketMs) / 1000);
                const end = Math.round(((columnIndex + 1) * value.bucketMs) / 1000);
                const accessibleName = `${label}, ${start}–${end}s, dwell ${formatDuration(dwell)}`;
                return (
                  <span
                    className={styles.journeyCell}
                    key={columnIndex}
                    role="img"
                    aria-label={accessibleName}
                    title={accessibleName}
                    style={intensity > 0 ? { backgroundColor: `rgba(36, 122, 211, ${intensity})` } : undefined}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
