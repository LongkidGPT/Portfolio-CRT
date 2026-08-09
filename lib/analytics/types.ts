import type { ProjectId } from "@/lib/portfolio/projects";

export const ANALYTICS_EVENT_NAMES = [
  "portfolio_session_started",
  "portfolio_session_progress",
  "portfolio_project_clicked",
  "portfolio_case_progress",
  "portfolio_session_ended",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

interface AnalyticsEventBase {
  branch_id: string;
  visitor_id: string;
  session_id: string;
  pathname: string;
  timestamp: string;
}

export type AnalyticsEvent =
  | (AnalyticsEventBase & { event: "portfolio_session_started" })
  | (AnalyticsEventBase & {
      event: "portfolio_session_progress";
      active_dwell_ms: number;
    })
  | (AnalyticsEventBase & {
      event: "portfolio_project_clicked";
      project_id: ProjectId;
      project_label: string;
    })
  | (AnalyticsEventBase & {
      event: "portfolio_case_progress";
      project_id: ProjectId;
      case_view_id: string;
      max_scroll_depth: number;
      active_dwell_ms: number;
      segment_dwell_ms: number[];
    })
  | (AnalyticsEventBase & { event: "portfolio_session_ended" });

type AnalyticsEnvelopeKeys = keyof AnalyticsEventBase;
export type AnalyticsEventDetails = AnalyticsEvent extends infer Event
  ? Event extends AnalyticsEvent
    ? Omit<Event, AnalyticsEnvelopeKeys>
    : never
  : never;

export interface PublicPostHogConfig {
  token: string;
  host: string;
}

export interface JourneyMatrixSnapshot {
  sectionLabels: string[];
  bucketMs: number;
  cells: number[][];
}

export interface PostHogEventRow {
  event: AnalyticsEventName;
  timestamp: string;
  branchId: string;
  visitorId: string;
  sessionId: string;
  pathname: string;
  projectId?: ProjectId;
  caseViewId?: string;
  maxScrollDepth?: number;
  activeDwellMs?: number;
  segmentDwellMs?: number[];
}

export interface ProjectAnalyticsMeasurement {
  clicks: number;
  activeDwellMs: number;
  maxDepth: number;
  segmentDwellMs?: number[];
}

export interface SessionAnalyticsSummary {
  label: string;
  startedAt: string;
  lastSeenAt: string;
  activeDwellMs: number;
  projects: Record<ProjectId, ProjectAnalyticsMeasurement>;
}

export interface BranchAnalyticsSummary {
  branchId: string;
  totalVisits: number;
  updatedAt: string | null;
  visitors: Array<{ label: string; sessions: SessionAnalyticsSummary[] }>;
}
