"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./portfolio.module.css";

export default function CaseOverlay({
  label,
  children,
  fallbackHref = "/",
}: {
  label: string;
  children: React.ReactNode;
  fallbackHref?: string;
}) {
  const router = useRouter();
  const reduced = Boolean(useReducedMotion());
  const closeButton = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const closeTimer = useRef<number | null>(null);
  const closeRef = useRef<() => void>(() => undefined);
  const [isClosing, setIsClosing] = useState(false);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setIsClosing(true);
    closeTimer.current = window.setTimeout(() => {
      if (window.history.length > 1) router.back();
      else router.replace(fallbackHref);
    }, reduced ? 100 : 320);
  }, [fallbackHref, reduced, router]);

  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);

  return (
    <motion.div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      initial={{ opacity: 0, y: reduced ? 0 : "7vh" }}
      animate={
        isClosing
          ? { opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : "2vh" }
          : { opacity: 1, scale: 1, y: 0 }
      }
      transition={{ duration: reduced ? 0.1 : isClosing ? 0.32 : 0.46 }}
      onClick={(event) => event.stopPropagation()}
    >
      <button ref={closeButton} className={styles.closeOverlay} type="button" aria-label="Close project" onClick={close}>CLOSE ×</button>
      {children}
    </motion.div>
  );
}
