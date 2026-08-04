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

test("mobile removes desktop rulers from the dedicated phone composition", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 767px)"));
  expect(mobile).toMatch(/\.ruler\s*\{[^}]*display:\s*none/s);
});

test("mobile preserves the 9:16 video ratio and uses the approved mask color", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 767px)"));
  expect(mobile).toMatch(/\.home\s*\{[^}]*background:\s*#edefef/s);
  expect(mobile).toMatch(/\.portrait\s*\{[^}]*aspect-ratio:\s*9\s*\/\s*16/s);
  expect(mobile).toMatch(/--mobile-mask-line:\s*61\.8svh/);
});

test("desktop preview copy sits forty pixels below the two-button upward offset", () => {
  expect(css).toMatch(
    /\.previewStage\s*\{[^}]*transform:\s*translateY\(calc\(clamp\(-112px,\s*-11vh,\s*-92px\)\s*\+\s*40px\)\)/s,
  );

  const mobile = css.slice(css.indexOf("@media (max-width: 767px)"));
  expect(mobile).toMatch(/\.previewStage\s*\{[^}]*transform:\s*none/s);
});

test("case page surfaces use the approved cool-white background", () => {
  expect(css).toMatch(
    /\.standaloneCase,\s*\.overlay\s*\{[^}]*background:\s*#f8fafc;/s,
  );
});
