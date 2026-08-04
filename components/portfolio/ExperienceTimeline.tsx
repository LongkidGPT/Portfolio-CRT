"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useMemo, useRef, useState } from "react";
import styles from "./portfolio.module.css";

const FIRST_YEAR = 2012;
const LAST_YEAR = 2026;
const VISIBLE_YEARS = 4;
const MONTHS_PER_YEAR = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToQuarter(value: number) {
  return Math.round(value * 4) / 4;
}

export default function ExperienceTimeline({
  activeYear,
  onActiveYearChange,
  onInteractionStart,
}: {
  activeYear: number;
  onActiveYearChange: (year: number) => void;
  onInteractionStart: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, year: activeYear, width: 1 });
  const years = useMemo(
    () => Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, index) => FIRST_YEAR + index),
    [],
  );
  const ticks = useMemo(
    () => Array.from(
      { length: (LAST_YEAR - FIRST_YEAR) * MONTHS_PER_YEAR + 1 },
      (_, index) => index,
    ),
    [],
  );
  const timelinePosition = (activeYear - FIRST_YEAR) / (LAST_YEAR - FIRST_YEAR);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    dragStart.current = { x: event.clientX, year: activeYear, width: Math.max(1, bounds.width) };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
    onInteractionStart();
    event.preventDefault();
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const delta = event.clientX - dragStart.current.x;
    const yearDelta = (delta / dragStart.current.width) * VISIBLE_YEARS;
    onActiveYearChange(
      clamp(roundToQuarter(dragStart.current.year - yearDelta), FIRST_YEAR, LAST_YEAR),
    );
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDragging(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next = activeYear;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next -= 0.25;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") next += 0.25;
    else if (event.key === "Home") next = FIRST_YEAR;
    else if (event.key === "End") next = LAST_YEAR;
    else return;

    event.preventDefault();
    onInteractionStart();
    onActiveYearChange(clamp(roundToQuarter(next), FIRST_YEAR, LAST_YEAR));
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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onLostPointerCapture={() => setDragging(false)}
      onKeyDown={handleKeyDown}
      data-dragging={dragging ? "true" : undefined}
      data-testid="career-timeline"
    >
      <div
        className={styles.timelineTrack}
        aria-hidden="true"
        style={{ "--timeline-position": timelinePosition } as CSSProperties}
      >
        <div className={styles.timelineTicks}>
          {ticks.map((index) => {
            const tickYear = FIRST_YEAR + index / MONTHS_PER_YEAR;
            const distance = Math.abs(tickYear - activeYear);
            const isYear = index % MONTHS_PER_YEAR === 0;
            const proximity = clamp(1 - distance / 0.9, 0, 1);
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

        <div className={styles.timelineYears}>
          {years.map((year) => <span key={year}>{year}</span>)}
        </div>
      </div>

      <span className={styles.timelineMarker} aria-hidden="true" />
    </div>
  );
}
