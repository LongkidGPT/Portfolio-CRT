import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readPngSize(path: string) {
  const buffer = readFileSync(path);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

describe("generated KV assets", () => {
  const root = join(process.cwd(), "public", "kv");
  const manifestPath = join(root, "manifest.json");

  it("describes the full-frame sequence", () => {
    expect(existsSync(manifestPath), "KV manifest must be generated").toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    expect(manifest).toMatchObject({
      frameCount: 72,
      width: 1470,
      height: 630,
      neutralFrame: 65,
      transparent: true,
      framePattern: "/kv/frames/frame-%03d.webp",
    });
  });

  it("contains every frame and button state", () => {
    for (let index = 0; index < 72; index += 1) {
      expect(
        existsSync(
          join(
            root,
            "frames",
            `frame-${String(index).padStart(3, "0")}.webp`,
          ),
        ),
      ).toBe(true);
    }

    for (const id of [
      "about",
      "business",
      "brand-system",
      "product-launch",
      "launch-event",
    ]) {
      expect(existsSync(join(root, "buttons", `${id}-default.png`))).toBe(
        true,
      );
      expect(existsSync(join(root, "buttons", `${id}-active.png`))).toBe(true);
    }
  });

  it("uses the approved high-resolution desktop artwork for every project state", () => {
    const expectedSizes = {
      about: { width: 1152, height: 336 },
      "design-logic": { width: 1364, height: 336 },
      "brand-system": { width: 1384, height: 336 },
      "product-launch": { width: 1484, height: 336 },
      "launch-event": { width: 1376, height: 336 },
    } as const;

    for (const [id, expectedSize] of Object.entries(expectedSizes)) {
      for (const state of ["default", "active"]) {
        expect(readPngSize(join(root, "buttons", `${id}-${state}.png`))).toEqual(
          expectedSize,
        );
      }
    }
  });

  it("uses the latest supplied desktop case-study artwork", () => {
    const cases = join(root, "cases");
    const expectedSizes = {
      "design-logic.png": { width: 5760, height: 22882 },
      "brand-system.png": { width: 3299, height: 32768 },
      "product-launch.png": { width: 2375, height: 32768 },
      "launch-event.png": { width: 4786, height: 32768 },
    } as const;

    for (const [filename, expectedSize] of Object.entries(expectedSizes)) {
      expect(readPngSize(join(cases, filename))).toEqual(expectedSize);
    }
  });
});

describe("generated mobile KV assets", () => {
  const root = join(process.cwd(), "public", "kv-mobile");

  it("contains the 720×1280 PHO sequence and supplied mobile cards", () => {
    const manifest = JSON.parse(
      readFileSync(join(root, "manifest.json"), "utf8"),
    );
    expect(manifest).toMatchObject({
      frameCount: 193,
      width: 720,
      height: 1280,
      neutralFrame: 124,
      framePattern: "/kv-mobile/frames/frame-%03d.webp",
    });

    for (let index = 0; index < 193; index += 1) {
      expect(
        existsSync(
          join(root, "frames", `frame-${String(index).padStart(3, "0")}.webp`),
        ),
      ).toBe(true);
    }

    for (const id of [
      "about",
      "design-logic",
      "brand-system",
      "product-launch",
      "launch-event",
    ]) {
      expect(existsSync(join(root, "cards", `${id}-default.png`))).toBe(true);
      expect(existsSync(join(root, "cards", `${id}-active.png`))).toBe(true);
    }
  });

  it("uses the latest 1378×342 mobile card artwork for both states", () => {
    for (const id of [
      "about",
      "design-logic",
      "brand-system",
      "product-launch",
      "launch-event",
    ]) {
      for (const state of ["default", "active"]) {
        expect(readPngSize(join(root, "cards", `${id}-${state}.png`))).toEqual({
          width: 1378,
          height: 342,
        });
      }
    }
  });
});
