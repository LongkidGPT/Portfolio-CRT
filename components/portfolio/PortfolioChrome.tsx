"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./portfolio.module.css";

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date).toUpperCase();
}

function Ruler({ side }: { side: "left" | "right" }) {
  return (
    <div className={styles.ruler} data-side={side} aria-hidden="true">
      {[28, 52, 84, 126, 168, 126, 84, 52, 28].map((width, index) => (
        <span key={`${width}-${index}`} style={{ width }} />
      ))}
    </div>
  );
}

export default function PortfolioChrome() {
  const [time, setTime] = useState("—:— PM");
  const [resolution, setResolution] = useState("0000 × 0000");

  useEffect(() => {
    const update = () => {
      setTime(formatTime(new Date()));
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
      <header className={styles.chrome}>
        <div className={styles.identity}>
          <strong>KID LONG</strong><span>VISUAL DESIGNER</span>
        </div>
        <nav className={styles.workNav} aria-label="Portfolio">
          <strong>→ WORK @</strong><Link href="/about">ABOUT</Link>
        </nav>
        <div className={styles.contact}>
          <strong>CONTACT</strong>
          <a href="mailto:long.kidq@gmail.com" aria-label="Email Kid Long">✉</a>
        </div>
        <div className={styles.time}>
          <strong>LET&apos;S TALK, ME</strong><span>{time} GMT+8</span>
        </div>
      </header>
      <Ruler side="left" />
      <Ruler side="right" />
      <div className={styles.resolution}>RES / {resolution}</div>
    </>
  );
}
