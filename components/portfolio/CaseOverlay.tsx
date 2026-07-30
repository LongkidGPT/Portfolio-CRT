"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
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
  const reduced = useReducedMotion();
  const closeButton = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    if (window.history.length > 1) router.back();
    else router.replace(fallbackHref);
  }, [fallbackHref, router]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [close]);

  return (
    <motion.div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      initial={{ opacity: 0, y: reduced ? 0 : "7vh" }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.1 : 0.46 }}
      onClick={(event) => event.stopPropagation()}
    >
      <button ref={closeButton} className={styles.closeOverlay} type="button" aria-label="Close project" onClick={close}>CLOSE ×</button>
      {children}
    </motion.div>
  );
}
