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

  it("exposes BUSINESS CONTEXT as the numbered business entry label", () => {
    expect(getProjectById("business").label).toBe("00 BUSINESS CONTEXT");
  });

  it("opens the first project card as the responsive flagship case overview", () => {
    expect(getProjectById("about")).toMatchObject({
      label: "PROJECT OVERVIEW",
      href: "/work/anker-ifa-2025",
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

  it("stores the selected-state flagship case mobile copy separately", () => {
    expect(PROJECT_OVERVIEW_MOBILE_PREVIEW_COPY).toEqual({
      firstLayer: "PROJECT OVERVIEW",
      secondLayer: ["ANKER INNOVATIONS", "IFA 2025 · 全球品牌与新品传播"],
    });
  });

  it("stores the approved two-layer mobile preview copy", () => {
    expect(
      PROJECTS.map(({ id, mobilePreviewCopy }) => ({ id, mobilePreviewCopy })),
    ).toEqual([
      {
        id: "about",
        mobilePreviewCopy: {
          firstLayer: "SENIOR VISUAL DESIGNER",
          secondLayer: ["消费科技品牌系统、", "新品 Campaign 与全球传播"],
          evidence: "10+ 年经验｜消费科技 · 全球新品发布 · 8 人团队",
        },
      },
      {
        id: "business",
        mobilePreviewCopy: {
          firstLayer: "00 BUSINESS CONTEXT",
          secondLayer: "将复杂业务问题转化为清晰的设计方向",
        },
      },
      {
        id: "brand-system",
        mobilePreviewCopy: {
          firstLayer: "01 BRAND SYSTEM",
          secondLayer: "全球消费科技品牌视觉语言与多品牌延展",
        },
      },
      {
        id: "product-launch",
        mobilePreviewCopy: {
          firstLayer: "02 PRODUCT LAUNCH",
          secondLayer:
            "Anker SOLIX Prime E10 全球新品 Campaign、主视觉与 DTC 承接",
        },
      },
      {
        id: "launch-event",
        mobilePreviewCopy: {
          firstLayer: "03 LAUNCH EVENT",
          secondLayer: "IFA 全球发布会主视觉与全渠道内容系统",
        },
      },
    ]);
  });

  it("stores the approved structured desktop preview copy", () => {
    expect(PROJECTS.map(({ id, previewCopy }) => ({ id, previewCopy }))).toEqual([
      {
        id: "about",
        previewCopy: expect.objectContaining({
          eyebrow: "SENIOR VISUAL DESIGNER",
          headlineLines: ["消费科技品牌系统、", "新品 Campaign 与全球传播"],
        }),
      },
      {
        id: "business",
        previewCopy: {
          eyebrow: "00 BUSINESS CONTEXT",
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
          eyebrow: "01 BRAND SYSTEM",
          headlineLines: ["建立母子品牌关系，", "提升子品牌认知"],
          subheadLines: ["全球消费科技品牌视觉语言与多品牌延展"],
          bodyLines: [
            "将品牌战略中的“光”，转译为母品牌可承载、子品牌",
            "可继承、多触点可复用的视觉符号规则。",
          ],
        },
      },
      {
        id: "product-launch",
        previewCopy: {
          eyebrow: "02 PRODUCT LAUNCH",
          headlineLines: ["清晰传达子品牌价值"],
          subheadLines: [
            "ANKER SOLIX PRIME E10 全球新品 Campaign、主视觉与 DTC 承接",
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
          eyebrow: "03 LAUNCH EVENT",
          headlineLines: ["强化发布会记忆点与", "传播连续性"],
          subheadLines: ["IFA 全球发布会主视觉与全渠道内容系统"],
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
