import { PROJECTS, type ProjectId } from "@/lib/portfolio/projects";
import type {
  BranchAnalyticsSummary,
  PostHogEventRow,
  ProjectAnalyticsMeasurement,
  SessionAnalyticsSummary,
  JourneyMatrixSnapshot,
} from "./types";

interface CaseViewSnapshot {
  maxDepth: number;
  activeDwellMs: number;
  segmentDwellMs?: number[];
  journeyMatrix?: JourneyMatrixSnapshot;
}

interface MutableProject {
  clicks: number;
  views: Map<string, CaseViewSnapshot>;
}

interface MutableSession {
  rawId: string;
  label: string;
  startedAt: string;
  lastSeenAt: string;
  activeDwellMs: number;
  projects: Record<ProjectId, MutableProject>;
}

interface MutableVisitor {
  rawId: string;
  firstSeenAt: string;
  sessions: Map<string, MutableSession>;
}

function emptyMutableProjects() {
  return Object.fromEntries(PROJECTS.map(({ id }) => [id, {
    clicks: 0,
    views: new Map<string, CaseViewSnapshot>(),
  }])) as Record<ProjectId, MutableProject>;
}

function mergeSegments(previous: number[] | undefined, next: number[] | undefined) {
  if (!next) return previous;
  if (!previous) return [...next];
  return previous.map((value, index) => Math.max(value, next[index] ?? 0));
}

function combineJourneys(views: CaseViewSnapshot[]) {
  const journeys = views.flatMap(({ journeyMatrix }) => journeyMatrix ? [journeyMatrix] : []);
  if (journeys.length === 0) return undefined;
  const [first] = journeys;
  const compatible = journeys.filter((journey) => journey.bucketMs === first.bucketMs
    && journey.sectionLabels.length === first.sectionLabels.length
    && journey.sectionLabels.every((label, index) => label === first.sectionLabels[index]));
  return {
    sectionLabels: [...first.sectionLabels],
    bucketMs: first.bucketMs,
    cells: first.sectionLabels.map((_, rowIndex) => compatible.flatMap(
      (journey) => journey.cells[rowIndex] ?? [],
    )),
  } satisfies JourneyMatrixSnapshot;
}

function finalizeProject(project: MutableProject): ProjectAnalyticsMeasurement {
  const views = Array.from(project.views.values());
  const heatmaps = views.flatMap(({ segmentDwellMs }) => segmentDwellMs ? [segmentDwellMs] : []);
  const segmentDwellMs = heatmaps.length > 0
    ? heatmaps.reduce(
      (total, heatmap) => total.map((value, index) => value + (heatmap[index] ?? 0)),
      Array.from({ length: 10 }, () => 0),
    )
    : undefined;
  const journeyMatrix = combineJourneys(views);

  return {
    clicks: project.clicks,
    activeDwellMs: views.reduce((total, view) => total + view.activeDwellMs, 0),
    maxDepth: views.reduce((maximum, view) => Math.max(maximum, view.maxDepth), 0),
    ...(segmentDwellMs ? { segmentDwellMs } : {}),
    ...(journeyMatrix ? { journeyMatrix } : {}),
  };
}

function finalizeProjects(projects: Record<ProjectId, MutableProject>) {
  return Object.fromEntries(PROJECTS.map(({ id }) => [id, finalizeProject(projects[id])])) as Record<
    ProjectId,
    ProjectAnalyticsMeasurement
  >;
}

export function buildBranchSummary(rows: PostHogEventRow[], branchId: string): BranchAnalyticsSummary {
  const visitors = new Map<string, MutableVisitor>();
  let updatedAt: string | null = null;
  const validRows = rows
    .filter((row) => row.branchId === branchId && row.visitorId && row.sessionId && !Number.isNaN(Date.parse(row.timestamp)))
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));

  for (const row of validRows) {
    updatedAt = !updatedAt || Date.parse(row.timestamp) > Date.parse(updatedAt)
      ? row.timestamp
      : updatedAt;
    let visitor = visitors.get(row.visitorId);
    if (!visitor) {
      visitor = { rawId: row.visitorId, firstSeenAt: row.timestamp, sessions: new Map() };
      visitors.set(row.visitorId, visitor);
    }
    let session = visitor.sessions.get(row.sessionId);
    if (!session) {
      session = {
        rawId: row.sessionId,
        label: "",
        startedAt: row.timestamp,
        lastSeenAt: row.timestamp,
        activeDwellMs: 0,
        projects: emptyMutableProjects(),
      };
      visitor.sessions.set(row.sessionId, session);
    }
    session.lastSeenAt = row.timestamp;

    const projectId = row.projectId;
    if (row.event === "portfolio_project_clicked" && projectId && projectId in session.projects) {
      session.projects[projectId as ProjectId].clicks += 1;
    }
    if (row.event === "portfolio_case_progress" && projectId && projectId in session.projects) {
      const project = session.projects[projectId as ProjectId];
      const viewKey = row.caseViewId ?? `legacy:${projectId}`;
      const previous = project.views.get(viewKey) ?? { maxDepth: 0, activeDwellMs: 0 };
      project.views.set(viewKey, {
        maxDepth: Math.max(previous.maxDepth, row.maxScrollDepth ?? 0),
        activeDwellMs: Math.max(previous.activeDwellMs, row.activeDwellMs ?? 0),
        segmentDwellMs: mergeSegments(previous.segmentDwellMs, row.segmentDwellMs),
        journeyMatrix: row.journeyMatrix ?? previous.journeyMatrix,
      });
    }
    if (row.event === "portfolio_session_progress") {
      session.activeDwellMs = Math.max(session.activeDwellMs, row.activeDwellMs ?? 0);
    }
  }

  const publicVisitors = Array.from(visitors.values())
    .sort((a, b) => Date.parse(a.firstSeenAt) - Date.parse(b.firstSeenAt))
    .map((visitor, visitorIndex) => {
      const chronological = Array.from(visitor.sessions.values())
        .sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt));
      chronological.forEach((session, index) => { session.label = `VISIT-${String(index + 1).padStart(2, "0")}`; });
      return {
        label: `VISITOR-${String(visitorIndex + 1).padStart(2, "0")}`,
        sessions: chronological.reverse().map((session): SessionAnalyticsSummary => ({
          label: session.label,
          startedAt: session.startedAt,
          lastSeenAt: session.lastSeenAt,
          activeDwellMs: session.activeDwellMs,
          projects: finalizeProjects(session.projects),
        })),
      };
    });

  return {
    branchId,
    totalVisits: publicVisitors.reduce((total, visitor) => total + visitor.sessions.length, 0),
    updatedAt,
    visitors: publicVisitors,
  };
}
