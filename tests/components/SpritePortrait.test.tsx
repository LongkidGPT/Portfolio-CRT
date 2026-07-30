import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import SpritePortrait from "@/components/portfolio/SpritePortrait";

test("exposes the interactive portrait as one semantic image", () => {
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(null);

  render(<SpritePortrait focusPoint={null} motionReduced />);

  expect(
    screen.getByRole("img", { name: "Interactive CRT portrait" }),
  ).toBeInTheDocument();

  getContext.mockRestore();
});
