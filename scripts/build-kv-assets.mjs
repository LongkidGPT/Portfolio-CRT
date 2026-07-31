import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const FRAME_COUNT = 72;
const NEUTRAL_FRAME = 54;
const SOURCE_DIR = resolve(process.cwd(), "..", "KV首屏");
const VIDEO_PATH = join(SOURCE_DIR, "首屏头部转动效果.mp4");
const OUTPUT_ROOT = resolve(process.cwd(), "public", "kv");
const FRAME_DIR = join(OUTPUT_ROOT, "frames");
const BUTTON_DIR = join(OUTPUT_ROOT, "buttons");

const buttonSources = {
  "about-default.png": join(SOURCE_DIR, "WHITE", "ABOUT ME W.png"),
  "about-active.png": join(SOURCE_DIR, "BLACK", "ABOUT ME B.png"),
  "business-default.png": join(SOURCE_DIR, "WHITE", "BUSINESS W.png"),
  "business-active.png": join(SOURCE_DIR, "BLACK", "BUSINESS B.png"),
  "brand-system-default.png": join(
    SOURCE_DIR,
    "WHITE",
    "BRAND SYSTEM W.png",
  ),
  "brand-system-active.png": join(
    SOURCE_DIR,
    "BLACK",
    "BRAND SYSTEM B.png",
  ),
  "product-launch-default.png": join(
    SOURCE_DIR,
    "WHITE",
    "PRODUCT LAUNCH W.png",
  ),
  "product-launch-active.png": join(
    SOURCE_DIR,
    "BLACK",
    "PRODUCT LAUNCH B.png",
  ),
  "launch-event-default.png": join(
    SOURCE_DIR,
    "WHITE",
    "LAUNCH EVENT W.png",
  ),
  "launch-event-active.png": join(
    SOURCE_DIR,
    "BLACK",
    "LAUNCH EVENT B.png",
  ),
};

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });

  if (result.status !== 0) {
    throw new Error(
      `${command} failed (${result.status}): ${result.stderr || result.stdout}`,
    );
  }

  return result.stdout.trim();
}

function requireFile(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing KV source: ${path}`);
  }
}

requireFile(VIDEO_PATH);
for (const source of Object.values(buttonSources)) requireFile(source);

const probe = JSON.parse(
  run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height:format=duration",
    "-of",
    "json",
    VIDEO_PATH,
  ]),
);
const [{ width, height }] = probe.streams;
const duration = Number(probe.format.duration);

if (width !== 1470 || height !== 630 || !Number.isFinite(duration)) {
  throw new Error(`Unexpected KV video metadata: ${width}x${height}, ${duration}s`);
}

rmSync(FRAME_DIR, { recursive: true, force: true });
rmSync(BUTTON_DIR, { recursive: true, force: true });
mkdirSync(FRAME_DIR, { recursive: true });
mkdirSync(BUTTON_DIR, { recursive: true });

const tempDir = mkdtempSync(join(tmpdir(), "portfolio-kv-"));

try {
  run("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-i",
    VIDEO_PATH,
    "-vf",
    `fps=${FRAME_COUNT}/${duration}`,
    "-frames:v",
    String(FRAME_COUNT),
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
    const webpName = pngName.replace(/\.png$/, ".webp");
    run("cwebp", [
      "-quiet",
      "-q",
      "78",
      "-m",
      "6",
      join(tempDir, pngName),
      "-o",
      join(FRAME_DIR, webpName),
    ]);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

for (const [outputName, source] of Object.entries(buttonSources)) {
  copyFileSync(source, join(BUTTON_DIR, outputName));
}

const generatedFrames = readdirSync(FRAME_DIR).filter((name) =>
  name.endsWith(".webp"),
);

if (generatedFrames.length !== FRAME_COUNT) {
  throw new Error(
    `Expected ${FRAME_COUNT} WebP frames, found ${generatedFrames.length}`,
  );
}

const manifest = {
  frameCount: FRAME_COUNT,
  width,
  height,
  neutralFrame: NEUTRAL_FRAME,
  framePattern: "/kv/frames/frame-%03d.webp",
};

writeFileSync(
  join(OUTPUT_ROOT, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(
  `Generated ${FRAME_COUNT} KV frames and ${Object.keys(buttonSources).length} button assets in ${basename(OUTPUT_ROOT)}`,
);
