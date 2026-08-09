import Link from "next/link";
import styles from "./portfolio.module.css";

export default function CasePage({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.standaloneCase}>
      <Link href="/" className={styles.backHome}>← BACK TO WORK</Link>
      {children}
    </main>
  );
}
