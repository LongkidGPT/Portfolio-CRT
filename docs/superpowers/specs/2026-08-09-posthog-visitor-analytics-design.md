# PostHog Visitor Analytics Design

**Date:** 2026-08-09

## 1. Objective

Add anonymous visitor analytics to Portfolio 2.0 so Kid can evaluate how each job-specific portfolio branch performs. The system must record home-page project-entry clicks, per-case-page reading depth and active dwell time, and contact-action clicks. A public analytics card presents only the current branch's anonymized records.

## 2. Scope

### Included

- PostHog Cloud as the single analytics data source.
- Explicit custom events; PostHog autocapture and session recording remain disabled.
- Automatic branch identification from the current URL pathname.
- Stable anonymous visitor identity per browser and a new session identity per visit.
- Five home project-entry click counts.
- Per-case-page maximum scroll depth and active dwell time.
- Email, phone, and WeChat click counts.
- A public analytics card fixed to the lower-right on desktop and shown as a bottom drawer on mobile.
- Global card visibility controlled by a Netlify environment variable.
- A Netlify Function that queries PostHog and returns a branch-scoped, anonymized response.

### Excluded

- Names, email addresses, IP addresses in the UI, device fingerprints, or typed content.
- Home-page scroll-depth reporting.
- Cross-branch aggregation inside the public card.
- A visitor-accessible visibility toggle.
- A second analytics database.

## 3. Architecture

The browser sends explicit events to PostHog using the public Project Token and Cloud Host. A Netlify Function holds the Personal API Key and Project ID, queries PostHog, filters results to the current branch, normalizes visitor labels, and returns only the fields required by the analytics card.

The public client never receives the Personal API Key. Analytics failures are isolated from portfolio navigation, transitions, media, and contact actions.

### Configuration

- `NEXT_PUBLIC_POSTHOG_TOKEN`: public PostHog Project Token used to send events.
- `NEXT_PUBLIC_POSTHOG_HOST`: PostHog Cloud ingestion host.
- `POSTHOG_PERSONAL_API_KEY`: server-only key used by the Netlify Function.
- `POSTHOG_PROJECT_ID`: server-only PostHog project identifier.
- `NEXT_PUBLIC_ANALYTICS_CARD_VISIBLE`: build-time `true` or `false` switch controlling whether the card exists in the public UI.

Changing `NEXT_PUBLIC_ANALYTICS_CARD_VISIBLE` requires a Netlify rebuild/deployment. Visitors cannot change it from the page.

## 4. Identity and Branch Model

### Branch ID

The normalized portfolio-entry pathname identifies the job-specific portfolio branch. The root portfolio uses `/`; each tailored application uses its own path, such as `/anker-visual`. Query strings do not alter the branch ID.

The branch ID is resolved when the visitor enters the portfolio and remains fixed for that session. Internal routes such as `/work/design-logic` are case-page paths inside the active branch and must not replace the branch ID. All events contain both the stable `branch_id` and the current `pathname`. The card requests and displays data for its active `branch_id` only.

### Visitor ID

The browser creates a random anonymous visitor ID on first use and persists it locally. Returning from the same browser retains the same identity. The public card converts identities into branch-local labels such as `VISITOR-01` and `VISITOR-02`; raw IDs are never rendered.

### Session ID

A new random session ID is created for every site entry. A returning browser may therefore have multiple sessions under the same anonymous visitor.

## 5. Event Model

Every event includes:

- `branch_id`
- `visitor_id`
- `session_id`
- `pathname`
- event timestamp

### `portfolio_session_started`

Sent once when a portfolio session begins.

### `portfolio_session_progress`

Sent every 15 seconds while the portfolio is in the foreground and when the document becomes hidden. `active_dwell_ms` is the session's accumulated foreground-only time and is treated as a maximum, never as a delta.

### `portfolio_project_clicked`

Sent when one of the five home project buttons opens its destination. Properties include `project_id` and `project_label`. Each deliberate activation produces one event; hover and focus do not count.

### `portfolio_case_progress`

Sent for a case page when meaningful progress changes and when the document becomes hidden. Properties include:

- `project_id`
- `max_scroll_depth`: integer from `0` to `100`
- `active_dwell_ms`: foreground-only accumulated time

The highest reported depth and greatest reported active dwell time for a session/page are authoritative. Repeated progress events must not be added together.

### `portfolio_contact_clicked`

Sent for Email, Phone, or WeChat. Properties include `contact_type` with one of `email`, `phone`, or `wechat`.

### `portfolio_session_ended`

Best-effort event sent when the page becomes hidden or exits. Final state is also recoverable from the latest case-progress event so an absent end event does not invalidate the visit.

## 6. Measurement Rules

- Home-page scroll depth is not displayed or required.
- Home project clicks are aggregated separately for all five buttons.
- Case-page depth is the maximum normalized document scroll percentage reached during the session.
- Case-page and total session dwell time count only while the document is visible; time spent in a background tab is excluded.
- Reopening the same case in one session increments its home entry click count but preserves the case's maximum depth and accumulated active dwell time.
- Contact clicks are counted separately by contact type.

## 7. Analytics Query Function

The Netlify Function accepts only a normalized `branch` query parameter. It queries PostHog server-side and returns a bounded result containing:

- branch ID
- total visits
- generated `VISITOR-XX` labels
- per-visitor session summaries
- five home project click counts
- per-case maximum depth and active dwell time
- three contact click counts
- most recent activity timestamp

The response contains no raw PostHog distinct IDs, Personal API Key, IP address, or unrelated branch data. Requests with invalid branch paths return `400`. Missing server configuration returns `503`. PostHog failures return a generic `502` response without credential details.

## 8. Analytics Card

### Collapsed State

- Fixed to the lower-right on desktop.
- Compact `LIVE SIGNAL` control showing the current branch's total visits.
- Positioned so it does not cover home project controls or case-page close controls.

### Expanded Desktop State

- Shows the current branch name and total visits.
- Lists anonymized visitors as `VISITOR-01`, `VISITOR-02`, and so on.
- Selecting a visitor reveals its session records.
- Each session shows total active time, five home project click counts, per-case depth and dwell time, and Email/Phone/WeChat counts.

### Mobile State

- The collapsed control remains reachable above the safe-area inset.
- Expansion uses a bottom drawer sized for the narrow viewport.
- The drawer scrolls internally and does not change the portfolio page's scroll position.

### Refresh and States

- Fetch once when the card becomes visible.
- Refresh immediately when the card opens.
- Refresh every 30 seconds while expanded.
- Stop polling while collapsed or while the document is hidden.
- Render explicit loading, empty, unconfigured, and temporarily unavailable states.
- Analytics-card requests and errors never block or replace portfolio content.

## 9. Visibility

When `NEXT_PUBLIC_ANALYTICS_CARD_VISIBLE=true`, every visitor can see and open the card. When it is `false` or absent, no card markup or data request is produced. Only Kid controls the environment variable in Netlify; there is no page-level visibility switch.

## 10. Privacy and Security

- Use only the public Project Token in browser code.
- Keep the Personal API Key and Project ID server-side.
- Disable PostHog autocapture and session recording.
- Send only the explicit events in this specification.
- Return only anonymized, branch-filtered aggregates to the public card.
- Do not expose raw visitor IDs in HTML, API responses, or card labels.

## 11. Failure Handling

- If the public PostHog configuration is absent, event capture becomes a no-op.
- If PostHog is blocked by the browser, portfolio behavior remains unchanged.
- If the query Function fails, the card shows a temporary unavailable state and preserves its last successful in-memory result until refresh.
- Navigation, route transitions, click actions, clipboard actions, and contact links must not wait for analytics calls.

## 12. Testing and Acceptance

### Unit Tests

- Normalize root and job-specific branch paths.
- Persist stable anonymous visitor identity and create fresh session IDs.
- Calculate active foreground dwell time.
- Calculate per-case maximum scroll depth.
- Build explicit event payloads without prohibited data.
- Normalize API results into deterministic `VISITOR-XX` labels.
- Aggregate five project clicks, three contact clicks, and per-case depth/time.

### Component Tests

- The card renders only when the visibility variable is `true`.
- Collapsed, expanded, loading, empty, unavailable, and populated states render correctly.
- Selecting a visitor reveals the correct per-session measurements.
- Opening and closing the card does not trigger portfolio analytics events.

### Browser Tests

- Each home project activation produces one click event.
- Hovering a project produces no click event.
- Case-page scrolling reports the correct maximum depth.
- Background-tab time is excluded from active dwell time.
- Email, Phone, and WeChat each produce the correct event.
- The card requests only the current branch.
- Analytics failures do not interrupt home-to-case or case-to-home transitions.
- Desktop and mobile card layouts remain within the viewport and do not cover primary controls.

### Acceptance Criteria

- A tailored branch never displays another branch's records.
- Each visitor record is labeled only as `VISITOR-XX`.
- The home section displays click counts for exactly five project buttons and no home-depth metric.
- Every opened case can display its own maximum depth and active dwell time.
- The card can be globally published or removed using the Netlify environment variable.
- The site remains fully usable when PostHog or the analytics query Function is unavailable.
