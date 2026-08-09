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
