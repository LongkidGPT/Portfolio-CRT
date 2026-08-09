import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import ProjectHeatmap from "@/components/analytics/ProjectHeatmap";

test("renders ten accessible page segments with dwell intensity", () => {
  render(<ProjectHeatmap values={[0, 1000, 4000, 8000, 12000, 9000, 5000, 2000, 1000, 0]} />);

  const segments = screen.getAllByRole("img", { name: /page segment/i });
  expect(segments).toHaveLength(10);
  expect(segments[0]).toHaveAccessibleName("Page segment 1–10%, dwell 00:00");
  expect(segments[4]).toHaveAccessibleName("Page segment 41–50%, dwell 00:12");
  expect(segments[4]).toHaveStyle({ backgroundColor: "rgba(36, 122, 211, 1)" });
});

test("does not fabricate a heatmap for legacy visits", () => {
  render(<ProjectHeatmap />);
  expect(screen.getByText("NO HEATMAP DATA")).toBeVisible();
  expect(screen.queryAllByRole("img", { name: /page segment/i })).toHaveLength(0);
});
