import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import PortfolioHeader from "@/components/portfolio/PortfolioHeader";

const route = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

test("selects WORK on the home and case routes", () => {
  route.pathname = "/";
  const { rerender } = render(<PortfolioHeader />);
  const work = screen.getByRole("link", { name: "WORK @" });
  const about = screen.getByRole("link", { name: "ABOUT" });

  expect(work).toHaveTextContent("→ WORK @");
  expect(work).toHaveAttribute("aria-current", "page");
  expect(about).not.toHaveAttribute("aria-current");

  route.pathname = "/work/business";
  rerender(<PortfolioHeader />);

  expect(work).toHaveTextContent("→ WORK @");
  expect(work).toHaveAttribute("aria-current", "page");
});

test("moves the arrow to ABOUT on the profile route", () => {
  route.pathname = "/about";
  render(<PortfolioHeader />);
  const work = screen.getByRole("link", { name: "WORK @" });
  const about = screen.getByRole("link", { name: "ABOUT" });

  expect(work).toHaveTextContent("WORK @");
  expect(work).not.toHaveTextContent("→");
  expect(work).not.toHaveAttribute("aria-current");
  expect(about).toHaveTextContent("→ ABOUT");
  expect(about).toHaveAttribute("aria-current", "page");
});
