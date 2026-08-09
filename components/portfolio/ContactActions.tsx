"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/portfolio/clipboard";
import styles from "./portfolio.module.css";

const CONTACT_ACTIONS = [
  {
    label: "Copy email address",
    type: "email",
    value: "longkid@sohu.com",
    icon: "/kv/contact/mail.png",
  },
  {
    label: "Copy phone number",
    type: "phone",
    value: "18520224719",
    icon: "/kv/contact/phone.png",
  },
  {
    label: "Copy WeChat ID",
    type: "wechat",
    value: "lkchat1980",
    icon: "/kv/contact/wechat.png",
  },
] as const;

export default function ContactActions() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const copy = async (value: string) => {
    try {
      await copyText(value);
    } catch {
      return;
    }

    setCopied(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={styles.contactActions}>
      {CONTACT_ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          aria-label={action.label}
          onClick={() => void copy(action.value)}
        >
          {/* Supplied raster artwork must retain its original pixels. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={action.icon} alt="" draggable={false} />
        </button>
      ))}
      <span className={styles.copyFeedback} aria-live="polite">
        {copied ? "COPIED" : ""}
      </span>
    </div>
  );
}
