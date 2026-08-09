import AboutExperience from "./AboutExperience";
import styles from "./portfolio.module.css";

const ABOUT_HERO_COPY = {
  eyebrow: "SENIOR VISUAL DESIGNER",
  name: "我是KID（龙昊翔）",
  role: "资深视觉设计师",
  introduction:
    "以 ANKER INNOVATIONS IFA 2025 全球品牌升级发布会为入口，这个项目展开母品牌视觉系统、SOLIX 新品上市传播、IFA 发布会内容设计▮",
} as const;

export default function AboutTemplate() {
  return (
    <>
      <article className={styles.aboutDesktopPage} data-about-layout="desktop-editable">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.aboutDesktopBackground}
          src="/kv/cases/about-background.png"
          alt=""
          width="10848"
          height="12858"
          decoding="async"
          data-testid="about-desktop-background"
        />

        <div className={styles.aboutDesktopCanvas} data-testid="about-desktop-canvas">
          <section className={styles.aboutDesktopHero} aria-labelledby="about-desktop-title">
            <div className={styles.aboutDesktopHeroCopy}>
              <p>{ABOUT_HERO_COPY.eyebrow}</p>
              <h1 id="about-desktop-title">{ABOUT_HERO_COPY.name}</h1>
              <h2>{ABOUT_HERO_COPY.role}</h2>
              <hr />
              <p className={styles.aboutDesktopIntroduction}>
                {ABOUT_HERO_COPY.introduction}
              </p>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.aboutDesktopPortrait}
              src="/kv/cases/about-crt-desktop.png"
              alt="Kid Long CRT portrait"
              width="4174"
              height="4476"
              decoding="async"
            />
          </section>

          <section className={styles.aboutDesktopCareer} aria-labelledby="career-title">
            <div className={styles.aboutCareerHeading}>
              <h2 id="career-title">工作经历</h2>
              <span aria-hidden="true" />
            </div>
            <AboutExperience desktop />
          </section>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.aboutDesktopContact}
            src="/kv/cases/about-contact.png"
            alt="Kid Long contact information"
            width="5745"
            height="918"
            decoding="async"
          />
        </div>
      </article>

      <article className={styles.aboutPage} data-about-layout="mobile-html">
        <section className={styles.aboutHero} aria-labelledby="about-title">
          <div className={styles.aboutHeroCopy}>
            <p className={styles.aboutEyebrow}>{ABOUT_HERO_COPY.eyebrow}</p>
            <h1 id="about-title">{ABOUT_HERO_COPY.name}</h1>
            <h2>{ABOUT_HERO_COPY.role}</h2>
            <hr className={styles.aboutMobileDivider} />
            <p className={styles.aboutIntroduction}>
              {ABOUT_HERO_COPY.introduction}
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

        <figure className={styles.aboutMobileContact}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/kv/cases/about-contact-mobile.png"
            alt="Kid Long mobile contact information"
            width="1256"
            height="932"
            decoding="async"
          />
        </figure>
      </article>
    </>
  );
}
