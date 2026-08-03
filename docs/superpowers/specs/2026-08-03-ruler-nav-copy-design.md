# Ruler scale, navigation selection, and preview copy

**Date:** 2026-08-03  
**Scope:** Desktop chrome and home preview copy only. Existing R4 portrait mapping, selector behavior, Contact actions, transitions, case pages, and mobile layout remain unchanged.

## Goal

Refine the desktop home composition and header navigation to match the approved reference behavior, while establishing a clear handoff format for the five hover-copy groups.

## Desktop rulers

- Scale each complete ruler group to `130%` of its current rendered size.
- Scaling applies uniformly to horizontal line lengths, vertical gaps, and stroke thickness so the existing proportions remain unchanged.
- Use the top outer corner as each ruler's transform origin: top-left for the left ruler and top-right for the right ruler.
- Move both ruler groups so their visible top edge aligns with the visible top edge of the centre preview-copy block, beginning at its English eyebrow.
- Preserve the existing neutral state of nine equal short lines and all five project-index profiles.
- Apply this refinement only above the existing desktop breakpoint. Mobile ruler geometry remains unchanged.

## WORK / ABOUT selection

- Extract the top header into a shared component used by the home chrome and both intercepted and direct ABOUT pages.
- The navigation contains two actual links: `WORK @` links to `/`, and `ABOUT` links to `/about`.
- Selection is derived from the current pathname rather than stored separately.
- `/about` selects ABOUT: WORK uses the muted style and ABOUT renders `→ ABOUT` in the selected style.
- `/`, every `/work/*` route, and project overlays select WORK: WORK renders `→ WORK @` in the selected style and ABOUT uses the muted style.
- Selection updates during client-side overlay navigation and browser back/close transitions without a flash of the wrong arrow.
- The shared header remains visible above ABOUT content, matching the reference. The ABOUT overlay does not show a competing visible close control; WORK navigation and Escape both return to the portfolio.
- Work case pages retain their existing close-control presentation and do not gain the shared header in this cycle.
- The selected link exposes `aria-current="page"`; the unselected link does not.
- Typography, header grid position, and existing transition visibility remain unchanged.

## Five preview-copy groups

The five PNG files in `KV首屏/copy/` are visual specifications only. They must not be copied into the site's public assets or rendered as images. Their text, hierarchy, explicit line breaks, and spacing are recreated with semantic HTML and CSS.

The source files are approximately `736px` wide and represent a 2× desktop export. Recreate the canonical desktop block at approximately `368px` CSS width, then use restrained fluid scaling for other desktop sizes. Preserve the source hierarchy: roughly `24px` eyebrow, `32px` headline, `24×2px` divider, `18px` subhead, and `12px` explanatory body at the canonical size. Exact font metrics and vertical gaps are finalized through same-viewport screenshot comparison rather than by embedding or tracing the source PNG.

Add a dedicated `previewCopy` object to each project instead of replacing the existing `title`, `year`, and `summary` fields used by case pages and mobile metadata. The preview object supports:

- `eyebrow`: small uppercase English label.
- `headlineLines`: one or more large Chinese headline lines.
- `subheadLines`: one or more medium supporting-title lines below a short divider.
- `bodyLines`: optional smaller explanatory lines.

Each explicit line is stored as a complete semantic phrase. Image-only wraps inside a word or phrase, such as `全球新 / 品` and `中建 / 立`, are not stored as broken text; the implementation preserves their visual wrap at the approved desktop width without corrupting the underlying content.

### ABOUT ME

```text
VISUAL DESIGNER
我是KID（龙昊翔）
—
一个人类 · 资深视觉设计师
```

### BUSINESS

```text
DESIGN LOGIC
业务洞察与设计目标
—
将复杂业务问题转化为清晰
的设计方向

通过业务链路梳理、用户诉求判断、展会触点拆解与竞品
观察，建立从业务目标到视觉系统策略的判断依据。
```

### BRAND SYSTEM

```text
DESIGN GOAL 01
建立母子品牌关系，
提升子品牌认知
—
母品牌视觉符号系统构建

将品牌战略中的“光”，转译为母品牌可承载、子品牌
可继承、多触点可复用的视觉符号规则。
```

### PRODUCT LAUNCH

```text
DESIGN GOAL 02
清晰传达子品牌价值
—
ANKER SOLIX PRIME E10 全球新品上市传播与 DTC 转化设计

通过 PRIME E10 的上市传播与页面承接，帮助
ANKER SOLIX 在家庭能源安全与持续供能场景中建立
更清晰的品类角色。
```

### LAUNCH EVENT

```text
DESIGN GOAL 03
强化发布会记忆点与
传播连续性
—
IFA 全球发布会传播与内容系统

将品牌升级后的视觉系统，转化为发布会可识别、
可延展、可连续传播的内容系统。
```

The existing reel transition remains: English letters and numbers retain their character-roll behavior, while Chinese glyphs transition in place without substituting unrelated Chinese characters. The whole copy block changes directly between projects without an additional crossfade.

## Acceptance criteria

1. At desktop sizes, both ruler groups are visibly 30% larger than the current implementation and their top edges align with the preview block's English eyebrow top edge.
2. Neutral and all five hover ruler patterns still operate correctly.
3. Mobile ruler size and position are unchanged.
4. On `/`, WORK displays the arrow and ABOUT is muted.
5. On `/about`, ABOUT displays the arrow and WORK is muted.
6. On `/work/business` and the other case routes, WORK displays the arrow.
7. Navigation selection remains correct after opening and closing overlays.
8. Each hover state renders the approved five-level copy hierarchy as real selectable text, never as one of the supplied PNG files.
9. The five copy blocks match the reference images' hierarchy, explicit headline breaks, divider, paragraph grouping, and relative spacing at the desktop acceptance sizes.
10. Case pages and mobile selector metadata retain their existing `title`, `year`, and `summary` content.
11. The reel animation remains case-consistent and project changes do not add a crossfade.

## Verification

- Component tests for WORK/ABOUT pathname selection and `aria-current`.
- Data and component tests for all five `previewCopy` blocks, semantic text, and explicit line grouping.
- Existing unit tests for neutral and indexed ruler profiles remain green.
- Browser screenshots at `1920×1080` and `2048×852` confirm ruler scale, top alignment, and each copy hierarchy against its corresponding source PNG.
- Browser navigation checks cover `/`, `/about`, a `/work/*` route, and overlay return.
- Full Vitest, ESLint, production build, and desktop Playwright suites remain green.
