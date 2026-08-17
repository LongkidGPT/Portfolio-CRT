# Portfolio Reading Efficiency — Design Spec

## Objective

Improve recruiter reading efficiency without changing the CRT identity, case artwork, hidden LIVE SIGNAL, or the established responsive composition.

## Scope

### 1. Key chrome contrast

- Increase contrast only for meaningful secondary navigation and identity text: `VISUAL DESIGNER` and the unselected `ABOUT ME / WORK @` item.
- Keep time and `RES` visually secondary because they function as ambient interface chrome.
- Do not enlarge these labels.
- Acceptance: meaningful secondary text reaches WCAG AA 4.5:1 against the darkest relevant point of the header background.

### 2. Case reading progress

- Add one restrained progress line to both intercepted case overlays and standalone `/work/[slug]` pages.
- Progress represents the case scroll container, including the recruiter summary and supplied artwork.
- Use the existing electric blue accent `#247ad3`; no glow, card, or extra decoration.
- Hide the indicator when the document is not scrollable.

### 3. Chapter navigation

- Reuse each project's existing `analyticsSections` labels and normalized section endpoints.
- Present a compact chapter control attached to the progress treatment rather than inserting separators into the supplied artwork.
- Selecting a chapter scrolls the current case container to the corresponding position.
- The current chapter updates from scroll position.
- Desktop: labels may remain visible when space permits.
- Mobile: keep the control compact and horizontally scrollable; do not cover the case artwork or close control.
- Accessibility: links/buttons expose readable chapter labels, current state, keyboard focus, and reduced-motion behavior.

## Explicit Non-goals

- No global six-step type-scale migration.
- No LIVE SIGNAL font or visibility changes.
- No blanket conversion of every PNG source asset.
- No lazy-loading of the above-the-fold case image as a whole.
- No CRT screen artwork overlay.
- No slicing or recomposition of supplied case-study artwork.

## Existing Optimization Validation

- Keep Netlify Image CDN responsive WebP delivery for case artwork.
- Keep existing proportional sans usage for long HTML Chinese copy.
- Add or change image loading behavior only if tests or network inspection identify a specific regression.

## Component Boundary

- Introduce a focused client component responsible only for reading progress and chapter navigation.
- The component receives project chapter data and locates the existing analytics scroll root when present, otherwise it observes `window`.
- `CaseTemplate` remains responsible for artwork and recruiter summary composition.
- Existing analytics tracking remains unchanged.

## Test Strategy

- Unit/component tests first for: hidden when not scrollable, progress calculation, active chapter, chapter jump, and accessible labels.
- Existing case template, overlay, analytics, and responsive tests must remain green.
- Run the complete test suite and production build.
- Visually verify one long desktop case and one mobile case at representative viewport sizes.

## Acceptance Criteria

1. Meaningful secondary header text is visibly clearer without changing size or terminal character.
2. A long case communicates current reading depth immediately.
3. Users can move to a named chapter without blind scrolling.
4. Progress/navigation never obscures the close/back control or case artwork.
5. Existing deep links, case hotspots, analytics, motion, and responsive layouts continue to work.
6. Production case images continue to be served as responsive WebP through Netlify Image CDN.
