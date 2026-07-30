import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import ReelText from "@/components/portfolio/ReelText";

test("keeps one accessible label while rendering animated character reels", () => {
  render(<ReelText text="IFA 2025" />);

  expect(screen.getByLabelText("IFA 2025")).toBeInTheDocument();
  expect(screen.getAllByTestId("reel-character")).toHaveLength(7);
});
