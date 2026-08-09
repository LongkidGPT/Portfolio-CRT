"use client";

import { createContext, useContext } from "react";
import type { ProjectId } from "@/lib/portfolio/projects";

export interface AnalyticsContextValue {
  branchId: string;
  trackProjectClick(project: { id: ProjectId; label: string }): void;
}

export const AnalyticsContext = createContext<AnalyticsContextValue>({
  branchId: "/",
  trackProjectClick: () => undefined,
});

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
