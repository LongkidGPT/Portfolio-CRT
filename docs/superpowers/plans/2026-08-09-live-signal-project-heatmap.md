# Live Signal Project Heatmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Live Signal around collapsible per-project metrics and add a real ten-segment active-dwell heatmap while preserving historical click, dwell, and completion data.

**Architecture:** The client samples the active case viewport into ten vertical segments and emits cumulative snapshots identified by a per-open `case_view_id`. The server de-duplicates snapshots within each view, sums repeated views within a session, and returns a complete five-project map consumed by an accordion-based analytics panel.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, PostHog HogQL, Vitest, Testing Library, Playwright, Netlify.

## Global Constraints

- Accent color is exactly `#247AD3` across launcher, expanded panel, focus states, active visitor and heatmap.
- Heatmap always contains 10 vertical page segments; color intensity represents active dwell, not inferred scroll coverage.
- `BRANCH`, `/`, expanded `TOTAL VISITS`, and Contact click data do not appear in the UI.
- New Contact click events are not collected; historical PostHog events are not deleted.
- Old case events without segment data keep click, dwell, and completion values and render `NO HEATMAP DATA`.
- Raw visitor IDs, session IDs, case-view IDs, and PostHog credentials never appear in the public API response.
- Only one project accordion is open at a time.

---

### Task 1: Ten-segment active dwell measurement

**Files:**
- Modify: `lib/analytics/measurements.ts`
- Test: `tests/unit/analytics-measurements.test.ts`

**Interfaces:**
- Produces: `HEATMAP_SEGMENT_COUNT`, `segmentIndexAtViewportCenter(metrics)`, and `createSegmentDwellTracker(now)`.
- `createSegmentDwellTracker` returns `{ start(index), move(index), pause(), read() }`; `read()` returns a defensive copy of ten non-negative millisecond values.

- [ ] **Step 1: Write failing unit tests for segment selection and foreground-only accumulation**

```ts
expect(segmentIndexAtViewportCenter({ scrollTop: 0, scrollHeight: 2000, clientHeight: 500 })).toBe(1);
expect(segmentIndexAtViewportCenter({ scrollTop: 1500, scrollHeight: 2000, clientHeight: 500 })).toBe(8);

const tracker = createSegmentDwellTracker(now);
tracker.start(1);
clock = 1000;
tracker.move(4);
clock = 2500;
tracker.pause();
expect(tracker.read()).toEqual([0, 1000, 0, 0, 1500, 0, 0, 0, 0, 0]);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- tests/unit/analytics-measurements.test.ts`

Expected: FAIL because the three exported measurement APIs do not exist.

- [ ] **Step 3: Implement the measurement primitives**

```ts
export const HEATMAP_SEGMENT_COUNT = 10;

export function segmentIndexAtViewportCenter({ scrollTop, scrollHeight, clientHeight }: ScrollMetrics) {
  if (scrollHeight <= 0) return 0;
  const center = Math.min(scrollHeight, Math.max(0, scrollTop + clientHeight / 2));
  return Math.min(9, Math.floor((center / scrollHeight) * HEATMAP_SEGMENT_COUNT));
}

export function createSegmentDwellTracker(now: () => number) {
  const dwell = Array.from({ length: HEATMAP_SEGMENT_COUNT }, () => 0);
  let activeIndex: number | null = null;
  let startedAt = 0;
  const flush = () => {
    if (activeIndex === null) return;
    const next = now();
    dwell[activeIndex] += Math.max(0, next - startedAt);
    startedAt = next;
  };
  return {
    start(index: number) { activeIndex = Math.min(9, Math.max(0, index)); startedAt = now(); },
    move(index: number) { flush(); activeIndex = Math.min(9, Math.max(0, index)); },
    pause() { flush(); activeIndex = null; },
    read() { flush(); return [...dwell]; },
  };
}
```

- [ ] **Step 4: Re-run the focused tests**

Run: `npm test -- tests/unit/analytics-measurements.test.ts`

Expected: PASS, including existing scroll-depth and active-clock cases.

- [ ] **Step 5: Commit the measurement unit**

```bash
git add lib/analytics/measurements.ts tests/unit/analytics-measurements.test.ts
git commit -m "feat: measure case segment dwell"
```

---

### Task 2: Capture and query heatmap snapshots

**Files:**
- Modify: `lib/analytics/types.ts`
- Modify: `components/analytics/CaseProgressTracker.tsx`
- Modify: `components/analytics/AnalyticsProvider.tsx`
- Modify: `components/analytics/useAnalytics.ts`
- Modify: `components/portfolio/ContactActions.tsx`
- Modify: `lib/analytics/posthog-query.ts`
- Test: `tests/components/CaseProgressTracker.test.tsx`
- Test: `tests/components/AnalyticsProvider.test.tsx`
- Test: `tests/components/ContactActions.test.tsx`
- Test: `tests/unit/posthog-query.test.ts`

**Interfaces:**
- Extends `portfolio_case_progress` with `case_view_id: string` and `segment_dwell_ms: number[]`.
- Extends `PostHogEventRow` with optional `caseViewId` and `segmentDwellMs` for legacy compatibility.
- Changes `CaseProgressTracker.onProgress` to `(projectId, caseViewId, maxDepth, activeDwellMs, segmentDwellMs) => void`.

- [ ] **Step 1: Write failing tests for a stable per-mount view ID and segment snapshots**

```ts
expect(onProgress).toHaveBeenLastCalledWith(
  "brand-system",
  expect.any(String),
  100,
  expect.any(Number),
  expect.arrayContaining([expect.any(Number)]),
);
expect(onProgress.mock.calls.at(-1)?.[4]).toHaveLength(10);
```

Add a PostHog query fixture whose result columns include `case-view-1` and `[0,1000,0,0,0,0,0,0,0,0]`, then assert both are parsed.

- [ ] **Step 2: Run focused tests and verify failures**

Run: `npm test -- tests/components/CaseProgressTracker.test.tsx tests/components/AnalyticsProvider.test.tsx tests/unit/posthog-query.test.ts`

Expected: FAIL because the event and callback shapes still use depth and dwell only.

- [ ] **Step 3: Add event fields and client sampling**

Generate one `crypto.randomUUID()` in the case tracker effect. Start both the existing active clock and the segment tracker when visible; on scroll, move the segment tracker to `segmentIndexAtViewportCenter(...)`; on hide/unmount pause both, then emit the cumulative snapshot.

```ts
onProgress(projectId, caseViewId, maxDepth, clock.read(), segmentTracker.read());
```

Update `AnalyticsProvider` to send the two new properties without exposing them elsewhere.

- [ ] **Step 4: Stop Contact analytics collection without changing copy behavior**

Remove `portfolio_contact_clicked` from `ANALYTICS_EVENT_NAMES` and the event union. Remove `trackContactClick` from the analytics context and delete its invocation from `ContactActions`; keep clipboard actions and feedback unchanged.

- [ ] **Step 5: Extend HogQL and sanitize heatmap arrays**

Query `properties.case_view_id` and `properties.segment_dwell_ms`. Parse heatmaps only when the value is an array of exactly ten finite non-negative numbers; otherwise return `undefined`.

```ts
function optionalHeatmap(value: unknown) {
  return Array.isArray(value) && value.length === 10 && value.every((item) => typeof item === "number" && Number.isFinite(item) && item >= 0)
    ? value
    : undefined;
}
```

- [ ] **Step 6: Run focused tests**

Run: `npm test -- tests/components/CaseProgressTracker.test.tsx tests/components/AnalyticsProvider.test.tsx tests/components/ContactActions.test.tsx tests/unit/posthog-query.test.ts`

Expected: PASS; Contact copy tests still pass and no test expects a Contact analytics event.

- [ ] **Step 7: Commit capture and query changes**

```bash
git add lib/analytics/types.ts lib/analytics/posthog-query.ts components/analytics/CaseProgressTracker.tsx components/analytics/AnalyticsProvider.tsx components/analytics/useAnalytics.ts components/portfolio/ContactActions.tsx tests
git commit -m "feat: capture project reading heatmaps"
```

---

### Task 3: Aggregate a complete per-project summary

**Files:**
- Modify: `lib/analytics/types.ts`
- Modify: `lib/analytics/summary.ts`
- Test: `tests/unit/analytics-summary.test.ts`
- Test: `tests/unit/analytics-route.test.ts`

**Interfaces:**
- Produces `ProjectAnalyticsMeasurement`:

```ts
interface ProjectAnalyticsMeasurement {
  clicks: number;
  activeDwellMs: number;
  maxDepth: number;
  segmentDwellMs?: number[];
}
```

- Replaces `projectClicks`, `cases`, and `contactClicks` on `SessionAnalyticsSummary` with `projects: Record<ProjectId, ProjectAnalyticsMeasurement>`.

- [ ] **Step 1: Write failing aggregation tests**

Create two cumulative snapshots for `case-view-a`, one snapshot for `case-view-b`, and one legacy event without a view ID. Assert:

```ts
expect(summary.visitors[0].sessions[0].projects["brand-system"]).toEqual({
  clicks: 2,
  activeDwellMs: 57000,
  maxDepth: 84,
  segmentDwellMs: [3000, 9000, 12000, 11000, 8000, 6000, 4000, 2000, 1000, 1000],
});
expect(summary.visitors[0].sessions[0]).not.toHaveProperty("contactClicks");
```

For repeated snapshots within a view, expect per-segment and dwell maxima; across different view IDs, expect sums. For legacy events, preserve max depth and max dwell but leave `segmentDwellMs` undefined.

- [ ] **Step 2: Run summary and route tests and verify failures**

Run: `npm test -- tests/unit/analytics-summary.test.ts tests/unit/analytics-route.test.ts`

Expected: FAIL because the response still has separate click/case/contact maps.

- [ ] **Step 3: Implement view de-duplication and project aggregation**

Use an internal `Map<ProjectId, Map<caseViewId, CaseViewSnapshot>>`. New events use their `caseViewId`; legacy events use a single stable `legacy:${projectId}` key. For each view keep maximum cumulative dwell, maximum depth, and element-wise maximum segments. Sum finalized new views into the project; merge the legacy view without fabricating segment data.

Initialize all five projects for every session so unopened projects return zero metrics.

- [ ] **Step 4: Remove Contact data from the public response**

Delete Contact counters from mutable and public session structures. The query no longer requests Contact events, so the API response contains no Contact fields.

- [ ] **Step 5: Re-run summary and route tests**

Run: `npm test -- tests/unit/analytics-summary.test.ts tests/unit/analytics-route.test.ts`

Expected: PASS and serialized summaries contain neither raw IDs nor `contactClicks`.

- [ ] **Step 6: Commit the summary migration**

```bash
git add lib/analytics/types.ts lib/analytics/summary.ts tests/unit/analytics-summary.test.ts tests/unit/analytics-route.test.ts
git commit -m "feat: group analytics by project"
```

---

### Task 4: Rebuild the Live Signal project accordion

**Files:**
- Create: `components/analytics/ProjectHeatmap.tsx`
- Modify: `components/analytics/AnalyticsCard.tsx`
- Modify: `components/analytics/analytics-card.module.css`
- Test: `tests/components/AnalyticsCard.test.tsx`
- Test: `tests/components/ProjectHeatmap.test.tsx`

**Interfaces:**
- `ProjectHeatmap({ values?: number[] })` renders ten accessible cells or `NO HEATMAP DATA`.
- `AnalyticsCard` consumes `SessionAnalyticsSummary.projects` and manages one `expandedProject: ProjectId | null`.

- [ ] **Step 1: Write failing heatmap and accordion tests**

```ts
expect(screen.getAllByRole("img", { name: /page segment/i })).toHaveLength(10);
expect(screen.getByText("NO HEATMAP DATA")).toBeVisible();

fireEvent.click(screen.getByRole("button", { name: /brand system metrics/i }));
expect(screen.getByText("42 CLICKS")).toBeVisible();
expect(screen.getByText("00:42")).toBeVisible();
expect(screen.getByText("84%")).toBeVisible();
expect(screen.queryByText(/CONTACT CLICKS/i)).not.toBeInTheDocument();
expect(screen.queryByText(/TOTAL VISITS/i)).not.toBeInTheDocument();
expect(screen.queryByText(/BRANCH/i)).not.toBeInTheDocument();
```

- [ ] **Step 2: Run component tests and verify failures**

Run: `npm test -- tests/components/AnalyticsCard.test.tsx tests/components/ProjectHeatmap.test.tsx`

Expected: FAIL because the current component uses separate groups and has no heatmap.

- [ ] **Step 3: Implement the heatmap component**

Normalize intensity relative to the largest value in the selected project. Render ten cells with `backgroundColor: rgba(36, 122, 211, intensity)` where non-zero intensity is clamped to `0.22–1`; zero stays the neutral CSS color. Each cell exposes `aria-label="Page segment 21–30%, dwell 00:09"`.

- [ ] **Step 4: Implement the single-open project accordion**

Render all `PROJECTS` as buttons. On activation, set the project ID or close it when already selected. Within the expanded region render a three-column metric strip and the heatmap. Keep visitor tabs and visit titles; remove the old `HOME PROJECT CLICKS`, `CASE READING`, and Contact groups.

- [ ] **Step 5: Apply the visual system**

- Remove the launcher border while retaining a subtle dark-background shadow.
- Replace every `#d8ff6a` and green glow with `#247AD3` / matching rgba values.
- Simplify the header to a two-column `LIVE SIGNAL` / close layout.
- Use neutral dividers only inside the expanded panel; do not recreate an outer gray frame on the launcher.
- On mobile, keep the existing bottom sheet and ensure the accordion body scrolls within `72dvh`.

- [ ] **Step 6: Run component tests**

Run: `npm test -- tests/components/AnalyticsCard.test.tsx tests/components/ProjectHeatmap.test.tsx`

Expected: PASS for launcher, header exclusions, accordion behavior, metrics, empty state, heatmap, loading, error, and refresh behavior.

- [ ] **Step 7: Commit the UI unit**

```bash
git add components/analytics/AnalyticsCard.tsx components/analytics/ProjectHeatmap.tsx components/analytics/analytics-card.module.css tests/components
git commit -m "feat: redesign live signal project metrics"
```

---

### Task 5: Full verification and production deployment

**Files:**
- Modify: `tests/e2e/analytics.spec.ts`
- Modify: `docs/superpowers/verification/2026-08-09-posthog-visitor-analytics.md`

**Interfaces:**
- Verifies the production contract from click capture through public summary and accordion rendering.

- [ ] **Step 1: Update the E2E test to exercise a project accordion**

Mock the new `projects` response shape, open Live Signal, select a visitor, expand `BRAND SYSTEM`, and assert `CLICKS`, `DWELL`, `COMPLETION`, and ten heatmap segments. Assert `BRANCH`, expanded `TOTAL VISITS`, and Contact metrics are absent.

- [ ] **Step 2: Run the complete quality gate**

Run:

```bash
npm test
npm run lint
npm run build
npx playwright test --config=playwright.analytics.config.ts
```

Expected: all tests and build pass; lint has no new errors or warnings.

- [ ] **Step 3: Record verification evidence**

Document test counts, build result, browser viewport coverage, and the expected legacy-data fallback in `docs/superpowers/verification/2026-08-09-posthog-visitor-analytics.md`.

- [ ] **Step 4: Commit verification**

```bash
git add tests/e2e/analytics.spec.ts docs/superpowers/verification/2026-08-09-posthog-visitor-analytics.md
git commit -m "test: verify live signal heatmap"
```

- [ ] **Step 5: Push the approved branch snapshot to GitHub main and wait for Netlify**

Use the established Git LFS snapshot workflow so large portfolio assets are not re-added to the ordinary Git pack. Verify the Netlify deploy references the new GitHub commit and reaches `ready` state with the Next.js server handler available.

- [ ] **Step 6: Verify production behavior and data flow**

In a fresh Chrome profile, open the production URL, click one project card, scroll through at least three page segments, wait for one heartbeat, close the case, and query `/api/analytics/summary?branch=%2F`. Confirm the newest anonymous visit shows one click, non-zero dwell, expected completion, and a ten-value heatmap. Confirm the card renders the same values and contains no raw IDs or Contact metrics.

