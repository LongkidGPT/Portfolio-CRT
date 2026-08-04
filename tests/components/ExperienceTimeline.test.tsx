import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import ExperienceTimeline from "@/components/portfolio/ExperienceTimeline";

test("career ruler supports keyboard scrubbing", () => {
  render(<ExperienceTimeline />);
  const ruler = screen.getByRole("slider", { name: "Career timeline" });

  fireEvent.keyDown(ruler, { key: "ArrowRight" });
  expect(ruler).toHaveAttribute("aria-valuenow", "2014.25");

  fireEvent.keyDown(ruler, { key: "End" });
  expect(ruler).toHaveAttribute("aria-valuenow", "2026");
});
