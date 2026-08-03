import { render, screen, within } from "@testing-library/react";
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
    within(desktop!).getByRole("heading", { name: "业务洞察与设计目标" }),
  ).toBeVisible();
  expect(
    within(desktop!).getByLabelText("将复杂业务问题转化为清晰"),
  ).toBeVisible();
  expect(within(desktop!).getByLabelText("的设计方向")).toBeVisible();
  expect(
    within(desktop!).getByLabelText(
      "观察，建立从业务目标到视觉系统策略的判断依据。",
    ),
  ).toBeVisible();
  expect(
    desktop!.querySelector('[data-preview-divider="true"]'),
  ).toBeInTheDocument();
  expect(container.querySelector('img[src*="/copy/"]')).toBeNull();
});

test("keeps about body optional and preserves legacy mobile metadata", () => {
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
  expect(within(mobile!).getByLabelText("Kid Long")).toBeVisible();
  expect(within(mobile!).getByLabelText("2007—Present")).toBeVisible();
  expect(
    within(mobile!).getByLabelText(
      "Profile, capabilities, experience and contact.",
    ),
  ).toBeVisible();
});
