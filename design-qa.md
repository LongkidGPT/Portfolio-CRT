# ABOUT desktop design QA

- Source visual truth: `/Users/jade/Desktop/About页面.png` (5760 × 6786)
- Supplied implementation assets: `/Users/jade/Desktop/about/about ground.png`, `CRT.png`, `contact.png`
- Implementation: `http://127.0.0.1:4178/about`
- Browser-rendered screenshot: `/private/tmp/about-editable-verified.png` (1440 × 1769)
- Large-viewport verification: `/private/tmp/about-desktop-1920-fixed.png` (1920 × 1769)
- No-rule verification: `/private/tmp/about-desktop-no-crt-line.png` (1920 × 1769)
- Top-and-rule verification: `/private/tmp/about-desktop-top-rule-fixed.png` (1920 × 1697)
- Normalized implementation content: `/private/tmp/about-editable-verified-crop.png` (1440 × 1697)
- Normalized source: `/private/tmp/about-reference.png` (1440 × 1697)
- Full-view comparison: `/private/tmp/about-editable-verified-comparison.png` (2880 × 1697)
- CSS viewport: 1440 × 1000; device density: 1×; state: desktop/default 2014 marker

## Findings and comparison history

- [P1 fixed] The first implementation rasterized the complete ABOUT artwork, preventing role-specific copy edits. It was replaced with separate background, editable HTML copy, transparent CRT imagery, semantic experience rows, interactive timeline, and the supplied contact image.
- [P2 fixed] The first editable pass placed the hero content too high and caused the Chinese name to wrap. Hero percentage coordinates, copy width, optical weight, and text wrapping were recalibrated against the source.
- [P2 fixed] The experience rows and timeline were vertically low. Desktop row padding, timeline gap, and visible timeline width were adjusted to the measured source rhythm.
- [P1 fixed] At viewports wider than 1440 px, the gradient background stopped at the content canvas. The page background now fills the full viewport while the 1440 px composition remains centered.
- [P1 fixed] The CRT portrait and career rule now share one baseline. At 1920 px the measured bottoms are 865.44 px and 865.42 px (0.02 px difference).
- [P1 fixed] Timeline year labels now reserve a 1.5 em line box. The 2014 label ends at 1424.45 px inside a timeline ending at 1426.42 px, so no glyph is clipped.
- [P2 fixed] The career-heading rule now runs from the title to the portrait edge only; measured line right and portrait left are both 872.16 px at the 1920 px viewport.
- [P1 fixed] The standalone ABOUT route no longer adds a 72 px top spacer. The gradient background begins at viewport y = 0 behind the navigation.

## Required fidelity surfaces

- Fonts and typography: editable HTML; hierarchy, line height, weight, and wrapping checked against the normalized source.
- Spacing and layout rhythm: hero, portrait, career rows, timeline, and contact panel use source-derived percentage coordinates inside the 5760:6786 frame.
- Colors and visual tokens: supplied background image preserves the source gradient; foreground and ruler colors match the existing portfolio tokens.
- Image quality and asset fidelity: supplied full-resolution background, transparent CRT, and contact assets are used directly; the complete static ABOUT artwork is not referenced.
- Copy and content: desktop hero copy and every experience item remain editable in React.

Focused crops were not required because all important desktop regions remain legible in the 2880 px combined comparison.

## Functional review

- Hover `2021–2023 Linsy` → active year `2021.5`: passed.
- Drag/keyboard ruler interaction → matching experience selection: passed.
- Mobile HTML layout remains separate below 768 px: passed.
- Browser console/runtime errors: none.
- Unit/component suite: 123/123 passed.
- Production build: passed.

The small circular `N` badge is the Next.js development indicator and is absent from production output.

Final result: passed.

## ABOUT copy and PROJECT OVERVIEW R4 refresh — 2026-08-11

- ABOUT desktop/mobile introduction remains editable HTML text and now uses the supplied 10+ years visual-design and brand-marketing profile.
- Latest desktop overview artwork: `KV首屏/子页面/project overview.png` (5760 × 8472), served as `/kv/cases/project-overview-r4.png`.
- Latest mobile overview artwork: `KV首屏/子页面/手机端/project overview MOB.png` (4560 × 10790), served as `/kv/cases/project-overview-mobile-r4.png`.
- New revisioned URLs prevent stale browser and Netlify Image CDN responses from showing earlier artwork.
- All four transparent links were checked against the visible R4 blue-button pixel bounds for desktop and mobile; their positions are unchanged from R3.
- Link mapping remains: 01 → `/work/business`; 02 → `/work/brand-system`; 03 → `/work/product-launch`; 04 → `/work/launch-event`.
- Unit/component suite: 197/197 passed.
- ESLint: 0 errors; one pre-existing unused `_side` warning.
- Production build: passed.

## ABOUT experience and PRODUCT LAUNCH R2 refresh — 2026-08-11

- Corrected the 2018–2021 company name from `熠思堡创意 Extend` to `熠思霆创意 Extend` in both responsive ABOUT layouts.
- Latest desktop PRODUCT LAUNCH artwork: `KV首屏/子页面/PRODUCT LAUNCH.png` (2375 × 32768), served as `/kv/cases/product-launch-r2.png`.
- Latest mobile PRODUCT LAUNCH artwork: `KV首屏/子页面/手机端/PRODUCT LAUNCH MOB.png` (1887 × 32768), served as `/kv/cases/product-launch-mobile-r2.png`.
- Revisioned URLs prevent stale browser and Netlify Image CDN responses from showing the previous artwork.
- Unit/component suite: 197/197 passed.
- ESLint: 0 errors; one pre-existing unused `_side` warning.
- Production build: passed.

## ABOUT introduction typography and mobile spacing — 2026-08-11

- Desktop introduction typography is fixed at 14px with a 1.9 line height.
- Mobile introduction uses the supplied concise role-focused copy.
- Mobile hero bottom padding is 51px, matching the 51px gap between the work-experience list and the contact artwork.
- Unit/component suite: 198/198 passed.
- Production build: passed.

## PROJECT OVERVIEW case-link hotspots QA — 2026-08-10

- Updated desktop source: `KV首屏/子页面/project overview.png` (5760 × 8472), served as `/kv/cases/project-overview-r2.png`.
- Updated mobile source: `KV首屏/子页面/手机端/project overview MOB.png` (4560 × 10790), served as `/kv/cases/project-overview-mobile-r2.png`.
- Desktop comparison: `/private/tmp/project-overview-desktop-comparison.png`.
- Mobile comparison: `/private/tmp/project-overview-mobile-comparison.png`.
- The supplied raster artwork remains visually unchanged. Four transparent semantic links are positioned over the blue action buttons only.
- Link mapping: 01 → `/work/business`; 02 → `/work/brand-system`; 03 → `/work/product-launch`; 04 → `/work/launch-event`.
- Desktop hit targets align with the visible blue buttons. Mobile hit targets expand vertically to approximately 41 px at a 390 px viewport without changing the artwork.
- Browser navigation check: selecting the 01 button opened `/work/business`.
- Browser console/runtime errors: none.
- Unit/component suite: 197/197 passed.
- Production build: passed.

Final result: passed.

## Responsive PROJECT OVERVIEW entry QA — 2026-08-10

- Source desktop artwork: `KV首屏/子页面/project overview.png` (5760 × 8270).
- Source mobile artwork: `KV首屏/子页面/手机端/project overview MOB.png` (4560 × 8270).
- Default homepage state retains the editable personal ABOUT ME copy.
- Selecting the first project swaps desktop copy to PROJECT OVERVIEW and mobile copy to `项目总览 / ANKER INNOVATIONS / IFA 2025 · 全球品牌升级`.
- First project card routes to `/work/about`; header ABOUT ME continues to route to the independent `/about` profile page.
- Responsive case page maps the desktop PNG to the fallback image and the supplied mobile PNG to the `(max-width: 767px)` picture source.
- Browser route verification: `/work/about` loaded both mappings with no console errors.
- Unit/component suite: 196/196 passed before final semantic label adjustment; rerun recorded in the delivery verification.

Final result: passed.

## Desktop PROJECT OVERVIEW hover-copy QA — 2026-08-10

- Source visual truth: `/var/folders/w3/86hm5rwn3ll4gmnz__7mbh240000gn/T/TemporaryItems/NSIRD_screencaptureui_kiIfFL/截屏2026-08-10 14.15.33.png` (452 × 452).
- Implementation: `http://127.0.0.1:4178/`.
- Browser-rendered full view: `/private/tmp/overview-hover-1440x900-final.png` (1440 × 900).
- Focused implementation crop: `/private/tmp/overview-hover-region-final.png` (452 × 452 CSS crop at 1× density).
- Focused side-by-side comparison: `/private/tmp/overview-design-comparison.png`.
- Viewport: 1440 × 900; state: desktop, first project card hovered.

### Findings and comparison history

- [P2 fixed] The first pass inherited the standard 368 px preview width, forcing `IFA 2025 · 全球品牌升级` onto two visual lines and allowing the text to intersect the CRT edge. The overview-only state now uses a 452 px maximum width and shifts 30 px left; the requested second layer remains two lines and clears the portrait.
- Default/no-hover state still renders the original ABOUT ME copy. Pointer leave restores it immediately.
- Mobile preview content and the other four project previews are unchanged.

### Required fidelity surfaces

- Fonts and typography: existing portfolio mono font, weights, reel animation, and responsive type scale are preserved; the requested hierarchy maps to eyebrow, two-line headline, subhead, and four-line body.
- Spacing and layout rhythm: divider and vertical gaps reuse the established preview system; only the overview hover state receives the wider/left-adjusted container needed by the new copy.
- Colors and visual tokens: existing paper, ink, and muted portfolio tokens remain unchanged.
- Image quality and asset fidelity: no raster asset or CRT frame was altered in this change.
- Copy and content: all four supplied layers are present, including the intended headline line break and complete project description.

### Functional review

- Default state → ABOUT ME copy: passed.
- Hover first card → PROJECT OVERVIEW copy and reel transition: passed.
- Pointer leave → ABOUT ME copy restored: passed.
- Browser console errors: none.
- Unit/component suite: 193/193 passed.
- Production build: passed.

Final result: passed.

## Mobile ABOUT reconstruction QA — 2026-08-08

- Source visual truth: `KV首屏/手机端/mob refer.png` (585 × 1482, normalized to 390 × 988 CSS px).
- Supplied contact artwork: `KV首屏/手机端/mob contact.png` (1256 × 932), rendered directly at 316 × 234.47 px.
- Browser viewport: 390 × 988.
- Implementation capture: `/private/tmp/about-mobile-rebuilt-390-v2.png`.
- Normalized reference: `/private/tmp/mob-reference-390.png`.
- Side-by-side comparison: `/private/tmp/about-mobile-comparison.png`.
- Mobile content inset is 37 px; hero is 340 px tall; five experience rows are 64 px each; contact artwork begins at y = 712 px with a 51 px preceding gap.
- Hero copy is shared by desktop and mobile through the editable `ABOUT_HERO_COPY` data object; the portrait and supplied contact panel remain separate image assets.
- Timeline/ruler remains desktop-only. Mobile experience entries use the reference's two-column year/details composition.

Final result: passed.

## Mobile project-card replacement QA — 2026-08-08

- Source assets: `KV首屏/手机端/WHITE/*.png` for default state and `KV首屏/手机端/BLACK/*.png` for active state.
- Browser viewport: 390 × 844.
- Implementation capture: `/private/tmp/mobile-cards-updated-390.png`.
- All five default and active card images load at the supplied 1378 × 342 natural size.
- Default state displays WHITE artwork; click activation switches default opacity to 0 and BLACK artwork opacity to 1.
- Existing carousel geometry, controls, project order, and mobile frame mapping remain unchanged.

Final result: passed.

## Desktop case-study replacement QA — 2026-08-08

- Source assets: `KV首屏/子页面/DESIGN LOGIC.png`, `BRAND SYSTEM.png`, `PRODUCT LAUNCH.png`, `LAUNCH EVENT.png`.
- Browser viewport: 1440 × 900; desktop/default state.
- Implementation captures: `/private/tmp/business-desktop-replaced.png`, `/private/tmp/brand-system-desktop-replaced.png`, `/private/tmp/product-launch-desktop-replaced.png`, `/private/tmp/launch-event-desktop-replaced.png`.
- DESIGN LOGIC: loaded `/kv/cases/design-logic.png` at 5760 × 22882; rendered width 1440 px; horizontal overflow 0.
- BRAND SYSTEM: loaded `/kv/cases/brand-system.png` at 3299 × 32768; rendered width 1440 px; horizontal overflow 0.
- PRODUCT LAUNCH: loaded `/kv/cases/product-launch.png` at 2375 × 32768; rendered width 1440 px; horizontal overflow 0.
- LAUNCH EVENT: loaded `/kv/cases/launch-event.png` at 4786 × 32768; rendered width 1440 px; horizontal overflow 0.
- Mobile `<source>` mappings remain unchanged for all four projects.
- Wide desktop verification: `/private/tmp/business-1920-fullwidth.png`; at a 1920 px viewport the case artwork measures x = 0, width = 1920, right = 1920, horizontal overflow = 0.
- Home ruler verification: `/private/tmp/home-about-rulers-symmetric.png`; all five hovered project states use identical top-to-bottom width sequences on the left and right rulers, with alignment mirrored only horizontally.

Final result: passed.
