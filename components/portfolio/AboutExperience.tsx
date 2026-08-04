"use client";

import { useState } from "react";
import ExperienceTimeline from "./ExperienceTimeline";
import styles from "./portfolio.module.css";

const DEFAULT_YEAR = 2014;

const experiences = [
  {
    start: 2023,
    end: 2026,
    years: "2023　–　2026",
    label: "2023–2026 Anker Innovations",
    company: "安克创新 Anker Innovations",
    role: "资深视觉设计师",
  },
  {
    start: 2021,
    end: 2023,
    years: "2021　–　2023",
    label: "2021–2023 Linsy",
    company: "林氏家居 Linsy",
    role: "创意设计主管",
  },
  {
    start: 2018,
    end: 2021,
    years: "2018　–　2021",
    label: "2018–2021 Extend",
    company: "熠思堡创意 Extend",
    role: "创意设计组长",
  },
  {
    start: 2015,
    end: 2018,
    years: "2015　–　2018",
    label: "2015–2018 GREY-DPI",
    company: "GREY-DPI (wpp)",
    role: "资深视觉设计师",
  },
  {
    start: 2012,
    end: 2015,
    years: "2012　–　2015",
    label: "2012–2015 UNI Group",
    company: "同立集团 UNI Group",
    role: "视觉设计师",
  },
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
    <section className={styles.aboutExperience} aria-label="Work experience">
      <div className={styles.experienceRows}>
        {experiences.map((experience, index) => (
          <button
            key={experience.years}
            type="button"
            className={styles.experienceRowTarget}
            aria-label={experience.label}
            aria-current={activeIndex === index ? "true" : undefined}
            onPointerEnter={() => {
              setActiveIndex(index);
              setActiveYear(Math.min(experience.start + 0.5, experience.end));
            }}
            onClick={() => {
              setActiveIndex(index);
              setActiveYear(Math.min(experience.start + 0.5, experience.end));
            }}
            onFocus={() => {
              setActiveIndex(index);
              setActiveYear(Math.min(experience.start + 0.5, experience.end));
            }}
          >
            <span className={styles.experienceArrow} aria-hidden="true">→</span>
            <span className={styles.experienceYears}>{experience.years}</span>
            <strong>{experience.company}</strong>
            <small>{experience.role}</small>
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
    </section>
  );
}
