"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./portfolio.module.css";

const EMPTY_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

type CaseSlice = {
  src: `/kv/cases/${string}`;
  width: number;
  height: number;
};

type ProgressiveCaseSlicesProps = {
  slices: readonly CaseSlice[];
  alt: string;
  media: "(min-width: 768px)" | "(max-width: 767px)";
  className: string;
};

export default function ProgressiveCaseSlices({
  slices,
  alt,
  media,
  className,
}: ProgressiveCaseSlicesProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set([0]));

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack || slices.length < 2) return;

    if (!("IntersectionObserver" in window)) {
      const fallbackId = setTimeout(
        () => setLoaded(new Set(slices.map((_, index) => index))),
        0,
      );
      return () => clearTimeout(fallbackId);
    }

    const preloadDistance = Math.max(480, Math.round(window.innerHeight * 0.7));
    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number((entry.target as HTMLElement).dataset.sliceIndex));

        if (entering.length === 0) return;

        setLoaded((current) => {
          const next = new Set(current);
          entering.forEach((index) => next.add(index));
          return next;
        });
        entries.forEach((entry) => {
          if (entry.isIntersecting) observer.unobserve(entry.target);
        });
      },
      { rootMargin: `${preloadDistance}px 0px`, threshold: 0.01 },
    );

    stack
      .querySelectorAll<HTMLElement>("[data-slice-index]")
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [slices]);

  return (
    <div ref={stackRef} className={className}>
      {slices.map((slice, index) => {
        const shouldLoad = loaded.has(index);

        return (
          <div
            key={slice.src}
            className={styles.caseSlice}
            data-slice-index={index}
            data-slice-src={slice.src}
            style={{ aspectRatio: `${slice.width} / ${slice.height}` }}
          >
            {shouldLoad ? (
              <picture>
                <source media={media} srcSet={slice.src} />
                <img
                  src={EMPTY_PIXEL}
                  alt={index === 0 ? alt : ""}
                  width={slice.width}
                  height={slice.height}
                  loading="eager"
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              </picture>
            ) : (
              <span className={styles.caseSlicePlaceholder} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}
