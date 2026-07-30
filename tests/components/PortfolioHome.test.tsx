import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import PortfolioHome from "@/components/portfolio/PortfolioHome";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  prefetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => navigation,
}));

beforeEach(() => {
  navigation.push.mockReset();
  navigation.prefetch.mockReset();
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

  fireEvent.click(screen.getByRole("link", { name: "Open BUSINESS" }));
  expect(container.querySelector("main")).toHaveAttribute("data-phase", "zooming");
  act(() => vi.advanceTimersByTime(719));
  expect(navigation.push).not.toHaveBeenCalled();

  act(() => vi.advanceTimersByTime(1));
  expect(navigation.push).toHaveBeenCalledWith("/work/business");

  getContext.mockRestore();
  vi.useRealTimers();
});
