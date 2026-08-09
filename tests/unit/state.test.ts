import { describe, expect, it } from "vitest";
import {
  initialPortfolioState,
  portfolioReducer,
} from "@/lib/portfolio/state";

describe("portfolioReducer", () => {
  it("previews a project without opening it", () => {
    const state = portfolioReducer(initialPortfolioState, {
      type: "PREVIEW",
      projectId: "business",
    });

    expect(state).toMatchObject({
      activeProject: "business",
      phase: "preview",
    });
  });

  it("moves through zoom, open, and close phases", () => {
    const zooming = portfolioReducer(initialPortfolioState, {
      type: "OPEN_REQUESTED",
      projectId: "brand-system",
    });
    const open = portfolioReducer(zooming, { type: "OPENED" });
    const closing = portfolioReducer(open, { type: "CLOSE_REQUESTED" });
    const idle = portfolioReducer(closing, { type: "CLOSED" });

    expect(zooming.phase).toBe("zooming");
    expect(open.phase).toBe("open");
    expect(closing.phase).toBe("closing");
    expect(idle.phase).toBe("idle");
    expect(idle.activeProject).toBe("brand-system");
  });

  it("ignores a second open request while transitioning", () => {
    const zooming = portfolioReducer(initialPortfolioState, {
      type: "OPEN_REQUESTED",
      projectId: "business",
    });
    const repeated = portfolioReducer(zooming, {
      type: "OPEN_REQUESTED",
      projectId: "launch-event",
    });

    expect(repeated).toEqual(zooming);
  });
});
