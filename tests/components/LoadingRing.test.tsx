import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import LoadingRing from "@/components/portfolio/LoadingRing";

test("loading ring exposes one accessible status", () => {
  render(<LoadingRing />);
  expect(screen.getByRole("status", { name: "Loading portfolio" })).toBeInTheDocument();
});
