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
  eyebrow: "PROJECT OVERVIEW",
  headlineLines: ["全球新品发布", "视觉系统"],
  subheadLines: ["前期创意 · 品牌语言 · 线上线下发布"],
  bodyLines: [
    "以 ANKER SOLIX 新品发布为例，将产品价值、视觉方向、",
    "DTC 页面、发布会与现场触点组织为同一套发布系统。",
  ],
} satisfies PreviewCopy;

export const PROJECT_OVERVIEW_MOBILE_PREVIEW_COPY = {
  firstLayer: "NEW PRODUCT LAUNCH",
  secondLayer: ["新品发布视觉系统", "从前期创意到线上线下触点"],
} satisfies MobilePreviewCopy;

export const PROJECTS = [
  {
    id: "about",
    label: "PROJECT OVERVIEW",
    title: "Project Overview",
    year: "IFA 2025",
    summary: "A launch visual system connecting product value, brand language and multi-touchpoint delivery.",
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
      subtitle: "全球新品发布视觉系统",
      objective: "围绕“提升子品牌多品类转化效率”，建立从业务判断、母品牌识别，到子品牌上市与全球发布会传播的完整设计链路。",
      scope: "前期创意与视觉方向 · 品牌语言与维护规则 · 新品发布与 DTC · 发布会及现场内容",
      showMeta: false,
      contributions: [
        {
          title: "前期判断",
          description: "从产品能力、用户理解与发布场景出发，确定新品应被如何看见、理解与记住。",
        },
        {
          title: "系统建立",
          description: "以品牌视觉语言连接产品识别、线上页面、发布会与现场内容，建立可复用的表达规则。",
        },
        {
          title: "质量落地",
          description: "通过 BRAND SYSTEM、PRODUCT LAUNCH、LAUNCH EVENT 三个子项目，控制线上线下触点的一致性与最终质量。",
        },
      ],
      validationLabel: "项目产出",
      validation: [
        "形成从前期判断、系统建立到多触点落地的完整发布链路",
        "覆盖品牌语言、新品发布、DTC 页面、发布会与现场内容",
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
    summary: "Business objectives, project framing and design requirements.",
    previewCopy: {
      eyebrow: "DESIGN LOGIC",
      headlineLines: ["从产品与发布场景", "定义视觉方向"],
      subheadLines: ["把复杂能力转为用户能理解的表达"],
      bodyLines: [
        "梳理产品价值、用户理解与线上线下发布场景，确立新品内容、",
        "视觉风格和多触点落地的共同判断。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "DESIGN LOGIC",
      secondLayer: "从产品与发布场景定义视觉方向",
    },
    href: "/work/business",
    kind: "case",
    buttonDefault: "/kv/buttons/design-logic-default.png",
    buttonActive: "/kv/buttons/design-logic-active.png",
    recruiterSummary: {
      title: "ANKER INNOVATIONS IFA 2025",
      subtitle: "新品发布的前期规划、创意与视觉方向",
      objective: "围绕“提升子品牌多品类转化效率”，识别品牌、渠道和传播链路中的关键问题，并转化为可执行的设计方向。",
      scope: "产品价值与用户理解 · 发布场景拆解 · 品牌与产品关系 · 创意及视觉方向提案",
      contributions: [
        {
          title: "产品与场景梳理",
          description: "梳理产品价值、用户理解及线上、线下与展会场景，为内容设计确定范围与优先级。",
        },
        {
          title: "视觉方向提案",
          description: "结合品牌关系、产品价值与发布环境，提出新品与品牌内容的视觉表达重点。",
        },
        {
          title: "发布系统衔接",
          description: "将前期判断带入品牌系统、新品发布与发布会传播，使后续触点使用同一套表达逻辑。",
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
    summary: "A visual relationship system for Anker and SOLIX.",
    previewCopy: {
      eyebrow: "DESIGN GOAL 01",
      headlineLines: ["建立可维护的品牌语言，", "支持新品持续发布"],
      subheadLines: ["品牌视觉语言、规范与多触点维护"],
      bodyLines: [
        "将品牌战略中的“光”转化为可延展、可维护的视觉语言，",
        "为新品、展会与传播内容提供统一而可更新的风格基础。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "DESIGN GOAL 01",
      secondLayer: "Anker innovations 品牌视觉语言与维护规范",
    },
    href: "/work/brand-system",
    kind: "case",
    buttonDefault: "/kv/buttons/brand-system-default.png",
    buttonActive: "/kv/buttons/brand-system-active.png",
    recruiterSummary: {
      title: "ANKER INNOVATIONS",
      subtitle: "品牌视觉语言、维护规则与发布风格规范",
      objective: "建立清晰的母子品牌关系，让母品牌资产可继承、子品牌表达可区分，并适配多场景与多触点传播。",
      scope: "视觉方向探索 · 品牌符号系统 · 既有视觉优化与维护 · 多触点应用 · AIGC 探索规则",
      contributions: [
        {
          title: "视觉方向探索",
          description: "围绕品牌战略中的“光”展开视觉方向探索，明确适用于品牌与新品发布的核心表达。",
        },
        {
          title: "规范与维护规则",
          description: "将统一的光型体系转化为不同品牌的能量、节奏与情绪表达，建立可执行、可维护的风格规范。",
        },
        {
          title: "规模化应用",
          description: "建立光型样本、AIGC 探索规则与人工筛选机制，使视觉语言稳定应用于发布会、官网、社媒和渠道内容。",
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
    summary: "Launch communication, product value and DTC structure.",
    previewCopy: {
      eyebrow: "DESIGN GOAL 02",
      headlineLines: ["从产品能力到", "用户能理解的新品体验"],
      subheadLines: [
        "ANKER SOLIX PRIME E10 全球新品发布视觉与 DTC 页面",
      ],
      bodyLines: [
        "围绕 PRIME E10 的产品价值与发布节奏，完成核心视觉、",
        "传播内容与 DTC 页面设计，让新品从认知进入购买判断。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "DESIGN GOAL 02",
      secondLayer: "从产品能力到用户能理解的新品体验",
    },
    href: "/work/product-launch",
    kind: "case",
    buttonDefault: "/kv/buttons/product-launch-default.png",
    buttonActive: "/kv/buttons/product-launch-active.png",
    recruiterSummary: {
      title: "ANKER SOLIX PRIME E10",
      subtitle: "全球新品发布视觉与 DTC 页面设计",
      objective: "降低用户理解成本与购买决策风险，同时强化 SOLIX 在家庭能源系统中的品类价值。",
      scope: "产品能力转译 · 新品视觉方向 · 发布内容 · DTC 信息架构与页面设计 · AIGC 质量控制",
      contributions: [
        {
          title: "产品能力转译",
          description: "建立 E10 的产品识别与视觉锤，将 Infinite Power 的核心概念转译为可被用户感知的视觉记忆。",
        },
        {
          title: "视觉风格与质量把控",
          description: "以黑色、能量蓝和阳光橙平衡系统科技感与家庭安心感，并通过 AIGC 探索与人工筛选统一多触点的最终质量。",
        },
        {
          title: "发布页面设计",
          description: "围绕家庭价值、系统能力与配置选择组织页面信息，使用户从产品理解进入购买判断。",
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
    summary: "Key visual, event narrative and multi-touchpoint content.",
    previewCopy: {
      eyebrow: "DESIGN GOAL 03",
      headlineLines: ["让发布视觉成为品牌与新品", "共同的记忆点"],
      subheadLines: ["IFA 全球发布会主视觉、内容系统与现场体验"],
      bodyLines: [
        "将品牌视觉语言转化为 IFA 发布会主视觉、预热内容、",
        "现场物料与展后传播，统一展前、展中、展后的表达。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "DESIGN GOAL 03",
      secondLayer: "IFA 全球发布会主视觉、内容系统与现场体验",
    },
    href: "/work/launch-event",
    kind: "case",
    buttonDefault: "/kv/buttons/launch-event-default.png",
    buttonActive: "/kv/buttons/launch-event-active.png",
    recruiterSummary: {
      title: "ANKER INNOVATIONS IFA 2025",
      subtitle: "IFA 全球发布会主视觉、内容系统与现场体验",
      objective: "以 IFA 全球发布会承接品牌升级，强化发布会记忆点，并让品牌、新品内容在展前、展中、展后保持连续传播。",
      scope: "发布会创意方向 · 主视觉系统 · 展前预热 · Keynote 与现场及印刷物料 · 展后传播",
      contributions: [
        {
          title: "发布会视觉方向",
          description: "将母品牌“光”资产转化为发布会核心视觉，建立明暗双模式及跨触点统一的识别基础。",
        },
        {
          title: "线上线下内容统筹",
          description: "组织倒计时、官网预热、直播、Keynote、现场与印刷物料和展后 Recap，形成完整的发布内容链路。",
        },
        {
          title: "多品牌新品表达",
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
