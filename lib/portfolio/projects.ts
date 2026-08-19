export type ProjectId =
  | "about"
  | "business"
  | "brand-system"
  | "product-launch"
  | "launch-event";

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
}

export interface CaseArtwork {
  src: `/kv/cases/${string}`;
  alt: string;
  width: number;
  height: number;
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
  href: "/about" | `/work/${ProjectId}`;
  kind: "about" | "case";
  buttonDefault: `/kv/buttons/${string}-default.png`;
  buttonActive: `/kv/buttons/${string}-active.png`;
  caseArtwork?: CaseArtwork;
  recruiterSummary?: RecruiterSummary;
  analyticsSections: readonly { label: string; end: number }[];
  media: readonly MediaSlot[];
}

export const PROJECT_OVERVIEW_PREVIEW_COPY = {
  eyebrow: "GLOBAL PRODUCT LAUNCH & DTC",
  headlineLines: ["我是KID（龙昊翔）"],
  subheadLines: ["一个人类 · 资深视觉设计师"],
  bodyLines: [
    "10+ 年智能硬件品牌视觉经验，聚焦新品传播、",
    "电商活动与 DTC 购买路径设计。",
  ],
} satisfies PreviewCopy;

export const PROJECT_OVERVIEW_MOBILE_PREVIEW_COPY = {
  firstLayer: "GLOBAL PRODUCT LAUNCH & DTC",
  secondLayer: ["我是KID（龙昊翔）", "新品传播 · 电商活动 · DTC 转化视觉"],
} satisfies MobilePreviewCopy;

export const PROJECTS = [
  {
    id: "about",
    label: "PROJECT OVERVIEW",
    title: "Project Overview",
    year: "IFA 2025",
    summary: "10+ years in smart hardware visual design, focused on product launch and DTC conversion.",
    previewCopy: {
      eyebrow: "VISUAL DESIGNER",
      headlineLines: ["我是KID（龙昊翔）"],
      subheadLines: ["一个人类 · 资深视觉设计师"],
      bodyLines: [],
    },
    mobilePreviewCopy: {
      firstLayer: "VISUAL DESIGNER",
      secondLayer: "我是KID（龙昊翔）",
    },
    href: "/work/about",
    kind: "case",
    buttonDefault: "/kv/buttons/about-default.png",
    buttonActive: "/kv/buttons/about-active.png",
    recruiterSummary: {
      title: "ANKER INNOVATIONS",
      subtitle: "IFA 2025 · 全球新品传播与商业化设计",
      objective: "围绕“提升子品牌多品类转化效率”，建立从业务判断、母品牌识别，到子品牌上市与全球发布会传播的完整设计链路。",
      scope: "业务判断与设计目标 · 品牌符号系统 · SOLIX 新品传播与 DTC · IFA 全球发布内容",
      showMeta: false,
      contributions: [
        {
          title: "策略推导",
          description: "从品牌升级、全球发布和多品牌增长目标出发，梳理新品传播中需要由设计解决的问题，并形成三个设计方向。",
        },
        {
          title: "系统联动",
          description: "以品牌视觉资产为基础，连接品牌识别、产品价值表达与发布内容，让不同触点保持同一传播逻辑。",
        },
        {
          title: "项目落地",
          description: "通过品牌系统、新品 DTC 与发布会传播三个项目，把设计方向落到品牌、产品与渠道内容中。",
        },
      ],
      validationLabel: "项目产出",
      validation: [
        "形成品牌视觉系统、新品传播与 DTC、发布会传播三类项目输出",
        "建立从业务判断到多触点落地的项目结构",
      ],
    },
    caseArtwork: {
      src: "/kv/cases/project-overview-r4.png",
      alt: "Project overview case study",
      width: 5760,
      height: 8472,
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
    label: "DESIGN LOGIC",
    title: "Business Context",
    year: "IFA 2025",
    summary: "From product value and user needs to a clear design direction.",
    previewCopy: {
      eyebrow: "DESIGN LOGIC",
      headlineLines: ["产品价值与用户理解"],
      subheadLines: ["新品传播、电商页面与购买路径的设计判断"],
      bodyLines: [
        "从业务目标、用户场景与产品卖点出发，建立",
        "可进入新品传播与 DTC 页面设计的判断依据。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "DESIGN LOGIC",
      secondLayer: "从产品价值与用户理解到设计判断",
    },
    href: "/work/business",
    kind: "case",
    buttonDefault: "/kv/buttons/design-logic-default.png",
    buttonActive: "/kv/buttons/design-logic-active.png",
    recruiterSummary: {
      title: "ANKER INNOVATIONS IFA 2025",
      subtitle: "新品商业化与设计判断",
      objective: "围绕 IFA 新品发布，梳理品牌、产品与渠道中的传播问题，明确新品价值表达、页面承接与发布传播的设计任务。",
      scope: "业务链路梳理 · 用户场景与产品价值 · 渠道及触点分析 · 竞品观察 · 设计目标定义",
      contributions: [
        {
          title: "业务链路建模",
          description: "连接产品价值、内容生产、线上渠道、线下体验与用户决策，定位设计需要介入的关键环节。",
        },
        {
          title: "传播问题定义",
          description: "识别产品价值表达、用户理解与多触点承接中的关键问题，为新品上市确定设计优先级。",
        },
        {
          title: "设计目标转译",
          description: "将业务问题转化为“建立母子品牌关联、清晰传达品类价值、强化发布会记忆点”三条设计目标。",
        },
      ],
      validationLabel: "策略产出",
      validation: [
        "形成品牌系统、新品传播与 DTC、发布会传播三条落地路径",
        "建立从业务判断到设计落地的完整项目结构",
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
    label: "BRAND SYSTEM",
    title: "Mother & Sub-brand System",
    year: "IFA 2025",
    summary: "A global visual language connecting brand, product and channel touchpoints.",
    previewCopy: {
      eyebrow: "DESIGN GOAL 01",
      headlineLines: ["建立全球品牌语言，", "支撑多触点传播"],
      subheadLines: ["品牌识别与跨市场内容延展"],
      bodyLines: [
        "以统一的品牌视觉规则连接产品、电商与传播内容，",
        "让不同市场和渠道保持一致的识别与表达。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "DESIGN GOAL 01",
      secondLayer: "品牌识别与跨市场内容延展",
    },
    href: "/work/brand-system",
    kind: "case",
    buttonDefault: "/kv/buttons/brand-system-default.png",
    buttonActive: "/kv/buttons/brand-system-active.png",
    recruiterSummary: {
      title: "ANKER INNOVATIONS",
      subtitle: "全球品牌视觉系统与营销触点应用",
      objective: "建立清晰的母子品牌关系，使产品、电商与传播内容在不同市场保持一致表达。",
      scope: "品牌视觉策略 · 核心符号与规范 · 母子品牌映射 · 电商/社媒/发布触点 · AIGC 协同",
      contributions: [
        {
          title: "品牌符号",
          description: "将“光”转化为核心视觉符号，形成可用于新品传播与品牌内容的统一识别。",
        },
        {
          title: "母子品牌规则",
          description: "根据不同品牌定位，定义 Anker、soundcore、eufy 的视觉节奏与情绪边界，并保证系统关联。",
        },
        {
          title: "规模化应用",
          description: "建立光型样本、Prompt 模板和人工筛选机制，支持发布会、官网、电商、社媒等内容持续产出。",
        },
      ],
      validationLabel: "应用验证",
      validation: [
        "覆盖多品牌及官网、电商、社媒、发布会等传播触点",
        "形成可复用的品牌视觉资产与协同方式",
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
    label: "PRODUCT LAUNCH",
    title: "SOLIX Product Launch",
    year: "IFA 2025",
    summary: "SOLIX product launch: product value, DTC information and conversion validation.",
    previewCopy: {
      eyebrow: "DESIGN GOAL 02",
      headlineLines: ["将产品价值转化为", "用户购买判断"],
      subheadLines: [
        "ANKER SOLIX PRIME E10 全球新品上市传播与 DTC 转化设计",
      ],
      bodyLines: [
        "从新品传播到 DTC 页面信息架构，帮助用户理解",
        "家庭能源场景、产品价值与下一步购买选择。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "DESIGN GOAL 02",
      secondLayer: "新品传播与 DTC 转化设计",
    },
    href: "/work/product-launch",
    kind: "case",
    buttonDefault: "/kv/buttons/product-launch-default.png",
    buttonActive: "/kv/buttons/product-launch-active.png",
    recruiterSummary: {
      title: "ANKER SOLIX PRIME E10",
      subtitle: "北美新品上市传播与 DTC 转化设计",
      objective: "围绕北美家庭能源场景，梳理产品价值与页面信息，帮助用户理解产品、完成购买判断。",
      scope: "产品价值梳理 · 创意概念与 KV · 视觉调性与 AIGC 规则 · DTC 信息架构 · 多触点传播延展",
      contributions: [
        {
          title: "产品价值与创意概念",
          description: "围绕北美家庭能源安全与持续供能场景，梳理核心卖点并定义 Infinite Power 的传播概念、主视觉和产品识别。",
        },
        {
          title: "DTC 信息架构",
          description: "重组产品理解、卖点阅读、配置选择与预售行动的页面路径，让用户完成从了解产品到购买判断的推进。",
        },
        {
          title: "多触点延展与品质协同",
          description: "将主视觉延展至 DTC 页面、电商、社媒与发布物料，协作 3D 渲染供应商及相关团队，以 AIGC 规则保障输出质量。",
        },
      ],
      validation: [
        "预售页点击率 1.5% → 2.6%",
        "浏览量 +15%",
        "加购率 +8%",
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
    label: "LAUNCH EVENT",
    title: "IFA Launch Event",
    year: "IFA 2025",
    summary: "Launch visual and multi-touchpoint content across the event communication journey.",
    previewCopy: {
      eyebrow: "DESIGN GOAL 03",
      headlineLines: ["让新品发布视觉贯穿", "线上线下传播体验"],
      subheadLines: ["全球发布会核心视觉与内容系统"],
      bodyLines: [
        "将主视觉延展至展前、现场与展后内容，建立",
        "让新品信息在展前、现场与展后持续延展。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "DESIGN GOAL 03",
      secondLayer: "全球发布会核心视觉与内容系统",
    },
    href: "/work/launch-event",
    kind: "case",
    buttonDefault: "/kv/buttons/launch-event-default.png",
    buttonActive: "/kv/buttons/launch-event-active.png",
    recruiterSummary: {
      title: "ANKER INNOVATIONS IFA 2025",
      subtitle: "全球新品发布传播与内容系统",
      objective: "以 IFA 全球发布会承接品牌升级，强化发布会记忆点，并让品牌、新品内容在展前、展中、展后保持连续传播。",
      scope: "新品发布策略 · 主视觉系统 · 展前预热 · Keynote 与现场内容 · 展后官网与社媒承接",
      contributions: [
        {
          title: "发布会主视觉",
          description: "将“光”资产转化为发布会主视觉，定义明暗两种表达方式，并延展至不同传播内容。",
        },
        {
          title: "传播内容链路",
          description: "统筹倒计时、官网预热、直播、Keynote、现场物料与展后 Recap，使新品信息在各阶段连续出现。",
        },
        {
          title: "多品牌内容整合",
          description: "在统一主视觉下承接 Anker、eufy、soundcore 的品牌和新品内容，协调不同产品、内容与现场物料。",
        },
      ],
      validationLabel: "应用验证",
      validation: [
        "覆盖展前预热、展中发布与展后内容延展",
        "落地官网、直播、Keynote、现场物料及新品内容",
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
