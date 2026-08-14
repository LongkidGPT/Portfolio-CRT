import { act, fireEvent, render, screen } from "@testing-library/react";
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

test("locks body scroll and closes on Escape after the transition", () => {
  vi.useFakeTimers();
  render(<CaseOverlay label="Business Context"><h1>Business Context</h1></CaseOverlay>);
  expect(document.body.style.overflow).toBe("hidden");
  fireEvent.keyDown(window, { key: "Escape" });
  expect(back).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(320));
  expect(back).toHaveBeenCalledOnce();
  vi.useRealTimers();
});

test("close button has an accessible name", () => {
  render(<CaseOverlay label="Business Context"><h1>Business Context</h1></CaseOverlay>);
  expect(screen.getByRole("button", { name: "Close project" })).toBeInTheDocument();
});

test("can visually hide the close control without removing it", () => {
  render(
    <CaseOverlay label="Kid Long profile" showCloseControl={false}>
      <h1>Kid Long profile</h1>
    </CaseOverlay>,
  );

  expect(screen.getByRole("button", { name: "Close project" })).toHaveAttribute(
    "data-visual-control",
    "hidden",
  );
});

test("plays the close transition before returning to the homepage", () => {
  vi.useFakeTimers();
  render(<CaseOverlay label="Business Context"><h1>Business Context</h1></CaseOverlay>);

  fireEvent.click(screen.getByRole("button", { name: "Close project" }));
  expect(back).not.toHaveBeenCalled();

  act(() => vi.advanceTimersByTime(320));
  expect(back).toHaveBeenCalledOnce();
  vi.useRealTimers();
});

test("keeps keyboard focus inside the modal", () => {
  render(
    <CaseOverlay label="Business Context">
      <button type="button">Last project action</button>
    </CaseOverlay>,
  );

  const close = screen.getByRole("button", { name: "Close project" });
  const last = screen.getByRole("button", { name: "Last project action" });

  last.focus();
  fireEvent.keyDown(window, { key: "Tab" });
  expect(close).toHaveFocus();

  close.focus();
  fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
  expect(last).toHaveFocus();
});
