import AboutTemplate from "@/components/portfolio/AboutTemplate";
import PortfolioHeader from "@/components/portfolio/PortfolioHeader";
import styles from "@/components/portfolio/portfolio.module.css";

export default function AboutPage() {
  return (
    <main className={styles.standaloneCase}>
      <PortfolioHeader />
      <AboutTemplate />
    </main>
  );
}
