# Live Signal Journey Matrix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the anonymous ten-block dwell strip with a semantic content-section by browsing-time matrix for each project visit.

**Architecture:** The case tracker samples the currently visible page section into fixed five-second time buckets and sends cumulative journey snapshots with the existing progress heartbeat. PostHog parsing and summary aggregation retain the newest snapshot per case view and combine repeated views without breaking historical segment-only records. The card renders section rows against chronological time columns, with blue intensity representing effective visible dwell.

**Tech Stack:** Next.js 16, React 19, TypeScript, PostHog events/query API, Vitest, Testing Library, Playwright.

## Global Constraints

- Use `#247AD3` for all active heatmap color.
- Matrix rows use semantic project content sections, not anonymous equal page-depth labels.
- Matrix columns represent five-second browsing-time buckets in chronological order.
- Hidden/background-tab time must not be counted.
- Preserve legacy `segmentDwellMs` display for historical visits that do not contain journey samples.
- Keep the existing single-open project accordion and mobile bottom-sheet behavior.

---

### Task 1: Journey measurement model

**Files:**
- Modify: `lib/analytics/measurements.ts`
- Modify: `lib/analytics/types.ts`
- Test: `tests/unit/analytics-measurements.test.ts`

**Interfaces:**
- Produces: `createJourneyMatrixTracker(sectionCount, now, bucketMs)` with `start`, `move`, `pause`, and `read` methods.
- Produces: `JourneyMatrixSnapshot` containing `sectionLabels`, `bucketMs`, and `cells`.

- [ ] **Step 1: Write a failing test** proving that foreground time is split across chronological five-second buckets and section changes.
- [ ] **Step 2: Run** `npm test -- tests/unit/analytics-measurements.test.ts` and confirm the new assertion fails because the tracker is missing.
- [ ] **Step 3: Implement the minimal tracker** with cumulative millisecond cells and no hidden-time accumulation.
- [ ] **Step 4: Run** `npm test -- tests/unit/analytics-measurements.test.ts` and confirm it passes.
- [ ] **Step 5: Commit** measurement types, tests, and implementation.

### Task 2: Case sampling and PostHog summary

**Files:**
- Modify: `components/portfolio/CaseTemplate.tsx`
- Modify: `components/analytics/CaseProgressTracker.tsx`
- Modify: `components/analytics/AnalyticsProvider.tsx`
- Modify: `lib/analytics/posthog-query.ts`
- Modify: `lib/analytics/summary.ts`
- Test: `tests/components/CaseProgressTracker.test.tsx`
- Test: `tests/unit/posthog-query.test.ts`
- Test: `tests/unit/analytics-summary.test.ts`

**Interfaces:**
- Consumes: `JourneyMatrixSnapshot` from Task 1.
- Produces: `journey_matrix` on `portfolio_case_progress` and `journeyMatrix` on public project measurements.

- [ ] **Step 1: Write failing tests** for semantic section detection, safe PostHog JSON parsing, latest-snapshot selection per `case_view_id`, and repeated-view aggregation.
- [ ] **Step 2: Run the three focused test files** and confirm failures are caused by missing journey data.
- [ ] **Step 3: Mark project artwork with semantic sections**, sample the most visible section, and send cumulative journey snapshots.
- [ ] **Step 4: Parse and validate journey JSON**, then aggregate compatible matrices while retaining legacy segment data.
- [ ] **Step 5: Run focused tests** and confirm all pass.
- [ ] **Step 6: Commit** the collection and summary layer.

### Task 3: Semantic journey matrix UI

**Files:**
- Create: `components/analytics/ProjectJourneyMatrix.tsx`
- Modify: `components/analytics/ProjectHeatmap.tsx`
- Modify: `components/analytics/AnalyticsCard.tsx`
- Modify: `components/analytics/analytics-card.module.css`
- Test: `tests/components/ProjectJourneyMatrix.test.tsx`
- Modify: `tests/components/AnalyticsCard.test.tsx`
- Modify: `tests/e2e/analytics.spec.ts`

**Interfaces:**
- Consumes: `journeyMatrix?: JourneyMatrixSnapshot` and legacy `segmentDwellMs?: number[]`.
- Produces: accessible row/column matrix with per-cell section, time range, and dwell labels.

- [ ] **Step 1: Write failing component tests** for semantic row names, chronological columns, blue dwell intensity, and legacy fallback.
- [ ] **Step 2: Run focused component tests** and confirm the matrix component is absent.
- [ ] **Step 3: Implement the matrix and responsive styling**, including `START`, time markers, section labels, and cell tooltips.
- [ ] **Step 4: Run component tests** and confirm they pass.
- [ ] **Step 5: Update E2E expectations** and run desktop/mobile analytics E2E.
- [ ] **Step 6: Run** `npm test`, `npm run lint`, and `npm run build`.
- [ ] **Step 7: Commit, push, deploy, and verify** a new production visit produces a multi-row chronological matrix.
