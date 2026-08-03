import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import KvSyncTest from "@/components/portfolio/KvSyncTest";

test("draws the complete neutral source frame before preloading directions", () => {
  const sources: string[] = [];
  const drawImage = vi.fn();
  const clearRect = vi.fn();
  const context = { clearRect, drawImage };

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
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(context as unknown as CanvasRenderingContext2D);
  const bounds = vi
    .spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect")
    .mockReturnValue({
      left: 0,
      top: 0,
      right: 1470,
      bottom: 630,
      width: 1470,
      height: 630,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
  const requestFrame = vi
    .spyOn(window, "requestAnimationFrame")
    .mockReturnValue(1);

  render(<KvSyncTest />);

  const canvas = screen.getByRole("img", {
    name: "Full-frame KV synchronization test",
  });
  expect(canvas).toHaveAttribute("data-frame", "174");
  expect(sources[0]).toBe("/kv-sync-test/frames/frame-174.webp");
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

  requestFrame.mockRestore();
  bounds.mockRestore();
  getContext.mockRestore();
  vi.unstubAllGlobals();
});
