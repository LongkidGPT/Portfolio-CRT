import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import AboutTemplate from "@/components/portfolio/AboutTemplate";
import CaseTemplate from "@/components/portfolio/CaseTemplate";
import { getProjectById } from "@/lib/portfolio/projects";

test.each([
  ["business", "Design logic case study", "/kv/cases/design-logic.jpg", "2880", "12170"],
  ["brand-system", "Brand system case study", "/kv/cases/brand-system.jpg", "2880", "28394"],
  ["product-launch", "Product launch case study", "/kv/cases/product-launch.png", "2397", "32768"],
  ["launch-event", "Launch event case study", "/kv/cases/launch-event.png", "2880", "19500"],
] as const)(
  "%s case uses its supplied full-page artwork",
  (id, accessibleName, src, width, height) => {
    render(<CaseTemplate project={getProjectById(id)} />);

    expect(screen.getByRole("img", { name: accessibleName })).toHaveAttribute(
      "src",
      src,
    );
    expect(screen.getByRole("img", { name: accessibleName })).toHaveAttribute(
      "width",
      width,
    );
    expect(screen.getByRole("img", { name: accessibleName })).toHaveAttribute(
      "height",
      height,
    );
    expect(
      screen.queryByRole("navigation", { name: "Case chapters" }),
    ).not.toBeInTheDocument();
  },
);

test("about template uses the supplied artwork and an interactive experience ruler", () => {
  render(<AboutTemplate />);
  expect(screen.getByRole("img", { name: "Kid Long profile and experience" })).toHaveAttribute(
    "src",
    "/kv/cases/about-me.png",
  );
  expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
  expect(screen.getByRole("slider", { name: "Career timeline" })).toHaveAttribute(
    "aria-valuenow",
    "2014",
  );
});
