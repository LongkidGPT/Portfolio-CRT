import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import R3Portrait from "@/components/portfolio/R3Portrait";

const canvasBounds = {
  left: 0,
  top: 0,
  right: 1470,
  bottom: 630,
  width: 1470,
  height: 630,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

function installCanvasHarness() {
  const sources: string[] = [];
  const drawImage = vi.fn();
  const context = { clearRect: vi.fn(), drawImage };
  const callbacks: FrameRequestCallback[] = [];

  class FakeImage {
    complete = true;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private value = "";

    set src(value: string) {
      this.value = value;
      sources.push(value);
      this.onload?.();
    }

    get src() {
      return this.value;
    }
  }

  vi.stubGlobal("Image", FakeImage);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue(
    canvasBounds,
  );
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callbacks.push(callback);
    return callbacks.length;
  });

  return { callbacks, drawImage, FakeImage, sources };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("R3Portrait", () => {
  it("draws the complete neutral frame before preloading directions", () => {
    const { drawImage, FakeImage, sources } = installCanvasHarness();

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
  });

  it("eases to a fixed project frame instead of following the pointer", () => {
    const { callbacks } = installCanvasHarness();
    const { rerender } = render(<R3Portrait />);

    rerender(<R3Portrait fixedFrame={144} />);

    act(() => {
      let timestamp = 0;
      for (let index = 0; index < 40; index += 1) {
        const callback = callbacks.shift();
        if (!callback) break;
        timestamp += 1000 / 60;
        callback(timestamp);
      }
    });

    const canvas = screen.getByRole("img", {
      name: "Interactive R3 full-frame portrait",
    });
    expect(canvas).toHaveAttribute("data-target-frame", "144");
    expect(canvas).toHaveAttribute("data-frame", "144");
  });
});
