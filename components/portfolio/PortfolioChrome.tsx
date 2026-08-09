"use client";

import { useEffect, useState } from "react";
import { rulerWidthsForIndex } from "@/lib/portfolio/interactions";
import PortfolioHeader from "./PortfolioHeader";
import styles from "./portfolio.module.css";

function Ruler({ side, activeIndex }: { side: "left" | "right"; activeIndex: number | null }) {
  const widths = rulerWidthsForIndex(activeIndex, side);
  return (
    <div className={styles.ruler} data-side={side} aria-hidden="true">
      {widths.map((width, index) => (
        <span key={index} style={{ width }} />
      ))}
    </div>
  );
}

export default function PortfolioChrome({ activeIndex }: { activeIndex: number | null }) {
  const [resolution, setResolution] = useState("0000 × 0000");

  useEffect(() => {
    const update = () => {
      setResolution(`${window.innerWidth} × ${window.innerHeight}`);
    };
    update();
    const timer = window.setInterval(update, 60_000);
    window.addEventListener("resize", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      <PortfolioHeader />
      <Ruler side="left" activeIndex={activeIndex} />
      <Ruler side="right" activeIndex={activeIndex} />
      <div className={styles.resolution}>RES / {resolution}</div>
    </>
  );
}
