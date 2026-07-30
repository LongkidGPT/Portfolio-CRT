import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import CaseOverlay from "@/components/portfolio/CaseOverlay";

const back = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, replace }),
}));

beforeEach(() => {
  back.mockReset();
  replace.mockReset();
  document.body.style.overflow = "";
  window.history.pushState({}, "", "/work/business");
});

test("locks body scroll and closes on Escape", async () => {
  render(<CaseOverlay label="Business Context"><h1>Business Context</h1></CaseOverlay>);
  expect(document.body.style.overflow).toBe("hidden");
  await userEvent.keyboard("{Escape}");
  expect(back).toHaveBeenCalledOnce();
});

test("close button has an accessible name", () => {
  render(<CaseOverlay label="Business Context"><h1>Business Context</h1></CaseOverlay>);
  expect(screen.getByRole("button", { name: "Close project" })).toBeInTheDocument();
});
