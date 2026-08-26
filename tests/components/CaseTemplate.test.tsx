import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import AboutTemplate from "@/components/portfolio/AboutTemplate";
import CaseTemplate from "@/components/portfolio/CaseTemplate";
import { getProjectById } from "@/lib/portfolio/projects";

afterEach(() => vi.unstubAllGlobals());

test("PROJECT OVERVIEW uses lossless-source-derived progressive slices", () => {
  const { container } = render(<CaseTemplate project={getProjectById("about")} />);
  const desktopStack = container.querySelector('[class*="caseDesktopSlices"]')!;
  const mobileStack = container.querySelector('[class*="caseMobileSlices"]')!;

  expect(desktopStack.querySelectorAll('[data-slice-src]')).toHaveLength(4);
  expect(mobileStack.querySelectorAll('[data-slice-src]')).toHaveLength(5);
  expect(desktopStack.querySelector("source")).toHaveAttribute(
    "srcset",
    "/kv/cases/桌面端/project-overview/Slice-01.webp",
  );
});

test.each([
  ["business", "Design logic case study", "/kv/cases/桌面端/design-logic/Slice-44.webp", 4],
  ["brand-system", "Brand system case study", "/kv/cases/桌面端/brand-system/Slice-36.webp", 8],
  ["product-launch", "Product launch case study", "/kv/cases/桌面端/product-launch-r2/Slice-26.webp", 10],
  ["launch-event", "Launch event case study", "/kv/cases/桌面端/launch-event/Slice-20.webp", 6],
] as const)(
  "%s case uses ordered desktop slices",
  (id, accessibleName, firstSlice, sliceCount) => {
    const { container } = render(<CaseTemplate project={getProjectById(id)} />);
    const sliceStack = container.querySelector('[class*="caseDesktopSlices"]')!;
    const slots = sliceStack.querySelectorAll('[data-slice-src]');
    const sources = sliceStack.querySelectorAll("source");
    const images = sliceStack.querySelectorAll("img");

    expect(slots).toHaveLength(sliceCount);
    expect(sources).toHaveLength(1);
    expect(slots[0]).toHaveAttribute("data-slice-src", firstSlice);
    expect(sources[0]).toHaveAttribute("srcset", firstSlice);
    expect(sources[0]).toHaveAttribute("media", "(min-width: 768px)");
    expect(images[0]).toHaveAttribute("loading", "eager");
    expect(images[0]).toHaveAttribute("fetchpriority", "high");
    expect(screen.getByRole("img", { name: accessibleName })).toBe(images[0]);
    expect(
      screen.getByRole("navigation", { name: "Featured case chapter navigation" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("progressbar", { name: "Case reading progress" }),
    ).not.toBeInTheDocument();
  },
);

test("PROJECT OVERVIEW blue CTAs link to the four matching case pages", () => {
  render(<CaseTemplate project={getProjectById("about")} />);

  expect(screen.getByRole("link", { name: "Open 00 BUSINESS CONTEXT chapter" })).toHaveAttribute(
    "href",
    "/work/anker-ifa-2025/business",
  );
  expect(screen.getByRole("link", { name: "Open 01 BRAND SYSTEM chapter" })).toHaveAttribute(
    "href",
    "/work/anker-ifa-2025/brand-system",
  );
  expect(screen.getByRole("link", { name: "Open 02 PRODUCT LAUNCH chapter" })).toHaveAttribute(
    "href",
    "/work/anker-ifa-2025/product-launch",
  );
  expect(screen.getByRole("link", { name: "Open 03 LAUNCH EVENT chapter" })).toHaveAttribute(
    "href",
    "/work/anker-ifa-2025/launch-event",
  );
});

test("PRODUCT LAUNCH exposes a concise recruiter summary before the supplied artwork", () => {
  const { container } = render(<CaseTemplate project={getProjectById("product-launch")} />);

  expect(screen.queryByRole("heading", { name: "新品传播与 DTC 转化" })).not.toBeInTheDocument();
  expect(screen.queryByText("DESIGN GOAL 02")).not.toBeInTheDocument();
  expect(screen.queryByText("新品传播与 DTC 转化")).not.toBeInTheDocument();
  expect(screen.getByText("DTC 信息架构")).toBeInTheDocument();
  expect(screen.queryByText("判断 · 方法 · 价值")).not.toBeInTheDocument();
  expect(screen.getByText(/预售页点击率 1.5% → 2.6%/)).toBeInTheDocument();

  const summary = container.querySelector("section");
  const artwork = screen.getByRole("img", { name: "Product launch case study" });
  expect(summary?.compareDocumentPosition(artwork) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(container.querySelectorAll("section")).toHaveLength(1);
});

test("LAUNCH EVENT exposes the confirmed recruiter summary", () => {
  render(<CaseTemplate project={getProjectById("launch-event")} />);

  expect(
    screen.queryByRole("heading", { name: "发布会传播与内容系统" }),
  ).not.toBeInTheDocument();
  expect(screen.getByText("传播内容链路")).toBeInTheDocument();
  expect(screen.getByText(/覆盖展前预热、展中发布与展后内容延展/)).toBeInTheDocument();
});

test.each([
  ["business", "00 BUSINESS CONTEXT", "ANKER INNOVATIONS IFA 2025"],
  ["brand-system", "01 BRAND SYSTEM", "ANKER INNOVATIONS"],
  ["product-launch", "02 PRODUCT LAUNCH", "ANKER SOLIX PRIME E10"],
  ["launch-event", "03 LAUNCH EVENT", "ANKER INNOVATIONS IFA 2025"],
] as const)("%s uses project attribution and a single chapter title system", (id, chapterTitle, repeatedTitle) => {
  render(<CaseTemplate project={getProjectById(id)} />);

  expect(screen.getAllByText("ANKER INNOVATIONS · IFA 2025")).toHaveLength(2);
  expect(screen.getByText(chapterTitle)).toBeInTheDocument();
  expect(screen.queryByText(`PROJECT OVERVIEW / ${chapterTitle}`)).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: repeatedTitle })).not.toBeInTheDocument();
  expect(screen.getByText("业务目标")).toBeInTheDocument();
  expect(screen.getByText("负责范围")).toBeInTheDocument();
});

test("mobile chapter menu exposes large chapter choices and marks the current page", () => {
  render(<CaseTemplate project={getProjectById("product-launch")} />);

  fireEvent.click(screen.getByRole("button", { name: "Open chapter menu" }));

  expect(screen.getByRole("dialog", { name: "CHAPTERS" })).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /02 PRODUCT LAUNCH/ }),
  ).toHaveAttribute("aria-current", "page");
});

test("BUSINESS CONTEXT exposes the confirmed recruiter summary", () => {
  render(<CaseTemplate project={getProjectById("business")} />);

  expect(screen.queryByText("ANKER INNOVATIONS IFA 2025")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "业务洞察与设计目标" }),
  ).not.toBeInTheDocument();
  expect(screen.getByText("传播问题定义")).toBeInTheDocument();
  expect(screen.getByText(/形成品牌系统、新品传播与 DTC/)).toBeInTheDocument();
});

test.each([
  ["brand-system", "ANKER INNOVATIONS", "品牌系统与触点应用"],
  ["product-launch", "ANKER SOLIX PRIME E10", "新品传播与 DTC 转化"],
  ["launch-event", "ANKER INNOVATIONS IFA 2025", "发布会传播与内容系统"],
] as const)(
  "%s removes its case heading",
  (id, previousTitle, promotedTitle) => {
    render(<CaseTemplate project={getProjectById(id)} />);

    expect(screen.queryByText(previousTitle)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: promotedTitle })).not.toBeInTheDocument();
  },
);

test.each([
  ["business", "PROJECT OVERVIEW / 00 DESIGN LOGIC"],
  ["brand-system", "PROJECT OVERVIEW / 01 BRAND SYSTEM"],
  ["product-launch", "PROJECT OVERVIEW / 02 PRODUCT LAUNCH"],
  ["launch-event", "PROJECT OVERVIEW / 03 LAUNCH EVENT"],
] as const)("%s exposes its case path without adding a heading", (id, pathLabel) => {
  render(<CaseTemplate project={getProjectById(id)} />);

  expect(screen.getByText(pathLabel)).toBeInTheDocument();
});

test("PROJECT OVERVIEW exposes the confirmed recruiter summary", () => {
  render(<CaseTemplate project={getProjectById("about")} />);

  expect(
    screen.getByRole("heading", { name: "ANKER INNOVATIONS" }),
  ).toBeInTheDocument();
  expect(screen.getByText("IFA 2025 · 全球新品传播与商业化设计")).toBeInTheDocument();
  expect(screen.getByText("系统联动")).toBeInTheDocument();
  expect(screen.getByText(/形成品牌视觉系统、新品传播与 DTC、发布会传播三类项目输出/)).toBeInTheDocument();
  expect(screen.queryByText("业务目标")).not.toBeInTheDocument();
  expect(screen.queryByText("负责范围")).not.toBeInTheDocument();
});

test.each([
  ["business", "/kv/cases/移动端/design-logic/Slice-44.webp", 4],
  ["brand-system", "/kv/cases/移动端/brand-system/Slice-36.webp", 8],
  ["product-launch", "/kv/cases/移动端/product-launch-r2/Slice-26.webp", 10],
  ["launch-event", "/kv/cases/移动端/launch-event/Slice-20.webp", 6],
] as const)("%s exposes ordered mobile slices below 768px", (id, firstSlice, sliceCount) => {
  const { container } = render(<CaseTemplate project={getProjectById(id)} />);
  const mobileStack = container.querySelector('[class*="caseMobileSlices"]')!;
  const slots = mobileStack.querySelectorAll('[data-slice-src]');
  const sources = mobileStack.querySelectorAll("source");
  const images = mobileStack.querySelectorAll("img");

  expect(slots).toHaveLength(sliceCount);
  expect(sources).toHaveLength(1);
  expect(slots[0]).toHaveAttribute("data-slice-src", firstSlice);
  expect(sources[0]).toHaveAttribute("srcset", firstSlice);
  expect(sources[0]).toHaveAttribute("media", "(max-width: 767px)");
  expect(images[0]).toHaveAttribute("loading", "eager");
});

test("case slices mount only the first image before approaching the viewport", () => {
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

  const { container } = render(<CaseTemplate project={getProjectById("product-launch")} />);
  const desktopStack = container.querySelector('[class*="caseDesktopSlices"]')!;

  expect(desktopStack.querySelectorAll('[data-slice-src]')).toHaveLength(10);
  expect(desktopStack.querySelectorAll("source")).toHaveLength(1);
  expect(desktopStack.querySelectorAll('[class*="caseSlicePlaceholder"]')).toHaveLength(9);
});

test("serves desktop slices directly without runtime image conversion", () => {
  const { container } = render(<CaseTemplate project={getProjectById("brand-system")} />);
  const sliceStack = container.querySelector('[class*="caseDesktopSlices"]')!;
  const sources = Array.from(sliceStack.querySelectorAll("source"));

  expect(sources[0]).toHaveAttribute("srcset", "/kv/cases/桌面端/brand-system/Slice-36.webp");
  expect(sources.every((source) => !source.getAttribute("srcset")?.includes("/.netlify/images"))).toBe(true);
});

test("about template links experience rows to the ruler and rebuilds the contact card", () => {
  const { container } = render(<AboutTemplate />);
  expect(screen.getAllByText("熠思霆创意 Extend")).toHaveLength(2);
  expect(screen.getAllByText("创意设计主管 · 带 8 人团队")).toHaveLength(2);
  expect(screen.getAllByText("创意设计组长 · 整合营销")).toHaveLength(2);
  expect(screen.getByText(
    "10+ 年智能硬件与品牌营销视觉经验，覆盖消费电子新品传播、全球电商与 DTC 页面。曾主导 SOLIX 北美新品上市，从产品价值、创意概念到页面信息架构与多触点落地；具备品牌系统、AIGC 工作流、3D 渲染协同及团队管理经验 ▮",
  )).toBeInTheDocument();
  expect(screen.getByText(
    "10+ 年智能硬件与品牌营销视觉经验，聚焦新品传播、全球电商与 DTC 页面。主导 SOLIX 北美新品上市，具备产品价值转译、创意概念、页面信息架构、AIGC 工作流及团队协作能力。",
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
  expect(screen.getAllByText("GLOBAL PRODUCT LAUNCH & DTC")).toHaveLength(2);
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
