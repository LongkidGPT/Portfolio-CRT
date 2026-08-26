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
    within(desktop!).getByRole("heading", { name: "业务洞察与设计目标" }),
  ).toBeVisible();
  expect(
    within(desktop!).getByLabelText("从产品价值、用户理解到设计方向"),
  ).toBeVisible();
  expect(
    within(desktop!).getByLabelText(
      "可进入新品传播与 DTC 页面设计的判断依据。",
    ),
  ).toBeVisible();
  expect(
    desktop!.querySelector('[data-preview-divider="true"]'),
  ).toBeInTheDocument();
  expect(container.querySelector('img[src*="/copy/"]')).toBeNull();
});

test.each([
  ["brand-system", "品牌系统与触点应用"],
  ["product-launch", "新品传播与 DTC 转化"],
  ["launch-event", "发布会传播与内容系统"],
] as const)("%s uses its canonical case title on the project overview", (id, title) => {
  const { container } = render(<ProjectPreview project={getProjectById(id)} />);
  const desktop = container.querySelector('[data-preview-layout="desktop"]');

  expect(desktop).not.toBeNull();
  expect(within(desktop!).getByRole("heading", { name: title })).toBeVisible();
});

test("renders the approved two-layer mobile about copy", () => {
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
      "新品传播与 DTC 转化",
    ),
  ).toBeVisible();
});
