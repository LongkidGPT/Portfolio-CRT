"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { sendAnalyticsEvent } from "@/lib/analytics/client";
import {
  createSessionId,
  getOrCreateVisitorId,
  normalizeBranchId,
} from "@/lib/analytics/identity";
import type {
  AnalyticsEvent,
  AnalyticsEventDetails,
  ContactType,
  PublicPostHogConfig,
} from "@/lib/analytics/types";
import type { ProjectId } from "@/lib/portfolio/projects";
import { AnalyticsContext } from "./useAnalytics";
import CaseProgressTracker from "./CaseProgressTracker";

const BRANCH_STORAGE_KEY = "kid-portfolio-branch-v1";

function environmentConfig(): PublicPostHogConfig | null {
  const token = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  return token && host ? { token, host } : null;
}

interface SessionIdentity {
  visitorId: string;
  sessionId: string;
}

export default function AnalyticsProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config?: PublicPostHogConfig | null;
}) {
  const pathname = usePathname();
  const resolvedConfig = config === undefined ? environmentConfig() : config;
  const identity = useRef<SessionIdentity | null>(null);
  const branchId = useMemo(() => {
    if (typeof window === "undefined") return normalizeBranchId(pathname);
    const stored = window.sessionStorage.getItem(BRANCH_STORAGE_KEY) ?? undefined;
    const branch = normalizeBranchId(pathname, stored);
    window.sessionStorage.setItem(BRANCH_STORAGE_KEY, branch);
    return branch;
  }, [pathname]);

  const capture = useCallback((details: AnalyticsEventDetails) => {
    if (!identity.current) return;
    sendAnalyticsEvent(
      resolvedConfig,
      {
        ...details,
        branch_id: branchId,
        visitor_id: identity.current.visitorId,
        session_id: identity.current.sessionId,
        pathname: window.location.pathname,
        timestamp: new Date().toISOString(),
      } as AnalyticsEvent,
      {},
    );
  }, [branchId, resolvedConfig]);

  useEffect(() => {
    if (!identity.current) {
      identity.current = {
        visitorId: getOrCreateVisitorId(window.localStorage),
        sessionId: createSessionId(),
      };
      capture({ event: "portfolio_session_started" });
    }

    const endSession = () => {
      if (!identity.current) return;
      sendAnalyticsEvent(
        resolvedConfig,
        {
          event: "portfolio_session_ended",
          branch_id: branchId,
          visitor_id: identity.current.visitorId,
          session_id: identity.current.sessionId,
          pathname: window.location.pathname,
          timestamp: new Date().toISOString(),
        },
        {
          preferBeacon: true,
          beacon: navigator.sendBeacon?.bind(navigator),
        },
      );
    };

    window.addEventListener("pagehide", endSession);
    return () => window.removeEventListener("pagehide", endSession);
  }, [branchId, capture, resolvedConfig]);

  const value = useMemo(() => ({
    branchId,
    trackProjectClick: (project: { id: ProjectId; label: string }) => capture({
      event: "portfolio_project_clicked",
      project_id: project.id,
      project_label: project.label,
    }),
    trackContactClick: (type: ContactType) => capture({
      event: "portfolio_contact_clicked",
      contact_type: type,
    }),
  }), [branchId, capture]);

  const trackCaseProgress = useCallback((projectId: ProjectId, maxDepth: number, activeDwellMs: number) => {
    capture({
      event: "portfolio_case_progress",
      project_id: projectId,
      max_scroll_depth: maxDepth,
      active_dwell_ms: activeDwellMs,
    });
  }, [capture]);

  return (
    <AnalyticsContext.Provider value={value}>
      <CaseProgressTracker pathname={pathname} onProgress={trackCaseProgress} />
      {children}
    </AnalyticsContext.Provider>
  );
}
