import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public", "kv", "cases");
const targets = [
  { directory: "桌面端/project-overview-r5", sliceHeight: 2200 },
  { directory: "移动端/project-overview-r5", sliceHeight: 1100 },
];

for (const target of targets) {
  const directory = path.join(root, target.directory);
  const input = path.join(directory, "overview.png");
  const metadata = await sharp(input).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Unable to read ${input}`);
  }

  for (const entry of await readdir(directory)) {
    if (/^Slice-\d+\.png$/i.test(entry)) {
      await rm(path.join(directory, entry));
    }
  }

  for (let top = 0, index = 1; top < metadata.height; top += target.sliceHeight, index += 1) {
    const height = Math.min(target.sliceHeight, metadata.height - top);
    await sharp(input)
      .extract({ left: 0, top, width: metadata.width, height })
      .png()
      .toFile(path.join(directory, `Slice-${String(index).padStart(2, "0")}.png`));
  }
}

console.log("Built progressive source slices for project overview artwork.");
