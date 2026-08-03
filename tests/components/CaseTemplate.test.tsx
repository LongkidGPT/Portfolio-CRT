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

test("brand system case uses the supplied full-page artwork", () => {
  render(<CaseTemplate project={getProjectById("brand-system")} />);

  expect(
    screen.getByRole("img", { name: "Brand system case study" }),
  ).toHaveAttribute("src", "/kv/cases/brand-system/goal-01.jpg");
  expect(
    screen.queryByRole("navigation", { name: "Case chapters" }),
  ).not.toBeInTheDocument();
});

test("about template exposes the approved profile sections", () => {
  render(<AboutTemplate />);
  expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
});
