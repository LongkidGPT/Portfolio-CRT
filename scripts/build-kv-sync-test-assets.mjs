import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const FRAME_COUNT = 193;
const SOURCE_NAME = "首屏头部转动效果（需要除背景）.mp4";
const sourceCandidates = [
  resolve(process.cwd(), "..", "KV首屏", SOURCE_NAME),
  resolve(process.cwd(), "..", "..", "..", "KV首屏", SOURCE_NAME),
];
const VIDEO_PATH = sourceCandidates.find(existsSync);
const OUTPUT_ROOT = resolve(process.cwd(), "public", "kv-sync-test");
const FRAME_DIR = join(OUTPUT_ROOT, "frames");

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });

  if (result.status !== 0) {
    throw new Error(
      `${command} failed (${result.status}): ${result.stderr || result.stdout}`,
    );
  }

  return result.stdout.trim();
}

function parseRate(rate) {
  const [numerator, denominator] = rate.split("/").map(Number);
  return numerator / denominator;
}

if (!VIDEO_PATH) {
  throw new Error(`Missing source video: ${SOURCE_NAME}`);
}

const probe = JSON.parse(
  run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-count_frames",
    "-show_entries",
    "stream=width,height,avg_frame_rate,nb_read_frames",
    "-of",
    "json",
    VIDEO_PATH,
  ]),
);
const [{ width, height, avg_frame_rate: averageFrameRate, nb_read_frames }] =
  probe.streams;
const decodedFrameCount = Number(nb_read_frames);

if (width !== 1470 || height !== 630 || decodedFrameCount !== FRAME_COUNT) {
  throw new Error(
    `Unexpected source: ${width}x${height}, ${decodedFrameCount} frames`,
  );
}

const tempDir = mkdtempSync(join(tmpdir(), "portfolio-kv-sync-"));
rmSync(FRAME_DIR, { recursive: true, force: true });
mkdirSync(FRAME_DIR, { recursive: true });

try {
  run("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-i",
    VIDEO_PATH,
    "-vsync",
    "0",
    "-start_number",
    "0",
    join(tempDir, "frame-%03d.png"),
  ]);

  const pngFrames = readdirSync(tempDir)
    .filter((name) => name.endsWith(".png"))
    .sort();

  if (pngFrames.length !== FRAME_COUNT) {
    throw new Error(
      `Expected ${FRAME_COUNT} extracted frames, found ${pngFrames.length}`,
    );
  }

  for (const pngName of pngFrames) {
    run("cwebp", [
      "-quiet",
      "-q",
      "78",
      "-m",
      "6",
      join(tempDir, pngName),
      "-o",
      join(FRAME_DIR, pngName.replace(/\.png$/, ".webp")),
    ]);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

const manifest = {
  frameCount: FRAME_COUNT,
  width,
  height,
  frameRate: parseRate(averageFrameRate),
  framePattern: "/kv-sync-test/frames/frame-%03d.webp",
};

writeFileSync(
  join(OUTPUT_ROOT, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Generated ${FRAME_COUNT} full-frame KV sync assets`);
