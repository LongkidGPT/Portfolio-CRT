# Home Idle State and Contact Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a true neutral desktop selector state, eliminate pointer-focus residue after overlay navigation, and make the three supplied Contact icons copy approved values with temporary feedback.

**Architecture:** Keep the last previewed project content in the existing reducer, but add a nullable `previewedProject` visual state in `PortfolioHome` so button/ruler activation exists only during hover, touch preview, or keyboard focus. Isolate clipboard behavior in a tested helper and a focused `ContactActions` component, then mount it inside `PortfolioChrome`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright.

## Global Constraints

- Desktop home-page details only; mobile layout and case-page content remain unchanged.
- Neutral state shows all supplied default button artwork and nine equal short lines on both rulers.
- Pointer navigation must not leave a stale outline, while keyboard `:focus-visible` remains intact.
- Exact copied values are `longkid@sohu.com`, `18520224719`, and `lkchat1980`.
- Supplied 48×48 transparent PNG artwork must be used without redrawing.
- Existing R4 full-screen rendering, portrait mapping, reel animation, and overlay transitions must not regress.

---

### Task 1: Neutral selector, ruler, and navigation focus

**Files:**
- Modify: `tests/unit/interactions.test.ts`
- Modify: `tests/components/ProjectSelector.test.tsx`
- Modify: `lib/portfolio/interactions.ts`
- Modify: `components/portfolio/PortfolioChrome.tsx`
- Modify: `components/portfolio/ProjectSelector.tsx`
- Modify: `components/portfolio/PortfolioHome.tsx`
- Modify: `components/portfolio/portfolio.module.css`

**Interfaces:**
- `rulerWidthsForIndex(projectIndex: number | null, side: "left" | "right"): number[]` returns nine `18` pixel widths for `null`, otherwise the existing indexed profile.
- `ProjectSelector` receives `previewedProject: ProjectId | null` in addition to `activeProject` and marks only that project with `data-previewed`.
- `PortfolioChrome` receives `activeIndex: number | null`.

- [ ] **Step 1: Write failing neutral-state and focus tests**

Add this unit case:

```ts
it("returns equal short lines when no project is previewed", () => {
  expect(rulerWidthsForIndex(null, "left")).toEqual(Array(9).fill(18));
  expect(rulerWidthsForIndex(null, "right")).toEqual(Array(9).fill(18));
});
```

Update every `ProjectSelector` render to pass `previewedProject`. Replace the old `aria-current` assertion with:

```tsx
expect(business).toHaveAttribute("data-previewed");
expect(screen.getByRole("link", { name: "Open ABOUT" })).not.toHaveAttribute("data-previewed");
expect(business).not.toHaveAttribute("aria-current");
```

Add pointer and keyboard focus cases:

```tsx
test("pointer activation blurs before opening", async () => {
  renderSelector({ previewedProject: "business" });
  const business = screen.getByRole("link", { name: "Open BUSINESS" });
  business.focus();
  await userEvent.click(business);
  expect(business).not.toHaveFocus();
});

test("keyboard activation preserves keyboard focus", async () => {
  renderSelector({ previewedProject: "business" });
  const business = screen.getByRole("link", { name: "Open BUSINESS" });
  business.focus();
  fireEvent.click(business, { detail: 0 });
  expect(business).toHaveFocus();
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
npm test -- tests/unit/interactions.test.ts tests/components/ProjectSelector.test.tsx
```

Expected: failures because `null` is not supported, `previewedProject`/`data-previewed` do not exist, and pointer click does not blur.

- [ ] **Step 3: Implement the minimal neutral visual state**

In `interactions.ts`, return `Array.from({ length: 9 }, () => 18)` for `projectIndex === null` before clamping.

In `PortfolioHome`, add:

```ts
const [previewedProject, setPreviewedProject] = useState<ProjectId | null>(null);
```

Set it in `preview`, clear it alongside `focusFrame` in a memoized `resumePointer`, pass the nullable project to `ProjectSelector`, and derive the nullable ruler index for `PortfolioChrome`.

In `ProjectSelector`, keep `activeProject` only for mobile carousel positioning. Replace `aria-current` with:

```tsx
data-previewed={project.id === previewedProject ? "" : undefined}
```

Before `onOpen`, blur only pointer-originated activation:

```ts
if (event.detail > 0) event.currentTarget.blur();
onOpen(project.id);
```

Replace all CSS `[aria-current="page"]` selectors with `[data-previewed]`. Keep `:focus-visible` selectors unchanged so keyboard focus remains visible.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the same focused Vitest command. Expected: all focused tests pass with no warnings.

- [ ] **Step 5: Commit Task 1**

```bash
git add tests/unit/interactions.test.ts tests/components/ProjectSelector.test.tsx lib/portfolio/interactions.ts components/portfolio/PortfolioChrome.tsx components/portfolio/ProjectSelector.tsx components/portfolio/PortfolioHome.tsx components/portfolio/portfolio.module.css
git commit -m "fix: restore neutral home selector state"
```

---

### Task 2: Contact copy actions and supplied artwork

**Files:**
- Create: `lib/portfolio/clipboard.ts`
- Create: `tests/unit/clipboard.test.ts`
- Create: `components/portfolio/ContactActions.tsx`
- Create: `tests/components/ContactActions.test.tsx`
- Copy: `KV首屏/contact icon/Mail (邮件).png` to `public/kv/contact/mail.png`
- Copy: `KV首屏/contact icon/Phone-call (电话呼叫).png` to `public/kv/contact/phone.png`
- Copy: `KV首屏/contact icon/Wechat (微信).png` to `public/kv/contact/wechat.png`
- Modify: `components/portfolio/PortfolioChrome.tsx`
- Modify: `components/portfolio/portfolio.module.css`

**Interfaces:**
- `copyText(value: string): Promise<void>` uses `navigator.clipboard.writeText` when available and a hidden textarea plus `document.execCommand("copy")` fallback otherwise.
- `ContactActions` owns the three exact values and temporary shared feedback state.

- [ ] **Step 1: Write failing clipboard tests**

Create native and fallback cases:

```ts
it("writes through the Clipboard API", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { clipboard: { writeText } });
  await copyText("longkid@sohu.com");
  expect(writeText).toHaveBeenCalledWith("longkid@sohu.com");
});

it("falls back to execCommand when Clipboard API is unavailable", async () => {
  const execCommand = vi.fn(() => true);
  Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand });
  await copyText("lkchat1980");
  expect(execCommand).toHaveBeenCalledWith("copy");
  expect(document.querySelector("textarea")).toBeNull();
});
```

- [ ] **Step 2: Run the clipboard test and verify RED**

Run `npm test -- tests/unit/clipboard.test.ts`. Expected: module-not-found failure because the helper does not exist.

- [ ] **Step 3: Implement `copyText` and verify GREEN**

Implement Clipboard API first, then a temporary readonly off-screen textarea fallback that selects, calls `execCommand("copy")`, removes itself in `finally`, and rejects if copying returns `false`.

Run `npm test -- tests/unit/clipboard.test.ts`. Expected: both cases pass.

- [ ] **Step 4: Write failing Contact component tests**

Test the exact three buttons and values, plus timer feedback:

```tsx
expect(screen.getByRole("button", { name: "Copy email address" })).toBeVisible();
expect(screen.getByRole("button", { name: "Copy phone number" })).toBeVisible();
expect(screen.getByRole("button", { name: "Copy WeChat ID" })).toBeVisible();

await userEvent.click(screen.getByRole("button", { name: "Copy email address" }));
expect(copyText).toHaveBeenCalledWith("longkid@sohu.com");
expect(screen.getByText("COPIED")).toBeVisible();
```

Use fake timers to advance `1200ms` and assert the label clears. Repeat value assertions for phone and WeChat.

- [ ] **Step 5: Run the component test and verify RED**

Run `npm test -- tests/components/ContactActions.test.tsx`. Expected: module-not-found failure because the component does not exist.

- [ ] **Step 6: Add assets and implement ContactActions**

Copy the exact source PNGs to the public paths. Implement a semantic three-button row using standard `<img>` elements so the source pixels are not transformed by optimization. Await `copyText`, set `copied` to the action label, reset the existing timer, and clear it after `1200ms`; clean up the timer on unmount.

Mount `ContactActions` below `CONTACT` in `PortfolioChrome`. Style buttons as transparent, borderless controls; render icons at `clamp(14px, 0.95vw, 18px)`; add a subtle opacity hover/focus state; place a compact `COPIED` label adjacent without shifting the header grid.

- [ ] **Step 7: Run component and unit tests and verify GREEN**

Run:

```bash
npm test -- tests/unit/clipboard.test.ts tests/components/ContactActions.test.tsx
```

Expected: all Contact tests pass with no act warnings.

- [ ] **Step 8: Commit Task 2**

```bash
git add lib/portfolio/clipboard.ts tests/unit/clipboard.test.ts components/portfolio/ContactActions.tsx tests/components/ContactActions.test.tsx components/portfolio/PortfolioChrome.tsx components/portfolio/portfolio.module.css public/kv/contact
git commit -m "feat: add contact copy actions"
```

---

### Task 3: Browser regression coverage and full verification

**Files:**
- Modify: `tests/e2e/portfolio.spec.ts`

**Interfaces:**
- Uses the final DOM contracts: `data-previewed`, ruler `style.width`, accessible Contact button names, and existing project routes.

- [ ] **Step 1: Write the failing desktop browser scenario**

Add a desktop-only test that:

```ts
await page.goto("/");
const links = page.getByRole("navigation", { name: "Portfolio projects" }).getByRole("link");
await expect(links.locator("[data-previewed]")).toHaveCount(0);

const widths = await page.locator('[aria-hidden="true"][data-side="left"] span').evaluateAll(
  (lines) => lines.map((line) => getComputedStyle(line).width),
);
expect(new Set(widths).size).toBe(1);

await page.getByRole("link", { name: "Open BUSINESS" }).hover();
await expect(page.getByRole("link", { name: "Open BUSINESS" })).toHaveAttribute("data-previewed", "");

await page.mouse.move(200, 180);
await expect(links.locator("[data-previewed]")).toHaveCount(0);
```

Extend the overlay return flow to assert that `document.activeElement` is not the clicked project link and its computed outline style is `none` after returning.

Grant clipboard permissions, click each Contact button, and assert `navigator.clipboard.readText()` equals the exact approved value after each click.

- [ ] **Step 2: Run the new E2E case and verify RED if any contract is missing**

Run `npm run test:e2e -- tests/e2e/portfolio.spec.ts --project=desktop`. Expected before final wiring: failures identify any missing neutral or clipboard browser behavior.

- [ ] **Step 3: Make only the browser-level corrections required by the failing assertions**

Adjust selectors, pointer-leave handling, or feedback positioning only where the browser test exposes a real integration defect. Do not change the approved interaction model.

- [ ] **Step 4: Run complete verification**

Run, in order:

```bash
npm test
npm run lint
npm run build
npm run test:e2e -- --project=desktop
```

Expected: all Vitest and Playwright tests pass, ESLint exits zero, and the Next.js production build succeeds without hydration or console errors.

- [ ] **Step 5: Visual desktop inspection**

At `1920×1080` and `2048×852`, capture initial idle, one active hover, Contact copied feedback, and post-overlay-return states. Confirm R4 remains edge-to-edge and compare neutral/hover rulers against `https://toddham.com/`.

- [ ] **Step 6: Commit Task 3**

```bash
git add tests/e2e/portfolio.spec.ts
git commit -m "test: cover home idle and contact interactions"
```
