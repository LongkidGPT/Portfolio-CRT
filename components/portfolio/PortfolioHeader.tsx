"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ContactActions from "./ContactActions";
import styles from "./portfolio.module.css";

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date).toUpperCase();
}

export default function PortfolioHeader({
  roleLabel = "VISUAL DESIGNER",
}: {
  roleLabel?: string;
}) {
  const pathname = usePathname();
  const aboutSelected = pathname === "/about";
  const [time, setTime] = useState("—:— PM");

  useEffect(() => {
    const update = () => setTime(formatTime(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className={styles.chrome}>
      <div className={styles.identity}>
        <strong>KID LONG</strong><span>{roleLabel}</span>
      </div>
      <nav className={styles.workNav} aria-label="Portfolio">
        <Link
          href="/"
          aria-label="WORK @"
          aria-current={aboutSelected ? undefined : "page"}
          className={aboutSelected ? styles.navUnselected : styles.navSelected}
        >
          {aboutSelected ? "WORK @" : "→ WORK @"}
        </Link>
        <Link
          href="/about"
          aria-label="ABOUT ME"
          aria-current={aboutSelected ? "page" : undefined}
          className={aboutSelected ? styles.navSelected : styles.navUnselected}
        >
          {aboutSelected ? "→ ABOUT ME" : "ABOUT ME"}
        </Link>
      </nav>
      <div className={styles.contact}>
        <strong>CONTACT</strong>
        <ContactActions />
      </div>
      <div className={styles.time}>
        <strong>LET&apos;S TALK, ME</strong><span>{time} GMT+8</span>
      </div>
    </header>
  );
}
