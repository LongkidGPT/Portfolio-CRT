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

export interface ProjectDefinition {
  id: ProjectId;
  label: string;
  title: string;
  year: string;
  summary: string;
  href: "/about" | `/work/${Exclude<ProjectId, "about">}`;
  kind: "about" | "case";
  media: readonly MediaSlot[];
}

export const PROJECTS = [
  {
    id: "about",
    label: "ABOUT",
    title: "Kid Long",
    year: "2007—Present",
    summary: "Profile, capabilities, experience and contact.",
    href: "/about",
    kind: "about",
    media: [],
  },
  {
    id: "business",
    label: "BUSINESS",
    title: "Business Context",
    year: "IFA 2025",
    summary: "Business objectives, project framing and design requirements.",
    href: "/work/business",
    kind: "case",
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
    href: "/work/brand-system",
    kind: "case",
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
    href: "/work/product-launch",
    kind: "case",
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
    href: "/work/launch-event",
    kind: "case",
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
