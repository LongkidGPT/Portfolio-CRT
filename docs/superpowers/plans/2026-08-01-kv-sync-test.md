# KV Full-Frame Sync Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated desktop test page that maps pointer direction to all 193 original video frames so the robot pose and monitor imagery always come from the same source frame.

**Architecture:** A dedicated asset script extracts all 193 full-background frames from the named MP4 into an isolated public directory. A pure mapping module converts pointer angles to source-frame indices, while a client Canvas component preloads and draws those frames on `/kv-sync-test`; the production homepage and its 72 transparent frames remain untouched.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Canvas 2D, FFmpeg, cwebp, Vitest, Testing Library, Playwright.

## Global Constraints

- Use only `KV首屏/首屏头部转动效果（需要除背景）.mp4` as the source.
- Preserve all 193 source frames at 1470 × 630; do not downsample the frame count and do not remove the background.
- Implement only the desktop validation route `/kv-sync-test`.
- Do not modify the formal homepage, its 72 transparent frames, mobile layout, or five-button behavior.
- A selected frame must contain both the robot direction and monitor imagery from the same source frame.

---

### Task 1: Generate the isolated 193-frame asset sequence

**Files:**
- Create: `tests/unit/kv-sync-assets.test.ts`
- Create: `scripts/build-kv-sync-test-assets.mjs`
- Modify: `package.json`
- Generate: `public/kv-sync-test/frames/frame-000.webp` through `frame-192.webp`
- Generate: `public/kv-sync-test/manifest.json`

**Interfaces:**
- Consumes: `../KV首屏/首屏头部转动效果（需要除背景）.mp4`
- Produces: manifest `{ frameCount: 193, width: 1470, height: 630, frameRate: number, framePattern: "/kv-sync-test/frames/frame-%03d.webp" }`

- [ ] **Step 1: Write the failing asset contract test**

```ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("KV full-frame sync assets", () => {
  const root = join(process.cwd(), "public", "kv-sync-test");

  it("contains the complete original video sequence", () => {
    const manifest = JSON.parse(
      readFileSync(join(root, "manifest.json"), "utf8"),
    );

    expect(manifest).toMatchObject({
      frameCount: 193,
      width: 1470,
      height: 630,
      framePattern: "/kv-sync-test/frames/frame-%03d.webp",
    });

    for (let index = 0; index < 193; index += 1) {
      expect(
        existsSync(
          join(root, "frames", `frame-${String(index).padStart(3, "0")}.webp`),
        ),
      ).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run the asset test and verify RED**

Run: `npm test -- --run tests/unit/kv-sync-assets.test.ts`

Expected: FAIL because `public/kv-sync-test/manifest.json` does not exist.

- [ ] **Step 3: Implement the extraction script**

Create `scripts/build-kv-sync-test-assets.mjs` that:

1. Verifies the source filename and probes width, height, frame rate, and `nb_frames` using `ffprobe -count_frames`.
2. Rejects any source that is not 1470 × 630 or does not contain exactly 193 decoded frames.
3. Extracts every source frame with `ffmpeg -vsync 0` into a temporary directory.
4. Compresses each PNG with `cwebp -q 78 -m 6` into `public/kv-sync-test/frames` without changing dimensions.
5. Writes the exact manifest interface above and removes its temporary directory in `finally`.

Add this script to `package.json`:

```json
"assets:kv-sync-test": "node scripts/build-kv-sync-test-assets.mjs"
```

- [ ] **Step 4: Generate assets and verify GREEN**

Run: `npm run assets:kv-sync-test`

Expected: output confirms `Generated 193 full-frame KV sync assets`.

Run: `npm test -- --run tests/unit/kv-sync-assets.test.ts`

Expected: PASS with 193 continuous frame files.

- [ ] **Step 5: Commit the isolated asset pipeline**

```bash
git add package.json scripts/build-kv-sync-test-assets.mjs tests/unit/kv-sync-assets.test.ts public/kv-sync-test
git commit -m "test: add complete KV source-frame sequence"
```

---

### Task 2: Map pointer angles to the original 193-frame direction ring

**Files:**
- Create: `lib/portfolio/kv-sync-test.ts`
- Create: `tests/unit/kv-sync-test.test.ts`

**Interfaces:**
- Consumes: `shortestFrameDelta(target: number, current: number, count: number)` from `lib/portfolio/sprite.ts`
- Produces: `kvSyncFrameSrc(index: number): string`
- Produces: `frameForKvSyncAngle(angle: number): number`
- Produces: `KV_SYNC_HEAD_ANCHOR = { x: 0.5, y: 0.33 }`

- [ ] **Step 1: Write failing mapping tests**

```ts
import { describe, expect, it } from "vitest";
import {
  frameForKvSyncAngle,
  kvSyncFrameSrc,
  KV_SYNC_FRAME_COUNT,
} from "@/lib/portfolio/kv-sync-test";

describe("full-frame KV direction mapping", () => {
  it("addresses every original source frame", () => {
    expect(KV_SYNC_FRAME_COUNT).toBe(193);
    expect(kvSyncFrameSrc(0)).toBe("/kv-sync-test/frames/frame-000.webp");
    expect(kvSyncFrameSrc(192)).toBe("/kv-sync-test/frames/frame-192.webp");
    expect(kvSyncFrameSrc(193)).toBe("/kv-sync-test/frames/frame-000.webp");
  });

  it("maps cardinal pointer directions to the calibrated source timeline", () => {
    expect(frameForKvSyncAngle(0)).toBe(138);
    expect(frameForKvSyncAngle(90)).toBe(30);
    expect(frameForKvSyncAngle(180)).toBe(65);
    expect(frameForKvSyncAngle(270)).toBe(103);
    expect(frameForKvSyncAngle(360)).toBe(138);
  });
});
```

- [ ] **Step 2: Run the mapping test and verify RED**

Run: `npm test -- --run tests/unit/kv-sync-test.test.ts`

Expected: FAIL because `@/lib/portfolio/kv-sync-test` does not exist.

- [ ] **Step 3: Implement the minimal mapping module**

Use these calibrated full-source keys, converted from the verified 72-frame direction map:

```ts
export const KV_SYNC_FRAME_COUNT = 193;
export const KV_SYNC_WIDTH = 1470;
export const KV_SYNC_HEIGHT = 630;
export const KV_SYNC_NEUTRAL_FRAME = 174;
export const KV_SYNC_HEAD_ANCHOR = { x: 0.5, y: 0.33 } as const;

const FULL_FRAME_KEYS = [
  [0, 138],
  [45, 162],
  [90, 30],
  [135, 49],
  [180, 65],
  [225, 84],
  [270, 103],
  [315, 119],
  [360, 138],
] as const;
```

`frameForKvSyncAngle` must normalize the angle, interpolate between adjacent keys using `shortestFrameDelta(..., 193)`, and return a rounded integer from 0 through 192. `kvSyncFrameSrc` must normalize negative and overflowing indices.

- [ ] **Step 4: Run the mapping test and verify GREEN**

Run: `npm test -- --run tests/unit/kv-sync-test.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the source-frame mapping**

```bash
git add lib/portfolio/kv-sync-test.ts tests/unit/kv-sync-test.test.ts
git commit -m "test: map pointer directions to original KV frames"
```

---

### Task 3: Build the isolated Canvas validation route

**Files:**
- Create: `app/kv-sync-test/page.tsx`
- Create: `components/portfolio/KvSyncTest.tsx`
- Create: `components/portfolio/kv-sync-test.module.css`
- Create: `tests/components/KvSyncTest.test.tsx`
- Create: `tests/e2e/kv-sync-test.spec.ts`

**Interfaces:**
- Consumes: `frameForKvSyncAngle`, `kvSyncFrameSrc`, `KV_SYNC_*` constants from Task 2
- Consumes: `pointerAngle(point, anchor)` and `containRect(...)` from existing portfolio helpers
- Produces: a route whose Canvas exposes `data-frame`, `data-loaded`, and `data-errors` for inspection

- [ ] **Step 1: Write the failing component test**

The test must mock `Image`, Canvas 2D, `requestAnimationFrame`, and a 1470 × 630 canvas boundary, then assert:

```ts
render(<KvSyncTest />);

expect(screen.getByRole("img", { name: "Full-frame KV synchronization test" }))
  .toHaveAttribute("data-frame", "174");
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

- [ ] **Step 2: Run the component test and verify RED**

Run: `npm test -- --run tests/components/KvSyncTest.test.tsx`

Expected: FAIL because `KvSyncTest` does not exist.

- [ ] **Step 3: Implement the route and Canvas component**

`KvSyncTest` must:

1. Load frame 174 first, then preload remaining frames by circular distance from 174.
2. Record the latest fine-pointer coordinates from a window `pointermove` listener.
3. Compute the interaction anchor from the contained 1470 × 630 frame and `KV_SYNC_HEAD_ANCHOR`.
4. Convert the current pointer angle to one full source frame with `frameForKvSyncAngle`.
5. Draw only when the target image is complete; otherwise retain the previously drawn valid frame.
6. Update `data-frame`, `data-loaded`, and `data-errors` after every successful load or draw.
7. Display a small diagnostic panel with angle, frame number, loaded count, and error count.
8. Remove all listeners, image callbacks, observers, and animation frames on unmount.

The CSS must fill the viewport, use `#eceeed` behind the contained source frame, keep the Canvas non-interactive, and show diagnostics above it without recreating formal homepage styling.

`app/kv-sync-test/page.tsx` must only render `<KvSyncTest />` and set route metadata to `KV Sync Test`.

- [ ] **Step 4: Run the component test and verify GREEN**

Run: `npm test -- --run tests/components/KvSyncTest.test.tsx`

Expected: PASS.

- [ ] **Step 5: Add the failing route-level browser test**

```ts
import { expect, test } from "@playwright/test";

test("renders a complete source frame on the isolated sync route", async ({ page }) => {
  await page.setViewportSize({ width: 1470, height: 630 });
  await page.goto("/kv-sync-test");

  const canvas = page.getByRole("img", {
    name: "Full-frame KV synchronization test",
  });
  await expect(canvas).toHaveAttribute("data-frame", /\d+/);
  await expect(canvas).toHaveAttribute("data-loaded", /[1-9]\d*/);
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
});
```

- [ ] **Step 6: Run the browser test and verify behavior**

Run: `npx playwright test tests/e2e/kv-sync-test.spec.ts --project=desktop`

Expected: PASS after the route implementation exists. Move the pointer to the four viewport corners and verify `data-frame` changes without becoming empty.

- [ ] **Step 7: Commit the isolated test route**

```bash
git add app/kv-sync-test components/portfolio/KvSyncTest.tsx components/portfolio/kv-sync-test.module.css tests/components/KvSyncTest.test.tsx tests/e2e/kv-sync-test.spec.ts
git commit -m "test: add full-frame KV synchronization route"
```

---

### Task 4: Verify isolation and hand off the test URL

**Files:**
- Verify only; no production homepage files should change in this task.

**Interfaces:**
- Consumes: completed `/kv-sync-test` route and generated 193-frame assets
- Produces: browser evidence and a local preview URL for user evaluation

- [ ] **Step 1: Confirm the formal homepage diff is empty**

Run: `git diff HEAD~3 -- app/page.tsx components/portfolio/PortfolioHome.tsx components/portfolio/SpritePortrait.tsx components/portfolio/portfolio.module.css public/kv/frames`

Expected: no output.

- [ ] **Step 2: Run all automated checks**

Run: `npm test`

Expected: all Vitest suites pass.

Run: `npm run lint`

Expected: exit code 0 with no ESLint errors.

Run: `npm run build`

Expected: production build succeeds and lists `/kv-sync-test`.

Run: `npm run test:e2e`

Expected: all configured desktop tests pass; device-specific skips remain skips.

- [ ] **Step 3: Perform the desktop visual check**

Start: `npm run dev -- --hostname 127.0.0.1 --port 4178`

Open: `http://127.0.0.1:4178/kv-sync-test`

Check at 1470 × 630 and 2048 × 853:

- the entire source video frame is visible;
- the diagnostic frame number changes at each corner;
- the monitor imagery changes together with the robot pose;
- no white frame or error overlay appears during rapid pointer movement.

- [ ] **Step 4: Commit any verification-only test adjustment**

If no adjustment is needed, do not create an empty commit. If an assertion needed correction, stage only that test and commit with:

```bash
git commit -m "test: verify full-frame KV sync behavior"
```
