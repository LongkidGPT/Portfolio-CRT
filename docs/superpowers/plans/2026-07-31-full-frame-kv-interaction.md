# Full-frame KV Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the isolated robot sprite and CSS-built project buttons with a 72-frame full-canvas KV sequence and the supplied five pairs of button-state artwork.

**Architecture:** A reproducible Node/FFmpeg asset script extracts 72 WebP frames and copies normalized button assets into `public/kv`. `SpritePortrait` preloads and draws one complete 1470×630 frame at a time on Canvas, mapping pointer angle to the circular sequence. `ProjectSelector` keeps semantic links but renders the supplied PNG artwork, while coarse pointers only change frame direction when a project is touched.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Canvas 2D, FFmpeg, Vitest, Testing Library, Playwright.

## Global Constraints

- Keep every KV frame at the source 1470×630 ratio; do not crop the robot or rebuild the background.
- Generate exactly 72 evenly spaced WebP frames from `KV首屏/首屏头部转动效果.mp4`.
- Use `WHITE` art for default buttons and `BLACK` art for hover, keyboard focus, and active preview states, with no fade or scale transition.
- Desktop fine pointers track the mouse relative to the robot-head anchor; mobile stays neutral until a project control is touched or focused.
- `prefers-reduced-motion: reduce` fixes the canvas to the neutral frame.
- Preserve the existing home-to-overlay and overlay-to-home transitions and all five routes.
- Do not stage or modify the unrelated pre-existing dirty files listed by `git status`.

---

### Task 1: Build and verify normalized KV assets

**Files:**
- Create: `scripts/build-kv-assets.mjs`
- Create: `public/kv/frames/frame-000.webp` through `public/kv/frames/frame-071.webp`
- Create: `public/kv/buttons/about-default.png`, `about-active.png`, `business-default.png`, `business-active.png`, `brand-system-default.png`, `brand-system-active.png`, `product-launch-default.png`, `product-launch-active.png`, `launch-event-default.png`, `launch-event-active.png`
- Create: `public/kv/manifest.json`
- Create: `tests/unit/kv-assets.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: sibling source directory `../KV首屏`, local `ffmpeg`, and local `ffprobe`.
- Produces: `KvManifest` JSON with `{ frameCount: 72, width: 1470, height: 630, neutralFrame: number, framePattern: "/kv/frames/frame-%03d.webp" }` and stable public button paths.

- [ ] **Step 1: Write the failing asset-contract test**

```ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("generated KV assets", () => {
  const root = join(process.cwd(), "public", "kv");
  const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));

  it("describes the full-frame sequence", () => {
    expect(manifest).toMatchObject({ frameCount: 72, width: 1470, height: 630 });
    expect(manifest.neutralFrame).toBe(71);
  });

  it("contains every frame and button state", () => {
    for (let index = 0; index < 72; index += 1) {
      expect(existsSync(join(root, "frames", `frame-${String(index).padStart(3, "0")}.webp`))).toBe(true);
    }
    for (const id of ["about", "business", "brand-system", "product-launch", "launch-event"]) {
      expect(existsSync(join(root, "buttons", `${id}-default.png`))).toBe(true);
      expect(existsSync(join(root, "buttons", `${id}-active.png`))).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run the test and verify that it fails before generation**

Run: `npm test -- tests/unit/kv-assets.test.ts`

Expected: FAIL because `public/kv/manifest.json` does not exist.

- [ ] **Step 3: Add the reproducible FFmpeg/copy script**

Implement `scripts/build-kv-assets.mjs` with `spawnSync`/`copyFileSync`: resolve `../KV首屏`, recreate only `public/kv/frames` and `public/kv/buttons`, run `ffmpeg -vf fps=72/8.016667 -frames:v 72 -c:v libwebp -quality 78`, normalize the ten filenames, probe the output dimensions, and write the manifest. The script must exit non-zero if FFmpeg fails or if the generated frame count is not 72.

Add to `package.json`:

```json
"assets:kv": "node scripts/build-kv-assets.mjs"
```

- [ ] **Step 4: Generate assets and inspect representative frames**

Run: `npm run assets:kv`

Run: `ffprobe -v error -show_entries stream=width,height -of csv=s=x:p=0 public/kv/frames/frame-000.webp`

Expected: `1470x630`. Visually inspect frames `000`, `018`, `036`, `054`, and `071`; frame `071` is the neutral forward-facing frame recorded in the manifest.

- [ ] **Step 5: Run the asset test**

Run: `npm test -- tests/unit/kv-assets.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the asset pipeline and generated assets**

```bash
git add package.json scripts/build-kv-assets.mjs public/kv tests/unit/kv-assets.test.ts
git commit -m "feat: generate full-frame KV assets"
```

---

### Task 2: Map pointer direction to the 72-frame circular sequence

**Files:**
- Modify: `lib/portfolio/sprite.ts`
- Modify: `tests/unit/sprite.test.ts`

**Interfaces:**
- Consumes: a viewport pointer `Point`, a screen-space anchor `Point`, `frameCount`, and `frameOffset`.
- Produces: `pointerAngle(point: Point, anchor: Point): number`, `frameForAngle(angle: number, frameCount: number, frameOffset?: number): number`, and unchanged `shortestFrameDelta(target, current, count)`.

- [ ] **Step 1: Replace old lookup-table expectations with circular-sequence tests**

```ts
it("maps cardinal angles around a 72-frame direction ring", () => {
  expect(frameForAngle(0, 72)).toBe(0);
  expect(frameForAngle(90, 72)).toBe(18);
  expect(frameForAngle(180, 72)).toBe(36);
  expect(frameForAngle(270, 72)).toBe(54);
  expect(frameForAngle(360, 72)).toBe(0);
});

it("supports calibrated source-frame offsets", () => {
  expect(frameForAngle(0, 72, 9)).toBe(9);
  expect(frameForAngle(315, 72, 9)).toBe(0);
});

it("calculates direction around an explicit robot-head anchor", () => {
  const anchor = { x: 70, y: 35 };
  expect(pointerAngle({ x: 70, y: 0 }, anchor)).toBeCloseTo(0);
  expect(pointerAngle({ x: 100, y: 35 }, anchor)).toBeCloseTo(90);
  expect(pointerAngle({ x: 70, y: 70 }, anchor)).toBeCloseTo(180);
});
```

- [ ] **Step 2: Run the focused unit test and verify failure**

Run: `npm test -- tests/unit/sprite.test.ts`

Expected: FAIL because the existing functions use fixed 64-frame keys and canvas bounds.

- [ ] **Step 3: Implement generic circular mapping**

```ts
export function frameForAngle(angle: number, frameCount: number, frameOffset = 0): number {
  const normalized = ((angle % 360) + 360) % 360;
  return (((normalized / 360) * frameCount + frameOffset) % frameCount + frameCount) % frameCount;
}

export function pointerAngle(point: Point, anchor: Point): number {
  return ((Math.atan2(point.x - anchor.x, -(point.y - anchor.y)) * 180) / Math.PI + 360) % 360;
}
```

Keep `shortestFrameDelta` generic and unchanged.

- [ ] **Step 4: Run the unit test and full test suite**

Run: `npm test -- tests/unit/sprite.test.ts`

Expected: PASS.

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 5: Commit the direction mapping**

```bash
git add lib/portfolio/sprite.ts tests/unit/sprite.test.ts
git commit -m "feat: map pointer angle to KV frame ring"
```

---

### Task 3: Render complete KV frames with progressive preloading

**Files:**
- Create: `lib/portfolio/kv.ts`
- Modify: `components/portfolio/SpritePortrait.tsx`
- Modify: `components/portfolio/PortfolioHome.tsx`
- Modify: `components/portfolio/portfolio.module.css`
- Modify: `tests/components/SpritePortrait.test.tsx`
- Modify: `tests/components/PortfolioHome.test.tsx`

**Interfaces:**
- Consumes: `focusPoint: Point | null`, `motionReduced: boolean`, and the generated manifest constants exposed by `lib/portfolio/kv.ts`.
- Produces: a semantic Canvas that always draws a complete 1470×630 frame; `PortfolioHome` supplies real pointer coordinates only for `(pointer: fine)` and supplies button-center coordinates for coarse-pointer previews.

- [ ] **Step 1: Add component tests for full-frame assets and reduced motion**

Mock `global.Image` and Canvas 2D. Assert that `SpritePortrait` requests `/kv/frames/frame-${index}.webp`, draws with source dimensions `1470, 630`, keeps the first decoded frame visible when another frame errors, and stays on the neutral frame when `motionReduced` is true.

Extend `PortfolioHome.test.tsx` so a mocked fine pointer updates `focusPoint`, while a mocked coarse pointer does not install a global `pointermove` listener.

- [ ] **Step 2: Run the component tests and verify failure**

Run: `npm test -- tests/components/SpritePortrait.test.tsx tests/components/PortfolioHome.test.tsx`

Expected: FAIL because the component still loads `/sprite/robot.webp` and assumes a square sprite sheet.

- [ ] **Step 3: Add typed KV constants**

Create `lib/portfolio/kv.ts`:

```ts
export const KV_FRAME_COUNT = 72;
export const KV_WIDTH = 1470;
export const KV_HEIGHT = 630;
export const KV_HEAD_ANCHOR = { x: 0.704, y: 0.425 } as const;
export const KV_NEUTRAL_FRAME = 71;

export function kvFrameSrc(index: number): string {
  const normalized = ((Math.round(index) % KV_FRAME_COUNT) + KV_FRAME_COUNT) % KV_FRAME_COUNT;
  return `/kv/frames/frame-${String(normalized).padStart(3, "0")}.webp`;
}
```

- [ ] **Step 4: Replace sprite-sheet drawing with decoded frame drawing**

In `SpritePortrait.tsx`, preload the neutral image first, then fill an `Array<HTMLImageElement | undefined>` outward around the neutral frame. Draw the selected complete image using `drawImage(image, 0, 0, 1470, 630, 0, 0, canvas.width, canvas.height)`. Convert `KV_HEAD_ANCHOR` to screen coordinates using the canvas bounding rectangle before calling `pointerAngle`. Preserve shortest-path easing at `0.16`, visibility pause, resize handling, the last good frame on load failure, and cancellation cleanup.

- [ ] **Step 5: Make the stage full-screen and keep pointer modes separate**

Change `.portraitStage` to cover the whole home (`inset: 0`) with `aspect-ratio: 1470 / 630`; change `.portrait` to `width: 100%; height: 100%; object-fit: cover`. Preserve its z-index below text/buttons and preserve the existing zoom/fade selectors.

In `PortfolioHome`, keep global `pointermove` only for fine pointers. Continue sending the button-center point through `preview` so coarse pointer touch selects an appropriate direction without blocking scroll.

- [ ] **Step 6: Run component and regression tests**

Run: `npm test -- tests/components/SpritePortrait.test.tsx tests/components/PortfolioHome.test.tsx`

Expected: PASS.

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 7: Commit the complete-frame renderer**

```bash
git add lib/portfolio/kv.ts components/portfolio/SpritePortrait.tsx components/portfolio/PortfolioHome.tsx components/portfolio/portfolio.module.css tests/components/SpritePortrait.test.tsx tests/components/PortfolioHome.test.tsx
git commit -m "feat: render mouse-following full-frame KV"
```

---

### Task 4: Replace project controls with supplied button artwork

**Files:**
- Modify: `lib/portfolio/projects.ts`
- Modify: `components/portfolio/ProjectSelector.tsx`
- Modify: `components/portfolio/portfolio.module.css`
- Modify: `tests/components/ProjectSelector.test.tsx`

**Interfaces:**
- Consumes: `buttonDefault` and `buttonActive` public paths on each `ProjectDefinition`.
- Produces: accessible links whose visible artwork switches instantly according to hover/focus/current state.

- [ ] **Step 1: Add tests for both button-state image sources**

Extend the selector test:

```ts
test("renders supplied default and active artwork for each project", () => {
  render(<ProjectSelector projects={PROJECTS} activeProject="business" onPreview={vi.fn()} onOpen={vi.fn()} />);
  const business = screen.getByRole("link", { name: "Open BUSINESS" });
  expect(business.querySelector('[data-state="default"]')).toHaveAttribute("src", "/kv/buttons/business-default.png");
  expect(business.querySelector('[data-state="active"]')).toHaveAttribute("src", "/kv/buttons/business-active.png");
  expect(business).toHaveAttribute("aria-current", "page");
});
```

- [ ] **Step 2: Run the selector test and verify failure**

Run: `npm test -- tests/components/ProjectSelector.test.tsx`

Expected: FAIL because project definitions do not yet expose artwork and links still render text/icon spans.

- [ ] **Step 3: Add explicit artwork paths to project data**

Add to `ProjectDefinition`:

```ts
buttonDefault: `/kv/buttons/${string}-default.png`;
buttonActive: `/kv/buttons/${string}-active.png`;
```

Populate all five entries with their normalized paths.

- [ ] **Step 4: Render both states without transition latency**

Keep each semantic `Link`, add a visually hidden label, render two `<img>` elements with `data-state="default"` and `data-state="active"`, and use CSS opacity switching with `transition: none`. Do not use `next/image` optimization because these small transparent controls are already final raster assets.

Desktop retains the five-control row. Mobile retains the existing carousel behavior, with the artwork fitting within each card and the existing metadata remaining available below/alongside it only where it does not duplicate the image text visually.

- [ ] **Step 5: Run selector and full tests**

Run: `npm test -- tests/components/ProjectSelector.test.tsx`

Expected: PASS.

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 6: Commit the supplied controls**

```bash
git add lib/portfolio/projects.ts components/portfolio/ProjectSelector.tsx components/portfolio/portfolio.module.css tests/components/ProjectSelector.test.tsx
git commit -m "feat: use supplied project button artwork"
```

---

### Task 5: Verify desktop, mobile, and route transitions

**Files:**
- Modify: `tests/e2e/portfolio.spec.ts`
- Modify: `tests/e2e/responsive.spec.ts`

**Interfaces:**
- Consumes: the complete implementation from Tasks 1–4.
- Produces: browser-level proof for full-frame rendering, instant button states, mobile touch behavior, and preserved overlay transitions.

- [ ] **Step 1: Add browser assertions**

On desktop, assert the Canvas bounding box spans the viewport width, move the mouse to top/right/bottom/left around the calibrated head anchor, and assert the Canvas remains visible with no page errors. Hover BUSINESS and assert its active-state image is visible immediately while its default-state image is hidden.

On mobile, assert the neutral canvas is visible, swipe vertically over a non-control region and verify the page remains scrollable, tap a project control, and verify its active artwork plus existing route transition.

- [ ] **Step 2: Run the focused E2E specs**

Run: `npm run test:e2e -- tests/e2e/portfolio.spec.ts tests/e2e/responsive.spec.ts`

Expected: both desktop and mobile projects pass; only explicitly unsupported hover assertions are skipped on mobile.

- [ ] **Step 3: Run lint and production build**

Run: `npm run lint`

Expected: zero errors.

Run: `npm run build`

Expected: successful Next.js production build with all five routes generated.

- [ ] **Step 4: Perform visual acceptance at large and mobile viewports**

Open the production preview at 2560×1440, 1440×900, 390×844, and 360×800. Check full-frame alignment, the robot-head anchor, button pixel size, frame direction, transition midpoint opacity, overlay width, and close transition. Record any source-resolution softness at 2560×1440 as an asset limitation rather than stretching the Canvas beyond the source resolution internally.

- [ ] **Step 5: Commit browser verification**

```bash
git add tests/e2e/portfolio.spec.ts tests/e2e/responsive.spec.ts
git commit -m "test: verify full-frame KV interaction"
```
