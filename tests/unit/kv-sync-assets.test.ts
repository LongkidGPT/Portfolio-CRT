import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("KV full-frame sync assets", () => {
  const root = join(process.cwd(), "public", "kv-sync-test");

  it("contains the complete original video sequence", () => {
    const manifestPath = join(root, "manifest.json");
    expect(existsSync(manifestPath), "sync manifest must exist").toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  expect(manifest).toMatchObject({
    frameCount: 193,
    width: 1470,
    height: 630,
    sourceFile: "首屏头部转动效果（R3）.mp4",
    sourceSha256:
      "b126bb9da72963a61f75c49edaea561cef0e40dcbfcda1224e6bffd1cd09cd20",
    framePattern: "/kv-sync-test/frames/frame-%03d.webp",
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
