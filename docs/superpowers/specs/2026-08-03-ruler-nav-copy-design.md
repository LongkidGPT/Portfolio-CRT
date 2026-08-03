# Ruler scale, navigation selection, and preview copy

**Date:** 2026-08-03  
**Scope:** Desktop chrome and home preview copy only. Existing R4 portrait mapping, selector behavior, Contact actions, transitions, case pages, and mobile layout remain unchanged.

## Goal

Refine the desktop home composition and header navigation to match the approved reference behavior, while establishing a clear handoff format for the five hover-copy groups.

## Desktop rulers

- Scale each complete ruler group to `130%` of its current rendered size.
- Scaling applies uniformly to horizontal line lengths, vertical gaps, and stroke thickness so the existing proportions remain unchanged.
- Use the top outer corner as each ruler's transform origin: top-left for the left ruler and top-right for the right ruler.
- Move both ruler groups so their visible top edge aligns with the visible top edge of the centre preview-copy title.
- Preserve the existing neutral state of nine equal short lines and all five project-index profiles.
- Apply this refinement only above the existing desktop breakpoint. Mobile ruler geometry remains unchanged.

## WORK / ABOUT selection

- The navigation contains two actual links: `WORK @` links to `/`, and `ABOUT` links to `/about`.
- Selection is derived from the current pathname rather than stored separately.
- `/about` selects ABOUT: WORK uses the muted style and ABOUT renders `→ ABOUT` in the selected style.
- `/`, every `/work/*` route, and project overlays select WORK: WORK renders `→ WORK @` in the selected style and ABOUT uses the muted style.
- Selection updates during client-side overlay navigation and browser back/close transitions without a flash of the wrong arrow.
- The selected link exposes `aria-current="page"`; the unselected link does not.
- Typography, header grid position, and existing transition visibility remain unchanged.

## Five preview-copy groups

Each button uses exactly three editable fields already present in the project data:

- `title`: primary project title.
- `year`: year, date range, or project phase.
- `summary`: short description shown below the year.

Kid can provide final copy using this structure:

```text
ABOUT ME
标题：
时间：
描述：

BUSINESS
标题：
时间：
描述：

BRAND SYSTEM
标题：
时间：
描述：

PRODUCT LAUNCH
标题：
时间：
描述：

LAUNCH EVENT
标题：
时间：
描述：
```

Content is rendered with the exact supplied capitalization. Responsive wrapping remains automatic. No authored line breaks are added unless Kid explicitly marks a deliberate `[换行]`. Recommended limits are approximately 26 English characters for the title, one line for the year, and 45–90 English characters for the description.

This cycle defines the handoff but does not replace the current placeholder copy; replacement happens after Kid supplies the final five groups.

## Acceptance criteria

1. At desktop sizes, both ruler groups are visibly 30% larger than the current implementation and their top edges align with the preview title top edge.
2. Neutral and all five hover ruler patterns still operate correctly.
3. Mobile ruler size and position are unchanged.
4. On `/`, WORK displays the arrow and ABOUT is muted.
5. On `/about`, ABOUT displays the arrow and WORK is muted.
6. On `/work/business` and the other case routes, WORK displays the arrow.
7. Navigation selection remains correct after opening and closing overlays.
8. The current preview-copy animation and project data continue to render without behavioral regression.

## Verification

- Component tests for WORK/ABOUT pathname selection and `aria-current`.
- Existing unit tests for neutral and indexed ruler profiles remain green.
- Browser screenshots at `1920×1080` and `2048×852` confirm ruler scale and top alignment.
- Browser navigation checks cover `/`, `/about`, a `/work/*` route, and overlay return.
- Full Vitest, ESLint, production build, and desktop Playwright suites remain green.
