import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "kv", "cases");
const TARGETS = [
  { directory: "桌面端", width: 2880 },
  { directory: "移动端", width: 1170 },
];

async function listPngFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listPngFiles(absolute)));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) files.push(absolute);
  }

  return files;
}

for (const target of TARGETS) {
  const directory = path.join(ROOT, target.directory);
  const files = await listPngFiles(directory);

  for (const input of files) {
    const output = input.replace(/\.png$/i, ".webp");
    await sharp(input)
      .resize({ width: target.width, withoutEnlargement: true })
      .webp({ quality: 94, alphaQuality: 100, effort: 6, smartSubsample: true })
      .toFile(output);
  }
}

console.log("Built high-resolution responsive WebP case slices.");
