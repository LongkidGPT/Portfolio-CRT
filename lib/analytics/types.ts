import type { ProjectId } from "@/lib/portfolio/projects";

export const ANALYTICS_EVENT_NAMES = [
  "portfolio_session_started",
  "portfolio_project_clicked",
  "portfolio_case_progress",
  "portfolio_contact_clicked",
  "portfolio_session_ended",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
export type ContactType = "email" | "phone" | "wechat";

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
      event: "portfolio_project_clicked";
      project_id: ProjectId;
      project_label: string;
    })
  | (AnalyticsEventBase & {
      event: "portfolio_case_progress";
      project_id: ProjectId;
      max_scroll_depth: number;
      active_dwell_ms: number;
    })
  | (AnalyticsEventBase & {
      event: "portfolio_contact_clicked";
      contact_type: ContactType;
    })
  | (AnalyticsEventBase & { event: "portfolio_session_ended" });

export interface PublicPostHogConfig {
  token: string;
  host: string;
}
