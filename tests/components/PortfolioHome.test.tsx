import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import PortfolioHome from "@/components/portfolio/PortfolioHome";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

test("renders the portfolio identity and five approved entry links", () => {
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(null);

  render(<PortfolioHome />);

  expect(screen.getByText("KID LONG")).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /open/i })).toHaveLength(5);

  getContext.mockRestore();
});
