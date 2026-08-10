import { render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import MobileFramePortrait from "@/components/portfolio/MobileFramePortrait";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("only preloads the neutral and five selectable mobile poses before page load", () => {
  const sources: string[] = [];

  class FakeImage {
    complete = true;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(value: string) {
      sources.push(value);
      this.onload?.();
    }
  }

  vi.stubGlobal("Image", FakeImage);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    clearRect: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    right: 390,
    bottom: 693,
    width: 390,
    height: 693,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);

  render(<MobileFramePortrait />);

  expect(new Set(sources).size).toBe(6);
});
