# Design QA — desktop homepage refinements

## Comparison target

- Source visual truth:
  - `/Users/jade/Desktop/Longkid Folder/AIGC/Portflio Test N/KV首屏/copy/ABOUT ME.png`
  - `/Users/jade/Desktop/Longkid Folder/AIGC/Portflio Test N/KV首屏/copy/BUSINESS.png`
  - `/Users/jade/Desktop/Longkid Folder/AIGC/Portflio Test N/KV首屏/copy/BRAND SYSTEM.png`
  - `/Users/jade/Desktop/Longkid Folder/AIGC/Portflio Test N/KV首屏/copy/PRODUCT LAUNCH.png`
  - `/Users/jade/Desktop/Longkid Folder/AIGC/Portflio Test N/KV首屏/copy/LAUNCH EVENT.png`
- Browser-rendered implementation:
  - `/private/tmp/portfolio-home-about-after-1920x806.png`
  - `/private/tmp/portfolio-business-hover-1280x720.png`
  - `/private/tmp/portfolio-about-route-1280x720.png`
  - `/private/tmp/portfolio-copy-shift-up-1280x720.png`
  - `/private/tmp/portfolio-neutral-about-down40.png`
- Full-view evidence: `/private/tmp/portfolio-home-full-stable-1920x1080.png`
- Focused comparison evidence:
  - before: `/private/tmp/qa-about-before-normalized.png`
  - after: `/private/tmp/qa-about-after-normalized.png`
- Local implementation: `http://127.0.0.1:4178/`

## Normalization

- Primary desktop CSS viewport: `1920 × 1080`, device scale factor `1`.
- Browser viewport capture: `1920 × 806` visible region; full-page evidence records the full `1920 × 1080` layout.
- Source ABOUT pixels: `736 × 534` at `2×`; normalized to `368 × 266` for comparison.
- Implementation focused crop: `368 × 266` CSS pixels at `1×`.
- State: desktop home, ABOUT preview selected, neutral button/ruler state. Additional direct and intercepted ABOUT route states were checked at `1280 × 720`.

## Required fidelity surfaces

- Fonts and typography: mono hierarchy matches the supplied artwork after normalizing the source from `2×`; headline, eyebrow, subhead, and body use consistent weights and line heights. English stays uppercase and Chinese content does not inherit artificial semantic breaks.
- Spacing and layout rhythm: ruler tops and preview eyebrow share the same `40.5%` anchor. Desktop rulers scale uniformly to `130%`; mobile overrides remain unchanged. Focused comparison confirms headline, divider, and subhead baselines align with the source hierarchy.
- Colors and tokens: copy and ruler foregrounds use the existing `--ink` / `--muted` system; no new palette drift was introduced.
- Image quality and asset fidelity: supplied R4 full-frame video and supplied raster button/contact assets remain unchanged; copy reference PNGs are not used at runtime.
- Copy and content: all five approved content groups are rendered as semantic text. Unit tests assert the approved hierarchy and prevent accidental `/copy/` raster use.

## Findings and comparison history

### Pass 1 — blocked

- [P2] Preview spacing and eyebrow scale drifted from the supplied `2×` artwork.
  - Evidence: `/private/tmp/qa-about-before-normalized.png` showed the implementation eyebrow at `24px` instead of approximately `18px`, with subhead/body gaps materially larger than the source.
  - Fix: changed eyebrow maximum to `18px`, subhead gap to `32px`, body gap to `18px`, and body maximum to `13px`.
- [P2] Desktop rulers were neither enlarged nor top-aligned with the copy block.
  - Evidence: pre-fix CSS anchored rulers at `34%` with no scale while the preview began at `40.5%`.
  - Fix: anchored rulers at `40.5%`, applied `scale(1.3)`, and set side-specific top transform origins. The mobile rule explicitly resets `transform: none` at `28%`.

### Pass 2 — passed

- Post-fix evidence: `/private/tmp/qa-about-after-normalized.png` shows matching eyebrow, headline, divider, and subhead scale/rhythm after density normalization.
- Browser measurements: preview and both ruler groups begin at `y = 437.398px` in the `1920 × 1080` CSS viewport.
- Route state: `/about` renders `WORK @` unselected and `→ ABOUT` selected; home and work routes retain `→ WORK @`.
- Intercepted ABOUT overlay retains the shared header, visually hides its close control, and remains escapable.
- Console: no browser errors or warnings were recorded after navigation and overlay checks.
- Automated verification: `92` unit/component tests passed; ESLint passed; production build passed.

### Pass 3 — passed

- User-directed positional override: move only the central copy group upward by two current desktop button heights while keeping the portrait, selector, and rulers fixed.
- Implementation uses `translateY(clamp(-112px, -11vh, -92px))`, matching twice the desktop button rule `clamp(46px, 5.5vh, 56px)`.
- Browser evidence at the active desktop viewport measured a `46px` button and a `-92px` copy transform. Mobile explicitly resets the transform to `none`.
- Post-change evidence: `/private/tmp/portfolio-copy-shift-up-1280x720.png`.

### Pass 4 — passed

- User-directed position refinement: the central copy group now sits `40px` below the Pass 3 position. Browser measurement at the active desktop viewport confirms the transform changed from `-92px` to `-52px`.
- Neutral interaction behavior: leaving any project button clears its selected artwork/ruler state and restores the `ABOUT ME` copy instead of retaining the last project copy.
- Component interaction evidence covers BUSINESS pointer enter followed by pointer leave and asserts the visible heading returns to `我是KID（龙昊翔）`.
- Browser-rendered neutral evidence: `/private/tmp/portfolio-neutral-about-down40.png`; console contained no errors or warnings.

## Open questions

- None for the confirmed desktop scope. Mobile remains intentionally outside this pass.

## Implementation checklist

- [x] Rebuild five preview groups as real HTML/CSS text.
- [x] Match supplied hierarchy and wrapping without using reference PNGs.
- [x] Move the header arrow with the active route.
- [x] Enlarge and align desktop rulers while preserving mobile behavior.
- [x] Verify routes, overlay state, console, tests, lint, and production build.

## Follow-up polish

- P3: final micro-adjustments can be made after the user reviews the live desktop preview at their exact monitor size.

final result: passed
