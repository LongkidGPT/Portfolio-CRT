# Portfolio 2.0 Interactive Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved five-entry Portfolio 2.0 homepage, responsive sprite interaction, shareable full-screen case overlays, and placeholder case templates in the existing Next.js application.

**Architecture:** Use the Next.js 16 App Router with a root `@overlay` parallel slot and intercepted routes so soft navigation opens a modal above the preserved homepage while direct navigation renders a standalone case page. Keep project data, sprite math, overlay behavior, and page templates in focused modules; use Framer Motion only for orchestrated transitions and CSS for layout and low-cost micro-interactions.

**Tech Stack:** Next.js 16.2.10, React 19.2.4, TypeScript 5, Framer Motion 12, Tailwind CSS 4 plus CSS Modules, Vitest, React Testing Library, Playwright.

## Global Constraints

- The desktop composition source of truth is `/Users/jade/Desktop/24559704.png`.
- First release entries are exactly `ABOUT`, `BUSINESS`, `BRAND SYSTEM`, `PRODUCT LAUNCH`, and `LAUNCH EVENT`.
- Shareable paths are exactly `/about`, `/work/business`, `/work/brand-system`, `/work/product-launch`, and `/work/launch-event`.
- Use the existing 64-frame robot sprite; do not introduce Three.js or a realtime 3D model.
- First release uses explicit labeled media placeholders; it does not invent final project content.
- Desktop-first verification targets are 2560×1440, 1920×1080, and 2048×852.
- Downward compatibility verification includes 1440×900, 1280×800, 1024×1366, 768×1024, 430×932, 390×844, and 375×812.
- Respect `prefers-reduced-motion`, keyboard navigation, visible focus, dialog semantics, focus restoration, and scroll locking.
- Preserve existing uncommitted work unless a file is explicitly listed in a task.
- Follow the local Next.js 16 documentation in `node_modules/next/dist/docs/`; use App Router APIs from `next/navigation`.

---

## File Structure

### Application routes

- `app/layout.tsx` — root layout and `@overlay` slot.
- `app/page.tsx` — server entry for the preserved homepage.
- `app/about/page.tsx` — standalone About route for direct navigation.
- `app/work/[slug]/page.tsx` — standalone project route for direct navigation.
- `app/@overlay/default.tsx` — empty parallel-slot fallback.
- `app/@overlay/page.tsx` — empty overlay at `/`.
- `app/@overlay/(.)about/page.tsx` — intercepted About overlay.
- `app/@overlay/(.)work/[slug]/page.tsx` — intercepted project overlay.
- `app/not-found.tsx` — invalid project route response.

### Portfolio modules

- `components/portfolio/PortfolioHome.tsx` — client-side homepage state coordinator.
- `components/portfolio/PortfolioChrome.tsx` — top navigation, rulers, resolution and clock.
- `components/portfolio/SpritePortrait.tsx` — Canvas sprite renderer.
- `components/portfolio/ProjectPreview.tsx` — active project metadata.
- `components/portfolio/ProjectSelector.tsx` — desktop buttons and mobile carousel.
- `components/portfolio/CaseOverlay.tsx` — accessible modal shell and close behavior.
- `components/portfolio/CasePage.tsx` — standalone case page shell.
- `components/portfolio/CaseTemplate.tsx` — shared project placeholder template.
- `components/portfolio/AboutTemplate.tsx` — About placeholder template.
- `components/portfolio/MediaPlaceholder.tsx` — ratio-safe labeled media placeholder.
- `components/portfolio/portfolio.module.css` — all feature-specific layout and motion.

### Data and pure logic

- `lib/portfolio/projects.ts` — project registry and lookup functions.
- `lib/portfolio/state.ts` — overlay phase reducer.
- `lib/portfolio/sprite.ts` — frame interpolation and pointer-angle math.

### Assets and tests

- `public/sprite/robot.webp` — copied from the existing 64-frame sprite sheet.
- `vitest.config.mts` — jsdom unit-test configuration.
- `vitest.setup.ts` — DOM cleanup and matchers.
- `playwright.config.ts` — production-build E2E configuration.
- `tests/unit/projects.test.ts` — project registry contract.
- `tests/unit/state.test.ts` — interaction phase contract.
- `tests/unit/sprite.test.ts` — sprite math.
- `tests/components/ProjectSelector.test.tsx` — selector accessibility and state changes.
- `tests/components/CaseOverlay.test.tsx` — Escape, focus, and scroll-lock behavior.
- `tests/e2e/portfolio.spec.ts` — routing and interaction flow.
- `tests/e2e/responsive.spec.ts` — representative viewport assertions and screenshots.

---

### Task 1: Test Foundation, Project Registry, and State Machine

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.mts`
- Create: `vitest.setup.ts`
- Create: `lib/portfolio/projects.ts`
- Create: `lib/portfolio/state.ts`
- Create: `tests/unit/projects.test.ts`
- Create: `tests/unit/state.test.ts`

**Interfaces:**
- Produces: `ProjectId`, `ProjectDefinition`, `PROJECTS`, `getProjectById(id)`, `getProjectByPath(pathname)`.
- Produces: `OverlayPhase`, `PortfolioState`, `PortfolioAction`, `portfolioReducer(state, action)`.
- Consumes: none.

- [ ] **Step 1: Install the test dependencies**

Run:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event vite-tsconfig-paths @playwright/test
```

Add scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 2: Configure Vitest**

Create `vitest.config.mts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/components/**/*.test.tsx"],
  },
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());
```

- [ ] **Step 3: Write failing project-registry tests**

Create `tests/unit/projects.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  PROJECTS,
  getProjectById,
  getProjectByPath,
} from "@/lib/portfolio/projects";

describe("project registry", () => {
  it("exposes the approved five entries in the approved order", () => {
    expect(PROJECTS.map((project) => project.id)).toEqual([
      "about",
      "business",
      "brand-system",
      "product-launch",
      "launch-event",
    ]);
  });

  it("maps every shareable path back to its project", () => {
    for (const project of PROJECTS) {
      expect(getProjectByPath(project.href)?.id).toBe(project.id);
      expect(getProjectById(project.id).href).toBe(project.href);
    }
  });

  it("returns undefined for an unsupported path", () => {
    expect(getProjectByPath("/work/unknown")).toBeUndefined();
  });
});
```

- [ ] **Step 4: Run the registry tests and verify RED**

Run:

```bash
npm test -- tests/unit/projects.test.ts
```

Expected: FAIL because `@/lib/portfolio/projects` does not exist.

- [ ] **Step 5: Implement the project registry**

Create `lib/portfolio/projects.ts` with:

```ts
export type ProjectId =
  | "about"
  | "business"
  | "brand-system"
  | "product-launch"
  | "launch-event";

export interface MediaSlot {
  id: string;
  label: string;
  ratio: "16:9" | "3:2" | "1:1";
  recommendation: string;
}

export interface ProjectDefinition {
  id: ProjectId;
  label: string;
  title: string;
  year: string;
  summary: string;
  href: "/about" | `/work/${Exclude<ProjectId, "about">}`;
  kind: "about" | "case";
  media: MediaSlot[];
}

export const PROJECTS: readonly ProjectDefinition[] = [
  {
    id: "about",
    label: "ABOUT",
    title: "Kid Long",
    year: "2007—Present",
    summary: "Profile, capabilities, experience and contact.",
    href: "/about",
    kind: "about",
    media: [],
  },
  {
    id: "business",
    label: "BUSINESS",
    title: "Business Context",
    year: "IFA 2025",
    summary: "Business objectives, project framing and design requirements.",
    href: "/work/business",
    kind: "case",
    media: [
      { id: "hero", label: "HERO IMAGE", ratio: "16:9", recommendation: "2560×1440" },
      { id: "process", label: "PROCESS DIAGRAM", ratio: "3:2", recommendation: "2400×1600" },
    ],
  },
  {
    id: "brand-system",
    label: "BRAND SYSTEM",
    title: "Mother & Sub-brand System",
    year: "IFA 2025",
    summary: "A visual relationship system for Anker and SOLIX.",
    href: "/work/brand-system",
    kind: "case",
    media: [
      { id: "hero", label: "HERO IMAGE", ratio: "16:9", recommendation: "2560×1440" },
      { id: "system", label: "SYSTEM DIAGRAM", ratio: "3:2", recommendation: "2400×1600" },
    ],
  },
  {
    id: "product-launch",
    label: "PRODUCT LAUNCH",
    title: "SOLIX Product Launch",
    year: "IFA 2025",
    summary: "Launch communication, product value and DTC structure.",
    href: "/work/product-launch",
    kind: "case",
    media: [
      { id: "hero", label: "HERO IMAGE", ratio: "16:9", recommendation: "2560×1440" },
      { id: "video", label: "VIDEO", ratio: "16:9", recommendation: "MP4 OR WEBM" },
    ],
  },
  {
    id: "launch-event",
    label: "LAUNCH EVENT",
    title: "IFA Launch Event",
    year: "IFA 2025",
    summary: "Key visual, event narrative and multi-touchpoint content.",
    href: "/work/launch-event",
    kind: "case",
    media: [
      { id: "hero", label: "HERO IMAGE", ratio: "16:9", recommendation: "2560×1440" },
      { id: "stage", label: "EVENT SYSTEM", ratio: "3:2", recommendation: "2400×1600" },
    ],
  },
] as const;

export function getProjectById(id: ProjectId): ProjectDefinition {
  const project = PROJECTS.find((candidate) => candidate.id === id);
  if (!project) throw new Error(`Unknown project: ${id}`);
  return project;
}

export function getProjectByPath(pathname: string): ProjectDefinition | undefined {
  return PROJECTS.find((project) => project.href === pathname);
}
```

- [ ] **Step 6: Run the registry tests and verify GREEN**

Run:

```bash
npm test -- tests/unit/projects.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 7: Write failing state-machine tests**

Create `tests/unit/state.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { initialPortfolioState, portfolioReducer } from "@/lib/portfolio/state";

describe("portfolioReducer", () => {
  it("previews a project without opening it", () => {
    const state = portfolioReducer(initialPortfolioState, {
      type: "PREVIEW",
      projectId: "business",
    });
    expect(state).toMatchObject({ activeProject: "business", phase: "preview" });
  });

  it("moves through zoom, open, and close phases", () => {
    const zooming = portfolioReducer(initialPortfolioState, {
      type: "OPEN_REQUESTED",
      projectId: "brand-system",
    });
    const open = portfolioReducer(zooming, { type: "OPENED" });
    const closing = portfolioReducer(open, { type: "CLOSE_REQUESTED" });
    const idle = portfolioReducer(closing, { type: "CLOSED" });

    expect(zooming.phase).toBe("zooming");
    expect(open.phase).toBe("open");
    expect(closing.phase).toBe("closing");
    expect(idle.phase).toBe("idle");
    expect(idle.activeProject).toBe("brand-system");
  });

  it("ignores a second open request while transitioning", () => {
    const zooming = portfolioReducer(initialPortfolioState, {
      type: "OPEN_REQUESTED",
      projectId: "business",
    });
    const repeated = portfolioReducer(zooming, {
      type: "OPEN_REQUESTED",
      projectId: "launch-event",
    });
    expect(repeated).toEqual(zooming);
  });
});
```

- [ ] **Step 8: Run the state tests and verify RED**

Run:

```bash
npm test -- tests/unit/state.test.ts
```

Expected: FAIL because `@/lib/portfolio/state` does not exist.

- [ ] **Step 9: Implement the reducer**

Create `lib/portfolio/state.ts`:

```ts
import type { ProjectId } from "./projects";

export type OverlayPhase = "idle" | "preview" | "zooming" | "open" | "closing";

export interface PortfolioState {
  activeProject: ProjectId;
  overlayProject: ProjectId | null;
  phase: OverlayPhase;
}

export type PortfolioAction =
  | { type: "PREVIEW"; projectId: ProjectId }
  | { type: "OPEN_REQUESTED"; projectId: ProjectId }
  | { type: "OPENED" }
  | { type: "CLOSE_REQUESTED" }
  | { type: "CLOSED" };

export const initialPortfolioState: PortfolioState = {
  activeProject: "about",
  overlayProject: null,
  phase: "idle",
};

export function portfolioReducer(
  state: PortfolioState,
  action: PortfolioAction,
): PortfolioState {
  switch (action.type) {
    case "PREVIEW":
      if (state.phase === "zooming" || state.phase === "open" || state.phase === "closing") return state;
      return { ...state, activeProject: action.projectId, phase: "preview" };
    case "OPEN_REQUESTED":
      if (state.phase === "zooming" || state.phase === "open" || state.phase === "closing") return state;
      return {
        activeProject: action.projectId,
        overlayProject: action.projectId,
        phase: "zooming",
      };
    case "OPENED":
      return state.phase === "zooming" ? { ...state, phase: "open" } : state;
    case "CLOSE_REQUESTED":
      return state.phase === "open" ? { ...state, phase: "closing" } : state;
    case "CLOSED":
      return { ...state, overlayProject: null, phase: "idle" };
  }
}
```

- [ ] **Step 10: Run all unit tests**

Run:

```bash
npm test
```

Expected: 6 tests PASS.

- [ ] **Step 11: Commit Task 1**

```bash
git add package.json package-lock.json vitest.config.mts vitest.setup.ts lib/portfolio tests/unit
git commit -m "test: add portfolio registry and state foundation"
```

---

### Task 2: Sprite Math, Asset, and Canvas Renderer

**Files:**
- Create: `lib/portfolio/sprite.ts`
- Create: `tests/unit/sprite.test.ts`
- Create: `components/portfolio/SpritePortrait.tsx`
- Create: `public/sprite/robot.webp`

**Interfaces:**
- Consumes: `ProjectId` from Task 1.
- Produces: `frameForAngle(angle)`, `shortestFrameDelta(target, current, count)`, `pointerAngle(point, bounds)`.
- Produces: `<SpritePortrait focusPoint motionReduced className />`.

- [ ] **Step 1: Write failing sprite-math tests**

Create `tests/unit/sprite.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  frameForAngle,
  pointerAngle,
  shortestFrameDelta,
} from "@/lib/portfolio/sprite";

describe("sprite math", () => {
  it("maps cardinal angles to the expected sprite frames", () => {
    expect(frameForAngle(0)).toBe(0);
    expect(frameForAngle(90)).toBeCloseTo(20);
    expect(frameForAngle(180)).toBeCloseTo(38);
    expect(frameForAngle(270)).toBeCloseTo(54);
  });

  it("takes the short path across the frame seam", () => {
    expect(shortestFrameDelta(1, 63, 64)).toBe(2);
    expect(shortestFrameDelta(63, 1, 64)).toBe(-2);
  });

  it("calculates the angle from the sprite center to a point", () => {
    const bounds = { left: 0, top: 0, width: 100, height: 100 };
    expect(pointerAngle({ x: 50, y: 0 }, bounds)).toBeCloseTo(0);
    expect(pointerAngle({ x: 100, y: 50 }, bounds)).toBeCloseTo(90);
  });
});
```

- [ ] **Step 2: Run the sprite tests and verify RED**

Run:

```bash
npm test -- tests/unit/sprite.test.ts
```

Expected: FAIL because `@/lib/portfolio/sprite` does not exist.

- [ ] **Step 3: Implement sprite math**

Create `lib/portfolio/sprite.ts` with the approved angle map:

```ts
const ANGLE_KEYS = [
  [0, 0], [22.5, 5], [45, 10], [67.5, 15], [90, 20],
  [112.5, 25], [135, 30], [157.5, 34], [180, 38],
  [202.5, 42], [225, 46], [247.5, 50], [270, 54],
  [292.5, 58], [315, 61], [337.5, 63], [360, 64],
] as const;

export interface Point { x: number; y: number }
export interface Bounds { left: number; top: number; width: number; height: number }

export function frameForAngle(angle: number): number {
  const normalized = ((angle % 360) + 360) % 360;
  for (let index = 0; index < ANGLE_KEYS.length - 1; index += 1) {
    const [angleA, frameA] = ANGLE_KEYS[index];
    const [angleB, frameB] = ANGLE_KEYS[index + 1];
    if (normalized >= angleA && normalized <= angleB) {
      const progress = (normalized - angleA) / (angleB - angleA);
      return frameA + (frameB - frameA) * progress;
    }
  }
  return 0;
}

export function shortestFrameDelta(target: number, current: number, count: number): number {
  let delta = target - current;
  if (delta > count / 2) delta -= count;
  if (delta < -count / 2) delta += count;
  return delta;
}

export function pointerAngle(point: Point, bounds: Bounds): number {
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  return (Math.atan2(point.x - centerX, -(point.y - centerY)) * 180 / Math.PI + 360) % 360;
}
```

- [ ] **Step 4: Run the sprite tests and verify GREEN**

Run:

```bash
npm test -- tests/unit/sprite.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 5: Copy the approved high-resolution sprite**

Run:

```bash
mkdir -p public/sprite
cp "../gprite.webp" public/sprite/robot.webp
```

Verify:

```bash
file public/sprite/robot.webp
```

Expected: WebP image data with the existing high-resolution sprite sheet.

- [ ] **Step 6: Implement `SpritePortrait`**

Create a client component that:

- uses an 8×8 sheet, 64 frames, and 640px source cells;
- caps Canvas DPR at 2;
- receives a `focusPoint` generated from pointer movement or a project-button center;
- draws only when the rounded frame changes;
- cancels its animation frame and resize observer on unmount;
- stops following when `motionReduced` is true or `document.visibilityState !== "visible"`;
- renders a semantic fallback label: `Interactive CRT portrait`.

Public interface:

```ts
interface SpritePortraitProps {
  focusPoint: { x: number; y: number } | null;
  motionReduced: boolean;
  className?: string;
}
```

- [ ] **Step 7: Run unit tests, lint, and type-aware build**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 8: Commit Task 2**

```bash
git add lib/portfolio/sprite.ts tests/unit/sprite.test.ts components/portfolio/SpritePortrait.tsx public/sprite/robot.webp
git commit -m "feat: add directional sprite portrait"
```

---

### Task 3: Desktop Portfolio Shell and Approved Homepage Composition

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Create: `components/portfolio/PortfolioHome.tsx`
- Create: `components/portfolio/PortfolioChrome.tsx`
- Create: `components/portfolio/ProjectPreview.tsx`
- Create: `components/portfolio/portfolio.module.css`

**Interfaces:**
- Consumes: `PROJECTS`, `ProjectId`, `portfolioReducer`, `SpritePortrait`.
- Produces: `<PortfolioHome />`, the preserved homepage used beneath intercepted overlays.

- [ ] **Step 1: Write a failing homepage component test**

Create `tests/components/PortfolioHome.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import PortfolioHome from "@/components/portfolio/PortfolioHome";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));

test("renders the five approved entries and portfolio identity", () => {
  render(<PortfolioHome />);
  expect(screen.getByText("KID LONG")).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /open/i })).toHaveLength(5);
});
```

- [ ] **Step 2: Run the homepage test and verify RED**

Run:

```bash
npm test -- tests/components/PortfolioHome.test.tsx
```

Expected: FAIL because `PortfolioHome` does not exist.

- [ ] **Step 3: Implement the server page**

Replace `app/page.tsx` with:

```tsx
import PortfolioHome from "@/components/portfolio/PortfolioHome";

export default function HomePage() {
  return <PortfolioHome />;
}
```

- [ ] **Step 4: Implement the homepage coordinator**

`PortfolioHome` must:

- use `useReducer(portfolioReducer, initialPortfolioState)`;
- read `usePathname()` and dispatch `OPENED` when an intercepted route becomes active, then `CLOSED` when navigation returns to `/`;
- listen to pointer movement only on fine-pointer devices;
- pass pointer or selected-button focus coordinates to `SpritePortrait`;
- render `PortfolioChrome`, `ProjectPreview`, `SpritePortrait`, and `ProjectSelector`;
- render five semantic links with exact shareable `href` values;
- prefetch a route only after pointer enter, focus, or touch intent;
- own and clean up the delayed-navigation timer used by the zoom transition;
- add `data-phase` and `data-project` attributes for deterministic animation CSS.

- [ ] **Step 5: Implement `PortfolioChrome`**

Render:

- top-left `KID LONG / VISUAL DESIGNER`;
- center `WORK / ABOUT`;
- contact links with actual `mailto:` and available social destinations;
- Shenzhen GMT+8 clock updated once per minute;
- left and right five-tick rulers;
- bottom-left viewport readout.

The clock must render a stable placeholder during server output and update only after hydration to avoid a mismatch.

- [ ] **Step 6: Implement `ProjectPreview`**

Use a keyed Framer Motion group so title, year, and summary transition together. Keep text motion under 16px and 450ms. Add an `aria-live="polite"` summary for keyboard users without announcing pointer-only churn on every frame.

- [ ] **Step 7: Implement the approved desktop CSS**

In `portfolio.module.css`:

- use a fixed 100dvh shell and match the `24559704.png` wide composition;
- keep the robot stage centered slightly right of the viewport midpoint;
- use cold white/gray tokens and mono metadata;
- position rulers at the viewport edges;
- reserve bottom space for five entries;
- avoid rounded SaaS cards, colored glows, and decorative gradients;
- define visible `:focus-visible` states;
- define phase selectors for `zooming`, `open`, and `closing`.

In `app/globals.css`, retain only global resets, font variables, body background, selection, and reduced-motion defaults. Remove obsolete homepage-specific rules only after the new module renders.

- [ ] **Step 8: Run the homepage test and verify GREEN**

Run:

```bash
npm test -- tests/components/PortfolioHome.test.tsx
```

Expected: PASS with five entry links.

- [ ] **Step 9: Run regression checks**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 10: Commit Task 3**

```bash
git add app/page.tsx app/globals.css components/portfolio/PortfolioHome.tsx components/portfolio/PortfolioChrome.tsx components/portfolio/ProjectPreview.tsx components/portfolio/portfolio.module.css tests/components/PortfolioHome.test.tsx
git commit -m "feat: build portfolio home composition"
```

---

### Task 4: Desktop Selector and Mobile Carousel

**Files:**
- Create: `components/portfolio/ProjectSelector.tsx`
- Create: `tests/components/ProjectSelector.test.tsx`
- Modify: `components/portfolio/PortfolioHome.tsx`
- Modify: `components/portfolio/portfolio.module.css`

**Interfaces:**
- Consumes: `readonly ProjectDefinition[]`, `activeProject`, `onPreview(projectId, focusPoint)`, `onOpen(projectId)`.
- Produces: one selector component with desktop and mobile presentations.

- [ ] **Step 1: Write failing selector tests**

Create `tests/components/ProjectSelector.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import ProjectSelector from "@/components/portfolio/ProjectSelector";
import { PROJECTS } from "@/lib/portfolio/projects";

test("focus previews the selected project", async () => {
  const onPreview = vi.fn();
  render(
    <ProjectSelector
      projects={PROJECTS}
      activeProject="about"
      onPreview={onPreview}
      onOpen={vi.fn()}
    />,
  );
  await userEvent.tab();
  expect(onPreview).toHaveBeenCalledWith("about", expect.any(Object));
});

test("click opens the selected project", async () => {
  const onOpen = vi.fn();
  render(
    <ProjectSelector
      projects={PROJECTS}
      activeProject="about"
      onPreview={vi.fn()}
      onOpen={onOpen}
    />,
  );
  await userEvent.click(screen.getByRole("link", { name: /open business/i }));
  expect(onOpen).toHaveBeenCalledWith("business");
});
```

- [ ] **Step 2: Run selector tests and verify RED**

Run:

```bash
npm test -- tests/components/ProjectSelector.test.tsx
```

Expected: FAIL because `ProjectSelector` does not exist.

- [ ] **Step 3: Implement the desktop selector**

Desktop requirements:

- five equal-width file-style links;
- exact labels from `PROJECTS`;
- pointer enter and keyboard focus both call `onPreview`;
- center coordinates come from `getBoundingClientRect()`;
- active entry uses `aria-current="page"`;
- each item remains a semantic Next.js link with its real `href`;
- link clicks call `preventDefault()` and then `onOpen`, allowing `PortfolioHome` to begin the zoom before it calls `router.push`;
- modified clicks (`Cmd/Ctrl/Shift/Alt`) keep native browser behavior and do not enter the delayed overlay sequence.

- [ ] **Step 4: Implement the mobile carousel**

Mobile requirements:

- CSS horizontal track with one card primarily visible;
- touch drag threshold of 50px or velocity threshold of 500px/s;
- previous and next buttons wrap across five entries;
- ten-entry Toddham behavior is reduced to five dots;
- selected dot has an elongated pill state;
- every card has a unique `Open {label}` accessible name;
- card text includes title, year, summary, and `VIEW`.

- [ ] **Step 5: Run selector tests and verify GREEN**

Run:

```bash
npm test -- tests/components/ProjectSelector.test.tsx
```

Expected: 2 tests PASS.

- [ ] **Step 6: Verify responsive rendering**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit Task 4**

```bash
git add components/portfolio/ProjectSelector.tsx components/portfolio/PortfolioHome.tsx components/portfolio/portfolio.module.css tests/components/ProjectSelector.test.tsx
git commit -m "feat: add responsive project selector"
```

---

### Task 5: Case Templates and Direct Routes

**Files:**
- Create: `components/portfolio/MediaPlaceholder.tsx`
- Create: `components/portfolio/CaseTemplate.tsx`
- Create: `components/portfolio/AboutTemplate.tsx`
- Create: `components/portfolio/CasePage.tsx`
- Create: `app/about/page.tsx`
- Create: `app/work/[slug]/page.tsx`
- Create: `app/work/[slug]/loading.tsx`
- Create: `app/not-found.tsx`
- Create: `tests/components/CaseTemplate.test.tsx`

**Interfaces:**
- Consumes: `ProjectDefinition`, `MediaSlot`, `getProjectById`.
- Produces: reusable placeholder case content for standalone and overlay routes.

- [ ] **Step 1: Write failing template tests**

Create `tests/components/CaseTemplate.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import CaseTemplate from "@/components/portfolio/CaseTemplate";
import AboutTemplate from "@/components/portfolio/AboutTemplate";
import { getProjectById } from "@/lib/portfolio/projects";

test("case template renders labeled media slots with recommendations", () => {
  render(<CaseTemplate project={getProjectById("business")} />);
  expect(screen.getByText("HERO IMAGE")).toBeInTheDocument();
  expect(screen.getByText("2560×1440")).toBeInTheDocument();
  expect(screen.getByText("PROCESS DIAGRAM")).toBeInTheDocument();
});

test("about template exposes the approved profile sections", () => {
  render(<AboutTemplate />);
  expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Experience" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run template tests and verify RED**

Run:

```bash
npm test -- tests/components/CaseTemplate.test.tsx
```

Expected: FAIL because the templates do not exist.

- [ ] **Step 3: Implement `MediaPlaceholder`**

Render a `figure` with:

- CSS `aspect-ratio` from `MediaSlot.ratio`;
- label, recommendation, and slot ID;
- `role="img"` and an accessible label such as `Placeholder for HERO IMAGE, recommended 2560×1440`;
- no broken `<img>` element and no remote request.

- [ ] **Step 4: Implement the project template**

`CaseTemplate` must render:

- title, year, role placeholder, and concise approved summary;
- sticky chapter navigation: `Overview`, `Process`, `System`, `Result`;
- text skeleton blocks that say what content is expected;
- registry-defined media slots;
- a four-cell result metric placeholder;
- next-case link from the registry order.

- [ ] **Step 5: Implement the About template**

Render the structural sections:

- `Profile`;
- `Capabilities`;
- `Experience`;
- `Education`;
- `Contact`.

Use explicit content labels such as `PROFILE COPY / CONTENT PENDING`, not lorem ipsum.

- [ ] **Step 6: Implement direct routes**

`app/about/page.tsx` renders `CasePage` with `AboutTemplate`.

`app/work/[slug]/page.tsx`:

- awaits `params: Promise<{ slug: string }>`;
- accepts only `business`, `brand-system`, `product-launch`, and `launch-event`;
- exports `generateStaticParams`;
- calls `notFound()` for any unsupported slug;
- exports per-project metadata using registry title and summary.

`app/work/[slug]/loading.tsx` renders the branded circular loading label without waiting for project media.

- [ ] **Step 7: Run template tests and verify GREEN**

Run:

```bash
npm test -- tests/components/CaseTemplate.test.tsx
```

Expected: 2 tests PASS.

- [ ] **Step 8: Verify all direct routes build**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all five direct routes appear in the Next.js build output and commands exit 0.

- [ ] **Step 9: Commit Task 5**

```bash
git add components/portfolio/MediaPlaceholder.tsx components/portfolio/CaseTemplate.tsx components/portfolio/AboutTemplate.tsx components/portfolio/CasePage.tsx app/about app/work app/not-found.tsx tests/components/CaseTemplate.test.tsx
git commit -m "feat: add shareable portfolio case routes"
```

---

### Task 6: Intercepted Overlay Routing and Accessible Close Behavior

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/@overlay/default.tsx`
- Create: `app/@overlay/page.tsx`
- Create: `app/@overlay/(.)about/page.tsx`
- Create: `app/@overlay/(.)work/[slug]/page.tsx`
- Create: `components/portfolio/CaseOverlay.tsx`
- Create: `tests/components/CaseOverlay.test.tsx`

**Interfaces:**
- Consumes: `AboutTemplate`, `CaseTemplate`, registry lookups.
- Produces: `<CaseOverlay label fallbackHref>{children}</CaseOverlay>`.

- [ ] **Step 1: Write failing overlay behavior tests**

Create `tests/components/CaseOverlay.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import CaseOverlay from "@/components/portfolio/CaseOverlay";

const back = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, replace }),
}));

beforeEach(() => {
  back.mockReset();
  replace.mockReset();
  document.body.style.overflow = "";
});

test("locks body scroll and closes on Escape", async () => {
  render(
    <CaseOverlay label="Business Context" fallbackHref="/">
      <h1>Business Context</h1>
    </CaseOverlay>,
  );
  expect(document.body.style.overflow).toBe("hidden");
  await userEvent.keyboard("{Escape}");
  expect(back).toHaveBeenCalledOnce();
});

test("close button has an accessible name", () => {
  render(
    <CaseOverlay label="Business Context" fallbackHref="/">
      <h1>Business Context</h1>
    </CaseOverlay>,
  );
  expect(screen.getByRole("button", { name: "Close project" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run overlay tests and verify RED**

Run:

```bash
npm test -- tests/components/CaseOverlay.test.tsx
```

Expected: FAIL because `CaseOverlay` does not exist.

- [ ] **Step 3: Implement `CaseOverlay`**

The client component must:

- render `role="dialog"` and `aria-modal="true"`;
- save `document.activeElement` on mount;
- lock `body.style.overflow`;
- move focus to the close button;
- close on Escape;
- run `window.history.length > 1 ? router.back() : router.replace(fallbackHref)` from one idempotent close handler shared by Escape and the close button;
- restore body overflow and prior focus on unmount;
- prevent click-through to the homepage;
- use `AnimatePresence` and a 400–550ms entrance;
- use the reduced-motion preference for a 100ms fade.

- [ ] **Step 4: Modify the root layout for the parallel slot**

Update the root signature:

```tsx
export default function RootLayout({
  children,
  overlay,
}: Readonly<{
  children: React.ReactNode;
  overlay: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${plexMono.variable}`}>
      <body>
        {children}
        {overlay}
      </body>
    </html>
  );
}
```

Keep existing font metadata unless it conflicts with the approved visual tokens.

- [ ] **Step 5: Add empty slot routes**

Both `app/@overlay/default.tsx` and `app/@overlay/page.tsx` return `null`.

- [ ] **Step 6: Add intercepted About route**

`app/@overlay/(.)about/page.tsx` renders:

```tsx
<CaseOverlay label="Kid Long profile" fallbackHref="/">
  <AboutTemplate />
</CaseOverlay>
```

- [ ] **Step 7: Add intercepted work route**

`app/@overlay/(.)work/[slug]/page.tsx` validates the slug against the registry and renders:

```tsx
<CaseOverlay label={project.title} fallbackHref="/">
  <CaseTemplate project={project} />
</CaseOverlay>
```

Unsupported slugs call `notFound()`.

- [ ] **Step 8: Run overlay tests and verify GREEN**

Run:

```bash
npm test -- tests/components/CaseOverlay.test.tsx
```

Expected: 2 tests PASS.

- [ ] **Step 9: Run route and build verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 10: Commit Task 6**

```bash
git add app/layout.tsx app/@overlay components/portfolio/CaseOverlay.tsx tests/components/CaseOverlay.test.tsx
git commit -m "feat: add intercepted case overlays"
```

---

### Task 7: Motion Orchestration, Loading, Performance, and Reduced Motion

**Files:**
- Modify: `components/portfolio/PortfolioHome.tsx`
- Modify: `components/portfolio/SpritePortrait.tsx`
- Modify: `components/portfolio/ProjectPreview.tsx`
- Modify: `components/portfolio/CaseOverlay.tsx`
- Modify: `components/portfolio/portfolio.module.css`
- Create: `components/portfolio/LoadingRing.tsx`
- Create: `tests/components/LoadingRing.test.tsx`

**Interfaces:**
- Consumes: state phases and existing components.
- Produces: final transition timing, prefetch policy, visibility pause, and reduced-motion behavior.

- [ ] **Step 1: Write a failing loading-ring test**

Create `tests/components/LoadingRing.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import LoadingRing from "@/components/portfolio/LoadingRing";

test("loading ring exposes a single accessible status", () => {
  render(<LoadingRing />);
  expect(screen.getByRole("status", { name: "Loading portfolio" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the loading-ring test and verify RED**

Run:

```bash
npm test -- tests/components/LoadingRing.test.tsx
```

Expected: FAIL because `LoadingRing` does not exist.

- [ ] **Step 3: Implement `LoadingRing`**

Render a CSS circular text treatment inspired by the reference loading system, with one screen-reader status and decorative repeated text hidden from assistive technology.

- [ ] **Step 4: Finalize phase timing**

Use these exact transition windows:

- initial loading cover: 500–800ms maximum;
- preview text: 320ms;
- hero zoom: 560ms;
- overlay entrance: 460ms;
- overlay close: 320ms;
- reduced-motion overlay transition: 100ms.

Dispatch the route navigation after the zoom reaches 70%, so perceived motion begins before server navigation.

Implementation contract:

```ts
dispatch({ type: "OPEN_REQUESTED", projectId });
navigationTimer.current = window.setTimeout(
  () => router.push(getProjectById(projectId).href),
  392,
);
```

Clear the timer before starting a new one and on unmount. `usePathname()` then advances the preserved homepage state to `OPENED` on the intercepted URL and resets it with `CLOSED` when the browser returns to `/`.

- [ ] **Step 5: Finalize intent-based prefetch**

On pointer enter, keyboard focus, or touch start:

```ts
router.prefetch(project.href);
```

Do not prefetch all four work routes and About during initial render.

- [ ] **Step 6: Finalize sprite performance**

- pause animation on `visibilitychange`;
- use `ResizeObserver` rather than polling;
- redraw only on rounded frame change;
- cap DPR at 2;
- clean up image, observer, pointer listener, and animation frame;
- render static frame 0 under reduced motion.

- [ ] **Step 7: Add global reduced-motion and focus rules**

CSS must:

- preserve visible state changes without long movement;
- remove nonessential transforms;
- keep focus rings at least 2px;
- avoid `transition: all`;
- maintain contrast on the pale background.

- [ ] **Step 8: Run component tests and verify GREEN**

Run:

```bash
npm test -- tests/components/LoadingRing.test.tsx
npm test
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 9: Commit Task 7**

```bash
git add components/portfolio app/globals.css tests/components/LoadingRing.test.tsx
git commit -m "feat: polish portfolio motion and loading"
```

---

### Task 8: E2E, Responsive Verification, and Production Readiness

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/portfolio.spec.ts`
- Create: `tests/e2e/responsive.spec.ts`
- Modify: `README.md`

**Interfaces:**
- Consumes: completed application.
- Produces: repeatable routing, responsive, accessibility, and screenshot verification.

- [ ] **Step 1: Configure Playwright**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:4177",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 4177",
    url: "http://127.0.0.1:4177",
    reuseExistingServer: true,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
```

- [ ] **Step 2: Write failing routing E2E tests**

Create `tests/e2e/portfolio.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("opens and closes a shareable project overlay", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open BUSINESS" }).click();
  await expect(page).toHaveURL("/work/business");
  await expect(page.getByRole("dialog", { name: "Business Context" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL("/");
});

test("direct project URL renders a standalone case page", async ({ page }) => {
  await page.goto("/work/product-launch");
  await expect(page.getByRole("heading", { name: "SOLIX Product Launch" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("browser back closes the overlay and keeps the homepage", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open BRAND SYSTEM" }).click();
  await expect(page).toHaveURL("/work/brand-system");
  await page.goBack();
  await expect(page).toHaveURL("/");
  await expect(page.getByText("KID LONG")).toBeVisible();
});
```

- [ ] **Step 3: Run E2E and verify RED**

Run:

```bash
npm run test:e2e -- tests/e2e/portfolio.spec.ts
```

Expected: at least one test FAIL until route timing and accessible names match the contract.

- [ ] **Step 4: Fix production behavior, not the tests**

Adjust selectors, route timing, focus restoration, or overlay lifecycle in production components until the exact approved behavior passes.

- [ ] **Step 5: Run routing E2E and verify GREEN**

Run:

```bash
npm run test:e2e -- tests/e2e/portfolio.spec.ts
```

Expected: 6 tests PASS total: the three routing contracts in both configured browser projects.

- [ ] **Step 6: Add responsive assertions**

Create `tests/e2e/responsive.spec.ts` to loop through:

```ts
const viewports = [
  { name: "wide-reference", width: 2048, height: 852 },
  { name: "desktop-large", width: 1920, height: 1080 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];
```

For each viewport:

- assert `document.documentElement.scrollWidth <= window.innerWidth`;
- assert the robot stage intersects the viewport;
- assert the appropriate desktop selector or mobile carousel is visible;
- capture `testInfo.snapshotPath(`${name}.png`)` only for review artifacts, not as a brittle pixel-perfect assertion.

- [ ] **Step 7: Update README**

Document:

- `npm run dev`;
- `npm test`;
- `npm run test:e2e`;
- `npm run lint`;
- `npm run build`;
- the five route paths;
- where to replace placeholder project data and media later.

- [ ] **Step 8: Run the full verification suite**

Run:

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

Expected:

- unit/component tests: 0 failures;
- ESLint: 0 errors;
- Next build: exit 0 with all five routes;
- Playwright: 0 failures across configured projects.

- [ ] **Step 9: Inspect the final worktree**

Run:

```bash
git status --short
git diff --check
git diff --stat HEAD
```

Confirm that unrelated pre-existing edits remain untouched and every new production file is covered by a task.

- [ ] **Step 10: Commit Task 8**

```bash
git add playwright.config.ts tests/e2e README.md
git commit -m "test: verify portfolio interactions and responsive layout"
```
