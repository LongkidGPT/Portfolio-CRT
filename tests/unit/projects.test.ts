import { describe, expect, it } from "vitest";
import {
  PROJECTS,
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
          secondLayer: "将复杂业务问题转化为清晰的设计方向",
        },
      },
      {
        id: "brand-system",
        mobilePreviewCopy: {
          firstLayer: "DESIGN GOAL 01",
          secondLayer: "Anker innovations 视觉符号系统构建",
        },
      },
      {
        id: "product-launch",
        mobilePreviewCopy: {
          firstLayer: "DESIGN GOAL 02",
          secondLayer:
            "Anker SOLIX Prime E10 全球新品上市传播与 DTC 转化设计",
        },
      },
      {
        id: "launch-event",
        mobilePreviewCopy: {
          firstLayer: "DESIGN GOAL 03",
          secondLayer: "IFA 全球发布会传播与内容系统",
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
          subheadLines: ["将复杂业务问题转化为清晰", "的设计方向"],
          bodyLines: [
            "通过业务链路梳理、用户诉求判断、展会触点拆解与竞品",
            "观察，建立从业务目标到视觉系统策略的判断依据。",
          ],
        },
      },
      {
        id: "brand-system",
        previewCopy: {
          eyebrow: "DESIGN GOAL 01",
          headlineLines: ["建立母子品牌关系，", "提升子品牌认知"],
          subheadLines: ["母品牌视觉符号系统构建"],
          bodyLines: [
            "将品牌战略中的“光”，转译为母品牌可承载、子品牌",
            "可继承、多触点可复用的视觉符号规则。",
          ],
        },
      },
      {
        id: "product-launch",
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
      },
      {
        id: "launch-event",
        previewCopy: {
          eyebrow: "DESIGN GOAL 03",
          headlineLines: ["强化发布会记忆点与", "传播连续性"],
          subheadLines: ["IFA 全球发布会传播与内容系统"],
          bodyLines: [
            "将品牌升级后的视觉系统，转化为发布会可识别、",
            "可延展、可连续传播的内容系统。",
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
