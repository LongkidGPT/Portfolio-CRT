import AboutExperience from "./AboutExperience";
import styles from "./portfolio.module.css";

export default function AboutTemplate() {
  return (
    <article className={styles.aboutArtwork}>
      <div className={styles.visuallyHidden}>
        <h1>我是 KID（龙昊翔），人类 · 资深视觉设计师</h1>
        <p>
          10+ 年视觉设计与品牌营销经验，擅长消费电子营销视觉、品牌视觉语言、
          DTC 电商页面与 AI 创意生产流程。
        </p>
        <h2>Experience</h2>
        <p>
          Anker Innovations、Linsy、Extend、GREY-DPI 与 UNI Group，2012 至 2026。
        </p>
        <h2>Contact</h2>
        <p>longkid@sohu.com，微信 lkchat1980，电话 18520224719。</p>
      </div>

      {/* The supplied artwork remains the visual source of truth; only its static ruler is replaced below. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/kv/cases/about-me.png"
        alt="Kid Long profile and experience"
        width="2880"
        height="2907"
        decoding="async"
      />

      <AboutExperience />

      <div className={styles.aboutContactMask} aria-hidden="true" />
      <div className={styles.aboutContactCard} data-testid="about-contact-card">
        {/* Reuse the supplied contact artwork while clipping it into the corrected card geometry. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kv/cases/about-me.png" alt="" width="2880" height="2907" />
      </div>
    </article>
  );
}
