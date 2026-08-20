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
      firstLayer: "GLOBAL PRODUCT LAUNCH & DTC",
      secondLayer: ["我是KID（龙昊翔）", "新品传播 · 电商活动 · DTC 转化视觉"],
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
          secondLayer: "从产品价值与用户理解到设计判断",
        },
      },
      {
        id: "brand-system",
        mobilePreviewCopy: {
          firstLayer: "DESIGN GOAL 01",
          secondLayer: "品牌识别与跨市场内容延展",
        },
      },
      {
        id: "product-launch",
        mobilePreviewCopy: {
          firstLayer: "DESIGN GOAL 02",
          secondLayer:
            "新品传播与 DTC 转化设计",
        },
      },
      {
        id: "launch-event",
        mobilePreviewCopy: {
          firstLayer: "DESIGN GOAL 03",
          secondLayer: "全球发布会核心视觉与内容系统",
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
          headlineLines: ["产品价值与用户理解"],
          subheadLines: ["新品传播、电商页面与购买路径的设计判断"],
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
          headlineLines: ["建立全球品牌语言，", "支撑多触点传播"],
          subheadLines: ["品牌识别与跨市场内容延展"],
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
          headlineLines: ["将产品价值转化为", "用户购买判断"],
          subheadLines: [
            "ANKER SOLIX PRIME E10 全球新品上市传播与 DTC 转化设计",
          ],
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
          headlineLines: ["让新品发布视觉贯穿", "线上线下传播体验"],
          subheadLines: ["全球发布会核心视觉与内容系统"],
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
