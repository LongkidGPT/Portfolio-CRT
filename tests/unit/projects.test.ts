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

  it("stores the DJI home mobile copy separately", () => {
    expect(PROJECT_OVERVIEW_MOBILE_PREVIEW_COPY).toEqual({
      firstLayer: "PROJECT OVERVIEW",
      secondLayer: ["全球新品传播与商业化系统", "从品牌语言到线上线下触点"],
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
          secondLayer: "业务洞察与设计目标",
        },
      },
      {
        id: "brand-system",
        mobilePreviewCopy: {
          firstLayer: "DESIGN GOAL 01",
          secondLayer: "品牌系统与触点应用",
        },
      },
      {
        id: "product-launch",
        mobilePreviewCopy: {
          firstLayer: "DESIGN GOAL 02",
          secondLayer: "新品传播与 DTC 转化",
        },
      },
      {
        id: "launch-event",
        mobilePreviewCopy: {
          firstLayer: "DESIGN GOAL 03",
          secondLayer: "发布会传播与内容系统",
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
          headlineLines: ["业务洞察与设计目标"],
          subheadLines: ["从产品价值、用户理解到设计方向"],
          bodyLines: [
            "从业务目标、用户场景与产品卖点出发，建立",
            "可进入新品传播与 DTC 页面设计的判断依据。",
          ],
        },
      },
      {
        id: "brand-system",
        previewCopy: {
          eyebrow: "DESIGN GOAL 01",
          headlineLines: ["品牌系统与触点应用"],
          subheadLines: ["建立可维护的全球品牌语言"],
          bodyLines: [
            "以统一的品牌视觉规则连接产品、电商与传播内容，",
            "让不同市场和渠道保持一致的识别与表达。",
          ],
        },
      },
      {
        id: "product-launch",
        previewCopy: {
          eyebrow: "DESIGN GOAL 02",
          headlineLines: ["新品传播与 DTC 转化"],
          subheadLines: ["将产品价值转为用户购买判断"],
          bodyLines: [
            "从新品传播到 DTC 页面信息架构，帮助用户理解",
            "家庭能源场景、产品价值与下一步购买选择。",
          ],
        },
      },
      {
        id: "launch-event",
        previewCopy: {
          eyebrow: "DESIGN GOAL 03",
          headlineLines: ["发布会传播与内容系统"],
          subheadLines: ["让新品发布贯穿线上、线下与展后内容"],
          bodyLines: [
            "将主视觉延展至展前、现场与展后内容，建立",
            "让新品信息在展前、现场与展后持续延展。",
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
