import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("R5 desktop KV assets", () => {
  const root = join(process.cwd(), "public", "kv-desktop-r5");

  it("contains the complete high-resolution R5 sequence", () => {
    const manifestPath = join(root, "manifest.json");
    expect(existsSync(manifestPath), "R5 manifest must exist").toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    expect(manifest).toMatchObject({
      frameCount: 193,
      width: 1920,
      height: 1080,
      sourceFile: "首屏头部转动效果（R5）.mp4",
      sourceSha256:
        "305a6908c394df837e0ec870c29948ae2dbcca93ac5bf543776e5eb28bb3d2c8",
      quality: 86,
      framePattern: "/kv-desktop-r5/frames/frame-%03d.webp",
    });

    for (let index = 0; index < 193; index += 1) {
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
  });
});
