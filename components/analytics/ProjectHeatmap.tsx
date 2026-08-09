import styles from "./analytics-card.module.css";

function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function ProjectHeatmap({ values }: { values?: number[] }) {
  if (!values || values.length !== 10) {
    return <p className={styles.emptyGroup}>NO HEATMAP DATA</p>;
  }

  const maximum = Math.max(...values, 0);
  return (
    <div className={styles.heatmap} aria-label="Page reading heatmap">
      {values.map((value, index) => {
        const intensity = value > 0 && maximum > 0 ? Math.max(0.22, value / maximum) : 0;
        const start = index * 10 + 1;
        const end = (index + 1) * 10;
        return (
          <span
            key={index}
            className={styles.heatmapCell}
            role="img"
            aria-label={`Page segment ${start}–${end}%, dwell ${formatDuration(value)}`}
            style={intensity > 0 ? { backgroundColor: `rgba(36, 122, 211, ${intensity})` } : undefined}
          />
        );
      })}
    </div>
  );
}
