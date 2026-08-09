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
  secondLayer: string;
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

export interface ProjectDefinition {
  id: ProjectId;
  label: string;
  title: string;
  year: string;
  summary: string;
  previewCopy: PreviewCopy;
  mobilePreviewCopy: MobilePreviewCopy;
  href: "/about" | `/work/${Exclude<ProjectId, "about">}`;
  kind: "about" | "case";
  buttonDefault: `/kv/buttons/${string}-default.png`;
  buttonActive: `/kv/buttons/${string}-active.png`;
  caseArtwork?: CaseArtwork;
  media: readonly MediaSlot[];
}

export const PROJECTS = [
  {
    id: "about",
    label: "ABOUT",
    title: "Kid Long",
    year: "2007—Present",
    summary: "Profile, capabilities, experience and contact.",
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
    href: "/about",
    kind: "about",
    buttonDefault: "/kv/buttons/about-default.png",
    buttonActive: "/kv/buttons/about-active.png",
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
      headlineLines: ["业务洞察与设计目标"],
      subheadLines: ["将复杂业务问题转化为清晰", "的设计方向"],
      bodyLines: [
        "通过业务链路梳理、用户诉求判断、展会触点拆解与竞品",
        "观察，建立从业务目标到视觉系统策略的判断依据。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "DESIGN LOGIC",
      secondLayer: "将复杂业务问题转化为清晰的设计方向",
    },
    href: "/work/business",
    kind: "case",
    buttonDefault: "/kv/buttons/design-logic-default.png",
    buttonActive: "/kv/buttons/design-logic-active.png",
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
      headlineLines: ["建立母子品牌关系，", "提升子品牌认知"],
      subheadLines: ["母品牌视觉符号系统构建"],
      bodyLines: [
        "将品牌战略中的“光”，转译为母品牌可承载、子品牌",
        "可继承、多触点可复用的视觉符号规则。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "DESIGN GOAL 01",
      secondLayer: "Anker innovations 视觉符号系统构建",
    },
    href: "/work/brand-system",
    kind: "case",
    buttonDefault: "/kv/buttons/brand-system-default.png",
    buttonActive: "/kv/buttons/brand-system-active.png",
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
      firstLayer: "DESIGN GOAL 02",
      secondLayer: "Anker SOLIX Prime E10 全球新品上市传播与 DTC 转化设计",
    },
    href: "/work/product-launch",
    kind: "case",
    buttonDefault: "/kv/buttons/product-launch-default.png",
    buttonActive: "/kv/buttons/product-launch-active.png",
    caseArtwork: {
      src: "/kv/cases/product-launch.png",
      alt: "Product launch case study",
      width: 2375,
      height: 32768,
      mobile: {
        src: "/kv/cases/product-launch-mobile.png",
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
      headlineLines: ["强化发布会记忆点与", "传播连续性"],
      subheadLines: ["IFA 全球发布会传播与内容系统"],
      bodyLines: [
        "将品牌升级后的视觉系统，转化为发布会可识别、",
        "可延展、可连续传播的内容系统。",
      ],
    },
    mobilePreviewCopy: {
      firstLayer: "DESIGN GOAL 03",
      secondLayer: "IFA 全球发布会传播与内容系统",
    },
    href: "/work/launch-event",
    kind: "case",
    buttonDefault: "/kv/buttons/launch-event-default.png",
    buttonActive: "/kv/buttons/launch-event-active.png",
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
