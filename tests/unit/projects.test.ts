import { describe, expect, it } from "vitest";
import {
  PROJECTS,
  PROJECT_OVERVIEW_MOBILE_PREVIEW_COPY,
  getProjectById,
  getProjectByPath,
} from "@/lib/portfolio/projects";

describe("project registry", () => {
  it("exposes the approved five entries in the approved order", () => {
    expect(PROJECTS.map((project) => project.id)).toEqual([
      "about",
      "business",
      "brand-system",
      "product-launch",
      "launch-event",
    ]);
  });

  it("maps every shareable path back to its project", () => {
    for (const project of PROJECTS) {
      expect(getProjectByPath(project.href)?.id).toBe(project.id);
      expect(getProjectById(project.id).href).toBe(project.href);
    }
  });

  it("exposes DESIGN LOGIC as the business entry label", () => {
    expect(getProjectById("business").label).toBe("DESIGN LOGIC");
  });

  it("opens the first project card as the responsive PROJECT OVERVIEW case", () => {
    expect(getProjectById("about")).toMatchObject({
      label: "PROJECT OVERVIEW",
      href: "/work/about",
      kind: "case",
      caseArtwork: {
        src: "/kv/cases/project-overview-r4.png",
        width: 5760,
        height: 8472,
        mobile: {
          src: "/kv/cases/project-overview-mobile-r4.png",
          width: 4560,
          height: 10790,
        },
      },
    });
  });

  it("stores the selected-state PROJECT OVERVIEW mobile copy separately", () => {
    expect(PROJECT_OVERVIEW_MOBILE_PREVIEW_COPY).toEqual({
      firstLayer: "NEW PRODUCT LAUNCH",
      secondLayer: ["新品发布视觉系统", "从前期创意到线上线下触点"],
    });
  });

  it("stores the approved two-layer mobile preview copy", () => {
    expect(
      PROJECTS.map(({ id, mobilePreviewCopy }) => ({ id, mobilePreviewCopy })),
    ).toEqual([
      {
        id: "about",
        mobilePreviewCopy: {
          firstLayer: "VISUAL DESIGNER",
          secondLayer: "我是KID（龙昊翔）",
        },
      },
      {
        id: "business",
        mobilePreviewCopy: {
          firstLayer: "DESIGN LOGIC",
          secondLayer: "把复杂能力转为用户能理解的表达",
        },
      },
      {
        id: "brand-system",
        mobilePreviewCopy: {
          firstLayer: "DESIGN GOAL 01",
          secondLayer: "品牌视觉语言、规范与多触点维护",
        },
      },
      {
        id: "product-launch",
        mobilePreviewCopy: {
          firstLayer: "DESIGN GOAL 02",
          secondLayer: "ANKER SOLIX PRIME E10 全球新品发布视觉与 DTC 页面",
        },
      },
      {
        id: "launch-event",
        mobilePreviewCopy: {
          firstLayer: "DESIGN GOAL 03",
          secondLayer: "IFA 全球发布会主视觉、内容系统与现场体验",
        },
      },
    ]);
  });

  it("stores the approved structured desktop preview copy", () => {
    expect(PROJECTS.map(({ id, previewCopy }) => ({ id, previewCopy }))).toEqual([
      {
        id: "about",
        previewCopy: {
          eyebrow: "VISUAL DESIGNER",
          headlineLines: ["我是KID（龙昊翔）"],
          subheadLines: ["一个人类 · 资深视觉设计师"],
          bodyLines: [],
        },
      },
      {
        id: "business",
        previewCopy: {
          eyebrow: "DESIGN LOGIC",
          headlineLines: ["把复杂能力转为用户能理解的表达"],
          subheadLines: [],
          bodyLines: [
            "梳理产品价值、用户理解与线上线下发布场景，确立新品内容、",
            "视觉风格和多触点落地的共同判断。",
          ],
        },
      },
      {
        id: "brand-system",
        previewCopy: {
          eyebrow: "DESIGN GOAL 01",
          headlineLines: ["品牌视觉语言、规范与多触点维护"],
          subheadLines: [],
          bodyLines: [
            "将品牌战略中的“光”转化为可延展、可维护的视觉语言，",
            "为新品、展会与传播内容提供统一而可更新的风格基础。",
          ],
        },
      },
      {
        id: "product-launch",
        previewCopy: {
          eyebrow: "DESIGN GOAL 02",
          headlineLines: ["ANKER SOLIX PRIME E10 全球新品发布视觉与 DTC 页面"],
          subheadLines: [],
          bodyLines: [
            "围绕 PRIME E10 的产品价值与发布节奏，完成核心视觉、",
            "传播内容与 DTC 页面设计，让新品从认知进入购买判断。",
          ],
        },
      },
      {
        id: "launch-event",
        previewCopy: {
          eyebrow: "DESIGN GOAL 03",
          headlineLines: ["IFA 全球发布会主视觉、内容系统与现场体验"],
          subheadLines: [],
          bodyLines: [
            "将品牌视觉语言转化为 IFA 发布会主视觉、预热内容、",
            "现场物料与展后传播，统一展前、展中、展后的表达。",
          ],
        },
      },
    ]);
    expect(getProjectById("product-launch").title).toBe(
      "SOLIX Product Launch",
    );
  });

  it("returns undefined for an unsupported path", () => {
    expect(getProjectByPath("/work/unknown")).toBeUndefined();
  });
});
