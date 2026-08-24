import AboutExperience from "./AboutExperience";
import styles from "./portfolio.module.css";

const ABOUT_HERO_COPY = {
  eyebrow: "SENIOR VISUAL DESIGNER",
  name: "我是KID（龙昊翔）",
  role: "资深视觉设计师",
  introduction:
    "10+ 年视觉设计与品牌营销经验，具备消费电子、家居新零售与 4A/创意公司复合背景。曾在林氏家居管理 8 人视觉团队，负责将业务需求拆解为创意方向与执行分工，并通过提案评审、供应商协同与上线验收把控多渠道交付质量。擅长消费科技新品发布、品牌视觉语言与整合 Campaign，能在技术产品、用户场景与商业目标之间建立创意方向与跨触点表达，并持续探索 AI 创意生产流程 ▮",
  mobileIntroduction:
    "10+ 年品牌与视觉设计经验，具消费电子、家居新零售及 4A 复合背景。曾在林氏家居管理 8 人视觉团队，负责创意方向、执行分工、提案评审与供应商协同。擅长科技新品发布、品牌视觉系统、整合 Campaign 与 AI 创意流程，能够从创意方向到多触点落地完整推进。",
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
