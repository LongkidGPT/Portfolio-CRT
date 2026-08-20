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
    within(desktop!).getByRole("heading", { name: "把复杂能力转为用户能理解的表达" }),
  ).toBeVisible();
  expect(
    within(desktop!).getByLabelText(
      "视觉风格和多触点落地的共同判断。",
    ),
  ).toBeVisible();
  expect(desktop!.querySelector('[data-preview-divider="true"]')).toBeNull();
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
      "ANKER SOLIX PRIME E10 全球新品发布视觉与 DTC 页面",
    ),
  ).toBeVisible();
});

test.each([
  ["business", "把复杂能力转为用户能理解的表达", "从产品与发布场景定义视觉方向"],
  ["brand-system", "品牌视觉语言、规范与多触点维护", "建立可维护的品牌语言，支持新品持续发布"],
  ["product-launch", "ANKER SOLIX PRIME E10 全球新品发布视觉与 DTC 页面", "从产品能力到用户能理解的新品体验"],
  ["launch-event", "IFA 全球发布会主视觉、内容系统与现场体验", "让发布视觉成为品牌与新品共同的记忆点"],
] as const)("promotes the %s subtitle as the only desktop headline", (id, headline, removedTitle) => {
  const { container } = render(
    <ProjectPreview project={getProjectById(id)} />,
  );
  const desktop = container.querySelector(
    '[data-preview-layout="desktop"]',
  );

  expect(within(desktop!).getByRole("heading", { name: headline })).toBeVisible();
  expect(within(desktop!).queryByLabelText(removedTitle)).toBeNull();
  expect(desktop!.querySelector('[data-preview-divider="true"]')).toBeNull();
});
