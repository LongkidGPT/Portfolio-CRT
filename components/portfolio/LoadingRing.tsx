import styles from "./portfolio.module.css";

export default function LoadingRing() {
  return (
    <div className={styles.loadingRing} role="status" aria-label="Loading portfolio">
      <span aria-hidden="true">LOADING · PORTFOLIO · LOADING · PORTFOLIO ·</span>
    </div>
  );
}
