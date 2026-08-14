"use client";

import { useEffect, useRef } from "react";
import {
  MOBILE_KV_FRAME_COUNT,
  MOBILE_KV_HEIGHT,
  MOBILE_KV_NEUTRAL_FRAME,
  MOBILE_KV_PROJECT_FRAMES,
  MOBILE_KV_WIDTH,
  mobileKvFrameSrc,
  normalizeMobileKvFrame,
  stepMobileKvFrame,
} from "@/lib/portfolio/kv-mobile";
import { shortestFrameDelta } from "@/lib/portfolio/sprite";

interface Props {
  className?: string;
  fixedFrame?: number;
  motionReduced?: boolean;
}

export default function MobileFramePortrait({
  className,
  fixedFrame = MOBILE_KV_NEUTRAL_FRAME,
  motionReduced = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fixedFrameRef = useRef(fixedFrame);
  const motionReducedRef = useRef(motionReduced);
  const requestRenderRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    fixedFrameRef.current = normalizeMobileKvFrame(fixedFrame);
    motionReducedRef.current = motionReduced;
    requestRenderRef.current();
  }, [fixedFrame, motionReduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const images = new Array<HTMLImageElement | undefined>(MOBILE_KV_FRAME_COUNT);
    let displayFrame = normalizeMobileKvFrame(fixedFrameRef.current);
    let drawnFrame = -1;
    let animationFrame = 0;
    let lastTimestamp = 0;
    let cancelled = false;
    let visible = document.visibilityState === "visible";

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = Math.max(1, bounds.width);
      const displayHeight = displayWidth * (MOBILE_KV_HEIGHT / MOBILE_KV_WIDTH);
      const width = Math.max(1, Math.round(displayWidth * dpr));
      const height = Math.max(1, Math.round(displayHeight * dpr));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
      drawnFrame = -1;
    };

    const drawFrame = (frame: number) => {
      const normalized = normalizeMobileKvFrame(Math.round(frame));
      const image = images[normalized];
      if (!image?.complete || normalized === drawnFrame) return false;
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
      drawnFrame = normalized;
      canvas.dataset.frame = String(normalized);
      return true;
    };

    const loadFrame = (frame: number) => {
      const normalized = normalizeMobileKvFrame(frame);
      if (images[normalized]) return;
      const image = new Image();
      images[normalized] = image;
      image.onload = () => {
        if (cancelled) return;
        canvas.dataset.loaded = String(
          images.reduce((count, item) => count + (item?.complete ? 1 : 0), 0),
        );
        if (drawnFrame < 0 || normalized === Math.round(displayFrame)) {
          resizeCanvas();
          drawFrame(displayFrame);
        }
      };
      image.onerror = () => {
        if (cancelled) return;
        canvas.dataset.errors = String(Number(canvas.dataset.errors || 0) + 1);
      };
      image.src = mobileKvFrameSrc(normalized);
    };

    const priorityFrames = [
      fixedFrameRef.current,
      ...Object.values(MOBILE_KV_PROJECT_FRAMES),
    ];
    for (const frame of priorityFrames) loadFrame(frame);

    const preloadPath = (from: number, target: number, lookAhead = 10) => {
      const delta = shortestFrameDelta(target, from, MOBILE_KV_FRAME_COUNT);
      const direction = Math.sign(delta);
      const steps = Math.min(Math.ceil(Math.abs(delta)), lookAhead);
      loadFrame(target);
      for (let index = 0; index <= steps; index += 1) {
        loadFrame(from + direction * index);
      }
    };

    const tick = (timestamp: number) => {
      if (cancelled) return;
      animationFrame = 0;
      let shouldContinue = false;
      if (visible) {
        const target = normalizeMobileKvFrame(fixedFrameRef.current);
        const elapsed = lastTimestamp > 0 ? timestamp - lastTimestamp : 1000 / 60;
        displayFrame = motionReducedRef.current
          ? target
          : stepMobileKvFrame(displayFrame, target, elapsed);
        const roundedFrame = normalizeMobileKvFrame(Math.round(displayFrame));
        preloadPath(roundedFrame, target);
        canvas.dataset.targetFrame = String(Math.round(target));
        drawFrame(roundedFrame);
        shouldContinue =
          Math.abs(
            shortestFrameDelta(target, displayFrame, MOBILE_KV_FRAME_COUNT),
          ) >= 0.12;
      }
      lastTimestamp = timestamp;
      if (visible && !motionReducedRef.current && shouldContinue) scheduleTick();
    };

    const scheduleTick = () => {
      if (cancelled || animationFrame !== 0) return;
      animationFrame = window.requestAnimationFrame(tick);
    };
    requestRenderRef.current = scheduleTick;

    const handleResize = () => {
      resizeCanvas();
      drawFrame(displayFrame);
    };
    const handleVisibility = () => {
      visible = document.visibilityState === "visible";
      lastTimestamp = 0;
      if (visible) scheduleTick();
    };
    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(handleResize);

    observer?.observe(canvas);
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    resizeCanvas();
    scheduleTick();

    return () => {
      cancelled = true;
      requestRenderRef.current = () => undefined;
      for (const image of images) {
        if (!image) continue;
        image.onload = null;
        image.onerror = null;
      }
      observer?.disconnect();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="Mobile full-frame KV portrait"
      data-frame={MOBILE_KV_NEUTRAL_FRAME}
      data-target-frame={fixedFrame}
      data-loaded="0"
      data-errors="0"
      data-source-ratio="9:16"
    />
  );
}
