import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const FRAME_COUNT = 193;
const QUALITY = 86;
const SOURCE_NAME = "首屏头部转动效果（R5）.mp4";
const SOURCE_SHA256 =
  "305a6908c394df837e0ec870c29948ae2dbcca93ac5bf543776e5eb28bb3d2c8";
const sourceCandidates = [
  resolve(process.cwd(), "..", "KV首屏", SOURCE_NAME),
  resolve(process.cwd(), "..", "..", "..", "KV首屏", SOURCE_NAME),
];
const VIDEO_PATH = sourceCandidates.find(existsSync);
const OUTPUT_ROOT = resolve(process.cwd(), "public", "kv-desktop-r5");
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

if (!VIDEO_PATH) throw new Error(`Missing source video: ${SOURCE_NAME}`);

const sourceSha256 = createHash("sha256")
  .update(readFileSync(VIDEO_PATH))
  .digest("hex");
if (sourceSha256 !== SOURCE_SHA256) {
  throw new Error(`Unexpected source fingerprint: ${sourceSha256}`);
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
if (width !== 1920 || height !== 1080 || decodedFrameCount !== FRAME_COUNT) {
  throw new Error(
    `Unexpected R5 source: ${width}x${height}, ${decodedFrameCount} frames`,
  );
}

const tempDir = mkdtempSync(join(tmpdir(), "portfolio-kv-r5-"));
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
    throw new Error(`Expected ${FRAME_COUNT} frames, found ${pngFrames.length}`);
  }

  for (const pngName of pngFrames) {
    run("cwebp", [
      "-quiet",
      "-q",
      String(QUALITY),
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
  sourceFile: SOURCE_NAME,
  sourceSha256,
  frameRate: parseRate(averageFrameRate),
  quality: QUALITY,
  framePattern: "/kv-desktop-r5/frames/frame-%03d.webp",
};
mkdirSync(OUTPUT_ROOT, { recursive: true });
writeFileSync(
  join(OUTPUT_ROOT, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Generated ${FRAME_COUNT} R5 desktop frames from ${VIDEO_PATH}`);
