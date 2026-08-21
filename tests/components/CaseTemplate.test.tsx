import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import AboutTemplate from "@/components/portfolio/AboutTemplate";
import CaseTemplate from "@/components/portfolio/CaseTemplate";
import { getProjectById } from "@/lib/portfolio/projects";

test.each([
  ["about", "Project overview case study", "/kv/cases/project-overview-r4.png", "5760", "8472"],
  ["business", "Design logic case study", "/kv/cases/design-logic.png", "5760", "22882"],
  ["brand-system", "Brand system case study", "/kv/cases/brand-system.png", "3299", "32768"],
  ["product-launch", "Product launch case study", "/kv/cases/product-launch-r2.png", "2375", "32768"],
  ["launch-event", "Launch event case study", "/kv/cases/launch-event.png", "4786", "32768"],
] as const)(
  "%s case uses its supplied full-page artwork",
  (id, accessibleName, src, width, height) => {
    render(<CaseTemplate project={getProjectById(id)} />);

    expect(screen.getByRole("img", { name: accessibleName })).toHaveAttribute(
      "src",
      src,
    );
    expect(screen.getByRole("img", { name: accessibleName })).toHaveAttribute(
      "width",
      width,
    );
    expect(screen.getByRole("img", { name: accessibleName })).toHaveAttribute(
      "height",
      height,
    );
    expect(
      screen.queryByRole("navigation", { name: "Case chapters" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("progressbar", { name: "Case reading progress" }),
    ).not.toBeInTheDocument();
  },
);

test("PROJECT OVERVIEW blue CTAs link to the four matching case pages", () => {
  render(<CaseTemplate project={getProjectById("about")} />);

  expect(screen.getByRole("link", { name: "Open DESIGN LOGIC case" })).toHaveAttribute(
    "href",
    "/work/business",
  );
  expect(screen.getByRole("link", { name: "Open BRAND SYSTEM case" })).toHaveAttribute(
    "href",
    "/work/brand-system",
  );
  expect(screen.getByRole("link", { name: "Open PRODUCT LAUNCH case" })).toHaveAttribute(
    "href",
    "/work/product-launch",
  );
  expect(screen.getByRole("link", { name: "Open LAUNCH EVENT case" })).toHaveAttribute(
    "href",
    "/work/launch-event",
  );
});

test("BRAND SYSTEM keeps AI workflow evidence inside its third core contribution", () => {
  render(<CaseTemplate project={getProjectById("brand-system")} />);

  expect(screen.queryByRole("group", { name: "AI 辅助品牌系统工作流" })).not.toBeInTheDocument();
  expect(screen.getByText("规模化应用")).toBeInTheDocument();
  expect(screen.getByText(/团队出图效率提升 36%/)).toBeInTheDocument();
});

test("PRODUCT LAUNCH exposes a concise recruiter summary before the supplied artwork", () => {
  const { container } = render(<CaseTemplate project={getProjectById("product-launch")} />);

  expect(screen.getByRole("heading", { name: "ANKER SOLIX PRIME E10" })).toBeInTheDocument();
  expect(screen.queryByText("DESIGN GOAL 02")).not.toBeInTheDocument();
  expect(screen.getByText("全球新品上市传播与 DTC 转化设计")).toBeInTheDocument();
  expect(screen.getByText("视觉调性与 AIGC 规则")).toBeInTheDocument();
  expect(screen.queryByText("判断 · 方法 · 价值")).not.toBeInTheDocument();
  expect(screen.getByText(/页面阅读深度 65%/)).toBeInTheDocument();

  const summary = screen.getByRole("heading", { name: "ANKER SOLIX PRIME E10" }).closest("section");
  const artwork = screen.getByRole("img", { name: "Product launch case study" });
  expect(summary?.compareDocumentPosition(artwork) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(container.querySelectorAll("section")).toHaveLength(1);
});

test("LAUNCH EVENT exposes the confirmed recruiter summary", () => {
  render(<CaseTemplate project={getProjectById("launch-event")} />);

  expect(
    screen.getByRole("heading", { name: "ANKER INNOVATIONS IFA 2025" }),
  ).toBeInTheDocument();
  expect(screen.getByText("全球发布会传播与内容系统")).toBeInTheDocument();
  expect(screen.getByText("传播内容链路")).toBeInTheDocument();
  expect(screen.getByText(/覆盖展前、展中、展后三个传播阶段/)).toBeInTheDocument();
});

test("DESIGN LOGIC exposes the confirmed recruiter summary", () => {
  render(<CaseTemplate project={getProjectById("business")} />);

  expect(
    screen.getByRole("heading", { name: "ANKER INNOVATIONS IFA 2025" }),
  ).toBeInTheDocument();
  expect(screen.getByText("业务洞察与设计目标")).toBeInTheDocument();
  expect(screen.getByText("核心问题定义")).toBeInTheDocument();
  expect(screen.getByText(/三条设计目标分别进入 BRAND SYSTEM/)).toBeInTheDocument();
});

test("PROJECT OVERVIEW exposes the confirmed recruiter summary", () => {
  render(<CaseTemplate project={getProjectById("about")} />);

  expect(
    screen.getByRole("heading", { name: "ANKER INNOVATIONS" }),
  ).toBeInTheDocument();
  expect(screen.getByText("IFA 2025 · 全球品牌升级")).toBeInTheDocument();
  expect(screen.getByText("系统联动")).toBeInTheDocument();
  expect(screen.getByText(/形成 1 条业务目标、3 条设计目标和 3 个落地项目/)).toBeInTheDocument();
  expect(screen.queryByText("业务目标")).not.toBeInTheDocument();
  expect(screen.queryByText("负责范围")).not.toBeInTheDocument();
});

test.each([
  ["business", "/kv/cases/design-logic-mobile.png", "4560", "22192"],
  ["brand-system", "/kv/cases/brand-system-mobile.png", "2618", "32768"],
  ["product-launch", "/kv/cases/product-launch-mobile-r2.png", "1887", "32768"],
  ["launch-event", "/kv/cases/launch-event-mobile.png", "3789", "32768"],
] as const)("%s exposes its supplied mobile artwork below 768px", (id, src, width, height) => {
  const { container } = render(<CaseTemplate project={getProjectById(id)} />);

  expect(container.querySelector("source")).toHaveAttribute("srcset", src);
  expect(container.querySelector("source")).toHaveAttribute(
    "media",
    "(max-width: 767px)",
  );
  expect(container.querySelector("source")).toHaveAttribute("width", width);
  expect(container.querySelector("source")).toHaveAttribute("height", height);
});

test("uses responsive Netlify Image CDN sources in production", () => {
  const previous = process.env.NETLIFY;
  process.env.NETLIFY = "true";
  try {
    const { container } = render(<CaseTemplate project={getProjectById("brand-system")} />);
    const source = container.querySelector("source")!;
    const image = screen.getByRole("img", { name: "Brand system case study" });

    expect(source.getAttribute("srcset")).toContain("/.netlify/images?url=%2Fkv%2Fcases%2Fbrand-system-mobile.png&w=1170&fm=webp&q=86 1170w");
    expect(image.getAttribute("srcset")).toContain("/.netlify/images?url=%2Fkv%2Fcases%2Fbrand-system.png&w=1740&fm=webp&q=86 1740w");
    expect(image).toHaveAttribute("sizes", "(max-width: 767px) calc(100vw - 36px), min(calc(100vw - 48px), 870px)");
  } finally {
    if (previous === undefined) delete process.env.NETLIFY;
    else process.env.NETLIFY = previous;
  }
});

test("about template links experience rows to the ruler and rebuilds the contact card", () => {
  const { container } = render(<AboutTemplate />);
  expect(screen.getAllByText("熠思霆创意 Extend")).toHaveLength(2);
  expect(screen.getAllByText("创意设计主管（带8人团队）")).toHaveLength(2);
  expect(screen.getAllByText("创意设计组长（带4人团队）")).toHaveLength(2);
  expect(screen.getByText(
    "10+ 年视觉设计与品牌营销经验，具备消费电子、家居新零售与 4A/创意公司复合背景，曾管理 8 人视觉团队。擅长品牌视觉语言与整合营销创意，从创意构思到成品执行 ▮",
  )).toBeInTheDocument();
  expect(screen.getByText(
    "10+ 年视觉设计与品牌营销经验，具消费电子、家居新零售及 4A 复合背景，曾管理 8 人团队。擅长品牌视觉语言与整合营销创意，具备从创意构思到成品执行的全流程能力。",
  )).toBeInTheDocument();
  expect(screen.getByTestId("about-desktop-background")).toHaveAttribute(
    "src",
    "/kv/cases/about-background.png",
  );
  expect(screen.getByTestId("about-desktop-canvas")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Kid Long CRT portrait" })).toHaveAttribute(
    "src",
    "/kv/cases/about-crt-desktop.png",
  );
  expect(screen.getByRole("img", { name: "Kid Long contact information" })).toHaveAttribute(
    "src",
    "/kv/cases/about-contact.png",
  );
  expect(screen.getByRole("img", { name: "Kid Long visual designer portrait" })).toHaveAttribute(
    "src",
    "/kv/cases/about-crt.png",
  );
  expect(screen.getAllByRole("heading", { name: "我是KID（龙昊翔）" })).toHaveLength(2);
  expect(screen.getAllByText("SENIOR VISUAL DESIGNER")).toHaveLength(2);
  expect(screen.getAllByRole("slider", { name: "Career timeline" })).toHaveLength(2);
  expect(screen.getAllByRole("slider", { name: "Career timeline" })[0]).toHaveAttribute(
    "aria-valuenow",
    "2014",
  );
  expect(screen.getAllByRole("button", { name: "2023–2026 Anker Innovations" })).toHaveLength(2);
  expect(screen.getByRole("img", { name: "Kid Long mobile contact information" })).toHaveAttribute(
    "src",
    "/kv/cases/about-contact-mobile.png",
  );
  expect(screen.queryByTestId("about-contact-card")).not.toBeInTheDocument();
  expect(document.querySelector('[data-about-layout="desktop-editable"]')).toBeInTheDocument();
  expect(document.querySelector('[data-about-layout="mobile-html"]')).toBeInTheDocument();
  expect(container.querySelector('img[src="/kv/cases/about-desktop.png"]')).not.toBeInTheDocument();
});

test("about template defers and resizes its large raster assets on Netlify", () => {
  const previous = process.env.NETLIFY;
  process.env.NETLIFY = "true";
  try {
    render(<AboutTemplate />);
    expect(screen.getByTestId("about-desktop-background")).toHaveAttribute(
      "src",
      "/.netlify/images?url=%2Fkv%2Fcases%2Fabout-background.png&w=2560&fm=webp&q=90",
    );
    expect(screen.getByTestId("about-desktop-background")).toHaveAttribute(
      "loading",
      "lazy",
    );
    expect(screen.getByRole("img", { name: "Kid Long visual designer portrait" })).toHaveAttribute(
      "src",
      "/.netlify/images?url=%2Fkv%2Fcases%2Fabout-crt.png&w=720&fm=webp&q=90",
    );
  } finally {
    if (previous === undefined) delete process.env.NETLIFY;
    else process.env.NETLIFY = previous;
  }
});
