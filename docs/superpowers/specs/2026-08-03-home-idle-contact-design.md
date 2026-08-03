# Home idle state and Contact interactions

**Date:** 2026-08-03  
**Scope:** Desktop home-page details only. Mobile layout and case-page content remain unchanged.

## Goal

Match the reference site's desktop interaction model more closely: the home page has a true neutral state when no project button is hovered, Contact icons copy their corresponding details, and pointer navigation does not leave a stale focus outline after returning from a case page.

## Interaction states

### Neutral state

- When the pointer is outside all five project buttons, every button displays its supplied white/default artwork.
- Every line in both ruler groups uses the same short neutral width, matching the reference site's idle state.
- The portrait continues to follow the free pointer interaction; the neutral button and ruler state must not prevent that behavior.
- Project copy may retain the last previewed content internally, but no button is visually marked as selected while idle.

### Project hover and keyboard focus

- Pointer hover, touch preview, or keyboard focus previews the corresponding project.
- Only the currently previewed button displays active artwork.
- Both rulers move to the position mapped to that project's index.
- On pointer leave or blur, the project button and rulers return directly to neutral state.
- Existing project-copy reel animation and fixed-frame portrait preview remain in place.

### Navigation focus

- A pointer click that opens a child page must not leave a visible outer focus outline on the button after returning home.
- Keyboard navigation keeps a visible `:focus-visible` treatment for accessibility.
- Pointer and keyboard behavior are distinguished; the solution must not globally disable browser focus outlines.

## Contact icons

Use the three supplied transparent 48×48 PNG assets from `KV首屏/contact icon/`, copied into the site's public asset tree:

- Mail icon copies `longkid@sohu.com`.
- Phone icon copies `18520224719`.
- WeChat icon copies `lkchat1980`.

Each icon is a semantic button with an accessible label. On hover or keyboard focus it may use a subtle opacity change only; the supplied artwork must not be redrawn. After a successful copy, a compact label beside the icon changes to `COPIED` for approximately 1.2 seconds and then clears. If the Clipboard API is unavailable, use a legacy copy fallback. Copy actions do not navigate, dial, open mail, or launch WeChat.

## Project-copy handoff

The five preview text groups remain data-driven. Kid can provide each group directly in chat using:

`BUTTON｜TITLE｜YEAR｜DESCRIPTION`

Line wrapping is responsive and should not be authored with manual line breaks unless a deliberate editorial break is explicitly requested.

## Acceptance criteria

1. At initial load and whenever the pointer is outside the selector, all five buttons are white/default and every line in both rulers has the same short width.
2. Hovering each button activates only that button, its correct ruler position, its corresponding copy, and its mapped portrait frame.
3. Leaving the selector restores the neutral button and ruler state without a fade between projects.
4. Opening any of the five child pages and returning does not show the stale outer button frame from the supplied screenshot.
5. Keyboard Tab focus remains visible and previews the focused project.
6. Each Contact icon copies the exact approved value and shows temporary `COPIED` feedback.
7. Existing desktop R4 full-screen rendering, project transition animation, case-page overlay, and mobile implementation do not regress.

## Verification

- Unit tests for the neutral ruler profile and project-index profiles.
- Component tests for neutral button state, hover/focus preview, pointer leave reset, and copy interactions including the fallback path.
- Browser checks at the existing desktop acceptance sizes, including initial idle, all five hover states, open/return behavior, and Clipboard feedback.
- Full existing test and production-build verification.
