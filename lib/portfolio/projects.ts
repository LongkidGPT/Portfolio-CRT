export type ProjectId =
  | "about"
  | "business"
  | "brand-system"
  | "product-launch"
  | "launch-event";

export type FeaturedCaseChapter = Exclude<ProjectId, "about">;

export const FEATURED_CASE = {
  label: "FEATURED CASE",
  client: "ANKER INNOVATIONS",
  project: "IFA 2025",
  title: "GLOBAL BRAND UPGRADE",
  shortTitle: "ANKER INNOVATIONS · IFA 2025",
  overviewHref: "/work/anker-ifa-2025",
} as const;

export const FEATURED_CASE_CHAPTER_PATHS = {
  business: `${FEATURED_CASE.overviewHref}/business`,
  "brand-system": `${FEATURED_CASE.overviewHref}/brand-system`,
  "product-launch": `${FEATURED_CASE.overviewHref}/product-launch`,
  "launch-event": `${FEATURED_CASE.overviewHref}/launch-event`,
} as const satisfies Record<FeaturedCaseChapter, string>;

export interface MediaSlot {
  id: string;
  label: string;
  ratio: "16:9" | "3:2" | "1:1";
  recommendation: string;
}

export interface PreviewCopy {
  eyebrow: string;
  headlineLines: readonly string[];
  subheadLines: readonly string[];
  bodyLines: readonly string[];
}

export interface MobilePreviewCopy {
  firstLayer: string;
  secondLayer: string | readonly string[];
  evidence?: string;
}

export interface CaseArtwork {
  src: `/kv/cases/${string}`;
  alt: string;
  width: number;
  height: number;
  desktopSlices?: readonly {
    src: `/kv/cases/${string}`;
    width: number;
    height: number;
  }[];
  mobileSlices?: readonly {
    src: `/kv/cases/${string}`;
    width: number;
    height: number;
  }[];
  mobile: {
    src: `/kv/cases/${string}`;
    width: number;
    height: number;
  };
}

export interface RecruiterSummary {
  title: string;
  subtitle: string;
  objective: string;
  scope: string;
  showMeta?: boolean;
  contributions: readonly {
    title: string;
    description: string;
  }[];
  validationLabel?: string;
  validation: readonly string[];
}

export interface ProjectDefinition {
  id: ProjectId;
  label: string;
  title: string;
  year: string;
  summary: string;
  previewCopy: PreviewCopy;
  mobilePreviewCopy: MobilePreviewCopy;
  href:
    | typeof FEATURED_CASE.overviewHref
    | (typeof FEATURED_CASE_CHAPTER_PATHS)[FeaturedCaseChapter];
  kind: "about" | "case";
  buttonDefault: `/kv/buttons/${string}-default.png`;
  buttonActive: `/kv/buttons/${string}-active.png`;
  caseArtwork?: CaseArtwork;
  recruiterSummary?: RecruiterSummary;
  analyticsSections: readonly { label: string; end: number }[];
  media: readonly MediaSlot[];
}

export const PROJECT_OVERVIEW_PREVIEW_COPY = {
  eyebrow: "PROJECT OVERVIEW",
  headlineLines: ["ANKER INNOVATIONS", "IFA 2025 · 全球品牌升级"],
  subheadLines: ["母品牌识别 · 子品牌上市 · 发布会传播"],
  bodyLines: [
    "项目是 ANKER INNOVATIONS 全球品牌升级、IFA 2025",
    "官宣。围绕“提升子品牌多品类转化”，拆成三条设计目标，由",
    "三个子项目分别落地——母品牌识别、SOLIX 子品牌上市、",
    "IFA 发布会传播；",
  ],
} satisfies PreviewCopy;

export const PROJECT_OVERVIEW_MOBILE_PREVIEW_COPY = {
  firstLayer: "PROJECT OVERVIEW",
  secondLayer: ["ANKER INNOVATIONS", "IFA 2025 · 全球品牌升级"],
} satisfies MobilePreviewCopy;

export const PROJECTS = [
  {
    id: "about",
    label: "PROJECT OVERVIEW",
    title: "Case Overview",
    year: "IFA 2025",
    summary: "Art direction evidence: visual strategy, product campaign and global launch execution.",
    previewCopy: {
      eyebrow: "SENIOR ART DIRECTOR · PRODUCT LAUNCH",
      headlineLines: ["我是KID（龙昊翔）"],
      subheadLines: ["一个人类 · 产品发布与创意视觉策略"],
      bodyLines: [],
    },
    mobilePreviewCopy: {
      firstLayer: "SENIOR ART DIRECTOR · PRODUCT LAUNCH",
      secondLayer: "我是KID（龙昊翔）",
    },
    href: FEATURED_CASE.overviewHref,
    kind: "case",
    buttonDefault: "/kv/buttons/about-default.png",
    buttonActive: "/kv/buttons/about-active.png",
    recruiterSummary: {
      title: "OPPO E0152P · 创意视觉证据",
      subtitle: "以 ANKER INNOVATIONS IFA 2025 三组真实项目验证",
      objective: "用视觉策略、产品上市创意与全球发布执行三类项目，说明如何从市场与用户判断出发，建立有记忆点并能跨触点落地的视觉方向。",
      scope: "视觉策略与品牌系统 · 产品主视觉与上市传播 · 国际发布会与整合内容",
      showMeta: false,
      contributions: [
        {
          title: "视觉策略",
          description: "从业务目标、用户理解与品牌关系推导视觉方向，把抽象判断转化为可执行的设计目标与标准。",
        },
        {
          title: "产品创意",
          description: "建立产品视觉锤、场景叙事与色彩调性，并在 DTC 页面中把产品价值转化为连续的购买判断。",
        },
        {
          title: "整合落地",
          description: "将创意方向统筹至发布会、官网、社媒和线下体验，处理跨团队协作中的质量与一致性。",
        },
      ],
      validationLabel: "匹配证据",
      validation: [
        "BRAND SYSTEM · PRODUCT LAUNCH · LAUNCH EVENT 三组完整案例",
        "覆盖视觉策略、产品上市与全球发布的真实执行证据",
      ],
    },
    caseArtwork: {
      src: "/kv/cases/project-overview-r4.png",
      alt: "Project overview case study",
      width: 5760,
      height: 8472,
      desktopSlices: [
        { src: "/kv/cases/桌面端/project-overview/Slice-01.webp", width: 5760, height: 2200 },
        { src: "/kv/cases/桌面端/project-overview/Slice-02.webp", width: 5760, height: 2200 },
        { src: "/kv/cases/桌面端/project-overview/Slice-03.webp", width: 5760, height: 2200 },
        { src: "/kv/cases/桌面端/project-overview/Slice-04.webp", width: 5760, height: 1872 },
      ],
      mobileSlices: [
        { src: "/kv/cases/移动端/project-overview/Slice-01.webp", width: 4560, height: 2300 },
        { src: "/kv/cases/移动端/project-overview/Slice-02.webp", width: 4560, height: 2300 },
        { src: "/kv/cases/移动端/project-overview/Slice-03.webp", width: 4560, height: 2300 },
        { src: "/kv/cases/移动端/project-overview/Slice-04.webp", width: 4560, height: 2300 },
        { src: "/kv/cases/移动端/project-overview/Slice-05.webp", width: 4560, height: 1590 },
      ],
      mobile: {
        src: "/kv/cases/project-overview-mobile-r4.png",
        width: 4560,
        height: 10790,
      },
    },
    analyticsSections: [
      { label: "OVERVIEW", end: 0.32 },
      { label: "BUSINESS GOAL", end: 0.44 },
      { label: "DESIGN LOGIC", end: 0.69 },
      { label: "CASE PATHS", end: 0.92 },
      { label: "OUTCOME", end: 1 },
    ],
    media: [],
  },
  {
    id: "business",
    label: "00 BUSINESS CONTEXT",
    title: "Business Context",
    year: "IFA 2025",
    summary: "Business objectives, project framing and design requirements.",
    previewCopy: {
      eyebrow: "00 BUSINESS CONTEXT",
      headlineLines: ["业务洞察与设计目标"],
      subheadLines: ["将复杂业务问题转化为清晰", "的设计方向"],
      bodyLines: [
        "通过业务链路梳理、用户诉求判断、展会触点拆解与竞品",
        "观察，建立从业务目标到视觉系统策略的判断依据。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "00 BUSINESS CONTEXT",
      secondLayer: "将复杂业务问题转化为清晰的设计方向",
    },
    href: FEATURED_CASE_CHAPTER_PATHS.business,
    kind: "case",
    buttonDefault: "/kv/buttons/design-logic-default.png",
    buttonActive: "/kv/buttons/design-logic-active.png",
    recruiterSummary: {
      title: "ANKER INNOVATIONS IFA 2025",
      subtitle: "业务洞察与设计目标",
      objective: "围绕“提升子品牌多品类转化效率”，识别品牌、渠道和传播链路中的关键问题，并转化为可执行的设计方向。",
      scope: "业务链路梳理 · 品牌数据分析 · 用户诉求研究 · 展会触点拆解 · 竞品研究 · 设计目标定义",
      contributions: [
        {
          title: "业务链路建模",
          description: "梳理内容生产、媒体与 KOL、线上渠道、线下体验及消费者决策之间的关系，定位影响转化的关键环节。",
        },
        {
          title: "核心问题定义",
          description: "结合品牌数据、用户诉求与展会旅程，识别子品牌认知不足、购买决策成本高和传播转化有限三类问题。",
        },
        {
          title: "设计目标转译",
          description: "将业务问题转化为“建立母子品牌关联、清晰传达品类价值、强化发布会记忆点”三条设计目标。",
        },
      ],
      validationLabel: "策略产出",
      validation: [
        "三条设计目标分别进入 BRAND SYSTEM、PRODUCT LAUNCH、LAUNCH EVENT",
        "形成从业务判断到设计落地的完整项目结构",
      ],
    },
    analyticsSections: [
      { label: "OVERVIEW", end: 0.14 },
      { label: "BUSINESS CHAIN", end: 0.3 },
      { label: "BUSINESS ANALYSIS", end: 0.46 },
      { label: "USER NEEDS", end: 0.62 },
      { label: "EXHIBITION JOURNEY", end: 0.78 },
      { label: "COMPETITOR", end: 0.92 },
      { label: "DESIGN GOAL", end: 1 },
    ],
    caseArtwork: {
      src: "/kv/cases/design-logic.png",
      alt: "Design logic case study",
      width: 5760,
      height: 22882,
      desktopSlices: [
        { src: "/kv/cases/桌面端/design-logic/Slice-44.webp", width: 3840, height: 3599 },
        { src: "/kv/cases/桌面端/design-logic/Slice-45.webp", width: 3840, height: 4635 },
        { src: "/kv/cases/桌面端/design-logic/Slice-46.webp", width: 3840, height: 4469 },
        { src: "/kv/cases/桌面端/design-logic/Slice-47.webp", width: 3840, height: 2092 },
      ],
      mobileSlices: [
        { src: "/kv/cases/移动端/design-logic/Slice-44.webp", width: 3840, height: 4546 },
        { src: "/kv/cases/移动端/design-logic/Slice-45.webp", width: 3840, height: 5855 },
        { src: "/kv/cases/移动端/design-logic/Slice-46.webp", width: 3840, height: 5645 },
        { src: "/kv/cases/移动端/design-logic/Slice-47.webp", width: 3840, height: 2643 },
      ],
      mobile: {
        src: "/kv/cases/design-logic-mobile.png",
        width: 4560,
        height: 22192,
      },
    },
    media: [
      {
        id: "hero",
        label: "HERO IMAGE",
        ratio: "16:9",
        recommendation: "2560×1440",
      },
      {
        id: "process",
        label: "PROCESS DIAGRAM",
        ratio: "3:2",
        recommendation: "2400×1600",
      },
    ],
  },
  {
    id: "brand-system",
    label: "01 BRAND SYSTEM",
    title: "Mother & Sub-brand System",
    year: "IFA 2025",
    summary: "A visual relationship system for Anker and SOLIX.",
    previewCopy: {
      eyebrow: "01 BRAND SYSTEM",
      headlineLines: ["建立母子品牌关系，", "提升子品牌认知"],
      subheadLines: ["母品牌视觉符号系统构建"],
      bodyLines: [
        "将品牌战略中的“光”，转译为母品牌可承载、子品牌",
        "可继承、多触点可复用的视觉符号规则。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "01 BRAND SYSTEM",
      secondLayer: "Anker innovations 视觉符号系统构建",
    },
    href: FEATURED_CASE_CHAPTER_PATHS["brand-system"],
    kind: "case",
    buttonDefault: "/kv/buttons/brand-system-default.png",
    buttonActive: "/kv/buttons/brand-system-active.png",
    recruiterSummary: {
      title: "ANKER INNOVATIONS",
      subtitle: "从品牌判断到视觉方向的系统构建",
      objective: "建立清晰的母子品牌关系，让母品牌资产可继承、子品牌表达可区分，并适配多场景与多触点传播。",
      scope: "品牌视觉策略 · 品牌符号模块 · 母子品牌映射规则 · 光型样本库 · AIGC 工作流",
      contributions: [
        {
          title: "品牌符号",
          description: "将品牌战略中的“光”转译为可识别、可继承的核心视觉符号，建立母品牌统一的视觉感知基础。",
        },
        {
          title: "母子品牌规则",
          description: "依据品牌定位，将统一的光型体系映射为 Anker、soundcore、eufy 不同的能量、节奏与情绪表达。",
        },
        {
          title: "规模化应用",
          description: "建立光型样本库、Prompt 模板与人工筛选机制，使视觉资产稳定应用于发布会、官网、社媒和渠道内容。",
        },
      ],
      validationLabel: "应用验证",
      validation: [
        "覆盖 Anker、soundcore、eufy 品牌表达及多类传播触点",
        "将品牌符号从“可生成”推进到“可应用”",
      ],
    },
    analyticsSections: [
      { label: "OVERVIEW", end: 0.18 },
      { label: "BRAND STRATEGY", end: 0.42 },
      { label: "VISUAL SYSTEM", end: 0.62 },
      { label: "APPLICATION", end: 0.86 },
      { label: "OUTCOME", end: 1 },
    ],
    caseArtwork: {
      src: "/kv/cases/brand-system.png",
      alt: "Brand system case study",
      width: 3299,
      height: 32768,
      desktopSlices: [
        { src: "/kv/cases/桌面端/brand-system/Slice-36.webp", width: 3840, height: 2917 },
        { src: "/kv/cases/桌面端/brand-system/Slice-37.webp", width: 3840, height: 4229 },
        { src: "/kv/cases/桌面端/brand-system/Slice-38.webp", width: 3840, height: 3226 },
        { src: "/kv/cases/桌面端/brand-system/Slice-39.webp", width: 3840, height: 5813 },
        { src: "/kv/cases/桌面端/brand-system/Slice-40.webp", width: 3840, height: 3968 },
        { src: "/kv/cases/桌面端/brand-system/Slice-41.webp", width: 3840, height: 6069 },
        { src: "/kv/cases/桌面端/brand-system/Slice-42.webp", width: 3840, height: 5547 },
        { src: "/kv/cases/桌面端/brand-system/Slice-43.webp", width: 3840, height: 6289 },
      ],
      mobileSlices: [
        { src: "/kv/cases/移动端/brand-system/Slice-36.webp", width: 3840, height: 3687 },
        { src: "/kv/cases/移动端/brand-system/Slice-37.webp", width: 3840, height: 5345 },
        { src: "/kv/cases/移动端/brand-system/Slice-38.webp", width: 3840, height: 4077 },
        { src: "/kv/cases/移动端/brand-system/Slice-39.webp", width: 3840, height: 7346 },
        { src: "/kv/cases/移动端/brand-system/Slice-40.webp", width: 3840, height: 5014 },
        { src: "/kv/cases/移动端/brand-system/Slice-41.webp", width: 3840, height: 7670 },
        { src: "/kv/cases/移动端/brand-system/Slice-42.webp", width: 3840, height: 7009 },
        { src: "/kv/cases/移动端/brand-system/Slice-43.webp", width: 3840, height: 7947 },
      ],
      mobile: {
        src: "/kv/cases/brand-system-mobile.png",
        width: 2618,
        height: 32768,
      },
    },
    media: [
      {
        id: "hero",
        label: "HERO IMAGE",
        ratio: "16:9",
        recommendation: "2560×1440",
      },
      {
        id: "system",
        label: "SYSTEM DIAGRAM",
        ratio: "3:2",
        recommendation: "2400×1600",
      },
    ],
  },
  {
    id: "product-launch",
    label: "02 PRODUCT LAUNCH",
    title: "SOLIX Product Launch",
    year: "IFA 2025",
    summary: "Launch communication, product value and DTC structure.",
    previewCopy: {
      eyebrow: "02 PRODUCT LAUNCH",
      headlineLines: ["清晰传达子品牌价值"],
      subheadLines: [
        "ANKER SOLIX PRIME E10 全球新品上市传播与 DTC 转化设计",
      ],
      bodyLines: [
        "通过 PRIME E10 的上市传播与页面承接，帮助",
        "ANKER SOLIX 在家庭能源安全与持续供能场景中建立",
        "更清晰的品类角色。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "02 PRODUCT LAUNCH",
      secondLayer: "Anker SOLIX Prime E10 全球新品上市传播与 DTC 转化设计",
    },
    href: FEATURED_CASE_CHAPTER_PATHS["product-launch"],
    kind: "case",
    buttonDefault: "/kv/buttons/product-launch-default.png",
    buttonActive: "/kv/buttons/product-launch-active.png",
    recruiterSummary: {
      title: "ANKER SOLIX PRIME E10",
      subtitle: "产品主视觉、场景叙事与上市传播",
      objective: "降低用户理解成本与购买决策风险，同时强化 SOLIX 在家庭能源系统中的品类价值。",
      scope: "上市视觉策略 · 产品视觉识别 · AIGC 生成规则 · DTC 信息架构与页面设计",
      contributions: [
        {
          title: "产品识别",
          description: "建立 E10 产品识别与视觉锤，明确 Infinite Power 的核心概念与品类记忆。",
        },
        {
          title: "视觉调性与 AIGC 规则",
          description: "以黑色、能量蓝和阳光橙平衡系统科技感与家庭安心感，并沉淀为 AIGC 生成规则，统一多触点输出。",
        },
        {
          title: "DTC 购买判断",
          description: "围绕家庭价值、系统能力与配置选择重组页面信息，推动用户从产品理解进入购买判断。",
        },
      ],
      validation: [
        "页面阅读深度 65%",
        "Bundle 选择率 48%",
        "Checkout 入口点击 45%",
      ],
    },
    analyticsSections: [
      { label: "OVERVIEW", end: 0.16 },
      { label: "PRODUCT VALUE", end: 0.34 },
      { label: "CAMPAIGN SYSTEM", end: 0.56 },
      { label: "CONTENT DESIGN", end: 0.74 },
      { label: "DTC CONVERSION", end: 0.92 },
      { label: "OUTCOME", end: 1 },
    ],
    caseArtwork: {
      src: "/kv/cases/product-launch-r2.png",
      alt: "Product launch case study",
      width: 2375,
      height: 32768,
      desktopSlices: [
        { src: "/kv/cases/桌面端/product-launch-r2/Slice-26.webp", width: 3840, height: 4624 },
        { src: "/kv/cases/桌面端/product-launch-r2/Slice-27.webp", width: 3840, height: 4735 },
        { src: "/kv/cases/桌面端/product-launch-r2/Slice-28.webp", width: 3840, height: 5848 },
        { src: "/kv/cases/桌面端/product-launch-r2/Slice-29.webp", width: 3840, height: 7500 },
        { src: "/kv/cases/桌面端/product-launch-r2/Slice-30.webp", width: 3840, height: 5304 },
        { src: "/kv/cases/桌面端/product-launch-r2/Slice-31.webp", width: 3840, height: 4279 },
        { src: "/kv/cases/桌面端/product-launch-r2/Slice-32.webp", width: 3840, height: 8355 },
        { src: "/kv/cases/桌面端/product-launch-r2/Slice-33.webp", width: 3840, height: 3514 },
        { src: "/kv/cases/桌面端/product-launch-r2/Slice-34.webp", width: 3840, height: 5979 },
        { src: "/kv/cases/桌面端/product-launch-r2/Slice-35.webp", width: 3840, height: 2749 },
      ],
      mobileSlices: [
        { src: "/kv/cases/移动端/product-launch-r2/Slice-26.webp", width: 3840, height: 5841 },
        { src: "/kv/cases/移动端/product-launch-r2/Slice-27.webp", width: 3840, height: 5981 },
        { src: "/kv/cases/移动端/product-launch-r2/Slice-28.webp", width: 3840, height: 7387 },
        { src: "/kv/cases/移动端/product-launch-r2/Slice-29.webp", width: 3840, height: 9474 },
        { src: "/kv/cases/移动端/product-launch-r2/Slice-30.webp", width: 3840, height: 6700 },
        { src: "/kv/cases/移动端/product-launch-r2/Slice-31.webp", width: 3840, height: 5405 },
        { src: "/kv/cases/移动端/product-launch-r2/Slice-32.webp", width: 3840, height: 10554 },
        { src: "/kv/cases/移动端/product-launch-r2/Slice-33.webp", width: 3840, height: 4439 },
        { src: "/kv/cases/移动端/product-launch-r2/Slice-34.webp", width: 3840, height: 7553 },
        { src: "/kv/cases/移动端/product-launch-r2/Slice-35.webp", width: 3840, height: 3607 },
      ],
      mobile: {
        src: "/kv/cases/product-launch-mobile-r2.png",
        width: 1887,
        height: 32768,
      },
    },
    media: [
      {
        id: "hero",
        label: "HERO IMAGE",
        ratio: "16:9",
        recommendation: "2560×1440",
      },
      {
        id: "video",
        label: "VIDEO",
        ratio: "16:9",
        recommendation: "MP4 OR WEBM",
      },
    ],
  },
  {
    id: "launch-event",
    label: "03 LAUNCH EVENT",
    title: "IFA Launch Event",
    year: "IFA 2025",
    summary: "Key visual, event narrative and multi-touchpoint content.",
    previewCopy: {
      eyebrow: "03 LAUNCH EVENT",
      headlineLines: ["强化发布会记忆点与", "传播连续性"],
      subheadLines: ["IFA 全球发布会传播与内容系统"],
      bodyLines: [
        "将品牌升级后的视觉系统，转化为发布会可识别、",
        "可延展、可连续传播的内容系统。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "03 LAUNCH EVENT",
      secondLayer: "IFA 全球发布会传播与内容系统",
    },
    href: FEATURED_CASE_CHAPTER_PATHS["launch-event"],
    kind: "case",
    buttonDefault: "/kv/buttons/launch-event-default.png",
    buttonActive: "/kv/buttons/launch-event-active.png",
    recruiterSummary: {
      title: "ANKER INNOVATIONS IFA 2025",
      subtitle: "国际发布会的创意统筹与整合执行",
      objective: "以 IFA 全球发布会承接品牌升级，强化发布会记忆点，并让品牌、新品内容在展前、展中、展后保持连续传播。",
      scope: "发布会视觉策略 · 主视觉系统 · 展前预热 · Keynote 与现场内容 · 展后 Recap 与官网承接",
      contributions: [
        {
          title: "发布会主视觉",
          description: "将母品牌“光”资产转化为发布会核心视觉，建立明暗双模式及跨触点统一的识别基础。",
        },
        {
          title: "传播内容链路",
          description: "组织倒计时、官网预热、直播、Keynote、现场物料和展后 Recap，形成“抢占关注—组织理解—延长传播”的完整链路。",
        },
        {
          title: "多品牌内容整合",
          description: "在统一系统下承接 Anker、eufy、soundcore 的品牌与新品内容，保证多品牌、多产品和多场景传播的一致性。",
        },
      ],
      validationLabel: "应用验证",
      validation: [
        "覆盖展前、展中、展后三个传播阶段",
        "覆盖官网、直播、Keynote、现场物料及产品内容等核心触点",
      ],
    },
    analyticsSections: [
      { label: "OVERVIEW", end: 0.16 },
      { label: "EVENT STRATEGY", end: 0.34 },
      { label: "CONTENT SYSTEM", end: 0.54 },
      { label: "VISUAL SYSTEM", end: 0.72 },
      { label: "TOUCHPOINTS", end: 0.9 },
      { label: "OUTCOME", end: 1 },
    ],
    caseArtwork: {
      src: "/kv/cases/launch-event.png",
      alt: "Launch event case study",
      width: 4786,
      height: 32768,
      desktopSlices: [
        { src: "/kv/cases/桌面端/launch-event/Slice-20.webp", width: 3840, height: 2900 },
        { src: "/kv/cases/桌面端/launch-event/Slice-21.webp", width: 3840, height: 4874 },
        { src: "/kv/cases/桌面端/launch-event/Slice-22.webp", width: 3840, height: 3917 },
        { src: "/kv/cases/桌面端/launch-event/Slice-23.webp", width: 3840, height: 4787 },
        { src: "/kv/cases/桌面端/launch-event/Slice-24.webp", width: 3840, height: 6553 },
        { src: "/kv/cases/桌面端/launch-event/Slice-25.webp", width: 3840, height: 3265 },
      ],
      mobileSlices: [
        { src: "/kv/cases/移动端/launch-event/Slice-20.webp", width: 3840, height: 3663 },
        { src: "/kv/cases/移动端/launch-event/Slice-21.webp", width: 3840, height: 6157 },
        { src: "/kv/cases/移动端/launch-event/Slice-22.webp", width: 3840, height: 4948 },
        { src: "/kv/cases/移动端/launch-event/Slice-23.webp", width: 3840, height: 6047 },
        { src: "/kv/cases/移动端/launch-event/Slice-24.webp", width: 3840, height: 8278 },
        { src: "/kv/cases/移动端/launch-event/Slice-25.webp", width: 3840, height: 4125 },
      ],
      mobile: {
        src: "/kv/cases/launch-event-mobile.png",
        width: 3789,
        height: 32768,
      },
    },
    media: [
      {
        id: "hero",
        label: "HERO IMAGE",
        ratio: "16:9",
        recommendation: "2560×1440",
      },
      {
        id: "stage",
        label: "EVENT SYSTEM",
        ratio: "3:2",
        recommendation: "2400×1600",
      },
    ],
  },
] as const satisfies readonly ProjectDefinition[];

export const FEATURED_CASE_NAVIGATION = [
  { id: "about", label: "OVERVIEW" },
  { id: "business", label: "00 CONTEXT" },
  { id: "brand-system", label: "01 BRAND" },
  { id: "product-launch", label: "02 PRODUCT" },
  { id: "launch-event", label: "03 EVENT" },
] as const satisfies readonly { id: ProjectId; label: string }[];

export const LEGACY_PROJECT_REDIRECTS = {
  about: FEATURED_CASE.overviewHref,
  business: FEATURED_CASE_CHAPTER_PATHS.business,
  "brand-system": FEATURED_CASE_CHAPTER_PATHS["brand-system"],
  "product-launch": FEATURED_CASE_CHAPTER_PATHS["product-launch"],
  "launch-event": FEATURED_CASE_CHAPTER_PATHS["launch-event"],
} as const satisfies Record<ProjectId, ProjectDefinition["href"]>;

export function getProjectById(id: ProjectId): ProjectDefinition {
  const project = PROJECTS.find((candidate) => candidate.id === id);

  if (!project) {
    throw new Error(`Unknown project: ${id}`);
  }

  return project;
}

export function getProjectByPath(
  pathname: string,
): ProjectDefinition | undefined {
  return PROJECTS.find((project) => project.href === pathname);
}

export function getProjectByChapterSlug(
  chapter: string,
): ProjectDefinition | undefined {
  return PROJECTS.find((project) => project.id !== "about" && project.id === chapter);
}
