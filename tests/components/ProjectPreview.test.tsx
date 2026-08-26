import { render, within } from "@testing-library/react";
import { expect, test } from "vitest";
import ProjectPreview from "@/components/portfolio/ProjectPreview";
import { getProjectById } from "@/lib/portfolio/projects";

test("renders the approved business hierarchy as real text", () => {
  const { container } = render(
    <ProjectPreview project={getProjectById("business")} />,
  );
  const desktop = container.querySelector(
    '[data-preview-layout="desktop"]',
  );

  expect(desktop).not.toBeNull();
  expect(within(desktop!).getByLabelText("00 BUSINESS CONTEXT")).toBeVisible();
  expect(
    within(desktop!).getByRole("heading", { name: "从产品与发布场景定义视觉方向" }),
  ).toBeVisible();
  expect(
    within(desktop!).getByLabelText(
      "把复杂能力转为用户能理解的表达",
    ),
  ).toBeVisible();
  expect(
    within(desktop!).getByLabelText(
      "视觉风格和多触点落地的共同判断。",
    ),
  ).toBeVisible();
  expect(
    desktop!.querySelector('[data-preview-divider="true"]'),
  ).toBeInTheDocument();
  expect(container.querySelector('img[src*="/copy/"]')).toBeNull();
});

test("renders the approved three-layer mobile positioning copy", () => {
  const { container } = render(
    <ProjectPreview project={getProjectById("about")} />,
  );
  const desktop = container.querySelector(
    '[data-preview-layout="desktop"]',
  );
  const mobile = container.querySelector('[data-preview-layout="mobile"]');

  expect(desktop).not.toBeNull();
  expect(within(desktop!).getByLabelText("SENIOR VISUAL DESIGNER")).toBeVisible();
  expect(
    within(desktop!).getByRole("heading", {
      name: "品牌系统、新品上市与 DTC 转化设计",
    }),
  ).toBeVisible();
  expect(
    within(desktop!).getByLabelText("10+ 年视觉设计与品牌营销经验"),
  ).toBeVisible();
  expect(mobile).not.toBeNull();
  expect(within(mobile!).getByLabelText("SENIOR VISUAL DESIGNER")).toBeVisible();
  expect(
    within(mobile!).getByRole("heading", {
      name: "品牌系统、新品上市与 DTC 转化设计",
    }),
  ).toBeVisible();
  expect(
    within(mobile!).getByLabelText("10+ 年经验｜消费电子 · 家居新零售 · 4A"),
  ).toBeVisible();
});

test("renders the approved two-layer mobile product launch copy", () => {
  const { container } = render(
    <ProjectPreview project={getProjectById("product-launch")} />,
  );
  const mobile = container.querySelector('[data-preview-layout="mobile"]');

  expect(mobile).not.toBeNull();
  expect(within(mobile!).getByLabelText("02 PRODUCT LAUNCH")).toBeVisible();
  expect(
    within(mobile!).getByLabelText(
      "从产品能力到用户能理解的新品体验",
    ),
  ).toBeVisible();
});
