import { isValidBranchId } from "./identity";
import { ANALYTICS_EVENT_NAMES, type AnalyticsEventName, type PostHogEventRow } from "./types";

export interface PostHogServerConfig {
  personalApiKey: string;
  projectId: string;
  host: string;
}

function queryHost(host: string) {
  return host.replace(/\/+$/, "").replace("://us.i.", "://us.").replace("://eu.i.", "://eu.");
}

function optionalString(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function optionalHeatmap(value: unknown) {
  return Array.isArray(value)
    && value.length === 10
    && value.every((item) => typeof item === "number" && Number.isFinite(item) && item >= 0)
    ? value as number[]
    : undefined;
}

export async function queryBranchEvents(
  config: PostHogServerConfig,
  branchId: string,
  fetcher: typeof fetch = fetch,
) {
  if (!isValidBranchId(branchId)) throw new TypeError("Invalid branch");
  const events = ANALYTICS_EVENT_NAMES.map((name) => `'${name}'`).join(", ");
  const query = `SELECT event, toString(timestamp), properties.branch_id, properties.visitor_id, properties.session_id, properties.pathname, properties.project_id, properties.max_scroll_depth, properties.active_dwell_ms, properties.case_view_id, properties.segment_dwell_ms FROM events WHERE properties.branch_id = '${branchId}' AND event IN (${events}) ORDER BY timestamp ASC LIMIT 5000`;
  const response = await fetcher(`${queryHost(config.host)}/api/projects/${encodeURIComponent(config.projectId)}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.personalApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`PostHog query failed: ${response.status}`);
  const body = await response.json() as { results?: unknown[][] };
  return (body.results ?? []).flatMap((values): PostHogEventRow[] => {
    const [event, timestamp, rowBranch, visitorId, sessionId, pathname, projectId, depth, dwell, caseViewId, segmentDwellMs] = values;
    if (!ANALYTICS_EVENT_NAMES.includes(event as AnalyticsEventName)) return [];
    if (![timestamp, rowBranch, visitorId, sessionId, pathname].every((value) => typeof value === "string")) return [];
    return [{
      event: event as AnalyticsEventName,
      timestamp: timestamp as string,
      branchId: rowBranch as string,
      visitorId: visitorId as string,
      sessionId: sessionId as string,
      pathname: pathname as string,
      projectId: optionalString(projectId) as PostHogEventRow["projectId"],
      caseViewId: optionalString(caseViewId),
      maxScrollDepth: optionalNumber(depth),
      activeDwellMs: optionalNumber(dwell),
      segmentDwellMs: optionalHeatmap(segmentDwellMs),
    }];
  });
}
