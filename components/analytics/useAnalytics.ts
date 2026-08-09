"use client";

import { createContext, useContext } from "react";
import type { ContactType } from "@/lib/analytics/types";
import type { ProjectId } from "@/lib/portfolio/projects";

export interface AnalyticsContextValue {
  branchId: string;
  trackProjectClick(project: { id: ProjectId; label: string }): void;
  trackContactClick(type: ContactType): void;
}

export const AnalyticsContext = createContext<AnalyticsContextValue>({
  branchId: "/",
  trackProjectClick: () => undefined,
  trackContactClick: () => undefined,
});

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
