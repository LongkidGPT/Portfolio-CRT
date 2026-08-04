import {
  copyFileSync,
  createReadStream,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const FRAME_COUNT = 193;
const NEUTRAL_FRAME = 124;
const SOURCE_NAME = "首屏头部转动效果（PHO）需要添加遮罩.mp4";
const SOURCE_SHA256 =
  "04a443366681b76dc4e7d9f6442bf6f73c88eca5ce739ef296c26ff14feca803";
const sourceCandidates = [
  resolve(process.cwd(), "..", "KV首屏", "手机端"),
  resolve(process.cwd(), "..", "..", "..", "KV首屏", "手机端"),
];
const SOURCE_DIR = sourceCandidates.find((path) =>
  existsSync(join(path, SOURCE_NAME)),
);
const OUTPUT_ROOT = resolve(process.cwd(), "public", "kv-mobile");
const FRAME_DIR = join(OUTPUT_ROOT, "frames");
const CARD_DIR = join(OUTPUT_ROOT, "cards");

const cards = {
  "about-default.png": ["WHITE", "ABOUT ME WP.png"],
  "about-active.png": ["BLACK", "ABOUT ME BP.png"],
  "design-logic-default.png": ["WHITE", "BUSINESS WP.png"],
  "design-logic-active.png": ["BLACK", "BUSINESS BP.png"],
  "brand-system-default.png": ["WHITE", "BRAND SYSTEM WP.png"],
  "brand-system-active.png": ["BLACK", "BRAND SYSTEM BP.png"],
  "product-launch-default.png": ["WHITE", "PRODUCT LAUNCH WP.png"],
  "product-launch-active.png": ["BLACK", "PRODUCT LAUNCH BP.png"],
  "launch-event-default.png": ["WHITE", "LAUNCH EVENT WP.png"],
  "launch-event-active.png": ["BLACK", "LAUNCH EVENT BP.png"],
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

if (!SOURCE_DIR) throw new Error(`Missing mobile KV source: ${SOURCE_NAME}`);

const videoPath = join(SOURCE_DIR, SOURCE_NAME);
const sourceHash = createHash("sha256");
await new Promise((resolvePromise, reject) => {
  createReadStream(videoPath)
    .on("data", (chunk) => sourceHash.update(chunk))
    .on("end", resolvePromise)
    .on("error", reject);
});
const sourceSha256 = sourceHash.digest("hex");
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
    videoPath,
  ]),
);
const [{ width, height, avg_frame_rate: frameRate, nb_read_frames: frameCount }] =
  probe.streams;
if (width !== 720 || height !== 1280 || Number(frameCount) !== FRAME_COUNT) {
  throw new Error(`Unexpected mobile source: ${width}×${height}, ${frameCount} frames`);
}

rmSync(OUTPUT_ROOT, { recursive: true, force: true });
mkdirSync(FRAME_DIR, { recursive: true });
mkdirSync(CARD_DIR, { recursive: true });

const tempDir = mkdtempSync(join(tmpdir(), "portfolio-mobile-kv-"));
try {
  run("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-i",
    videoPath,
    "-vsync",
    "0",
    "-start_number",
    "0",
    join(tempDir, "frame-%03d.png"),
  ]);

  const frames = readdirSync(tempDir).filter((name) => name.endsWith(".png")).sort();
  if (frames.length !== FRAME_COUNT) {
    throw new Error(`Expected ${FRAME_COUNT} mobile frames, found ${frames.length}`);
  }

  for (const frame of frames) {
    run("cwebp", [
      "-quiet",
      "-q",
      "80",
      "-m",
      "6",
      join(tempDir, frame),
      "-o",
      join(FRAME_DIR, frame.replace(/\.png$/, ".webp")),
    ]);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

for (const [outputName, [folder, sourceName]] of Object.entries(cards)) {
  copyFileSync(join(SOURCE_DIR, folder, sourceName), join(CARD_DIR, outputName));
}
copyFileSync(join(SOURCE_DIR, "HUADONG.png"), join(OUTPUT_ROOT, "controls.png"));

writeFileSync(
  join(OUTPUT_ROOT, "manifest.json"),
  `${JSON.stringify(
    {
      frameCount: FRAME_COUNT,
      width,
      height,
      neutralFrame: NEUTRAL_FRAME,
      sourceFile: SOURCE_NAME,
      sourceSha256,
      frameRate,
      framePattern: "/kv-mobile/frames/frame-%03d.webp",
    },
    null,
    2,
  )}\n`,
);

console.log(`Generated ${FRAME_COUNT} mobile KV frames and supplied card states.`);
