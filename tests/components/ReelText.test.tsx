import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import ReelText from "@/components/portfolio/ReelText";

test("keeps one accessible label while rendering animated character reels", () => {
  render(<ReelText text="IFA 2025" />);

  expect(screen.getByLabelText("IFA 2025")).toBeInTheDocument();
  expect(screen.getAllByTestId("reel-character")).toHaveLength(7);
});

test("preserves character case and keeps words as non-breaking groups", () => {
  render(<ReelText text="Aa9 test" />);

  const characters = screen.getAllByTestId("reel-character");
  expect(characters[0].textContent).toMatch(/^[A-Z]{3}$/);
  expect(characters[1].textContent).toMatch(/^[a-z]{3}$/);
  expect(characters[2].textContent).toMatch(/^\d{3}$/);
  expect(screen.getAllByTestId("reel-word")).toHaveLength(2);
});

test("never exposes a scrambled glyph before the reel settles", () => {
  render(<ReelText text="KID" />);

  expect(screen.getAllByTestId("reel-character").map((character) => character.textContent)).toEqual([
    "KKK",
    "III",
    "DDD",
  ]);
});
