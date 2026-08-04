"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useMemo, useState } from "react";
import styles from "./portfolio.module.css";

const FIRST_YEAR = 2012;
const LAST_YEAR = 2026;
const DEFAULT_YEAR = 2014;
const WINDOW_YEARS = 4;
const MONTHS_PER_YEAR = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToQuarter(value: number) {
  return Math.round(value * 4) / 4;
}

export default function ExperienceTimeline() {
  const [activeYear, setActiveYear] = useState(DEFAULT_YEAR);
  const windowStart = clamp(
    Math.floor(activeYear) - 2,
    FIRST_YEAR,
    LAST_YEAR - WINDOW_YEARS,
  );
  const markerProgress = (activeYear - windowStart) / WINDOW_YEARS;
  const years = useMemo(
    () => Array.from({ length: WINDOW_YEARS + 1 }, (_, index) => windowStart + index),
    [windowStart],
  );
  const ticks = useMemo(
    () => Array.from({ length: WINDOW_YEARS * MONTHS_PER_YEAR + 1 }, (_, index) => index),
    [],
  );

  const updateFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width <= 0) return;
    const progress = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    setActiveYear(roundToQuarter(FIRST_YEAR + progress * (LAST_YEAR - FIRST_YEAR)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next = activeYear;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next -= 0.25;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") next += 0.25;
    else if (event.key === "Home") next = FIRST_YEAR;
    else if (event.key === "End") next = LAST_YEAR;
    else return;

    event.preventDefault();
    setActiveYear(clamp(roundToQuarter(next), FIRST_YEAR, LAST_YEAR));
  };

  return (
    <div
      className={styles.experienceTimeline}
      role="slider"
      tabIndex={0}
      aria-label="Career timeline"
      aria-valuemin={FIRST_YEAR}
      aria-valuemax={LAST_YEAR}
      aria-valuenow={activeYear}
      aria-valuetext={`${activeYear}`}
      onPointerMove={updateFromPointer}
      onKeyDown={handleKeyDown}
      data-testid="career-timeline"
    >
      <div className={styles.timelineTicks} aria-hidden="true">
        {ticks.map((index) => {
          const progress = index / (ticks.length - 1);
          const distance = Math.abs(progress - markerProgress);
          const isYear = index % MONTHS_PER_YEAR === 0;
          const proximity = clamp(1 - distance / 0.18, 0, 1);
          const scale = Math.max(isYear ? 0.72 : 0.42, 0.42 + proximity * 0.58);
          return (
            <span
              key={index}
              className={isYear ? styles.timelineYearTick : undefined}
              style={{ "--tick-scale": scale } as CSSProperties}
            />
          );
        })}
      </div>

      <span
        className={styles.timelineMarker}
        aria-hidden="true"
        style={{ "--marker-progress": markerProgress } as CSSProperties}
      />

      <div className={styles.timelineYears} aria-hidden="true">
        {years.map((year) => <span key={year}>{year}</span>)}
      </div>
    </div>
  );
}
