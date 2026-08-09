# PostHog Visitor Analytics Verification

Date: 2026-08-09

## Automated verification

- `npm test`: 36 test files passed, 175 tests passed.
- `npm run lint`: 0 errors; one pre-existing unused-parameter warning remains in `lib/portfolio/interactions.ts`.
- `npm run build`: production build passed; `/api/analytics/summary` is emitted as a dynamic server route.
- `npx playwright test --config=playwright.analytics.config.ts`: desktop and mobile analytics flows passed (2/2).

## Analytics E2E coverage

- Public `LIVE SIGNAL` launcher and summary render from the branch API.
- `VISITOR-02` labels and per-case maximum depth render without exposing raw visitor IDs.
- The card stays inside desktop and mobile viewports.
- Clicking `DESIGN LOGIC` emits exactly one `portfolio_project_clicked` event with the stable `/` branch ID.
- Desktop case scrolling emits `portfolio_case_progress`.

## External setup still required

The local suite intercepts PostHog network traffic. Real production ingestion and query results require the five values documented in `.env.example` to be configured in Netlify, followed by a rebuild/deploy.

## Existing suite note

The older `tests/e2e/portfolio.spec.ts` contains assertions for retired R4 frame numbers, former case headings, and older overlay behavior. Those failures are unrelated to this analytics feature and were not rewritten because the corresponding page changes are user-owned work already in progress.
