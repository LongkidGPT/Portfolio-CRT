"use client";

import { useEffect, useRef } from "react";
import {
  MOBILE_KV_HEIGHT,
  MOBILE_KV_NEUTRAL_FRAME,
  MOBILE_KV_WIDTH,
  mobileKvFrameSrc,
} from "@/lib/portfolio/kv-mobile";

interface Props {
  className?: string;
}

export default function MobileFramePortrait({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const image = new Image();
    let cancelled = false;

    const draw = () => {
      if (cancelled || !image.complete) return;
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = Math.max(1, bounds.width);
      const displayHeight = displayWidth * (MOBILE_KV_HEIGHT / MOBILE_KV_WIDTH);
      canvas.width = Math.max(1, Math.round(displayWidth * dpr));
      canvas.height = Math.max(1, Math.round(displayHeight * dpr));
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        0,
        0,
        MOBILE_KV_WIDTH,
        MOBILE_KV_HEIGHT,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      canvas.dataset.loaded = "1";
    };

    image.onload = draw;
    image.src = mobileKvFrameSrc(MOBILE_KV_NEUTRAL_FRAME);
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    window.addEventListener("resize", draw);

    return () => {
      cancelled = true;
      image.onload = null;
      observer.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="Mobile full-frame KV portrait"
      data-frame={MOBILE_KV_NEUTRAL_FRAME}
      data-loaded="0"
      data-source-ratio="9:16"
    />
  );
}
