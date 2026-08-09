"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PROJECTS, type ProjectId } from "@/lib/portfolio/projects";
import type { BranchAnalyticsSummary } from "@/lib/analytics/types";
import ProjectHeatmap from "./ProjectHeatmap";
import ProjectJourneyMatrix from "./ProjectJourneyMatrix";
import styles from "./analytics-card.module.css";

type LoadState = "loading" | "ready" | "empty" | "error";

function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function AnalyticsCard({ branchId, fetcher = fetch }: { branchId: string; fetcher?: typeof fetch }) {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState<LoadState>("loading");
  const [summary, setSummary] = useState<BranchAnalyticsSummary | null>(null);
  const [selectedVisitor, setSelectedVisitor] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<ProjectId | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetcher(`/api/analytics/summary?branch=${encodeURIComponent(branchId)}`, { cache: "no-store", signal });
      if (!response.ok) throw new Error("summary unavailable");
      const next = await response.json() as BranchAnalyticsSummary;
      setSummary(next);
      setState(next.totalVisits > 0 ? "ready" : "empty");
      setSelectedVisitor((current) => current && next.visitors.some(({ label }) => label === current) ? current : next.visitors[0]?.label ?? null);
    } catch (error) {
      if ((error as Error).name !== "AbortError") setState("error");
    }
  }, [branchId, fetcher]);

  useEffect(() => {
    const controller = new AbortController();
    const initialRefresh = window.setTimeout(() => void refresh(controller.signal), 0);
    return () => {
      window.clearTimeout(initialRefresh);
      controller.abort();
    };
  }, [refresh]);

  useEffect(() => {
    if (!expanded) return;
    const controller = new AbortController();
    const expandedRefresh = window.setTimeout(() => void refresh(controller.signal), 0);
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "hidden") void refresh(controller.signal);
    }, 30_000);
    return () => {
      controller.abort();
      window.clearTimeout(expandedRefresh);
      window.clearInterval(timer);
    };
  }, [expanded, refresh]);

  const visitor = useMemo(() => summary?.visitors.find(({ label }) => label === selectedVisitor) ?? null, [selectedVisitor, summary]);

  const selectVisitor = (label: string) => {
    setSelectedVisitor(label);
    setExpandedProject(null);
  };

  return (
    <aside className={styles.shell} data-expanded={expanded ? "" : undefined}>
      {!expanded ? (
        <button className={styles.launcher} type="button" aria-label="Open Live Signal analytics" aria-expanded="false" onClick={() => setExpanded(true)}>
          <span><i /> LIVE SIGNAL</span><strong>{summary?.totalVisits ?? "—"}</strong>
        </button>
      ) : (
        <section className={styles.panel} aria-label="Live Signal analytics panel">
          <header className={styles.header}>
            <strong>LIVE SIGNAL</strong>
            <button type="button" aria-label="Close analytics" onClick={() => setExpanded(false)}>×</button>
          </header>
          <div className={styles.body}>
            {state === "loading" && <p className={styles.state}>LOADING SIGNAL…</p>}
            {state === "error" && <p className={styles.state}>TEMPORARILY UNAVAILABLE</p>}
            {state === "empty" && <p className={styles.state}>NO VISITS RECORDED</p>}
            {state === "ready" && summary && (
              <>
                <nav className={styles.visitors} aria-label="Anonymous visitors">
                  {summary.visitors.map(({ label }) => (
                    <button key={label} type="button" aria-pressed={label === selectedVisitor} onClick={() => selectVisitor(label)}>{label}</button>
                  ))}
                </nav>
                <div className={styles.sessions}>
                  {visitor?.sessions.map((session) => (
                    <article key={`${visitor.label}-${session.label}`} className={styles.session}>
                      <div className={styles.sessionTitle}><strong>{session.label}</strong><span>ACTIVE {formatDuration(session.activeDwellMs)}</span></div>
                      <div className={styles.projects}>
                        {PROJECTS.map((project) => {
                          const measurement = session.projects[project.id];
                          const isOpen = expandedProject === project.id;
                          return (
                            <section className={styles.project} key={project.id}>
                              <button
                                className={styles.projectToggle}
                                type="button"
                                aria-label={`${project.label} metrics`}
                                aria-expanded={isOpen}
                                onClick={() => setExpandedProject(isOpen ? null : project.id)}
                              >
                                <span>{project.label}</span><i aria-hidden="true">{isOpen ? "−" : "+"}</i>
                              </button>
                              {isOpen && (
                                <div className={styles.projectDetails}>
                                  <div className={styles.metricGrid}>
                                    <div><span>CLICKS</span><strong>{measurement.clicks} {measurement.clicks === 1 ? "CLICK" : "CLICKS"}</strong></div>
                                    <div><span>DWELL</span><strong>{formatDuration(measurement.activeDwellMs)}</strong></div>
                                    <div><span>COMPLETION</span><strong>{measurement.maxDepth}%</strong></div>
                                  </div>
                                  <span className={styles.eyebrow}>
                                    {measurement.journeyMatrix ? "BROWSING JOURNEY / SECTION × TIME" : "LEGACY HEATMAP / TOP → BOTTOM"}
                                  </span>
                                  {measurement.journeyMatrix
                                    ? <ProjectJourneyMatrix value={measurement.journeyMatrix} />
                                    : <ProjectHeatmap values={measurement.segmentDwellMs} />}
                                </div>
                              )}
                            </section>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </aside>
  );
}

export { formatDuration };
