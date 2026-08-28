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
    screen.getByRole("link", { name: "Open 00 BUSINESS CONTEXT chapter" }),
  );

  expect(onOpen).toHaveBeenCalledWith("business");
});

test("renders only the current active artwork for the selected project", () => {
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

  const business = screen.getByRole("link", { name: "Open 00 BUSINESS CONTEXT chapter" });
  expect(business.querySelector('[data-state="active"]')).toHaveAttribute(
    "src",
    "/kv/buttons/design-logic-active.png",
  );
  expect(business.querySelectorAll("img")).toHaveLength(1);
  expect(business.querySelector("source")).toHaveAttribute(
    "srcSet",
    "/kv-mobile/cards/design-logic-active.png",
  );
  expect(screen.getByText("00 BUSINESS CONTEXT")).toBeInTheDocument();
  expect(business).toHaveAttribute("data-previewed");
  expect(screen.getByRole("link", { name: "Open PROJECT OVERVIEW chapter" })).not.toHaveAttribute(
    "data-previewed",
  );
  expect(business).not.toHaveAttribute("aria-current");
});

test("uses active mobile artwork only for an activated project", () => {
  render(
    <ProjectSelector
      projects={PROJECTS}
      activeProject="business"
      previewedProject="business"
      activatedProject="business"
      onPreview={vi.fn()}
      onOpen={vi.fn()}
      onResumePointer={vi.fn()}
    />,
  );

  expect(
    screen.getByRole("link", { name: "Open 00 BUSINESS CONTEXT chapter" }),
  ).toHaveAttribute("data-activated");
  expect(
    screen.getByRole("link", { name: "Open PROJECT OVERVIEW chapter" }),
  ).not.toHaveAttribute("data-activated");
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
    screen.getByRole("link", { name: "Open 00 BUSINESS CONTEXT chapter" }),
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

  const business = screen.getByRole("link", { name: "Open 00 BUSINESS CONTEXT chapter" });
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

  const business = screen.getByRole("link", { name: "Open 00 BUSINESS CONTEXT chapter" });
  business.focus();
  fireEvent.click(business, { detail: 0 });

  expect(business).toHaveFocus();
});

test("mobile carousel controls preview adjacent projects and wrap", async () => {
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

  await userEvent.click(screen.getByRole("button", { name: "Next chapter" }));
  expect(onPreview).toHaveBeenLastCalledWith("business", expect.any(Object));

  await userEvent.click(
    screen.getByRole("button", { name: "Previous chapter" }),
  );
  expect(onPreview).toHaveBeenLastCalledWith(
    "launch-event",
    expect.any(Object),
  );
});

test("positions the mobile indicator from the active project index", () => {
  const { container, rerender } = render(
    <ProjectSelector
      projects={PROJECTS}
      activeProject="about"
      previewedProject={null}
      onPreview={vi.fn()}
      onOpen={vi.fn()}
      onResumePointer={vi.fn()}
    />,
  );

  expect(container.querySelector('[aria-hidden="true"][style]')).toHaveStyle(
    "--active-index: 0",
  );

  rerender(
    <ProjectSelector
      projects={PROJECTS}
      activeProject="brand-system"
      previewedProject="brand-system"
      onPreview={vi.fn()}
      onOpen={vi.fn()}
      onResumePointer={vi.fn()}
    />,
  );

  expect(container.querySelector('[aria-hidden="true"][style]')).toHaveStyle(
    "--active-index: 2",
  );
});
