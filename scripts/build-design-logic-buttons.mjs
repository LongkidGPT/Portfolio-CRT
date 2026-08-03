import fs from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createCanvas, loadImage } = require("@napi-rs/canvas");

const [defaultSource, activeSource, defaultOutput, activeOutput] =
  process.argv.slice(2);

if (!activeOutput) {
  throw new Error(
    "Usage: build-design-logic-buttons default-source active-source default-output active-output",
  );
}

const variants = [
  { source: defaultSource, output: defaultOutput, textColor: "rgb(153,153,153)" },
  { source: activeSource, output: activeOutput, textColor: "rgb(255,255,255)" },
];

for (const variant of variants) {
  const source = await loadImage(variant.source);
  if (source.width !== 576 || source.height !== 168) {
    throw new Error(
      `Expected a 576×168 source, got ${source.width}×${source.height}`,
    );
  }

  const canvas = createCanvas(source.width, source.height);
  const context = canvas.getContext("2d");
  context.drawImage(source, 0, 0);

  const [red, green, blue, alpha] = context.getImageData(500, 84, 1, 1).data;
  context.fillStyle = `rgba(${red},${green},${blue},${alpha / 255})`;
  context.fillRect(145, 35, 414, 98);

  context.fillStyle = variant.textColor;
  context.font = "47px Menlo";
  context.textBaseline = "middle";
  context.fillText("DESIGN LOGIC", 169, 84);

  await fs.writeFile(variant.output, canvas.toBuffer("image/png"));
}
