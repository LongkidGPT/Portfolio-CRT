import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import ProjectSelector from "@/components/portfolio/ProjectSelector";
import { PROJECTS } from "@/lib/portfolio/projects";

test("keyboard focus previews the selected project", async () => {
  const onPreview = vi.fn();

  render(
    <ProjectSelector
      projects={PROJECTS}
      activeProject="about"
      onPreview={onPreview}
      onOpen={vi.fn()}
    />,
  );

  await userEvent.tab();

  expect(onPreview).toHaveBeenCalledWith("about", expect.any(Object));
});

test("click requests the selected project overlay", async () => {
  const onOpen = vi.fn();

  render(
    <ProjectSelector
      projects={PROJECTS}
      activeProject="about"
      onPreview={vi.fn()}
      onOpen={onOpen}
    />,
  );

  await userEvent.click(
    screen.getByRole("link", { name: "Open BUSINESS" }),
  );

  expect(onOpen).toHaveBeenCalledWith("business");
});

test("renders the supplied default and active artwork for each project", () => {
  render(
    <ProjectSelector
      projects={PROJECTS}
      activeProject="business"
      onPreview={vi.fn()}
      onOpen={vi.fn()}
    />,
  );

  const business = screen.getByRole("link", { name: "Open BUSINESS" });
  expect(business.querySelector('[data-state="default"]')).toHaveAttribute(
    "src",
    "/kv/buttons/business-default.png",
  );
  expect(business.querySelector('[data-state="active"]')).toHaveAttribute(
    "src",
    "/kv/buttons/business-active.png",
  );
  expect(business).toHaveAttribute("aria-current", "page");
});
