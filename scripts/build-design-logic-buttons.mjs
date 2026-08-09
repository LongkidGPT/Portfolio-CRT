import sharp from "sharp";

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
  const source = sharp(variant.source);
  const metadata = await source.metadata();
  if (metadata.width !== 692 || metadata.height !== 168) {
    throw new Error(
      `Expected a 692×168 source, got ${metadata.width}×${metadata.height}`,
    );
  }

  const background = await source
    .clone()
    .extract({ left: 650, top: 84, width: 1, height: 1 })
    .resize(530, 98, { kernel: "nearest" })
    .png()
    .toBuffer();
  const label = Buffer.from(`
    <svg width="530" height="98" xmlns="http://www.w3.org/2000/svg">
      <text x="24" y="49" fill="${variant.textColor}"
        font-family="Menlo, monospace" font-size="47"
        dominant-baseline="middle">DESIGN LOGIC</text>
    </svg>
  `);

  await source
    .composite([
      { input: background, left: 145, top: 35 },
      { input: label, left: 145, top: 35 },
    ])
    .png()
    .toFile(variant.output);
}
