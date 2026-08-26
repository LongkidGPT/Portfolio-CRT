import styles from "./portfolio.module.css";

export default function CasePage({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.standaloneCase}>
      {children}
    </main>
  );
}
