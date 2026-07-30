import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import AboutTemplate from "@/components/portfolio/AboutTemplate";
import CaseTemplate from "@/components/portfolio/CaseTemplate";
import { getProjectById } from "@/lib/portfolio/projects";

test("case template renders labeled media requirements", () => {
  render(<CaseTemplate project={getProjectById("business")} />);
  expect(
    screen.getByRole("img", {
      name: "Placeholder for HERO IMAGE, recommended 2560×1440",
    }),
  ).toBeInTheDocument();
  expect(screen.getByText("2560×1440")).toBeInTheDocument();
  expect(
    screen.getByRole("img", {
      name: "Placeholder for PROCESS DIAGRAM, recommended 2400×1600",
    }),
  ).toBeInTheDocument();
});

test("about template exposes the approved profile sections", () => {
  render(<AboutTemplate />);
  expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
});
