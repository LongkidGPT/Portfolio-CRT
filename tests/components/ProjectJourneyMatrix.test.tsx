import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import ProjectJourneyMatrix from "@/components/analytics/ProjectJourneyMatrix";

test("renders semantic sections against chronological time buckets", () => {
  render(<ProjectJourneyMatrix value={{
    sectionLabels: ["OVERVIEW", "VISUAL SYSTEM"],
    bucketMs: 5000,
    cells: [
      [5000, 1000, 0],
      [0, 4000, 5000],
    ],
  }} />);

  expect(screen.getByText("OVERVIEW")).toBeVisible();
  expect(screen.getByText("VISUAL SYSTEM")).toBeVisible();
  expect(screen.getByText("START")).toBeVisible();
  expect(screen.getByText("15S")).toBeVisible();
  const cells = screen.getAllByRole("img", { name: /dwell/i });
  expect(cells).toHaveLength(6);
  expect(cells[0]).toHaveAccessibleName("OVERVIEW, 0–5s, dwell 00:05");
  expect(cells[4]).toHaveAccessibleName("VISUAL SYSTEM, 5–10s, dwell 00:04");
  expect(cells[0]).toHaveStyle({ backgroundColor: "rgba(36, 122, 211, 1)" });
});
