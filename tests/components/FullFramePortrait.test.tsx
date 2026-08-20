import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import FullFramePortrait from "@/components/portfolio/FullFramePortrait";

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

describe("FullFramePortrait", () => {
  it("covers a wide desktop with the neutral R4 frame", () => {
    const { drawImage, FakeImage, sources } = installCanvasHarness();

    render(<FullFramePortrait motionReduced />);

    const canvas = screen.getByRole("img", {
      name: "Interactive full-frame KV portrait",
    });
    expect(canvas).toHaveAttribute("data-frame", "80");
    expect(sources[0]).toBe("/kv-desktop-r5/frames/frame-080.webp");
    expect(new Set(sources).size).toBe(6);
    expect(drawImage).toHaveBeenCalledWith(
      expect.any(FakeImage),
      0,
      0,
      1920,
      1080,
      0,
      expect.closeTo(-94.11, 2),
      1470,
      expect.closeTo(826.88, 2),
    );
  });

  it("does not download the full frame sequence while the page is idle", () => {
    vi.useFakeTimers();
    const { sources } = installCanvasHarness();

    render(<FullFramePortrait />);
    fireEvent.load(window);
    act(() => vi.advanceTimersByTime(12_000));

    expect(new Set(sources).size).toBe(6);
    vi.useRealTimers();
  });

  it("stops the animation loop when reduced motion is enabled", () => {
    const { callbacks } = installCanvasHarness();

    render(<FullFramePortrait motionReduced />);
    expect(callbacks).toHaveLength(1);

    act(() => callbacks.shift()?.(1000 / 60));

    expect(callbacks).toHaveLength(0);
  });

  it("sleeps the animation loop after the portrait reaches its target", () => {
    const { callbacks } = installCanvasHarness();

    render(<FullFramePortrait />);
    expect(callbacks).toHaveLength(1);

    act(() => callbacks.shift()?.(1000 / 60));

    expect(callbacks).toHaveLength(0);
  });

  it("uses the visible viewport edge for the right-facing target", () => {
    const { callbacks } = installCanvasHarness();
    render(<FullFramePortrait />);

    fireEvent.pointerMove(window, { clientX: 1469, clientY: 301 });
    act(() => callbacks.shift()?.(1000 / 60));

    expect(
      screen.getByRole("img", {
        name: "Interactive full-frame KV portrait",
      }),
    ).toHaveAttribute("data-target-frame", "59");
  });

  it("eases to a fixed project frame instead of following the pointer", () => {
    const { callbacks } = installCanvasHarness();
    const { rerender } = render(<FullFramePortrait />);

    rerender(<FullFramePortrait fixedFrame={144} />);

    act(() => {
      let timestamp = 0;
      for (let index = 0; index < 60; index += 1) {
        const callback = callbacks.shift();
        if (!callback) break;
        timestamp += 1000 / 60;
        callback(timestamp);
      }
    });

    const canvas = screen.getByRole("img", {
      name: "Interactive full-frame KV portrait",
    });
    expect(canvas).toHaveAttribute("data-target-frame", "144");
    expect(canvas).toHaveAttribute("data-frame", "144");
  });
});
