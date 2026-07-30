import type { ProjectId } from "./projects";

export type OverlayPhase =
  | "idle"
  | "preview"
  | "zooming"
  | "open"
  | "closing";

export interface PortfolioState {
  activeProject: ProjectId;
  overlayProject: ProjectId | null;
  phase: OverlayPhase;
}

export type PortfolioAction =
  | { type: "PREVIEW"; projectId: ProjectId }
  | { type: "OPEN_REQUESTED"; projectId: ProjectId }
  | { type: "OPENED" }
  | { type: "CLOSE_REQUESTED" }
  | { type: "CLOSED" };

export const initialPortfolioState: PortfolioState = {
  activeProject: "about",
  overlayProject: null,
  phase: "idle",
};

export function portfolioReducer(
  state: PortfolioState,
  action: PortfolioAction,
): PortfolioState {
  switch (action.type) {
    case "PREVIEW":
      if (
        state.phase === "zooming" ||
        state.phase === "open" ||
        state.phase === "closing"
      ) {
        return state;
      }
      return {
        ...state,
        activeProject: action.projectId,
        phase: "preview",
      };
    case "OPEN_REQUESTED":
      if (
        state.phase === "zooming" ||
        state.phase === "open" ||
        state.phase === "closing"
      ) {
        return state;
      }
      return {
        activeProject: action.projectId,
        overlayProject: action.projectId,
        phase: "zooming",
      };
    case "OPENED":
      return state.phase === "zooming" ? { ...state, phase: "open" } : state;
    case "CLOSE_REQUESTED":
      return state.phase === "open" ? { ...state, phase: "closing" } : state;
    case "CLOSED":
      return { ...state, overlayProject: null, phase: "idle" };
  }
}
