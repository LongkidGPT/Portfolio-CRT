# Ruler, Navigation, and Preview Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the five supplied desktop copy references as real animated text, enlarge and align the rulers, and make the WORK/ABOUT arrow follow the current route.

**Architecture:** Add a dedicated `previewCopy` model so desktop KV copy can use the approved five-level hierarchy without changing case-page or mobile metadata. Extract a shared `PortfolioHeader` whose route selection comes from `usePathname`, and implement ruler sizing as desktop-only CSS geometry. Verify source-to-render fidelity through paired reference/prototype screenshots and a blocking design-QA report.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright, in-app Browser.

## Global Constraints

- The five PNGs in `KV首屏/copy/` are references only and must never be served or rendered by the site.
- Desktop copy is semantic HTML/CSS; existing case-page `title`, `year`, and `summary` remain unchanged.
- Mobile copy layout and selector metadata remain unchanged.
- Ruler groups scale uniformly to `130%`, align to the English eyebrow top, and retain existing neutral and five hover profiles.
- `/about` selects ABOUT; `/`, `/work/*`, and project overlays select WORK.
- Existing R4 portrait frames, selector behavior, Contact copying, transitions, and direct project changes without crossfade remain unchanged.
- The build is not complete until `design-qa.md` says `final result: passed`.

---

### Task 1: Preview-copy data model and semantic renderer

**Files:**
- Modify: `lib/portfolio/projects.ts`
- Modify: `components/portfolio/ProjectPreview.tsx`
- Modify: `components/portfolio/portfolio.module.css`
- Modify: `tests/unit/projects.test.ts`
- Create: `tests/components/ProjectPreview.test.tsx`

**Interfaces:**
- Produces `PreviewCopy` with `eyebrow: string`, `headlineLines: readonly string[]`, `subheadLines: readonly string[]`, and `bodyLines: readonly string[]`.
- Extends `ProjectDefinition` with `previewCopy: PreviewCopy` while preserving existing case fields.
- `ProjectPreview` renders `[data-preview-layout="desktop"]` from `previewCopy` and `[data-preview-layout="mobile"]` from the legacy fields.

- [ ] **Step 1: Write failing registry tests for the approved content**

Add assertions that every project has the exact structured data and that existing case fields remain intact. The expected preview data is:

```ts
expect(PROJECTS.map(({ id, previewCopy }) => ({ id, previewCopy }))).toEqual([
  {
    id: "about",
    previewCopy: {
      eyebrow: "VISUAL DESIGNER",
      headlineLines: ["我是KID（龙昊翔）"],
      subheadLines: ["一个人类 · 资深视觉设计师"],
      bodyLines: [],
    },
  },
  {
    id: "business",
    previewCopy: {
      eyebrow: "DESIGN LOGIC",
      headlineLines: ["业务洞察与设计目标"],
      subheadLines: ["将复杂业务问题转化为清晰", "的设计方向"],
      bodyLines: [
        "通过业务链路梳理、用户诉求判断、展会触点拆解与竞品",
        "观察，建立从业务目标到视觉系统策略的判断依据。",
      ],
    },
  },
  {
    id: "brand-system",
    previewCopy: {
      eyebrow: "DESIGN GOAL 01",
      headlineLines: ["建立母子品牌关系，", "提升子品牌认知"],
      subheadLines: ["母品牌视觉符号系统构建"],
      bodyLines: [
        "将品牌战略中的“光”，转译为母品牌可承载、子品牌",
        "可继承、多触点可复用的视觉符号规则。",
      ],
    },
  },
  {
    id: "product-launch",
    previewCopy: {
      eyebrow: "DESIGN GOAL 02",
      headlineLines: ["清晰传达子品牌价值"],
      subheadLines: ["ANKER SOLIX PRIME E10 全球新品上市传播与 DTC 转化设计"],
      bodyLines: [
        "通过 PRIME E10 的上市传播与页面承接，帮助",
        "ANKER SOLIX 在家庭能源安全与持续供能场景中建立",
        "更清晰的品类角色。",
      ],
    },
  },
  {
    id: "launch-event",
    previewCopy: {
      eyebrow: "DESIGN GOAL 03",
      headlineLines: ["强化发布会记忆点与", "传播连续性"],
      subheadLines: ["IFA 全球发布会传播与内容系统"],
      bodyLines: [
        "将品牌升级后的视觉系统，转化为发布会可识别、",
        "可延展、可连续传播的内容系统。",
      ],
    },
  },
]);
expect(getProjectById("product-launch").title).toBe("SOLIX Product Launch");
```

- [ ] **Step 2: Write failing component tests for hierarchy and real text**

Render BUSINESS and assert:

```tsx
const { container } = render(<ProjectPreview project={getProjectById("business")} />);
expect(screen.getByText("DESIGN LOGIC")).toBeVisible();
expect(screen.getByRole("heading", { name: "业务洞察与设计目标" })).toBeVisible();
expect(screen.getByText("将复杂业务问题转化为清晰")).toBeVisible();
expect(screen.getByText("的设计方向")).toBeVisible();
expect(screen.getByText("观察，建立从业务目标到视觉系统策略的判断依据。")).toBeVisible();
expect(container.querySelector('[data-preview-divider="true"]')).toBeInTheDocument();
expect(container.querySelector('img[src*="/copy/"]')).toBeNull();
```

Render ABOUT and assert that the desktop body group is absent. Assert the mobile layout still contains `Kid Long`, `2007—Present`, and the existing summary.

- [ ] **Step 3: Run focused tests and verify RED**

Run:

```bash
npm test -- tests/unit/projects.test.ts tests/components/ProjectPreview.test.tsx
```

Expected: failures because `previewCopy`, the desktop hierarchy, divider, and split desktop/mobile layouts do not exist.

- [ ] **Step 4: Add the model and exact content**

Add:

```ts
export interface PreviewCopy {
  eyebrow: string;
  headlineLines: readonly string[];
  subheadLines: readonly string[];
  bodyLines: readonly string[];
}
```

Add `previewCopy: PreviewCopy` to `ProjectDefinition`, then add exactly the five objects asserted in Step 1. Do not edit existing `title`, `year`, `summary`, `href`, button art, or media fields.

- [ ] **Step 5: Implement the semantic desktop hierarchy**

Create a small local `ReelLines` renderer that maps each explicit line to a block span containing `ReelText`. Render:

```tsx
<div className={styles.previewDesktop} data-preview-layout="desktop">
  <p className={styles.previewEyebrow}><ReelText text={copy.eyebrow} /></p>
  <h1 className={styles.previewHeadline}><ReelLines lines={copy.headlineLines} /></h1>
  <span className={styles.previewDivider} data-preview-divider="true" aria-hidden="true" />
  <div className={styles.previewSubhead}><ReelLines lines={copy.subheadLines} /></div>
  {copy.bodyLines.length > 0 && (
    <div className={styles.previewBody}><ReelLines lines={copy.bodyLines} /></div>
  )}
</div>
```

Keep the current three-field renderer in `[data-preview-layout="mobile"]`. CSS hides the mobile version above `767px` and the desktop version at or below `767px`.

Use a canonical desktop width near `368px`, fluidly capped for smaller desktops. Implement the approved hierarchy with approximately `24px` eyebrow, `32px` headline, `24×2px` divider, `18px` subhead, and `12px` body at 1920px. Use block line elements to preserve explicit line grouping, and allow the long PRODUCT LAUNCH subhead to wrap visually without storing broken words.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run the same focused Vitest command. Expected: all registry and preview tests pass without warnings.

- [ ] **Step 7: Commit Task 1**

```bash
git add lib/portfolio/projects.ts components/portfolio/ProjectPreview.tsx components/portfolio/portfolio.module.css tests/unit/projects.test.ts tests/components/ProjectPreview.test.tsx
git commit -m "feat: rebuild desktop preview copy from references"
```

---

### Task 2: Route-driven WORK / ABOUT selection

**Files:**
- Create: `components/portfolio/PortfolioHeader.tsx`
- Modify: `components/portfolio/PortfolioChrome.tsx`
- Modify: `components/portfolio/AboutTemplate.tsx`
- Modify: `components/portfolio/CaseOverlay.tsx`
- Modify: `app/@overlay/(.)about/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `components/portfolio/portfolio.module.css`
- Create: `tests/components/PortfolioHeader.test.tsx`
- Modify: `tests/components/CaseOverlay.test.tsx`

**Interfaces:**
- Consumes `usePathname(): string` from Next navigation.
- Produces a shared `PortfolioHeader` with two real links and exactly one `aria-current="page"`: `WORK @` to `/` and `ABOUT` to `/about`.
- `CaseOverlay` gains `showCloseControl?: boolean`; `false` keeps an accessible visually-hidden close target for initial dialog focus and Escape handling without competing with the ABOUT header.

- [ ] **Step 1: Write failing route-selection tests**

Mock `usePathname` through a mutable hoisted route. Assert:

```tsx
route.pathname = "/";
const { rerender } = render(<PortfolioHeader />);
expect(screen.getByRole("link", { name: "WORK @" })).toHaveTextContent("→ WORK @");
expect(screen.getByRole("link", { name: "WORK @" })).toHaveAttribute("aria-current", "page");
expect(screen.getByRole("link", { name: "ABOUT" })).not.toHaveAttribute("aria-current");

route.pathname = "/about";
rerender(<PortfolioHeader />);
expect(screen.getByRole("link", { name: "ABOUT" })).toHaveTextContent("→ ABOUT");
expect(screen.getByRole("link", { name: "ABOUT" })).toHaveAttribute("aria-current", "page");

route.pathname = "/work/business";
rerender(<PortfolioHeader />);
expect(screen.getByRole("link", { name: "WORK @" })).toHaveAttribute("aria-current", "page");
```

Render `AboutTemplate` with pathname `/about` and assert the shared banner is present above its profile content. Render `CaseOverlay showCloseControl={false}` and assert the close button remains accessible but has the visually-hidden class.

- [ ] **Step 2: Run the component test and verify RED**

Run `npm test -- tests/components/PortfolioHeader.test.tsx tests/components/CaseOverlay.test.tsx`. Expected: failures because the shared header, moving arrow, and ABOUT close-control mode do not exist.

- [ ] **Step 3: Implement pathname-derived navigation**

Extract the identity, navigation, Contact actions, and time block from `PortfolioChrome` into `PortfolioHeader`. Use `const aboutSelected = usePathname() === "/about"`. Render both entries as `Link` elements with stable `aria-label` values. Prefix only the selected visible label with `→ `, set `aria-current="page"` only on the selected link, and use `styles.navSelected` / `styles.navUnselected` for font weight and muted color. Keep the existing grid slot, type size, line height, and vertical ordering.

Render `PortfolioHeader` at the start of `AboutTemplate`. Direct `/about` renders the template in the standalone shell without the legacy `← BACK TO WORK` control. Intercepted ABOUT renders `CaseOverlay showCloseControl={false}`; its close button uses a reusable visually-hidden class but continues to receive initial focus and handle Escape. Work overlays and direct case pages remain unchanged.

- [ ] **Step 4: Run the component test and verify GREEN**

Run the focused PortfolioHeader and CaseOverlay tests. Expected: all path and close-control states pass.

- [ ] **Step 5: Commit Task 2**

```bash
git add components/portfolio/PortfolioHeader.tsx components/portfolio/PortfolioChrome.tsx components/portfolio/AboutTemplate.tsx components/portfolio/CaseOverlay.tsx 'app/@overlay/(.)about/page.tsx' app/about/page.tsx components/portfolio/portfolio.module.css tests/components/PortfolioHeader.test.tsx tests/components/CaseOverlay.test.tsx
git commit -m "feat: move the header arrow with the active route"
```

---

### Task 3: Desktop ruler scale and top alignment

**Files:**
- Modify: `components/portfolio/portfolio.module.css`
- Create: `tests/unit/portfolio-layout-css.test.ts`

**Interfaces:**
- Desktop `.ruler` shares the preview stage's `top: 40.5%`, uses `transform: scale(1.3)`, and anchors outward from each top corner.
- Mobile media rule restores `transform: none` and retains `top: 28%`.

- [ ] **Step 1: Write a failing CSS contract test**

Read the CSS module and assert the approved declarations are present:

```ts
const css = readFileSync(resolve(process.cwd(), "components/portfolio/portfolio.module.css"), "utf8");
expect(css).toMatch(/\.ruler\s*\{[\s\S]*?top:\s*40\.5%;[\s\S]*?transform:\s*scale\(1\.3\)/);
expect(css).toMatch(/\.ruler\[data-side="left"\][\s\S]*?transform-origin:\s*top left/);
expect(css).toMatch(/\.ruler\[data-side="right"\][\s\S]*?transform-origin:\s*top right/);
expect(css).toMatch(/@media \(max-width: 767px\)[\s\S]*?\.ruler\s*\{[\s\S]*?top:\s*28%;[\s\S]*?transform:\s*none/);
```

- [ ] **Step 2: Run the CSS contract test and verify RED**

Run `npm test -- tests/unit/portfolio-layout-css.test.ts`. Expected: failure because the current desktop ruler is `top: 34%` and has no scale/origins.

- [ ] **Step 3: Implement exact desktop and mobile geometry**

Set desktop `.ruler` to `top: 40.5%` and `transform: scale(1.3)`. Set left origin to `top left` and right origin to `top right`. Add `transform: none` to the existing mobile `.ruler` override while leaving all other mobile dimensions unchanged.

- [ ] **Step 4: Run the CSS contract and existing ruler tests**

Run:

```bash
npm test -- tests/unit/portfolio-layout-css.test.ts tests/unit/interactions.test.ts
```

Expected: the CSS contract passes and all neutral/indexed width profiles remain green.

- [ ] **Step 5: Commit Task 3**

```bash
git add components/portfolio/portfolio.module.css tests/unit/portfolio-layout-css.test.ts
git commit -m "feat: enlarge and align desktop rulers"
```

---

### Task 4: Browser verification and source-to-render design QA

**Files:**
- Modify: `tests/e2e/portfolio.spec.ts`
- Create: `design-qa.md`

**Interfaces:**
- Uses existing preview `http://127.0.0.1:4178/` in the Codex in-app Browser for visual inspection.
- Uses source PNGs only as QA references, never as runtime assets.

- [ ] **Step 1: Load required verification guidance**

Read `browser:control-in-app-browser` and `product-design:design-qa` completely before browser actions. Use the in-app Browser selected by the Codex Desktop workflow.

- [ ] **Step 2: Add browser regression coverage**

Extend desktop coverage to assert:

```ts
await expect(page.getByRole("link", { name: "WORK @" })).toHaveAttribute("aria-current", "page");
await page.getByRole("link", { name: "ABOUT" }).click();
await expect(page.getByRole("link", { name: "ABOUT" })).toHaveAttribute("aria-current", "page");
```

At `1920×1080`, read the left ruler and desktop preview bounding boxes and assert their top values differ by no more than `1px`; assert the ruler computed transform is not `none`. Hover every project and assert its approved eyebrow and headline are visible.

- [ ] **Step 3: Run focused browser coverage**

Run `npm run test:e2e -- tests/e2e/portfolio.spec.ts --project=desktop` against the current project preview. Expected: all portfolio flows, route selection, ruler geometry, and five copy states pass.

- [ ] **Step 4: Capture matched visual states in the in-app Browser**

At `1920×1080`, capture five project hover states and crop the rendered desktop copy block. Capture idle and ABOUT-route header states. Repeat representative ABOUT and PRODUCT LAUNCH states at `2048×852` to verify wide-layout behavior.

- [ ] **Step 5: Build paired comparison images and run design QA**

Pair each copy-block capture beside its corresponding file from `KV首屏/copy/` at a common scale. Open the paired image before judging. Create `design-qa.md` with findings for hierarchy, text accuracy, line breaks, font size/weight, block width, spacing, divider geometry, ruler scale/alignment, and navigation arrow. Fix every P0/P1/P2 item, recapture, and repeat until the report contains:

```text
final result: passed
```

Record remaining P3 polish only as iteration notes.

- [ ] **Step 6: Run complete verification**

Run:

```bash
npm test
npm run lint
npm run build
npm run test:e2e -- --project=desktop
```

Expected: all Vitest and Playwright tests pass, ESLint exits zero, the production build succeeds, and no hydration or browser console error is present.

- [ ] **Step 7: Commit Task 4**

```bash
git add tests/e2e/portfolio.spec.ts design-qa.md
git commit -m "test: verify ruler nav and preview copy fidelity"
```
