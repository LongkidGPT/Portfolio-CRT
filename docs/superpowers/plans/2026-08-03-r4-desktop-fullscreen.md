# R4 Desktop Fullscreen KV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the formal desktop homepage's R3 sequence with the supplied R4 1280 × 720 sequence and render it edge-to-edge on every desktop viewport without changing mobile behavior or the existing interactions.

**Architecture:** Keep the existing 193-frame interaction and fixed-frame override, but update the locked asset contract and source-space head anchor for R4. Add a focused `coverRect` geometry helper and make the shared renderer revision-neutral; drawing uses the focused cover rectangle while pointer direction uses viewport coordinates so cropped viewports still reach exact edge directions.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Canvas 2D, CSS Modules, ffmpeg/cwebp asset pipeline, Vitest, Testing Library, Playwright, agent-browser.

## Global Constraints

- Source file is `KV首屏/首屏头部转动效果（R4）.mp4` with SHA-256 `01c513e369a7e7140f87f5a07ac80bca1cf495d9f92c26dc0c212038def98677`.
- Source contract is exactly 1280 × 720 and 193 decoded frames, with nominal stream rate 60/1 and average decoded rate 11580/481.
- Desktop widths at or above 768 px use focused `cover`; no letterbox bars, stretching, mirroring, or separated screen playback.
- R4 source-space screen center is `{ x: 0.614, y: 0.478 }`; keep that point at the same normalized viewport position during crop.
- Preserve the visually checked R4 keyframes: neutral 174; directions 52, 36, 20, 156, 144, 124, 100, 76; project frames 124, 134, 144, 150, 156.
- Keep the existing pointer easing, neutral zone, fixed-project override, 720 ms route transition, header, copy, rulers, and button artwork.
- Below 768 px keep the legacy 72-frame `SpritePortrait` unchanged.
- Keep `/kv-sync-test` as the production-equivalent calibration route.

---

### Task 1: Lock and generate the R4 frame sequence

**Files:**
- Modify: `scripts/build-kv-sync-test-assets.mjs`
- Modify: `lib/portfolio/kv-sync-test.ts`
- Modify: `tests/unit/kv-sync-assets.test.ts`
- Modify: `tests/unit/kv-sync-test.test.ts`
- Replace generated assets: `public/kv-sync-test/frames/frame-000.webp` through `frame-192.webp`
- Modify generated manifest: `public/kv-sync-test/manifest.json`

**Interfaces:**
- Consumes: R4 MP4 and the existing `assets:kv-sync-test` command.
- Produces: a verified 193-frame WebP sequence, `KV_SYNC_WIDTH = 1280`, `KV_SYNC_HEIGHT = 720`, and `KV_SYNC_HEAD_ANCHOR = { x: 0.614, y: 0.478 }`.

- [ ] **Step 1: Change the asset-contract tests first**

In `tests/unit/kv-sync-assets.test.ts`, require the checked-in manifest to equal:

```ts
expect(manifest).toMatchObject({
  frameCount: 193,
  width: 1280,
  height: 720,
  sourceFile: "首屏头部转动效果（R4）.mp4",
  sourceSha256:
    "01c513e369a7e7140f87f5a07ac80bca1cf495d9f92c26dc0c212038def98677",
});
```

In `tests/unit/kv-sync-test.test.ts`, change the source contract assertion to:

```ts
expect([KV_SYNC_WIDTH, KV_SYNC_HEIGHT]).toEqual([1280, 720]);
expect(KV_SYNC_HEAD_ANCHOR).toEqual({ x: 0.614, y: 0.478 });
```

Update the literal edge vectors in the angle table to use the R4 anchor:

```ts
[0.386, -0.478, 45],
[0.386, 0.522, 135],
[-0.614, 0.522, 225],
[-0.614, -0.478, 315],
[0.386, 0, 90],
[0, 0.522, 180],
```

- [ ] **Step 2: Run the unit tests and verify RED**

Run:

```bash
npm test -- tests/unit/kv-sync-assets.test.ts tests/unit/kv-sync-test.test.ts
```

Expected: FAIL because the checked-in manifest and constants still describe R3 at 1470 × 630 with the old checksum and anchor.

- [ ] **Step 3: Update the locked source pipeline and R4 constants**

In `scripts/build-kv-sync-test-assets.mjs`, set:

```js
const SOURCE_NAME = "首屏头部转动效果（R4）.mp4";
const SOURCE_SHA256 =
  "01c513e369a7e7140f87f5a07ac80bca1cf495d9f92c26dc0c212038def98677";
```

Change the probe guard to:

```js
if (width !== 1280 || height !== 720 || decodedFrameCount !== FRAME_COUNT) {
```

In `lib/portfolio/kv-sync-test.ts`, set:

```ts
export const KV_SYNC_WIDTH = 1280;
export const KV_SYNC_HEIGHT = 720;
export const KV_SYNC_HEAD_ANCHOR = { x: 0.614, y: 0.478 } as const;
```

Keep the already inspected R4 frame maps unchanged.

- [ ] **Step 4: Generate the R4 WebP frames and manifest**

Run:

```bash
npm run assets:kv-sync-test
```

Expected: `Generated 193 full-frame KV sync assets` and a manifest naming R4 at 1280 × 720.

- [ ] **Step 5: Verify the generated sequence and keyframes**

Run the two unit files again. Then use ffmpeg to produce `/private/tmp/r4-generated-keyframes.jpg` from frames 20, 36, 52, 76, 100, 124, 134, 144, 150, 156, and 174, and inspect it with `view_image`.

Expected visual order:

```text
20 right, 36 up-right, 52 up, 76 up-left,
100 left, 124 down-left/about, 134 business, 144 down/brand,
150 product, 156 launch-event/down-right approximation, 174 neutral.
```

- [ ] **Step 6: Commit the R4 source contract and generated assets**

```bash
git add scripts/build-kv-sync-test-assets.mjs lib/portfolio/kv-sync-test.ts tests/unit/kv-sync-assets.test.ts tests/unit/kv-sync-test.test.ts public/kv-sync-test
git commit -m "feat: replace the desktop KV sequence with R4"
```

---

### Task 2: Add focused cover geometry

**Files:**
- Modify: `lib/portfolio/kv.ts`
- Modify: `tests/unit/kv.test.ts`

**Interfaces:**
- Consumes: source/target dimensions and a normalized focal point.
- Produces: `coverRect(sourceWidth, sourceHeight, targetWidth, targetHeight, focus): Rect`.

- [ ] **Step 1: Write failing cover-geometry tests**

Import `coverRect` and add table-driven assertions with literal values:

```ts
test.each([
  [1920, 1080, { x: 0, y: 0, width: 1920, height: 1080 }],
  [1440, 900, { x: -98.24, y: 0, width: 1600, height: 900 }],
  [1440, 960, { x: -163.73, y: 0, width: 1706.67, height: 960 }],
  [1470, 630, { x: 0, y: -94.11, width: 1470, height: 826.88 }],
])("covers %d × %d while preserving the R4 focal point", (width, height, want) => {
  const result = coverRect(1280, 720, width, height, { x: 0.614, y: 0.478 });
  expect(result.x).toBeCloseTo(want.x, 2);
  expect(result.y).toBeCloseTo(want.y, 2);
  expect(result.width).toBeCloseTo(want.width, 2);
  expect(result.height).toBeCloseTo(want.height, 2);
  expect(result.x).toBeLessThanOrEqual(0);
  expect(result.y).toBeLessThanOrEqual(0);
  expect(result.x + result.width).toBeGreaterThanOrEqual(width);
  expect(result.y + result.height).toBeGreaterThanOrEqual(height);
});
```

- [ ] **Step 2: Run the geometry test and verify RED**

Run: `npm test -- tests/unit/kv.test.ts`

Expected: FAIL because `coverRect` is not exported.

- [ ] **Step 3: Implement the focused cover helper**

Add to `lib/portfolio/kv.ts`:

```ts
export function coverRect(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  focus: Point,
): Rect {
  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const minX = targetWidth - width;
  const minY = targetHeight - height;

  return {
    x: Math.max(minX, Math.min(0, focus.x * (targetWidth - width))),
    y: Math.max(minY, Math.min(0, focus.y * (targetHeight - height))),
    width,
    height,
  };
}
```

Import `Point` as a type from `lib/portfolio/sprite.ts`.

- [ ] **Step 4: Run the geometry tests and verify GREEN**

Run: `npm test -- tests/unit/kv.test.ts`

Expected: every contain, legacy portrait, and new cover assertion passes.

- [ ] **Step 5: Commit the isolated geometry helper**

```bash
git add lib/portfolio/kv.ts tests/unit/kv.test.ts
git commit -m "feat: add focal cover geometry for desktop KV"
```

---

### Task 3: Make the shared renderer R4-neutral and fullscreen

**Files:**
- Create: `components/portfolio/FullFramePortrait.tsx`
- Delete: `components/portfolio/R3Portrait.tsx`
- Create: `tests/components/FullFramePortrait.test.tsx`
- Delete: `tests/components/R3Portrait.test.tsx`
- Modify: `components/portfolio/KvSyncTest.tsx`
- Modify: `components/portfolio/PortfolioHome.tsx`
- Modify: `tests/components/KvSyncTest.test.tsx`
- Modify: `tests/components/PortfolioHome.test.tsx`

**Interfaces:**
- Consumes: R4 dimensions/anchor, `coverRect`, frame mapping, and the existing easing helpers.
- Produces: `FullFramePortrait`, `FrameDiagnostics`, and the accessible name `Interactive full-frame KV portrait`.

- [ ] **Step 1: Rename the renderer test contract before production code**

Create `tests/components/FullFramePortrait.test.tsx` from the existing real Canvas harness, importing the wished-for `FullFramePortrait`.

The neutral-frame test must expect the R4 cover draw at 1470 × 630:

```ts
expect(drawImage).toHaveBeenCalledWith(
  expect.any(FakeImage),
  0,
  0,
  1280,
  720,
  0,
  expect.closeTo(-94.11, 2),
  1470,
  expect.closeTo(826.88, 2),
);
```

Keep the fixed-frame easing test and add a pointer test that moves to viewport right-center and expects `data-target-frame="20"`. Query the Canvas as:

```ts
screen.getByRole("img", { name: "Interactive full-frame KV portrait" });
```

Update `PortfolioHome.test.tsx` and `KvSyncTest.test.tsx` to use the new accessible name and R4 draw dimensions.

- [ ] **Step 2: Run the component tests and verify RED**

Run:

```bash
npm test -- tests/components/FullFramePortrait.test.tsx tests/components/PortfolioHome.test.tsx tests/components/KvSyncTest.test.tsx
```

Expected: FAIL because `FullFramePortrait` does not exist and the current renderer still exposes the R3 name and contain geometry.

- [ ] **Step 3: Create the revision-neutral renderer**

Move `R3Portrait.tsx` to `FullFramePortrait.tsx` through an apply-patch add/delete change and rename:

```ts
export interface FrameDiagnostics { /* existing five fields */ }
interface FullFramePortraitProps { /* existing five props */ }
export default function FullFramePortrait(/* existing props */) { /* ... */ }
```

Set the default label to `Interactive full-frame KV portrait`.

In `drawFrame`, replace `containRect` with:

```ts
const destination = coverRect(
  KV_SYNC_WIDTH,
  KV_SYNC_HEIGHT,
  canvas.width,
  canvas.height,
  KV_SYNC_HEAD_ANCHOR,
);
```

In `pointerTarget`, do not reuse the cropped draw rectangle. Calculate the visible anchor directly from the viewport:

```ts
const anchor = {
  x: bounds.left + bounds.width * KV_SYNC_HEAD_ANCHOR.x,
  y: bounds.top + bounds.height * KV_SYNC_HEAD_ANCHOR.y,
};
const normalizedX = (pointer.x - anchor.x) / bounds.width;
const normalizedY = (pointer.y - anchor.y) / bounds.height;
```

This preserves exact pointer directions even when top/bottom or left/right source pixels are cropped.

- [ ] **Step 4: Update both consumers and desktop naming**

In `KvSyncTest.tsx`, import `FullFramePortrait` and `FrameDiagnostics`.

In `PortfolioHome.tsx`:

- import `FullFramePortrait`;
- rename `useDesktopR3` to `useDesktopFullFrame`;
- rename local `desktopR3` to `desktopFullFrame`;
- keep the same 768 px query and the same mobile fallback;
- render `<FullFramePortrait ... />` on desktop.

Delete `R3Portrait.tsx` and its old test after the new component is referenced everywhere.

- [ ] **Step 5: Run component tests and verify GREEN**

Run:

```bash
npm test -- tests/components/FullFramePortrait.test.tsx tests/components/PortfolioHome.test.tsx tests/components/KvSyncTest.test.tsx tests/components/ProjectSelector.test.tsx tests/unit/state.test.ts
```

Expected: all tests pass; desktop uses the generic R4 renderer, mobile uses `Interactive CRT portrait`, and BUSINESS still targets frame 134.

- [ ] **Step 6: Commit the renderer integration**

```bash
git add components/portfolio tests/components
git commit -m "feat: render the R4 KV edge to edge on desktop"
```

---

### Task 4: Verify multi-size fullscreen behavior and transitions

**Files:**
- Modify: `tests/e2e/portfolio.spec.ts`
- Modify: `tests/e2e/kv-sync-test.spec.ts`
- Modify only if an observed regression requires it: `components/portfolio/FullFramePortrait.tsx`, `components/portfolio/PortfolioHome.tsx`, or `components/portfolio/portfolio.module.css`

**Interfaces:**
- Consumes: the production Canvas data attributes, R4 renderer accessible name, and existing routes.
- Produces: regression coverage across standard and wide desktop aspect ratios.

- [ ] **Step 1: Update the browser tests for R4 and multiple viewports**

Change the desktop portrait query to:

```ts
page.getByRole("img", { name: "Interactive full-frame KV portrait" });
```

Run the free-pointer and five-project frame assertions at 1920 × 1080. Derive pointer coordinates from the R4 anchor:

```ts
const anchor = { x: 1920 * 0.614, y: 1080 * 0.478 };
```

Add a viewport table for 1920 × 1080, 1440 × 900, 1440 × 960, and 1470 × 630. For each viewport, navigate to `/`, wait for `data-loaded="193"`, and assert:

```ts
const box = await portrait.boundingBox();
expect(box).toMatchObject({ x: 0, y: 0, width, height });
await expect(portrait).toHaveAttribute("data-errors", "0");
```

Update the transition query regex to accept `Interactive full-frame KV portrait` on desktop and `Interactive CRT portrait` on mobile. Update `/kv-sync-test` expectations to R4 dimensions and the shared generic renderer.

- [ ] **Step 2: Run desktop E2E and correct only observed failures**

Run against a free local validation port:

```bash
npx playwright test tests/e2e/portfolio.spec.ts tests/e2e/kv-sync-test.spec.ts --project=desktop
```

Expected: all R4 loading, pointer, fixed-frame, fullscreen box, diagnostic-route, and transition assertions pass.

- [ ] **Step 3: Run the complete automated verification**

Run separately:

```bash
npm test
npm run lint
npm run build
git diff --check
```

Expected: zero test failures, zero lint errors, successful Next.js build, and no whitespace errors.

- [ ] **Step 4: Perform visual acceptance at the four desktop sizes**

Use agent-browser against the running preview. At 1920 × 1080, 1440 × 900, 1440 × 960, and 1470 × 630 verify:

- no blank bands at any edge;
- no image stretching;
- screen/head focal position remains stable;
- header, copy, rulers, and controls remain above the KV;
- no Next.js error overlay or console error;
- open and close transitions remain visible.

Save screenshots to:

```text
/private/tmp/r4-home-1920x1080.png
/private/tmp/r4-home-1440x900.png
/private/tmp/r4-home-1440x960.png
/private/tmp/r4-home-1470x630.png
/private/tmp/r4-transition.png
```

- [ ] **Step 5: Commit final browser regression coverage**

```bash
git add tests/e2e/portfolio.spec.ts tests/e2e/kv-sync-test.spec.ts
git commit -m "test: verify R4 desktop fullscreen behavior"
```

## Completion Criteria

- Checked-in WebP frames and manifest come from the locked R4 source.
- Every desktop viewport is covered edge-to-edge; 16:9 is uncropped and other ratios crop around the R4 focal anchor.
- Pointer edge directions and all five project poses match the visually inspected R4 frames.
- Formal home and `/kv-sync-test` use the same revision-neutral renderer.
- Mobile stays on the legacy transparent portrait.
- Existing page transitions, full tests, lint, production build, browser console, and four visual sizes are clean.
