import AboutExperience from "./AboutExperience";
import styles from "./portfolio.module.css";

export default function AboutTemplate() {
  return (
    <article className={styles.aboutPage} data-about-layout="shared">
      <section className={styles.aboutHero} aria-labelledby="about-title">
        <div className={styles.aboutHeroCopy}>
          <p className={styles.aboutEyebrow}>VISUAL DESIGNER</p>
          <h1 id="about-title">我是KID（龙昊翔）</h1>
          <h2>人类 · 资深视觉设计师</h2>
          <p className={styles.aboutIntroduction}>
            10+ 年视觉设计与品牌营销经验，擅长消费电子营销视觉、品牌视觉语言、
            DTC／电商页面与 AI 创意生产流程，能从创意方向、风格定义、设计提案到落地执行，
            完整推进，并为后续数据验证与迭代建立清晰框架。
          </p>
        </div>

        <figure className={styles.aboutPortrait}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/kv/cases/about-crt.png"
            alt="Kid Long visual designer portrait"
            width="1797"
            height="1895"
            decoding="async"
          />
        </figure>
      </section>

      <AboutExperience />

      <section className={styles.aboutContactCard} data-testid="about-contact-card">
        <div>
          <p>LET&apos;S BUILD SOMETHING MEANINGFUL.</p>
          <h2>期待合作，创造长期价值</h2>
        </div>
        <address>
          <a href="mailto:longkid@sohu.com">E-MAIL　|　longkid@sohu.com</a>
          <span>WECHAT　|　lkchat1980</span>
          <a href="tel:+8618520224719">MOBILE　|　185 2022 4719</a>
        </address>
      </section>
    </article>
  );
}
