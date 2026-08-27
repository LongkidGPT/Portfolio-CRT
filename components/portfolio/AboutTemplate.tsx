import AboutExperience from "./AboutExperience";
import styles from "./portfolio.module.css";

const ABOUT_HERO_COPY = {
  eyebrow: "SENIOR VISUAL DESIGNER",
  name: "我是KID（龙昊翔）",
  role: "资深视觉设计师",
  introduction:
    "10+ 年视觉设计与品牌营销经验，具备消费电子、家居新零售与 4A/创意公司复合背景，曾管理 8 人视觉团队。擅长消费科技品牌视觉系统、全球新品 Campaign、包装系统优化与线上线下传播资产，能从策略理解、创意方向、主视觉和设计规范推进至多触点交付，并以 AIGC 工作流提升探索与协作效率 ▮",
  mobileIntroduction:
    "10+ 年视觉设计与品牌营销经验，具消费电子、家居新零售及 4A 复合背景，曾管理 8 人团队。擅长消费科技品牌视觉系统、全球新品 Campaign、包装系统与多触点传播，并以 AIGC 工作流提升创意探索和协作效率。",
} as const;

function aboutImage(src: string, width: number) {
  if (process.env.NETLIFY !== "true") return src;
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&fm=webp&q=90`;
}

export default function AboutTemplate() {
  return (
    <>
      <article className={styles.aboutDesktopPage} data-about-layout="desktop-editable">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.aboutDesktopBackground}
          src={aboutImage("/kv/cases/about-background.png", 2560)}
          alt=""
          width="10848"
          height="12858"
          decoding="async"
          loading="lazy"
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
              src={aboutImage("/kv/cases/about-crt-desktop.png", 1200)}
              alt="Kid Long CRT portrait"
              width="4174"
              height="4476"
              decoding="async"
              loading="lazy"
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
            src={aboutImage("/kv/cases/about-contact.png", 1600)}
            alt="Kid Long contact information"
            width="5745"
            height="918"
            decoding="async"
            loading="lazy"
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
              {ABOUT_HERO_COPY.mobileIntroduction}
            </p>
          </div>

          <figure className={styles.aboutPortrait}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={aboutImage("/kv/cases/about-crt.png", 720)}
              alt="Kid Long visual designer portrait"
              width="1797"
              height="1895"
              decoding="async"
              loading="lazy"
            />
          </figure>
        </section>

        <AboutExperience />

        <figure className={styles.aboutMobileContact}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={aboutImage("/kv/cases/about-contact-mobile.png", 720)}
            alt="Kid Long mobile contact information"
            width="1256"
            height="932"
            decoding="async"
            loading="lazy"
          />
        </figure>
      </article>
    </>
  );
}
