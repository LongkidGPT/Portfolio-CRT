# R3 Formal Home Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the formal desktop homepage’s legacy 72-frame transparent portrait with the verified 193-frame R3 full-frame interaction while preserving mobile behavior, five project controls, and page transitions.

**Architecture:** Extract the verified R3 canvas loader, pointer mapping, frame easing, and diagnostics into one reusable `R3Portrait` component. Both `/kv-sync-test` and the formal desktop homepage consume that component; the test route supplies diagnostics, while the homepage supplies only an optional fixed project frame. `PortfolioHome` keeps the legacy `SpritePortrait` below 768px and uses the shared R3 component at desktop widths.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Canvas 2D, CSS Modules, Vitest, Testing Library, Playwright, agent-browser.

## Global Constraints

- Use only the existing 193 WebP frames extracted from `KV首屏/首屏头部转动效果（R3）.mp4`.
- Draw the complete 1470 × 630 frame with `contain`; do not crop, stretch, matte, mirror, or separate the screen image.
- Keep `/kv-sync-test` available as the calibration route.
- Keep all existing navigation, project copy, rulers, button artwork, and route-transition timing.
- Use R3 only at widths of 768px and above; keep the existing `SpritePortrait` below 768px.
- Use project fixed frames `about: 124`, `business: 134`, `brand-system: 144`, `product-launch: 150`, `launch-event: 156`.
- Keep neutral frame 174 and the currently verified eight-direction mapping.
- Preserve the known R3 limitation: frame 156 is only an approximation of down-right.
- Do not delete the legacy 72-frame assets in this change.

---

### Task 1: Add the five-project R3 fixed-frame contract

**Files:**
- Modify: `lib/portfolio/kv-sync-test.ts`
- Modify: `tests/unit/kv-sync-test.test.ts`

**Interfaces:**
- Consumes: `ProjectId` from `lib/portfolio/projects.ts`.
- Produces: `KV_SYNC_PROJECT_FRAMES: Record<ProjectId, number>` for `PortfolioHome`.

- [ ] **Step 1: Write the failing project-frame test**

Add this import and assertion to `tests/unit/kv-sync-test.test.ts`:

```ts
import { KV_SYNC_PROJECT_FRAMES } from "@/lib/portfolio/kv-sync-test";

it("locks the five formal controls to the approved lower R3 arc", () => {
  expect(KV_SYNC_PROJECT_FRAMES).toEqual({
    about: 124,
    business: 134,
    "brand-system": 144,
    "product-launch": 150,
    "launch-event": 156,
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- tests/unit/kv-sync-test.test.ts`

Expected: FAIL because `KV_SYNC_PROJECT_FRAMES` is not exported.

- [ ] **Step 3: Add the typed mapping**

In `lib/portfolio/kv-sync-test.ts`, import `ProjectId` as a type and add:

```ts
export const KV_SYNC_PROJECT_FRAMES = {
  about: 124,
  business: 134,
  "brand-system": 144,
  "product-launch": 150,
  "launch-event": 156,
} as const satisfies Record<ProjectId, number>;
```

- [ ] **Step 4: Run the test and verify GREEN**

Run: `npm test -- tests/unit/kv-sync-test.test.ts`

Expected: all tests in the file PASS.

- [ ] **Step 5: Commit the mapping**

```bash
git add lib/portfolio/kv-sync-test.ts tests/unit/kv-sync-test.test.ts
git commit -m "feat: map formal controls to R3 frames"
```

---

### Task 2: Extract the verified R3 renderer into a shared component

**Files:**
- Create: `components/portfolio/R3Portrait.tsx`
- Create: `tests/components/R3Portrait.test.tsx`
- Modify: `components/portfolio/KvSyncTest.tsx`
- Modify: `tests/components/KvSyncTest.test.tsx`

**Interfaces:**
- Consumes: `KV_SYNC_*`, `angleForKvSyncPointer`, `frameForKvSyncPointer`, `kvSyncFrameSrc`, and `stepKvSyncFrame` from `lib/portfolio/kv-sync-test.ts`.
- Produces:

```ts
export interface R3Diagnostics {
  angle: number | null;
  frame: number;
  targetFrame: number;
  loaded: number;
  errors: number;
}

interface R3PortraitProps {
  fixedFrame?: number | null;
  motionReduced?: boolean;
  className?: string;
  ariaLabel?: string;
  onDiagnostics?: (value: R3Diagnostics) => void;
}
```

- [ ] **Step 1: Write the failing shared-renderer tests**

Create `tests/components/R3Portrait.test.tsx` using the existing `FakeImage`, mocked canvas context, 1470 × 630 bounds, and mocked `requestAnimationFrame` pattern from `tests/components/KvSyncTest.test.tsx`.

The first test must assert:

```ts
render(<R3Portrait motionReduced />);

const canvas = screen.getByRole("img", {
  name: "Interactive R3 full-frame portrait",
});
expect(canvas).toHaveAttribute("data-frame", "174");
expect(sources[0]).toBe("/kv-sync-test/frames/frame-174.webp");
expect(drawImage).toHaveBeenCalledWith(
  expect.any(FakeImage),
  0,
  0,
  1470,
  630,
  0,
  0,
  1470,
  630,
);
```

The second test must capture the animation callback, rerender with `fixedFrame={144}`, execute frames until the eased display reaches 144, and assert `data-target-frame="144"` and eventually `data-frame="144"`.

- [ ] **Step 2: Run the new test and verify RED**

Run: `npm test -- tests/components/R3Portrait.test.tsx`

Expected: FAIL because `R3Portrait` does not exist.

- [ ] **Step 3: Implement `R3Portrait` by moving the verified engine**

Move these responsibilities out of `KvSyncTest.tsx` without changing their behavior:

- create and preload all 193 images, neutral first;
- size the Canvas buffer with DPR capped at 2;
- calculate the complete-frame destination with `containRect`;
- listen to fine-pointer movement on `window`;
- calculate anchor-relative normalized coordinates and the edge-normalized pointer angle;
- prefer `fixedFrame`, then reduced-motion neutral frame, then free pointer mapping;
- ease with `stepKvSyncFrame` and draw only decoded frames;
- expose `data-frame`, `data-target-frame`, `data-loaded`, and `data-errors`;
- notify `onDiagnostics` only when a rounded frame, target, angle label, load count, or error count changes.

The returned markup is exactly one Canvas:

```tsx
return (
  <canvas
    ref={canvasRef}
    className={className}
    role="img"
    aria-label={ariaLabel}
    data-frame={KV_SYNC_NEUTRAL_FRAME}
    data-loaded="0"
    data-errors="0"
  />
);
```

- [ ] **Step 4: Run the shared-renderer test and verify GREEN**

Run: `npm test -- tests/components/R3Portrait.test.tsx`

Expected: both tests PASS.

- [ ] **Step 5: Refactor `KvSyncTest` to consume `R3Portrait`**

Replace its canvas engine with local `R3Diagnostics` state and:

```tsx
<R3Portrait
  className={styles.canvas}
  ariaLabel="Full-frame KV synchronization test"
  onDiagnostics={setDiagnostics}
/>
```

Keep the existing diagnostic panel text and route CSS. Update `tests/components/KvSyncTest.test.tsx` to assert that the delegated Canvas still exposes neutral frame 174 and the first source remains the R3 neutral file.

- [ ] **Step 6: Run both component test files**

Run: `npm test -- tests/components/R3Portrait.test.tsx tests/components/KvSyncTest.test.tsx`

Expected: all tests PASS.

- [ ] **Step 7: Commit the shared renderer**

```bash
git add components/portfolio/R3Portrait.tsx components/portfolio/KvSyncTest.tsx tests/components/R3Portrait.test.tsx tests/components/KvSyncTest.test.tsx
git commit -m "refactor: share the verified R3 renderer"
```

---

### Task 3: Use R3 on the formal desktop homepage

**Files:**
- Modify: `components/portfolio/PortfolioHome.tsx`
- Modify: `components/portfolio/portfolio.module.css`
- Modify: `tests/components/PortfolioHome.test.tsx`

**Interfaces:**
- Consumes: `R3Portrait`, `KV_SYNC_PROJECT_FRAMES`, the existing `focusFrame` preview state, and the existing `SpritePortrait` mobile component.
- Produces: desktop formal Canvas with aria-label `Interactive R3 full-frame portrait`; mobile retains aria-label `Interactive CRT portrait`.

- [ ] **Step 1: Write the failing formal-home test**

In `tests/components/PortfolioHome.test.tsx`, stub `matchMedia` so `(min-width: 768px)` returns `true`, mock Canvas context as `null`, render the real `PortfolioHome`, then assert:

```ts
expect(
  screen.getByRole("img", { name: "Interactive R3 full-frame portrait" }),
).toBeInTheDocument();
expect(
  screen.queryByRole("img", { name: "Interactive CRT portrait" }),
).not.toBeInTheDocument();
```

Add a second test that hovers `Open BUSINESS` and asserts the R3 Canvas receives `data-target-frame="134"` after the captured animation callback runs.

- [ ] **Step 2: Run the formal-home test and verify RED**

Run: `npm test -- tests/components/PortfolioHome.test.tsx`

Expected: FAIL because the formal homepage still renders `SpritePortrait` on desktop.

- [ ] **Step 3: Add the desktop media-query hook**

Inside `PortfolioHome.tsx`, add a focused hook:

```ts
function useDesktopR3() {
  const [desktop, setDesktop] = useState(true);

  useEffect(() => {
    const query = window.matchMedia?.("(min-width: 768px)");
    if (!query) return;
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return desktop;
}
```

- [ ] **Step 4: Replace only the desktop portrait layer**

Preserve the legacy mobile mapping and select the frame table by renderer:

```ts
setFocusFrame(
  desktopR3 ? KV_SYNC_PROJECT_FRAMES[id] : KV_PROJECT_FRAMES[id],
);
```

Add `desktopR3` to the `preview` callback dependency list so resizing across the 768px boundary updates the selected table without stale closure state.

Inside the existing `.portraitStage`, render:

```tsx
{desktopR3 ? (
  <R3Portrait
    fixedFrame={focusFrame}
    motionReduced={reduced}
    className={styles.portrait}
  />
) : (
  <SpritePortrait
    focusPoint={focusPoint}
    focusFrame={focusFrame}
    motionReduced={reduced}
    className={styles.portrait}
  />
)}
```

Do not change the state reducer, routing delay, selector handlers, or `.portraitStage` transition selectors. Only remove CSS rules that reposition the old transparent portrait on desktop; keep `.portrait` at `width: 100%; height: 100%` so `R3Portrait` can use `contain` across the full stage.

- [ ] **Step 5: Run component and transition tests**

Run: `npm test -- tests/components/PortfolioHome.test.tsx tests/components/ProjectSelector.test.tsx tests/unit/state.test.ts`

Expected: all tests PASS, including the existing 720ms navigation hold.

- [ ] **Step 6: Commit the formal integration**

```bash
git add components/portfolio/PortfolioHome.tsx components/portfolio/portfolio.module.css tests/components/PortfolioHome.test.tsx
git commit -m "feat: use R3 interaction on the formal desktop home"
```

---

### Task 4: Verify the complete desktop interaction and transition story

**Files:**
- Modify: `tests/e2e/portfolio.spec.ts`
- Modify only if a verified failure requires it: `components/portfolio/R3Portrait.tsx`, `components/portfolio/PortfolioHome.tsx`, or `components/portfolio/portfolio.module.css`

**Interfaces:**
- Consumes: formal R3 Canvas datasets and existing project routes.
- Produces: regression coverage for frame loading, free pointer motion, fixed project frames, and overlay transitions.

- [ ] **Step 1: Extend the formal homepage browser test**

At desktop viewport 1470 × 630, assert:

```ts
const portrait = page.getByRole("img", {
  name: "Interactive R3 full-frame portrait",
});
await expect(portrait).toHaveAttribute("data-loaded", "193");
await expect(portrait).toHaveAttribute("data-errors", "0");
```

Move the pointer to the canvas top, right, bottom, left, and screen-center positions and assert the verified target frames 52, 20, 144, 100, and 174. Hover each approved project control and assert fixed target frames 124, 134, 144, 150, and 156. Move away from the selector and assert free pointer tracking resumes.

- [ ] **Step 2: Run the new E2E test and fix only observed failures**

Run: `npx playwright test tests/e2e/portfolio.spec.ts --project=desktop`

Expected: the formal homepage frame assertions and existing open/close transition assertions PASS.

- [ ] **Step 3: Run the complete automated verification**

Run each command separately:

```bash
npm test
npm run lint
npm run build
git diff --check
```

Expected: 0 test failures, 0 lint errors, successful Next.js production build, and no whitespace errors.

- [ ] **Step 4: Run agent-browser visual verification**

Open `http://127.0.0.1:4178/` at 1470 × 630 and verify:

- full R3 frame is visible with no crop or stretch;
- no Next.js error overlay or console error;
- 193 frames load with 0 errors;
- header, preview copy, rulers, and five controls remain above the Canvas;
- free pointer and project hover both change frames;
- entering a child page fades and enlarges the R3 stage;
- closing the child page restores the R3 stage;
- `/kv-sync-test` still loads and shows diagnostics.

Capture final screenshots at `/private/tmp/r3-formal-home.png` and `/private/tmp/r3-formal-transition.png` for visual inspection.

- [ ] **Step 5: Commit final regression coverage**

```bash
git add tests/e2e/portfolio.spec.ts
git commit -m "test: verify formal R3 interaction story"
```

---

## Completion Criteria

- Formal desktop `/` uses the shared R3 renderer and complete 21:9 frames.
- `/kv-sync-test` uses the same renderer and retains diagnostics.
- All five project controls lock the approved frames and restore free tracking on exit.
- Mobile below 768px still renders the legacy `SpritePortrait`.
- Existing child-page routing and zoom/fade transitions pass automated and visual checks.
- Tests, lint, production build, browser console, and git diff checks are clean.
