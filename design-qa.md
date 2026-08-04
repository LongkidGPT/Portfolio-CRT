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

### Pass 5 — passed

- Supplied BRAND SYSTEM artwork: `/Users/jade/Desktop/Longkid Folder/AIGC/Portflio Test N/KV首屏/BRAND SYSTEM/goal 01.jpg` (`2880 × 28394`, authored at `2×`).
- Runtime asset is an exact copy at `/kv/cases/brand-system/goal-01.jpg`; it renders as one continuous case-study image at a maximum CSS width of `1440px`, without rebuilding or reflowing its contents.
- Both the direct route and intercepted homepage overlay use `#F8FAFC`; browser-computed background was `rgb(248, 250, 252)`.
- Actual homepage click flow was verified through the unique `Open BRAND SYSTEM` control. The intercepted subpage opens at the top of the artwork and retains the existing close/return control.
- Browser evidence:
  - direct route: `/private/tmp/portfolio-brand-system-top.png`
  - intercepted route: `/private/tmp/portfolio-brand-system-overlay-top.png`
  - source/implementation comparison: `/private/tmp/qa-brand-system-top-comparison.png`
- The only intentional difference in the comparison is the app-level `CLOSE ×` control over the intercepted view; it sits outside the supplied artwork. Console contained no errors or warnings.

### Pass 6 — passed

- Supplied subpage artwork:
  - `/Users/jade/Desktop/Longkid Folder/AIGC/Portflio Test N/KV首屏/子页面/DESIGN LOGIC.jpg` (`2880 × 12170`)
  - `/Users/jade/Desktop/Longkid Folder/AIGC/Portflio Test N/KV首屏/子页面/BRAND SYSTEM.jpg` (`2880 × 28394`)
  - `/Users/jade/Desktop/Longkid Folder/AIGC/Portflio Test N/KV首屏/子页面/PRODUCT LAUNCH.png` (`2397 × 32768`)
  - `/Users/jade/Desktop/Longkid Folder/AIGC/Portflio Test N/KV首屏/子页面/LAUNCH EVENT.png` (`2880 × 19500`)
- All four artworks render unchanged as continuous case-study images. At the `1280 × 720` QA viewport and device scale `1`, each image occupies the full `1280px` content width; the browser preserves its source aspect ratio and natural dimensions.
- Source/implementation comparison evidence:
  - `/private/tmp/qa-design-logic-top-comparison.png`
  - `/private/tmp/qa-brand-system-updated-comparison.png`
  - `/private/tmp/qa-product-launch-top-comparison.png`
  - `/private/tmp/qa-launch-event-top-comparison.png`
- Browser-rendered implementation evidence:
  - `/private/tmp/portfolio-design-logic-overlay-top-final.png`
  - `/private/tmp/portfolio-brand-system-overlay-updated.png`
  - `/private/tmp/portfolio-product-launch-overlay-top.png`
  - `/private/tmp/portfolio-launch-event-overlay-top.png`
- Fonts/typography, spacing/layout rhythm, colors/tokens, image quality, and copy/content are pixel-identical to each supplied raster after width normalization. The only intentional overlay difference is the app-level `CLOSE ×` control.
- The homepage entry now exposes `DESIGN LOGIC` visually and accessibly while retaining the supplied button frame/icon and its existing state styling. Evidence: `/private/tmp/portfolio-home-design-logic.png`.
- Actual homepage click flow was exercised for all four work entries; all opened at artwork top after the transition. Closing the last case returned to the homepage and restored the `DESIGN LOGIC` entry. All overlays computed `rgb(248, 250, 252)` (`#F8FAFC`), and the console contained no errors or warnings.

### Pass 7 — passed

- [P2] The second desktop button had an interrupted bottom border.
  - User evidence: `/var/folders/w3/86hm5rwn3ll4gmnz__7mbh240000gn/T/TemporaryItems/NSIRD_screencaptureui_sfrgVG/截屏2026-08-04 01.47.42.png`.
  - Root cause: `DESIGN LOGIC` was rendered as a CSS text/background layer over the original `BUSINESS` raster. That layer covered part of the supplied border artwork, leaving a darker exposed segment below the icon.
  - Fix: removed the runtime text/background overlay and replaced it with complete `576 × 168` default and active raster assets. Both assets preserve the original icon, frame, rounded corners, transparency, colors, and state behavior.
- Revised full-view evidence: `/private/tmp/portfolio-design-logic-button-fixed-full.png` at a `1280 × 720` CSS viewport, device scale `1`.
- Revised focused evidence: `/private/tmp/portfolio-design-logic-button-fixed-crop.png`.
- Before/after normalized comparison: `/private/tmp/qa-design-logic-button-before-after.png`. The revised lower comparison shows a continuous bottom border matching both adjacent buttons.
- Fonts/typography: the label remains monospaced, with size reduced only to fit the longer name. Spacing/layout rhythm: icon and label retain the original button anchors. Colors/tokens: default gray and active white/blue states match the supplied artwork. Image quality: both states are native `576 × 168` PNGs with preserved transparency. Copy/content: the visible and accessible label remains `DESIGN LOGIC`.
- Browser inspection confirmed exactly two raster state images, no runtime label overlay, correct natural dimensions, and no console errors or warnings.

### Pass 8 — blocked

- The user-supplied `DESIGN LOGIC.jpg` was replaced from `/Users/jade/Desktop/Longkid Folder/AIGC/Portflio Test N/KV首屏/子页面/DESIGN LOGIC.jpg`.
- Source and runtime asset are both `2880 × 12170`; their SHA-256 values match exactly: `ccf72de1f18c8160b9e0bc72855066258cb388d67174a52e48d7a2ad153f7a90`.
- Source visual inspection passed, and the existing route still points to `/kv/cases/design-logic.jpg` without layout or code changes.
- Browser-rendered capture is blocked because the in-app browser denied access to the local preview during this pass. No alternate browser or workaround was used.
- Remaining validation: open the local preview and visually confirm the newly uploaded asset after browser permission is available.

### Pass 9 — passed

- ABOUT ME now uses the supplied `/KV首屏/子页面/about me.png` artwork (`2880 × 2907`) as the visual source of truth at `/kv/cases/about-me.png`.
- The static ruler embedded in the artwork is covered by a real interactive ruler on the approved `#F8FAFC` subpage surface. Its initial state matches the comp at `2014`, with a five-year visible window (`2012–2016`).
- Pointer scrubbing maps the horizontal ruler area across the full `2012–2026` career range. The red marker, visible year window, and nearby tick heights update together; browser interaction verified a pointer move changed the accessible value from `2014` to `2023`.
- Keyboard support: arrow keys move by one quarter, and Home/End jump to `2012`/`2026`. Reduced-motion users receive immediate state changes without transition animation.
- Full-page browser evidence confirms the supplied portrait, copy, experience rows, ruler, and contact panel preserve the authored spacing and proportions. Browser console showed no application error overlay.
- Verification: 100 component/unit tests passed, ESLint passed, and the production build completed successfully.

### Pass 10 — passed

- Corrected the ABOUT interaction model from free pointer mapping to a bidirectional experience/ruler relationship.
- Hovering or focusing any of the five supplied experience rows now moves the ruler to that role's date range and displays a single arrow at the left edge of the matching row.
- The ruler uses a fixed red marker with a translated monthly track beneath it. It exposes `grab`/`grabbing` cursors and only changes while the primary pointer is held; dragging left advances the years and dragging right reverses them.
- Browser drag verification moved the ruler from `2014` to `2015` and selected `2015–2018 GREY-DPI`, confirming the reverse ruler-to-row mapping.
- The supplied contact artwork is now clipped into a four-corner card, with responsive `7–12px` corner radius, and is repositioned exactly `50px` farther from the preceding timeline area.
- Verification: 102 component/unit tests passed, ESLint passed, and the production build completed successfully.

## Open questions

- None for the confirmed desktop scope. Mobile remains intentionally outside this pass.

## Implementation checklist

- [x] Rebuild five preview groups as real HTML/CSS text.
- [x] Match supplied hierarchy and wrapping without using reference PNGs.
- [x] Move the header arrow with the active route.
- [x] Enlarge and align desktop rulers while preserving mobile behavior.
- [x] Verify routes, overlay state, console, tests, lint, and production build.
- [x] Render the supplied BRAND SYSTEM case study unchanged on the approved cool-white subpage background.

## Follow-up polish

- P3: final micro-adjustments can be made after the user reviews the live desktop preview at their exact monitor size.

final result: passed
