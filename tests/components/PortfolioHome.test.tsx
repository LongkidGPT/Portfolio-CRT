import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import PortfolioHome from "@/components/portfolio/PortfolioHome";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  prefetch: vi.fn(),
}));
const analytics = vi.hoisted(() => ({
  trackProjectClick: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => navigation,
}));
vi.mock("@/components/analytics/useAnalytics", () => ({
  useAnalytics: () => analytics,
}));

beforeEach(() => {
  navigation.push.mockReset();
  navigation.prefetch.mockReset();
  analytics.trackProjectClick.mockReset();
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches:
      query === "(min-width: 768px)" || query === "(pointer: fine)",
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test("server-renders a responsive neutral portrait before viewport hydration", () => {
  const html = renderToString(<PortfolioHome />);
  expect(html).toContain("<picture");
  expect(html).toContain("(max-width: 767px)");
  expect(html).not.toContain("<canvas");
});

test("uses the full-frame renderer only on the formal desktop home", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

  render(<PortfolioHome />);

  expect(
    screen.getByRole("img", { name: "Interactive full-frame KV portrait" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("img", { name: "Interactive CRT portrait" }),
  ).not.toBeInTheDocument();
});

test("uses the dedicated mobile full-frame renderer below the desktop breakpoint", () => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(pointer: fine)",
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

  render(<PortfolioHome />);

  expect(
    screen.getByRole("img", { name: "Mobile full-frame KV portrait" }),
  ).toHaveAttribute("data-source-ratio", "9:16");
  expect(
    screen.getByRole("img", { name: "Mobile full-frame KV portrait" }),
  ).toHaveAttribute("data-target-frame", "63");
  expect(
    screen.queryByRole("img", { name: "Interactive full-frame KV portrait" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("img", { name: "Interactive CRT portrait" }),
  ).not.toBeInTheDocument();
});

test("syncs the mobile portrait target with the selected project", async () => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(pointer: fine)",
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

  render(<PortfolioHome />);
  fireEvent.click(screen.getByRole("button", { name: "Next project" }));

  expect(
    screen.getByRole("img", { name: "Mobile full-frame KV portrait" }),
  ).toHaveAttribute("data-target-frame", "135");
});

test("locks the full-frame target to the hovered formal project", () => {
  const callbacks: FrameRequestCallback[] = [];
  const context = { clearRect: vi.fn(), drawImage: vi.fn() };

  class FakeImage {
    complete = true;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    set src(_value: string) {
      this.onload?.();
    }
  }

  vi.stubGlobal("Image", FakeImage);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    right: 1470,
    bottom: 630,
    width: 1470,
    height: 630,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callbacks.push(callback);
    return callbacks.length;
  });

  render(<PortfolioHome />);
  fireEvent.pointerEnter(screen.getByRole("link", { name: "Open DESIGN LOGIC" }));
  act(() => callbacks.shift()?.(1000 / 60));

  expect(
    screen.getByRole("img", { name: "Interactive full-frame KV portrait" }),
  ).toHaveAttribute("data-target-frame", "128");
});

test("restores the ABOUT ME copy after the pointer leaves a project button", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  render(<PortfolioHome />);
  const business = screen.getByRole("link", { name: "Open DESIGN LOGIC" });

  fireEvent.pointerEnter(business);
  expect(
    screen.getByRole("heading", { name: "产品价值与用户理解" }),
  ).toBeInTheDocument();

  fireEvent.pointerLeave(business);
  const desktopPreview = () => document.querySelector(
    '[data-preview-layout="desktop"]',
  );
  expect(desktopPreview()).not.toBeNull();
  expect(
    within(desktopPreview()!).getByRole("heading", { name: "我是KID（龙昊翔）" }),
  ).toBeInTheDocument();
});

test("shows DJI home copy while the first desktop card is previewed", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  const { container } = render(<PortfolioHome />);

  const desktopPreview = () => document.querySelector(
    '[data-preview-layout="desktop"]',
  );
  const mobilePreview = () => document.querySelector(
    '[data-preview-layout="mobile"]',
  );
  expect(desktopPreview()).not.toBeNull();
  expect(mobilePreview()).not.toBeNull();
  expect(
    within(desktopPreview()!).getByRole("heading", { name: "我是KID（龙昊翔）" }),
  ).toBeInTheDocument();
  expect(
    within(mobilePreview()!).getByLabelText("我是KID（龙昊翔）"),
  ).toBeInTheDocument();

  const overview = screen.getByRole("link", { name: "Open PROJECT OVERVIEW" });
  fireEvent.pointerEnter(overview);

  expect(container.querySelector("main")).toHaveAttribute(
    "data-previewed-project",
    "about",
  );

  expect(
    within(desktopPreview()!).getByLabelText("GLOBAL PRODUCT LAUNCH & DTC"),
  ).toBeInTheDocument();
  expect(
    within(desktopPreview()!).getByRole("heading", {
      name: "我是KID（龙昊翔）",
    }),
  ).toBeInTheDocument();
  expect(
    within(desktopPreview()!).getByLabelText("一个人类 · 资深视觉设计师"),
  ).toBeInTheDocument();
  expect(
    within(desktopPreview()!).getByLabelText(
      "10+ 年智能硬件品牌视觉经验，聚焦新品传播、",
    ),
  ).toBeInTheDocument();
  expect(
    within(mobilePreview()!).getByLabelText("GLOBAL PRODUCT LAUNCH & DTC"),
  ).toBeInTheDocument();
  expect(
    within(mobilePreview()!).getByRole("heading", {
      name: "我是KID（龙昊翔）新品传播 · 电商活动 · DTC 转化视觉",
    }),
  ).toBeInTheDocument();

  fireEvent.pointerLeave(overview);
  expect(container.querySelector("main")).not.toHaveAttribute(
    "data-previewed-project",
  );
  expect(
    within(desktopPreview()!).getByRole("heading", { name: "我是KID（龙昊翔）" }),
  ).toBeInTheDocument();
  expect(
    within(mobilePreview()!).getByLabelText("我是KID（龙昊翔）"),
  ).toBeInTheDocument();
});

test("renders the portfolio identity and five approved entry links", () => {
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(null);

  render(<PortfolioHome />);

  expect(screen.getByText("KID LONG")).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /open/i })).toHaveLength(5);

  getContext.mockRestore();
});

test("holds navigation until the portrait exit transition completes", () => {
  vi.useFakeTimers();
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(null);
  const { container } = render(<PortfolioHome />);

  fireEvent.click(screen.getByRole("link", { name: "Open DESIGN LOGIC" }));
  expect(analytics.trackProjectClick).toHaveBeenCalledWith({
    id: "business",
    label: "DESIGN LOGIC",
  });
  expect(container.querySelector("main")).toHaveAttribute("data-phase", "zooming");
  act(() => vi.advanceTimersByTime(719));
  expect(navigation.push).not.toHaveBeenCalled();

  act(() => vi.advanceTimersByTime(1));
  expect(navigation.push).toHaveBeenCalledWith("/work/business");

  getContext.mockRestore();
});

test("hovering a project previews it without counting a click", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  render(<PortfolioHome />);

  fireEvent.pointerEnter(screen.getByRole("link", { name: "Open DESIGN LOGIC" }));

  expect(analytics.trackProjectClick).not.toHaveBeenCalled();
});
