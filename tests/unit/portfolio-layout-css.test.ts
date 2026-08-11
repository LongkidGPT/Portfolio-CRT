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

test("mobile about follows the supplied 390 pixel composition", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 767px)"));
  expect(mobile).toMatch(
    /\.aboutPage\s*\{[^}]*padding:\s*0 clamp\(24px,\s*9\.49vw,\s*56px\) 39px/s,
  );
  expect(mobile).toMatch(
    /\.aboutHero\s*\{[^}]*position:\s*relative;[^}]*min-height:\s*0;[^}]*padding-bottom:\s*51px/s,
  );
  expect(mobile).toMatch(
    /\.aboutPortrait\s*\{[^}]*position:\s*absolute;[^}]*top:\s*22\.3vw;[^}]*right:\s*0;[^}]*width:\s*30\.77vw/s,
  );
  expect(mobile).toMatch(
    /\.experienceRowTarget\s*\{[^}]*min-height:\s*64px;[^}]*grid-template-columns:\s*44% 56%/s,
  );
  expect(mobile).toMatch(
    /\.aboutMobileContact\s*\{[^}]*width:\s*100%;[^}]*margin:\s*51px 0 0/s,
  );
});

test("desktop about introduction uses the approved fixed type size", () => {
  expect(css).toMatch(/\.aboutDesktopIntroduction\s*\{[^}]*font:\s*400 14px\/1\.9/s);
});

test("mobile preserves the 9:16 video ratio and fades into the approved mask color", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 767px)"));
  expect(mobile).toMatch(/\.home\s*\{[^}]*background:\s*#edefef/s);
  expect(mobile).toMatch(/\.portrait\s*\{[^}]*aspect-ratio:\s*9\s*\/\s*16/s);
  expect(mobile).toMatch(
    /\.portraitStage::after\s*\{[^}]*linear-gradient\([^)]*rgba\(237,\s*239,\s*239,\s*0\)\s*0%[^)]*#edefef\s*25%[^)]*#edefef\s*100%/s,
  );
  expect(mobile).toMatch(
    /\.portraitStage::after\s*\{[^}]*height:\s*calc\(42svh\s*-\s*32\.7vw\)/s,
  );
});

test("mobile carousel and controls remain anchored to the viewport bottom", () => {
  const mobile = css.slice(css.indexOf("@media (max-width: 767px)"));
  expect(mobile).toMatch(
    /\.selector\s*\{[^}]*top:\s*auto;[^}]*bottom:\s*max\(5svh,\s*env\(safe-area-inset-bottom\)\)/s,
  );
  expect(mobile).toMatch(
    /\.carouselControls\s*\{[^}]*width:\s*clamp\(210px,\s*72vw,\s*340px\)/s,
  );
  expect(mobile).toMatch(
    /\.carouselControls\s*\{[^}]*margin:\s*9\.3vw auto 0/s,
  );
});

test("desktop preview copy sits forty pixels below the two-button upward offset", () => {
  expect(css).toMatch(
    /\.previewStage\s*\{[^}]*transform:\s*translateY\(calc\(clamp\(-112px,\s*-11vh,\s*-92px\)\s*\+\s*40px\)\)/s,
  );

  const mobile = css.slice(css.indexOf("@media (max-width: 767px)"));
  expect(mobile).toMatch(/\.previewStage\s*\{[^}]*transform:\s*none/s);
});

test("desktop preview copy shifts fifty pixels left without changing mobile", () => {
  expect(css).toMatch(
    /\.previewStage\s*\{[^}]*left:\s*calc\(31\.6%\s*-\s*50px\)/s,
  );

  const mobile = css.slice(css.indexOf("@media (max-width: 767px)"));
  expect(mobile).toMatch(/\.previewStage\s*\{[^}]*left:\s*17%/s);
});

test("desktop overview preview widens and clears the portrait edge", () => {
  expect(css).toMatch(
    /\.home\[data-previewed-project="about"\] \.previewStage\s*\{[^}]*left:\s*calc\(31\.6%\s*-\s*80px\);[^}]*width:\s*min\(28vw,\s*452px\)/s,
  );
});

test("case page surfaces use the approved cool-white background", () => {
  expect(css).toMatch(
    /\.standaloneCase,\s*\.overlay\s*\{[^}]*background:\s*#f8fafc;/s,
  );
});

test("desktop case artwork fills every viewport width", () => {
  expect(css).toMatch(/\.caseArtwork\s*\{[^}]*width:\s*100%/s);
  expect(css).not.toMatch(/\.caseArtwork\s*\{[^}]*width:\s*min\(100%,\s*1440px\)/s);
});

test("about background fills the viewport while content keeps its desktop canvas", () => {
  expect(css).toMatch(/\.aboutStandalone\s*\{[^}]*padding-top:\s*0/s);
  expect(css).toMatch(/\.aboutDesktopPage\s*\{[^}]*width:\s*100%/s);
  expect(css).toMatch(/\.aboutDesktopPage\s*\{[^}]*--career-baseline:\s*46\.77%/s);
  expect(css).toMatch(
    /\.aboutDesktopCanvas\s*\{[^}]*width:\s*min\(100%,\s*1440px\);[^}]*aspect-ratio:\s*5760\s*\/\s*6786/s,
  );
  expect(css).toMatch(/\.aboutDesktopBackground\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%/s);
});

test("about portrait keeps the career baseline and the rule stops at its left edge", () => {
  expect(css).toMatch(/\.aboutDesktopHero\s*\{[^}]*height:\s*var\(--career-baseline\)/s);
  expect(css).toMatch(/\.aboutDesktopPortrait\s*\{[^}]*top:\s*auto;[^}]*bottom:\s*0/s);
  expect(css).toMatch(/\.aboutCareerHeading\s*\{[^}]*width:\s*40\.85%/s);
  expect(css).toMatch(/\.aboutCareerHeading span\s*\{[^}]*display:\s*block/s);
});

test("timeline year labels reserve enough vertical line box", () => {
  expect(css).toMatch(/\.timelineYears\s*\{[^}]*height:\s*1\.5em;[^}]*line-height:\s*1\.5/s);
  expect(css).toMatch(/\.timelineYears span\s*\{[^}]*top:\s*0/s);
});
