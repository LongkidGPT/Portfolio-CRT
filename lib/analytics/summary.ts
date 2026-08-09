import { PROJECTS, type ProjectId } from "@/lib/portfolio/projects";
import type {
  BranchAnalyticsSummary,
  ContactClickCounts,
  PostHogEventRow,
  ProjectClickCounts,
  SessionAnalyticsSummary,
} from "./types";

function emptyProjectClicks(): ProjectClickCounts {
  return Object.fromEntries(PROJECTS.map(({ id }) => [id, 0])) as ProjectClickCounts;
}

function emptyContactClicks(): ContactClickCounts {
  return { email: 0, phone: 0, wechat: 0 };
}

interface MutableSession extends SessionAnalyticsSummary {
  rawId: string;
}

interface MutableVisitor {
  rawId: string;
  firstSeenAt: string;
  sessions: Map<string, MutableSession>;
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
        projectClicks: emptyProjectClicks(),
        cases: {},
        contactClicks: emptyContactClicks(),
      };
      visitor.sessions.set(row.sessionId, session);
    }
    session.lastSeenAt = row.timestamp;

    const projectId = row.projectId;
    if (row.event === "portfolio_project_clicked" && projectId && projectId in session.projectClicks) {
      session.projectClicks[projectId as ProjectId] += 1;
    }
    if (row.event === "portfolio_case_progress" && row.projectId) {
      const previous = session.cases[row.projectId] ?? { maxDepth: 0, activeDwellMs: 0 };
      session.cases[row.projectId] = {
        maxDepth: Math.max(previous.maxDepth, row.maxScrollDepth ?? 0),
        activeDwellMs: Math.max(previous.activeDwellMs, row.activeDwellMs ?? 0),
      };
    }
    if (row.event === "portfolio_session_progress") {
      session.activeDwellMs = Math.max(session.activeDwellMs, row.activeDwellMs ?? 0);
    }
    if (row.event === "portfolio_contact_clicked" && row.contactType) {
      session.contactClicks[row.contactType] += 1;
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
        sessions: chronological.reverse().map(({ rawId: _rawId, ...session }) => session),
      };
    });

  return {
    branchId,
    totalVisits: publicVisitors.reduce((total, visitor) => total + visitor.sessions.length, 0),
    updatedAt,
    visitors: publicVisitors,
  };
}
