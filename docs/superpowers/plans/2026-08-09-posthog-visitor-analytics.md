# PostHog Visitor Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add branch-scoped anonymous analytics, per-case reading measurements, explicit click tracking, a safe PostHog query endpoint, and a public responsive `LIVE SIGNAL` card.

**Architecture:** A root client provider owns stable visitor/session identity and sends only explicit events to PostHog's ingestion API. A Next.js Route Handler, deployed by Netlify as a server function, queries PostHog with the server-only Personal API Key and returns a bounded anonymized branch summary. The card consumes only that summary and is emitted only when `NEXT_PUBLIC_ANALYTICS_CARD_VISIBLE=true`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, native `fetch`/`sendBeacon`, PostHog Cloud APIs, Vitest + Testing Library, Playwright.

## Global Constraints

- Preserve every existing uncommitted page, asset, animation, and test change in the worktree.
- Do not add PostHog autocapture, page autocapture, person profiles, or session replay.
- Never expose `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID`, or raw visitor IDs to client code or API responses.
- Keep the active branch ID stable while navigating `/about` and `/work/*` internal routes.
- Home analytics report exactly five project-entry click counts and no home scroll-depth metric.
- Case progress reports maximum depth and foreground-only active dwell time.
- Analytics failures must never delay or break navigation, copying, or transitions.
- Before implementing Route Handlers or environment access, follow `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` and `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`.
- Stage and commit only analytics-related paths; do not stage unrelated dirty files.

---

## File Structure

- `lib/analytics/types.ts`: event, query-row, and public summary contracts.
- `lib/analytics/identity.ts`: branch normalization and anonymous visitor/session identity.
- `lib/analytics/client.ts`: non-blocking PostHog ingestion transport.
- `lib/analytics/measurements.ts`: depth and active-time pure calculations.
- `lib/analytics/summary.ts`: server-side event aggregation and visitor-label normalization.
- `lib/analytics/posthog-query.ts`: server-only PostHog HogQL request.
- `components/analytics/AnalyticsProvider.tsx`: context, identity lifetime, and public tracking interface.
- `components/analytics/CaseProgressTracker.tsx`: case scroll/visibility measurement.
- `components/analytics/AnalyticsCard.tsx`: fetch lifecycle and responsive public card.
- `components/analytics/analytics-card.module.css`: isolated desktop/mobile styling.
- `app/api/analytics/summary/route.ts`: validated branch query endpoint.

---

### Task 1: Analytics Identity, Event Contracts, and Transport

**Files:**
- Create: `lib/analytics/types.ts`
- Create: `lib/analytics/identity.ts`
- Create: `lib/analytics/client.ts`
- Test: `tests/unit/analytics-identity.test.ts`
- Test: `tests/unit/analytics-client.test.ts`

**Interfaces:**
- Produces: `normalizeBranchId(pathname, storedBranch?)`, `getOrCreateVisitorId(storage, crypto)`, `createSessionId(crypto)`, `sendAnalyticsEvent(config, event, transport?)`.
- Produces event names `portfolio_session_started`, `portfolio_session_progress`, `portfolio_project_clicked`, `portfolio_case_progress`, `portfolio_contact_clicked`, `portfolio_session_ended`.

- [ ] **Step 1: Write failing identity tests**

```ts
import { describe, expect, test } from "vitest";
import { createSessionId, getOrCreateVisitorId, normalizeBranchId } from "@/lib/analytics/identity";

test.each([
  ["/", undefined, "/"],
  ["/anker-visual", undefined, "/anker-visual"],
  ["/about", "/anker-visual", "/anker-visual"],
  ["/work/brand-system", "/anker-visual", "/anker-visual"],
  ["/work/brand-system", undefined, "/"],
])("normalizes %s with stored branch %s", (pathname, stored, expected) => {
  expect(normalizeBranchId(pathname, stored)).toBe(expected);
});

test("persists one anonymous visitor but creates fresh session IDs", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
  const crypto = { randomUUID: vi.fn().mockReturnValueOnce("visitor-a").mockReturnValueOnce("session-a").mockReturnValueOnce("session-b") };
  expect(getOrCreateVisitorId(storage, crypto)).toBe("visitor-a");
  expect(getOrCreateVisitorId(storage, crypto)).toBe("visitor-a");
  expect(createSessionId(crypto)).toBe("session-a");
  expect(createSessionId(crypto)).toBe("session-b");
});
```

- [ ] **Step 2: Run the identity tests and verify RED**

Run: `npm test -- tests/unit/analytics-identity.test.ts`

Expected: FAIL because `@/lib/analytics/identity` does not exist.

- [ ] **Step 3: Implement identity and shared types**

Define `AnalyticsEvent` as a discriminated union whose common properties are `branch_id`, `visitor_id`, `session_id`, `pathname`, and `timestamp`. Implement branch validation with `^/[a-z0-9/_-]*$`; treat `/about` and `/work/*` as internal routes that inherit the stored branch or `/`.

- [ ] **Step 4: Run the identity tests and verify GREEN**

Run: `npm test -- tests/unit/analytics-identity.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing transport tests**

```ts
import { expect, test, vi } from "vitest";
import { sendAnalyticsEvent } from "@/lib/analytics/client";

test("sends the explicit event to PostHog without blocking callers", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
  sendAnalyticsEvent({ token: "phc_test", host: "https://us.i.posthog.com" }, {
    event: "portfolio_project_clicked",
    branch_id: "/anker-visual",
    visitor_id: "visitor-a",
    session_id: "session-a",
    pathname: "/",
    timestamp: "2026-08-09T10:00:00.000Z",
    project_id: "brand-system",
    project_label: "BRAND SYSTEM",
  }, { fetcher });
  await vi.waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toMatchObject({ token: "phc_test", event: "portfolio_project_clicked", properties: { distinct_id: "visitor-a", branch_id: "/anker-visual" } });
});

test("is a no-op without public configuration", () => {
  const fetcher = vi.fn();
  sendAnalyticsEvent(null, {} as never, { fetcher });
  expect(fetcher).not.toHaveBeenCalled();
});
```

- [ ] **Step 6: Run the transport tests and verify RED**

Run: `npm test -- tests/unit/analytics-client.test.ts`

Expected: FAIL because the client module does not exist.

- [ ] **Step 7: Implement the minimal ingestion client**

POST JSON to `${host}/i/v0/e/` using `keepalive: true`, `token`, the explicit event name, and event properties with `distinct_id=visitor_id`. Return immediately and swallow network rejection. Add a `sendBeacon` transport option for hidden/exiting documents; never await it from UI actions.

- [ ] **Step 8: Run Task 1 tests and commit**

Run: `npm test -- tests/unit/analytics-identity.test.ts tests/unit/analytics-client.test.ts`

Expected: PASS.

Commit only Task 1 paths with message `feat: add explicit analytics event client`.

---

### Task 2: Analytics Provider and Explicit Click Tracking

**Files:**
- Create: `components/analytics/AnalyticsProvider.tsx`
- Create: `components/analytics/useAnalytics.ts`
- Modify: `app/layout.tsx`
- Modify: `components/portfolio/PortfolioHome.tsx`
- Modify: `components/portfolio/ContactActions.tsx`
- Test: `tests/components/AnalyticsProvider.test.tsx`
- Modify: `tests/components/PortfolioHome.test.tsx`
- Modify: `tests/components/ContactActions.test.tsx`

**Interfaces:**
- Produces: `useAnalytics()` returning `{ branchId, trackProjectClick(project), trackContactClick(type), capture(event) }`.
- Consumes: Task 1 identity and event transport.

- [ ] **Step 1: Write failing provider and integration tests**

Add tests asserting that the provider emits one session-start event, clicking `Open DESIGN LOGIC` emits exactly one `portfolio_project_clicked`, hovering emits none, and a successful Email copy emits one `portfolio_contact_clicked` with `contact_type: "email"`.

```ts
expect(capture).toHaveBeenCalledWith(expect.objectContaining({ event: "portfolio_project_clicked", project_id: "business" }));
expect(capture).toHaveBeenCalledWith(expect.objectContaining({ event: "portfolio_contact_clicked", contact_type: "email" }));
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- tests/components/AnalyticsProvider.test.tsx tests/components/PortfolioHome.test.tsx tests/components/ContactActions.test.tsx`

Expected: FAIL because the provider/hook and explicit calls do not exist.

- [ ] **Step 3: Implement provider lifetime**

The provider reads public config once, obtains the stable visitor ID from `localStorage`, obtains/stores the session branch in `sessionStorage`, creates one in-memory session ID, and emits `portfolio_session_started`. It emits `portfolio_session_ended` through the beacon path on `pagehide`. Export a context with inert defaults so missing configuration cannot break descendants.

- [ ] **Step 4: Wire explicit project and contact events**

In `PortfolioHome.open`, call `trackProjectClick` before scheduling navigation. In `ContactActions`, add `type` to each action and call `trackContactClick` only after `copyText` succeeds. Keep every existing transition timer, clipboard value, and interaction unchanged.

- [ ] **Step 5: Mount the provider in the root layout**

Wrap `{children}` and `{overlay}` in one `AnalyticsProvider` so intercepted routes share the same session and branch.

- [ ] **Step 6: Run focused and regression tests**

Run: `npm test -- tests/components/AnalyticsProvider.test.tsx tests/components/PortfolioHome.test.tsx tests/components/ContactActions.test.tsx`

Expected: PASS with no React warnings.

- [ ] **Step 7: Commit Task 2**

Commit only Task 2 paths with message `feat: track portfolio entry and contact clicks`.

---

### Task 3: Per-Case Depth and Active Dwell Measurement

**Files:**
- Create: `lib/analytics/measurements.ts`
- Create: `components/analytics/CaseProgressTracker.tsx`
- Modify: `components/analytics/AnalyticsProvider.tsx`
- Modify: `components/portfolio/CaseOverlay.tsx`
- Modify: `components/portfolio/CasePage.tsx`
- Modify: `app/about/page.tsx`
- Test: `tests/unit/analytics-measurements.test.ts`
- Test: `tests/components/CaseProgressTracker.test.tsx`

**Interfaces:**
- Produces: `calculateScrollDepth({scrollTop, scrollHeight, clientHeight})`, `createActiveDwellClock(now)`, and `CaseProgressTracker`.
- Consumes: `capture` and stable identity from Task 2.

- [ ] **Step 1: Write failing pure measurement tests**

```ts
expect(calculateScrollDepth({ scrollTop: 450, scrollHeight: 1000, clientHeight: 500 })).toBe(90);
expect(calculateScrollDepth({ scrollTop: 900, scrollHeight: 1000, clientHeight: 500 })).toBe(100);

const clock = createActiveDwellClock(() => now);
clock.start(); now += 1000; clock.pause(); now += 5000; clock.start(); now += 500;
expect(clock.read()).toBe(1500);
```

- [ ] **Step 2: Run measurement tests and verify RED**

Run: `npm test -- tests/unit/analytics-measurements.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement pure calculations**

Clamp depth to integer `0..100`; a non-scrollable completed document reports `100`. The dwell clock accumulates only between `start()` and `pause()` and never double-counts repeated starts.

- [ ] **Step 4: Run measurement tests and verify GREEN**

Run: `npm test -- tests/unit/analytics-measurements.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing tracker component tests**

Verify that an overlay scroll root and a standalone window route both report `portfolio_case_progress`, depth only increases, hidden time is excluded, and route changes finalize the previous case. Use fake timers and injected `now`/capture dependencies rather than sleeping.

- [ ] **Step 6: Run tracker tests and verify RED**

Run: `npm test -- tests/components/CaseProgressTracker.test.tsx`

Expected: FAIL because the tracker and scroll-root markers do not exist.

- [ ] **Step 7: Implement the tracker and scroll-root markers**

Add `data-analytics-scroll-root` to `CaseOverlay`; mark standalone case mains with `data-analytics-case`. Resolve project IDs from `/about` and `/work/{slug}`. Sample progress on animation frames, emit when depth increases by at least 5 percentage points, emit a 15-second heartbeat while visible, and flush on `visibilitychange`, route change, and unmount. Progress events always carry the maximum depth and accumulated active dwell time, never deltas.

- [ ] **Step 8: Run Task 3 tests and commit**

Run: `npm test -- tests/unit/analytics-measurements.test.ts tests/components/CaseProgressTracker.test.tsx`

Expected: PASS.

Commit only Task 3 paths with message `feat: measure case reading depth and dwell`.

---

### Task 4: Server-Side PostHog Query and Anonymized Summary

**Files:**
- Create: `lib/analytics/summary.ts`
- Create: `lib/analytics/posthog-query.ts`
- Create: `app/api/analytics/summary/route.ts`
- Test: `tests/unit/analytics-summary.test.ts`
- Test: `tests/unit/posthog-query.test.ts`
- Test: `tests/unit/analytics-route.test.ts`

**Interfaces:**
- Produces: `buildBranchSummary(rows, branchId)`, `queryBranchEvents(config, branchId, fetcher?)`, and `GET(request)`.
- Returns `BranchAnalyticsSummary` without raw visitor IDs.

- [ ] **Step 1: Write failing aggregation tests**

Use two raw visitors and multiple sessions. Assert deterministic first-seen labels `VISITOR-01`, `VISITOR-02`; five project click buckets; three contact buckets; and per-case `max(depth)` plus `max(active_dwell_ms)` rather than sums.

```ts
expect(summary.visitors[1].label).toBe("VISITOR-02");
expect(summary.visitors[1].sessions[0].projectClicks.business).toBe(2);
expect(summary.visitors[1].sessions[0].cases["brand-system"]).toEqual({ maxDepth: 84, activeDwellMs: 42000 });
expect(JSON.stringify(summary)).not.toContain("raw-visitor-id");
```

- [ ] **Step 2: Run aggregation tests and verify RED**

Run: `npm test -- tests/unit/analytics-summary.test.ts`

Expected: FAIL because the summary module does not exist.

- [ ] **Step 3: Implement bounded aggregation**

Ignore malformed and cross-branch rows. Sort visitors by first activity and sessions newest-first. Initialize click buckets for `about`, `business`, `brand-system`, `product-launch`, `launch-event`, plus contact buckets for `email`, `phone`, `wechat` so zero values render consistently.

- [ ] **Step 4: Write failing query and Route Handler tests**

Assert that the query URL uses the server project ID, Authorization is `Bearer <personal key>`, the HogQL predicate contains only validated branch text, invalid branches return `400`, missing config returns `503`, upstream failure returns `502`, and success returns the anonymized summary with `Cache-Control: no-store`.

- [ ] **Step 5: Run query/route tests and verify RED**

Run: `npm test -- tests/unit/posthog-query.test.ts tests/unit/analytics-route.test.ts`

Expected: FAIL because the query and route modules do not exist.

- [ ] **Step 6: Implement PostHog query and route**

Convert `https://us.i.posthog.com` to `https://us.posthog.com` (and EU equivalently) for the query API. POST a bounded HogQL query to `/api/projects/{POSTHOG_PROJECT_ID}/query/`, selecting only the five event names and required properties for the requested branch, ordered by timestamp, limited to 5,000 rows. Validate branch with the same identity helper before interpolation. Keep all secret environment reads inside server-only modules.

- [ ] **Step 7: Run Task 4 tests and commit**

Run: `npm test -- tests/unit/analytics-summary.test.ts tests/unit/posthog-query.test.ts tests/unit/analytics-route.test.ts`

Expected: PASS.

Commit only Task 4 paths with message `feat: expose anonymized branch analytics summary`.

---

### Task 5: Public LIVE SIGNAL Card

**Files:**
- Create: `components/analytics/AnalyticsCard.tsx`
- Create: `components/analytics/analytics-card.module.css`
- Modify: `components/analytics/AnalyticsProvider.tsx`
- Modify: `app/layout.tsx`
- Test: `tests/components/AnalyticsCard.test.tsx`
- Modify: `tests/unit/portfolio-layout-css.test.ts`

**Interfaces:**
- Consumes: Task 2 `branchId` and Task 4 `BranchAnalyticsSummary`.
- Produces: collapsed desktop control, expanded desktop panel, and mobile bottom drawer.

- [ ] **Step 1: Write failing card behavior tests**

Cover loading, empty, unavailable, and populated states. Verify initial fetch, immediate refresh on open, 30-second polling only while expanded and visible, visitor selection, and zero requests when the visibility flag is false.

```tsx
expect(screen.getByRole("button", { name: /live signal/i })).toHaveTextContent("12");
fireEvent.click(screen.getByRole("button", { name: /live signal/i }));
expect(screen.getByText("VISITOR-02")).toBeVisible();
fireEvent.click(screen.getByText("VISITOR-02"));
expect(screen.getByText("BRAND SYSTEM · 84%" )).toBeVisible();
```

- [ ] **Step 2: Run the card tests and verify RED**

Run: `npm test -- tests/components/AnalyticsCard.test.tsx`

Expected: FAIL because the card does not exist.

- [ ] **Step 3: Implement card data lifecycle**

Fetch `/api/analytics/summary?branch=${encodeURIComponent(branchId)}` with an `AbortController`. Preserve the last successful in-memory value on later error. Refresh on expansion and every 30 seconds while expanded/document-visible; abort and stop polling on collapse/unmount.

- [ ] **Step 4: Implement semantic card content**

The collapsed button reads `LIVE SIGNAL` and total visits. The expanded view shows branch name, visitor list, session total active time, all five home project click counts, each visited case's depth/time, and all three contact counts. Do not render a home-depth row or raw IDs.

- [ ] **Step 5: Implement responsive isolated styles**

Desktop: fixed lower-right, high enough not to intersect the project selector or close control, bounded width/height, internal scrolling. Mobile: safe-area-aware collapsed control and bottom drawer with `max-height`, internal scroll, and no document scroll mutation. Include visible keyboard focus and reduced-motion behavior.

- [ ] **Step 6: Mount only when globally enabled**

Read `process.env.NEXT_PUBLIC_ANALYTICS_CARD_VISIBLE === "true"` in the server root layout and pass `cardVisible` into the provider. If false or absent, do not render card markup and do not request summary data.

- [ ] **Step 7: Run Task 5 tests and commit**

Run: `npm test -- tests/components/AnalyticsCard.test.tsx tests/unit/portfolio-layout-css.test.ts`

Expected: PASS with no accessibility or React warnings.

Commit only Task 5 paths with message `feat: add public live signal analytics card`.

---

### Task 6: Configuration Documentation and Full Verification

**Files:**
- Create: `.env.example`
- Modify: `design-qa.md`
- Modify: `tests/e2e/portfolio.spec.ts`

**Interfaces:**
- Documents the five Netlify variables and end-to-end verification procedure.

- [ ] **Step 1: Write failing browser tests**

Intercept PostHog ingestion and the summary endpoint. Verify one event per project activation, no event on hover, case progress after scrolling, all contact types, current branch in the summary request, card desktop/mobile viewport containment, and uninterrupted transitions when both endpoints fail.

- [ ] **Step 2: Run the new browser tests and verify RED**

Run: `npm run test:e2e -- tests/e2e/portfolio.spec.ts`

Expected: the new analytics scenarios fail before final integration/configuration is complete.

- [ ] **Step 3: Add exact environment documentation**

Document:

```dotenv
NEXT_PUBLIC_POSTHOG_TOKEN=phc_project_token
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_PERSONAL_API_KEY=phx_server_only_personal_key
POSTHOG_PROJECT_ID=12345
NEXT_PUBLIC_ANALYTICS_CARD_VISIBLE=true
```

State that changing visibility requires a Netlify redeploy and that the Personal API Key must never use the `NEXT_PUBLIC_` prefix.

- [ ] **Step 4: Run all automated verification**

Run: `npm test`

Run: `npm run lint`

Run: `npm run build`

Run: `npm run test:e2e -- tests/e2e/portfolio.spec.ts`

Expected: all commands exit `0`, with no hydration, console, or accessibility errors.

- [ ] **Step 5: Perform responsive browser verification**

Verify at 1920×1080, 1440×900, 390×844, and 320×568. Check collapsed/expanded card position, mobile safe area, internal card scrolling, project controls, case close control, and analytics-off rendering.

- [ ] **Step 6: Record evidence and commit**

Append the commands, viewport results, PostHog-off failure check, and remaining external requirement (real PostHog credentials) to `design-qa.md`.

Commit only Task 6 paths with message `test: verify portfolio visitor analytics`.

---

## External Setup After Code Verification

1. Create one free PostHog Cloud project.
2. Copy the Project Token, Cloud ingestion Host, Project ID, and a read-only Personal API Key into Netlify environment variables.
3. Set `NEXT_PUBLIC_ANALYTICS_CARD_VISIBLE=true` and redeploy.
4. Open one job-specific branch, click a project, scroll its case, and verify the `LIVE SIGNAL` card shows the same branch only.
5. Change the visibility variable to `false`, redeploy, and verify that no card markup or summary request exists.
