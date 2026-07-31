import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import SpritePortrait from "@/components/portfolio/SpritePortrait";

test("exposes the interactive portrait as one semantic image", () => {
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(null);

  render(<SpritePortrait focusPoint={null} motionReduced />);

  expect(
    screen.getByRole("img", { name: "Interactive CRT portrait" }),
  ).toBeInTheDocument();

  getContext.mockRestore();
});

test("loads the neutral full-frame KV and draws it without cropping", () => {
  const sources: string[] = [];
  const drawImage = vi.fn();
  const clearRect = vi.fn();
  const fillRect = vi.fn();
  const context = { clearRect, drawImage, fillRect, fillStyle: "" };

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

  render(<SpritePortrait focusPoint={null} motionReduced />);

  expect(sources[0]).toBe("/kv/frames/frame-054.webp");
  expect(
    screen.getByRole("img", { name: "Interactive CRT portrait" }),
  ).toHaveAttribute("data-frame", "54");
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

  requestFrame.mockRestore();
  bounds.mockRestore();
  getContext.mockRestore();
  vi.unstubAllGlobals();
});
