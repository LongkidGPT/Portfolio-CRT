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
      firstLayer: "项目总览",
      secondLayer: ["ANKER INNOVATIONS", "IFA 2025 · 全球品牌升级"],
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
          firstLayer: "STRATEGY TO VISUAL",
          secondLayer: "从品牌策略到可执行的视觉方向",
        },
      },
      {
        id: "brand-system",
        mobilePreviewCopy: {
          firstLayer: "BRAND VISUAL SYSTEM",
          secondLayer: "从品牌战略语言到跨触点视觉标准",
        },
      },
      {
        id: "product-launch",
        mobilePreviewCopy: {
          firstLayer: "INTEGRATED BRAND DELIVERY",
          secondLayer: "Anker SOLIX Prime E10 全球新品整合传播",
        },
      },
      {
        id: "launch-event",
        mobilePreviewCopy: {
          firstLayer: "BRAND EXPERIENCE",
          secondLayer: "把品牌系统带到真实的线下体验",
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
          eyebrow: "STRATEGY TO VISUAL",
          headlineLines: ["从品牌策略到", "可执行的视觉方向"],
          subheadLines: ["建立跨团队一致的设计判断依据"],
          bodyLines: [
            "通过业务链路、用户诉求、触点与竞品观察，建立从品牌",
            "目标到视觉系统策略的判断依据。",
          ],
        },
      },
      {
        id: "brand-system",
        previewCopy: {
          eyebrow: "BRAND VISUAL SYSTEM",
          headlineLines: ["从品牌战略语言到", "跨触点视觉标准"],
          subheadLines: ["Anker Innovations 母品牌视觉系统构建"],
          bodyLines: [
            "将“光”转化为可继承、可复用的视觉规则，并推动品牌",
            "在产品、传播与线下触点中一致落地。",
          ],
        },
      },
      {
        id: "product-launch",
        previewCopy: {
          eyebrow: "INTEGRATED BRAND DELIVERY",
          headlineLines: ["让新品价值在每个触点", "保持清晰一致"],
          subheadLines: ["Anker SOLIX Prime E10 全球新品整合传播"],
          bodyLines: [
            "以产品价值为主线，统筹 KV、DTC 页面、邮件与社媒素材，",
            "将上市传播转化为连续的品牌体验。",
          ],
        },
      },
      {
        id: "launch-event",
        previewCopy: {
          eyebrow: "BRAND EXPERIENCE",
          headlineLines: ["把品牌系统带到", "真实的线下体验"],
          subheadLines: ["IFA 全球发布会视觉与内容系统"],
          bodyLines: [
            "将升级后的视觉语言延展至展会、倒计时与发布内容，建立",
            "可识别、可连续传播的品牌体验。",
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
