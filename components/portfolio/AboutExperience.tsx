"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import ExperienceTimeline from "./ExperienceTimeline";
import styles from "./portfolio.module.css";

const DEFAULT_YEAR = 2014;

const experiences = [
  { start: 2023, end: 2026, label: "2023–2026 Anker Innovations" },
  { start: 2021, end: 2023, label: "2021–2023 Linsy" },
  { start: 2018, end: 2021, label: "2018–2021 Extend" },
  { start: 2015, end: 2018, label: "2015–2018 GREY-DPI" },
  { start: 2012, end: 2015, label: "2012–2015 UNI Group" },
] as const;

function experienceAt(year: number) {
  return experiences.findIndex(({ start, end }) => year >= start && year <= end);
}

export default function AboutExperience() {
  const [activeYear, setActiveYear] = useState(DEFAULT_YEAR);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activateYear = (year: number) => {
    setActiveYear(year);
    setActiveIndex(experienceAt(year));
  };

  return (
    <>
      <div className={styles.experienceRows} aria-label="Work experience">
        {experiences.map((experience, index) => (
          <button
            key={experience.label}
            type="button"
            className={styles.experienceRowTarget}
            aria-label={experience.label}
            aria-current={activeIndex === index ? "true" : undefined}
            style={{ "--experience-index": index } as CSSProperties}
            onPointerEnter={() => {
              setActiveIndex(index);
              setActiveYear(Math.min(experience.start + 0.5, experience.end));
            }}
            onPointerLeave={() => setActiveIndex(null)}
            onFocus={() => {
              setActiveIndex(index);
              setActiveYear(Math.min(experience.start + 0.5, experience.end));
            }}
            onBlur={() => setActiveIndex(null)}
          >
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>

      <div className={styles.aboutTimelineOverlay}>
        <ExperienceTimeline
          activeYear={activeYear}
          onActiveYearChange={activateYear}
          onInteractionStart={() => setActiveIndex(experienceAt(activeYear))}
        />
      </div>
    </>
  );
}
