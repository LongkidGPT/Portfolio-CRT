import fs from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";

const css = fs.readFileSync(
  path.join(process.cwd(), "components/portfolio/portfolio.module.css"),
  "utf8",
);

test("desktop rulers align to the preview top and scale uniformly by 30 percent", () => {
  expect(css).toMatch(/\.ruler\s*\{[^}]*top:\s*40\.5%;[^}]*transform:\s*scale\(1\.3\)/s);
  expect(css).toMatch(/\.ruler\[data-side="left"\][^{]*\{[^}]*transform-origin:\s*top left/s);
  expect(css).toMatch(/\.ruler\[data-side="right"\][^{]*\{[^}]*transform-origin:\s*top right/s);
});

test("mobile rulers retain their original dimensions and vertical position", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 767px)"));
  expect(mobile).toMatch(/\.ruler\s*\{[^}]*top:\s*28%;[^}]*transform:\s*none/s);
});

test("desktop preview copy moves upward by exactly two responsive button heights", () => {
  expect(css).toMatch(
    /\.previewStage\s*\{[^}]*transform:\s*translateY\(clamp\(-112px,\s*-11vh,\s*-92px\)\)/s,
  );

  const mobile = css.slice(css.indexOf("@media (max-width: 767px)"));
  expect(mobile).toMatch(/\.previewStage\s*\{[^}]*transform:\s*none/s);
});
