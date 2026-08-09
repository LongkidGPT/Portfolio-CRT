"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PROJECTS } from "@/lib/portfolio/projects";
import type { BranchAnalyticsSummary } from "@/lib/analytics/types";
import styles from "./analytics-card.module.css";

type LoadState = "loading" | "ready" | "empty" | "error";

function formatDuration(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function projectLabel(projectId: string) {
  return PROJECTS.find(({ id }) => id === projectId)?.label ?? projectId.toUpperCase();
}

export default function AnalyticsCard({ branchId, fetcher = fetch }: { branchId: string; fetcher?: typeof fetch }) {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState<LoadState>("loading");
  const [summary, setSummary] = useState<BranchAnalyticsSummary | null>(null);
  const [selectedVisitor, setSelectedVisitor] = useState<string | null>(null);

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
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  useEffect(() => {
    if (!expanded) return;
    const controller = new AbortController();
    void refresh(controller.signal);
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "hidden") void refresh(controller.signal);
    }, 30_000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [expanded, refresh]);

  const visitor = useMemo(() => summary?.visitors.find(({ label }) => label === selectedVisitor) ?? null, [selectedVisitor, summary]);

  return (
    <aside className={styles.shell} data-expanded={expanded ? "" : undefined}>
      {!expanded ? (
        <button className={styles.launcher} type="button" aria-label="Open Live Signal analytics" aria-expanded="false" onClick={() => setExpanded(true)}>
          <span><i /> LIVE SIGNAL</span><strong>{summary?.totalVisits ?? "—"}</strong>
        </button>
      ) : (
        <section className={styles.panel} aria-label="Live Signal analytics panel">
          <header className={styles.header}>
            <div><span>LIVE SIGNAL / BRANCH</span><strong>{summary?.branchId ?? branchId}</strong></div>
            <div className={styles.visitTotal}><span>TOTAL VISITS</span><strong>{summary?.totalVisits ?? "—"}</strong></div>
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
                    <button key={label} type="button" aria-pressed={label === selectedVisitor} onClick={() => setSelectedVisitor(label)}>{label}</button>
                  ))}
                </nav>
                <div className={styles.sessions}>
                  {visitor?.sessions.map((session) => (
                    <article key={`${visitor.label}-${session.label}`} className={styles.session}>
                      <div className={styles.sessionTitle}><strong>{session.label}</strong><span>ACTIVE {formatDuration(session.activeDwellMs)}</span></div>
                      <div className={styles.group}>
                        <span className={styles.eyebrow}>HOME PROJECT CLICKS</span>
                        {PROJECTS.map((project) => <div className={styles.metric} key={project.id}><span>{project.label}</span><b>{session.projectClicks[project.id]} CLICKS</b></div>)}
                      </div>
                      <div className={styles.group}>
                        <span className={styles.eyebrow}>CASE READING</span>
                        {Object.entries(session.cases).length === 0 && <p className={styles.emptyGroup}>NO CASE OPENED</p>}
                        {Object.entries(session.cases).map(([projectId, measurement]) => <div className={styles.metric} key={projectId}><span>{projectLabel(projectId)} · {measurement.maxDepth}%</span><b>{formatDuration(measurement.activeDwellMs)}</b></div>)}
                      </div>
                      <div className={styles.group}>
                        <span className={styles.eyebrow}>CONTACT CLICKS</span>
                        {(["email", "phone", "wechat"] as const).map((type) => <div className={styles.metric} key={type}><span>{type.toUpperCase()}</span><b>{session.contactClicks[type]} CLICKS</b></div>)}
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
