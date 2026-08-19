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
  expect(within(desktop!).getByLabelText("DESIGN LOGIC")).toBeVisible();
  expect(
    within(desktop!).getByRole("heading", { name: "产品价值与用户理解" }),
  ).toBeVisible();
  expect(
    within(desktop!).getByLabelText("新品传播、电商页面与购买路径的设计判断"),
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

test("renders the approved two-layer mobile about copy", () => {
  const { container } = render(
    <ProjectPreview project={getProjectById("about")} />,
  );
  const desktop = container.querySelector(
    '[data-preview-layout="desktop"]',
  );
  const mobile = container.querySelector('[data-preview-layout="mobile"]');

  expect(desktop).not.toBeNull();
  expect(desktop!.querySelector('[data-preview-body="true"]')).toBeNull();
  expect(within(desktop!).getByLabelText("我是KID（龙昊翔）")).toBeVisible();
  expect(mobile).not.toBeNull();
  expect(within(mobile!).getByLabelText("VISUAL DESIGNER")).toBeVisible();
  expect(within(mobile!).getByLabelText("我是KID（龙昊翔）")).toBeVisible();
});

test("renders the approved two-layer mobile product launch copy", () => {
  const { container } = render(
    <ProjectPreview project={getProjectById("product-launch")} />,
  );
  const mobile = container.querySelector('[data-preview-layout="mobile"]');

  expect(mobile).not.toBeNull();
  expect(within(mobile!).getByLabelText("DESIGN GOAL 02")).toBeVisible();
  expect(
    within(mobile!).getByLabelText(
      "新品传播与 DTC 转化设计",
    ),
  ).toBeVisible();
});
