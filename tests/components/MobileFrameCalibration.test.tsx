import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import MobileFrameCalibration from "@/components/portfolio/MobileFrameCalibration";

test("calibrates and remembers an independent frame for each mobile project", async () => {
  render(<MobileFrameCalibration />);

  expect(screen.getByAltText("ABOUT frame 124")).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Next frame" }));
  expect(screen.getByAltText("ABOUT frame 125")).toBeVisible();

  await userEvent.click(screen.getByRole("button", { name: /DESIGN LOGIC/ }));
  expect(screen.getByAltText("DESIGN LOGIC frame 124")).toBeVisible();

  fireEvent.change(screen.getByRole("slider", { name: "Frame" }), {
    target: { value: "30" },
  });
  expect(screen.getByAltText("DESIGN LOGIC frame 30")).toBeVisible();

  await userEvent.click(screen.getByRole("button", { name: /ABOUT/ }));
  expect(screen.getByAltText("ABOUT frame 125")).toBeVisible();
});
