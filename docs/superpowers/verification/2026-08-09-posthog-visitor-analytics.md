# PostHog Visitor Analytics Verification

Updated: 2026-08-10

## Automated verification

- `npm test`: 37 test files passed, 183 tests passed.
- `npm run lint`: 0 errors; one pre-existing unused-parameter warning remains in `lib/portfolio/interactions.ts`.
- `npm run build`: production build passed; `/api/analytics/summary` is emitted as a dynamic server route.
- `npx playwright test --config=playwright.analytics.config.ts`: desktop and mobile Live Signal flows passed (2/2).

## Analytics E2E coverage

- Public `LIVE SIGNAL` launcher and summary render from the branch API.
- `VISITOR-02` labels and per-project metrics render without exposing raw visitor, session, or case-view IDs.
- The card stays inside desktop and mobile viewports.
- Expanded header omits `BRANCH`, `/`, and `TOTAL VISITS`; the response and panel omit Contact metrics.
- Only one project accordion opens at a time and contains clicks, active dwell, completion, and ten heatmap segments.
- Clicking `DESIGN LOGIC` emits exactly one `portfolio_project_clicked` event with the stable `/` branch ID.
- Desktop case scrolling emits `portfolio_case_progress` with an anonymous `case_view_id` and ten cumulative segment dwell values.
- Legacy case events without segment data retain dwell and completion and render `NO HEATMAP DATA`.

## Production configuration

PostHog ingestion, server query credentials, project ID, host, and card visibility are configured in Netlify. Production verification after this change must confirm that a fresh visit returns a ten-value heatmap from `/api/analytics/summary?branch=%2F`.

## Existing suite note

The older `tests/e2e/portfolio.spec.ts` contains assertions for retired R4 frame numbers, former case headings, and older overlay behavior. Those failures are unrelated to this analytics feature and were not rewritten because the corresponding page changes are user-owned work already in progress.
