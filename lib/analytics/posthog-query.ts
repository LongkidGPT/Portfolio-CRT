import { isValidBranchId } from "./identity";
import {
  ANALYTICS_EVENT_NAMES,
  type AnalyticsEventName,
  type JourneyMatrixSnapshot,
  type PostHogEventRow,
} from "./types";

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
  let candidate = value;
  if (typeof value === "string") {
    try {
      candidate = JSON.parse(value) as unknown;
    } catch {
      return undefined;
    }
  }
  return Array.isArray(candidate)
    && candidate.length === 10
    && candidate.every((item) => typeof item === "number" && Number.isFinite(item) && item >= 0)
    ? candidate as number[]
    : undefined;
}

function optionalJourneyMatrix(value: unknown): JourneyMatrixSnapshot | undefined {
  let candidate = value;
  if (typeof value === "string") {
    try {
      candidate = JSON.parse(value) as unknown;
    } catch {
      return undefined;
    }
  }
  if (!candidate || typeof candidate !== "object") return undefined;
  const { sectionLabels, bucketMs, cells } = candidate as Partial<JourneyMatrixSnapshot>;
  if (!Array.isArray(sectionLabels) || sectionLabels.length < 1 || sectionLabels.length > 12) return undefined;
  if (!sectionLabels.every((label) => typeof label === "string" && label.length > 0 && label.length <= 40)) return undefined;
  if (typeof bucketMs !== "number" || !Number.isFinite(bucketMs) || bucketMs < 1000 || bucketMs > 60000) return undefined;
  if (!Array.isArray(cells) || cells.length !== sectionLabels.length) return undefined;
  const width = Array.isArray(cells[0]) ? cells[0].length : -1;
  if (width < 1 || width > 120) return undefined;
  if (!cells.every((row) => Array.isArray(row)
    && row.length === width
    && row.every((item) => typeof item === "number" && Number.isFinite(item) && item >= 0))) return undefined;
  return { sectionLabels: [...sectionLabels], bucketMs, cells: cells.map((row) => [...row]) };
}

export async function queryBranchEvents(
  config: PostHogServerConfig,
  branchId: string,
  fetcher: typeof fetch = fetch,
) {
  if (!isValidBranchId(branchId)) throw new TypeError("Invalid branch");
  const events = ANALYTICS_EVENT_NAMES.map((name) => `'${name}'`).join(", ");
  const query = `SELECT event, toString(timestamp), properties.branch_id, properties.visitor_id, properties.session_id, properties.pathname, properties.project_id, properties.max_scroll_depth, properties.active_dwell_ms, properties.case_view_id, properties.segment_dwell_ms, properties.journey_matrix FROM events WHERE properties.branch_id = '${branchId}' AND event IN (${events}) ORDER BY timestamp ASC LIMIT 5000`;
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
    const [event, timestamp, rowBranch, visitorId, sessionId, pathname, projectId, depth, dwell, caseViewId, segmentDwellMs, journeyMatrix] = values;
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
      journeyMatrix: optionalJourneyMatrix(journeyMatrix),
    }];
  });
}
