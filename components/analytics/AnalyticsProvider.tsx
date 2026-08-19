"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { sendAnalyticsEvent } from "@/lib/analytics/client";
import {
  createSessionId,
  getOrCreateVisitorId,
  resolveBranchId,
} from "@/lib/analytics/identity";
import type {
  AnalyticsEvent,
  AnalyticsEventDetails,
  PublicPostHogConfig,
} from "@/lib/analytics/types";
import type { ProjectId } from "@/lib/portfolio/projects";
import type { JourneyMatrixSnapshot } from "@/lib/analytics/types";
import { AnalyticsContext } from "./useAnalytics";
import CaseProgressTracker from "./CaseProgressTracker";
import { createActiveDwellClock } from "@/lib/analytics/measurements";
import AnalyticsCard from "./AnalyticsCard";

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
  cardVisible = false,
  allowAutomatedTracking = false,
}: {
  children: React.ReactNode;
  config?: PublicPostHogConfig | null;
  cardVisible?: boolean;
  allowAutomatedTracking?: boolean;
}) {
  const pathname = usePathname();
  const resolvedConfig = config === undefined ? environmentConfig() : config;
  const trackingEnabled = allowAutomatedTracking
    || typeof navigator === "undefined"
    || !navigator.webdriver;
  const identity = useRef<SessionIdentity | null>(null);
  const branchId = useMemo(() => {
    const configuredBranch = process.env.NEXT_PUBLIC_ANALYTICS_BRANCH_ID;
    if (typeof window === "undefined") return resolveBranchId(pathname, undefined, configuredBranch);
    const stored = window.sessionStorage.getItem(BRANCH_STORAGE_KEY) ?? undefined;
    const branch = resolveBranchId(pathname, stored, configuredBranch);
    window.sessionStorage.setItem(BRANCH_STORAGE_KEY, branch);
    return branch;
  }, [pathname]);

  const capture = useCallback((details: AnalyticsEventDetails) => {
    if (!trackingEnabled) return;
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
  }, [branchId, resolvedConfig, trackingEnabled]);

  useEffect(() => {
    if (!trackingEnabled) return;
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
  }, [branchId, capture, resolvedConfig, trackingEnabled]);

  useEffect(() => {
    if (!trackingEnabled) return;
    const clock = createActiveDwellClock(() => Date.now());
    const report = () => capture({
      event: "portfolio_session_progress",
      active_dwell_ms: clock.read(),
    });
    const visibilityChanged = () => {
      if (document.visibilityState === "hidden") {
        clock.pause();
        report();
      } else {
        clock.start();
      }
    };

    if (document.visibilityState !== "hidden") clock.start();
    document.addEventListener("visibilitychange", visibilityChanged);
    const timer = window.setInterval(report, 15_000);
    return () => {
      clock.pause();
      report();
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.clearInterval(timer);
    };
  }, [capture, trackingEnabled]);

  const value = useMemo(() => ({
    branchId,
    trackProjectClick: (project: { id: ProjectId; label: string }) => capture({
      event: "portfolio_project_clicked",
      project_id: project.id,
      project_label: project.label,
    }),
  }), [branchId, capture]);

  const trackCaseProgress = useCallback((
    projectId: ProjectId,
    caseViewId: string,
    maxDepth: number,
    activeDwellMs: number,
    segmentDwellMs: number[],
    journeyMatrix: JourneyMatrixSnapshot,
  ) => {
    capture({
      event: "portfolio_case_progress",
      project_id: projectId,
      case_view_id: caseViewId,
      max_scroll_depth: maxDepth,
      active_dwell_ms: activeDwellMs,
      segment_dwell_ms: segmentDwellMs,
      journey_matrix: journeyMatrix,
    });
  }, [capture]);

  return (
    <AnalyticsContext.Provider value={value}>
      <CaseProgressTracker pathname={pathname} onProgress={trackCaseProgress} />
      {children}
      {cardVisible ? <AnalyticsCard branchId={branchId} /> : null}
    </AnalyticsContext.Provider>
  );
}
