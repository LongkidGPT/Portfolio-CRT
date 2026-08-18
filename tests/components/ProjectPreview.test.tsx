import { render, within } from "@testing-library/react";
import { expect, test } from "vitest";
import ProjectPreview from "@/components/portfolio/ProjectPreview";
import { getProjectById } from "@/lib/portfolio/projects";

test("renders the Saturnbird business hierarchy as real text", () => {
  const { container } = render(
    <ProjectPreview project={getProjectById("business")} />,
  );
  const desktop = container.querySelector(
    '[data-preview-layout="desktop"]',
  );

  expect(desktop).not.toBeNull();
  expect(within(desktop!).getByLabelText("STRATEGY TO VISUAL")).toBeVisible();
  expect(
    within(desktop!).getByRole("heading", { name: "从品牌策略到可执行的视觉方向" }),
  ).toBeVisible();
  expect(
    within(desktop!).getByLabelText(
      "目标到视觉系统策略的判断依据。",
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
  expect(within(mobile!).getByLabelText("INTEGRATED BRAND DELIVERY")).toBeVisible();
  expect(
    within(mobile!).getByLabelText(
      "Anker SOLIX Prime E10 全球新品整合传播",
    ),
  ).toBeVisible();
});
