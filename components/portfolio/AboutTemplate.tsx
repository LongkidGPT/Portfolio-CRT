import AboutExperience from "./AboutExperience";
import styles from "./portfolio.module.css";

export default function AboutTemplate() {
  return (
    <>
      <article className={styles.aboutMobile} data-about-layout="mobile">
        <section className={styles.aboutMobileIntro}>
          <p>VISUAL DESIGNER</p>
          <h1>我是KID<br />（龙昊翔）</h1>
          <h2>人类 · 资深视觉设计师</h2>
          <p className={styles.aboutMobileBody}>
            10+ 年视觉设计与品牌营销经验，擅长消费电子营销视觉、品牌视觉语言、
            DTC／电商页面与 AI 创意生产流程。能从创意方向、风格定义、设计提案到落地执行完整推进，
            并为后续数据验证与迭代建立清晰框架。
          </p>
        </section>

        <figure className={styles.aboutMobilePortrait}>
          {/* Use the approved mobile full-frame character source. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/kv-mobile/frames/frame-063.webp"
            alt="Kid Long visual designer portrait"
            width="720"
            height="1280"
          />
        </figure>

        <section className={styles.aboutMobileExperience}>
          <h2>EXPERIENCE</h2>
          <div>
            {[
              ["2023—2026", "安克创新 Anker Innovations", "资深视觉设计师"],
              ["2021—2023", "林氏家居 Linsy", "创意设计主管"],
              ["2018—2021", "熠思堡创意 Extend", "创意设计组长"],
              ["2015—2018", "GREY-DPI (wpp)", "资深视觉设计师"],
              ["2012—2015", "同立集团 UNI Group", "视觉设计师"],
            ].map(([years, company, role]) => (
              <article key={years}>
                <span>{years}</span>
                <strong>{company}</strong>
                <small>{role}</small>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.aboutMobileContact}>
          <div>
            <p>LET&apos;S BUILD SOMETHING MEANINGFUL.</p>
            <h2>期待合作，创造长期价值</h2>
          </div>
          <address>
            <a href="mailto:longkid@sohu.com">E-MAIL　longkid@sohu.com</a>
            <span>WECHAT　lkchat1980</span>
            <a href="tel:+8618520224719">MOBILE　185 2022 4719</a>
          </address>
        </section>
      </article>

      <article className={styles.aboutArtwork} data-about-layout="desktop">
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
    </>
  );
}
