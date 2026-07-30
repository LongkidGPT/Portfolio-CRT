import { describe, expect, it } from "vitest";
import {
  PROJECTS,
  getProjectById,
  getProjectByPath,
} from "@/lib/portfolio/projects";

describe("project registry", () => {
  it("exposes the approved five entries in the approved order", () => {
    expect(PROJECTS.map((project) => project.id)).toEqual([
      "about",
      "business",
      "brand-system",
      "product-launch",
      "launch-event",
    ]);
  });

  it("maps every shareable path back to its project", () => {
    for (const project of PROJECTS) {
      expect(getProjectByPath(project.href)?.id).toBe(project.id);
      expect(getProjectById(project.id).href).toBe(project.href);
    }
  });

  it("returns undefined for an unsupported path", () => {
    expect(getProjectByPath("/work/unknown")).toBeUndefined();
  });
});
