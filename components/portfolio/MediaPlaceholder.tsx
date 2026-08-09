import type { MediaSlot } from "@/lib/portfolio/projects";
import styles from "./portfolio.module.css";

export default function MediaPlaceholder({ slot }: { slot: MediaSlot }) {
  return (
    <figure
      className={styles.mediaPlaceholder}
      style={{ aspectRatio: slot.ratio.replace(":", " / ") }}
      role="img"
      aria-label={`Placeholder for ${slot.label}, recommended ${slot.recommendation}`}
    >
      <span>{slot.id.toUpperCase()} / CONTENT PENDING</span>
      <strong>{slot.label}</strong>
      <small>{slot.recommendation}</small>
    </figure>
  );
}
