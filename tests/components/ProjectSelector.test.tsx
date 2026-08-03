import { fireEvent, render, screen } from "@testing-library/react";
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
      previewedProject={null}
      onPreview={onPreview}
      onOpen={vi.fn()}
      onResumePointer={vi.fn()}
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
      previewedProject={null}
      onPreview={vi.fn()}
      onOpen={onOpen}
      onResumePointer={vi.fn()}
    />,
  );

  await userEvent.click(
    screen.getByRole("link", { name: "Open DESIGN LOGIC" }),
  );

  expect(onOpen).toHaveBeenCalledWith("business");
});

test("renders the supplied default and active artwork for each project", () => {
  render(
    <ProjectSelector
      projects={PROJECTS}
      activeProject="business"
      previewedProject="business"
      onPreview={vi.fn()}
      onOpen={vi.fn()}
      onResumePointer={vi.fn()}
    />,
  );

  const business = screen.getByRole("link", { name: "Open DESIGN LOGIC" });
  expect(business.querySelector('[data-state="default"]')).toHaveAttribute(
    "src",
    "/kv/buttons/design-logic-default.png",
  );
  expect(business.querySelector('[data-state="active"]')).toHaveAttribute(
    "src",
    "/kv/buttons/design-logic-active.png",
  );
  expect(business.querySelectorAll("img")).toHaveLength(2);
  expect(screen.queryByText("DESIGN LOGIC")).not.toBeInTheDocument();
  expect(business).toHaveAttribute("data-previewed");
  expect(screen.getByRole("link", { name: "Open ABOUT" })).not.toHaveAttribute(
    "data-previewed",
  );
  expect(business).not.toHaveAttribute("aria-current");
});

test("returns control to free pointer tracking after leaving a project", () => {
  const onResumePointer = vi.fn();
  render(
    <ProjectSelector
      projects={PROJECTS}
      activeProject="business"
      previewedProject="business"
      onPreview={vi.fn()}
      onOpen={vi.fn()}
      onResumePointer={onResumePointer}
    />,
  );

  fireEvent.pointerLeave(
    screen.getByRole("link", { name: "Open DESIGN LOGIC" }),
  );

  expect(onResumePointer).toHaveBeenCalledOnce();
});

test("pointer activation blurs before opening", async () => {
  render(
    <ProjectSelector
      projects={PROJECTS}
      activeProject="business"
      previewedProject="business"
      onPreview={vi.fn()}
      onOpen={vi.fn()}
      onResumePointer={vi.fn()}
    />,
  );

  const business = screen.getByRole("link", { name: "Open DESIGN LOGIC" });
  business.focus();
  await userEvent.click(business);

  expect(business).not.toHaveFocus();
});

test("keyboard activation preserves keyboard focus", () => {
  render(
    <ProjectSelector
      projects={PROJECTS}
      activeProject="business"
      previewedProject="business"
      onPreview={vi.fn()}
      onOpen={vi.fn()}
      onResumePointer={vi.fn()}
    />,
  );

  const business = screen.getByRole("link", { name: "Open DESIGN LOGIC" });
  business.focus();
  fireEvent.click(business, { detail: 0 });

  expect(business).toHaveFocus();
});
