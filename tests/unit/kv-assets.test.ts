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

  it("keeps DESIGN LOGIC the same native size as BRAND SYSTEM", () => {
    for (const state of ["default", "active"]) {
      const designLogic = readPngSize(
        join(root, "buttons", `design-logic-${state}.png`),
      );
      const brandSystem = readPngSize(
        join(root, "buttons", `brand-system-${state}.png`),
      );

      expect(designLogic).toEqual(brandSystem);
      expect(designLogic).toEqual({ width: 692, height: 168 });
    }
  });
});
