import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import AboutExperience from "@/components/portfolio/AboutExperience";

test("hovering a role slides the ruler to its time range", () => {
  render(<AboutExperience />);
  const anker = screen.getByRole("button", { name: "2023–2026 Anker Innovations" });

  fireEvent.pointerEnter(anker);

  expect(anker).toHaveAttribute("aria-current", "true");
  expect(screen.getByRole("slider", { name: "Career timeline" })).toHaveAttribute(
    "aria-valuenow",
    "2023.5",
  );
});

test("dragging the ruler in reverse selects the matching role", () => {
  render(<AboutExperience />);
  const ruler = screen.getByRole("slider", { name: "Career timeline" });
  Object.defineProperty(ruler, "getBoundingClientRect", {
    value: () => ({ left: 0, width: 1000 }),
  });

  fireEvent.pointerDown(ruler, { clientX: 500, pointerId: 1 });
  fireEvent.pointerMove(ruler, { clientX: -500, pointerId: 1 });
  fireEvent.pointerUp(ruler, { pointerId: 1 });

  expect(ruler).toHaveAttribute("aria-valuenow", "2018");
  expect(screen.getByRole("button", { name: "2018–2021 Extend" })).toHaveAttribute(
    "aria-current",
    "true",
  );
});

test("career ruler supports keyboard scrubbing", () => {
  render(<AboutExperience />);
  const ruler = screen.getByRole("slider", { name: "Career timeline" });

  fireEvent.keyDown(ruler, { key: "End" });
  expect(ruler).toHaveAttribute("aria-valuenow", "2026");
});

test("timeline year labels align to their matching year ticks", () => {
  render(<AboutExperience />);

  expect(document.querySelector('[data-timeline-year="2012"]')).toHaveStyle({
    "--year-position": "0%",
  });
  expect(document.querySelector('[data-timeline-year="2014"]')).toHaveStyle({
    "--year-position": "14.285714285714285%",
  });
  expect(document.querySelector('[data-timeline-year="2026"]')).toHaveStyle({
    "--year-position": "100%",
  });
});
