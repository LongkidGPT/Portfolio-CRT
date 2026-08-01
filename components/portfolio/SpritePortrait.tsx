"use client";

import { useEffect, useRef } from "react";
import {
  KV_FRAME_COUNT,
  KV_HEAD_ANCHOR,
  KV_HEIGHT,
  KV_NEUTRAL_FRAME,
  KV_WIDTH,
  kvFrameSrc,
  portraitRect,
} from "@/lib/portfolio/kv";
import {
  frameForPointerAngle,
  pointerAngle,
  type Point,
} from "@/lib/portfolio/sprite";

interface SpritePortraitProps {
  focusPoint: Point | null;
  focusFrame?: number | null;
  motionReduced: boolean;
  className?: string;
}

export default function SpritePortrait({
  focusPoint,
  focusFrame = null,
  motionReduced,
  className,
}: SpritePortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusPointRef = useRef(focusPoint);
  const focusFrameRef = useRef(focusFrame);

  useEffect(() => {
    focusPointRef.current = focusPoint;
  }, [focusPoint]);

  useEffect(() => {
    focusFrameRef.current = focusFrame;
  }, [focusFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const images = new Array<HTMLImageElement | undefined>(KV_FRAME_COUNT);
    let animationFrame = 0;
    let drawnFrame = -1;
    let visible = document.visibilityState === "visible";
    let cancelled = false;

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const content = portraitRect(
        Math.max(1, bounds.width),
        Math.max(1, bounds.height),
      );
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const resolutionScale = Math.min(
        dpr,
        KV_WIDTH / content.width,
        KV_HEIGHT / content.height,
      );
      const nextWidth = Math.max(1, Math.round(bounds.width * resolutionScale));
      const nextHeight = Math.max(1, Math.round(bounds.height * resolutionScale));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        drawnFrame = -1;
      }
    };

    const drawFrame = (frame: number) => {
      const rounded =
        ((Math.round(frame) % KV_FRAME_COUNT) + KV_FRAME_COUNT) %
        KV_FRAME_COUNT;
      const image = images[rounded];

      if (rounded === drawnFrame || !image?.complete) return;

      const destination = portraitRect(canvas.width, canvas.height);

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        0,
        0,
        KV_WIDTH,
        KV_HEIGHT,
        destination.x,
        destination.y,
        destination.width,
        destination.height,
      );
      canvas.dataset.frame = String(rounded);
      drawnFrame = rounded;
    };

    const loadFrame = (index: number) => {
      const normalized =
        ((index % KV_FRAME_COUNT) + KV_FRAME_COUNT) % KV_FRAME_COUNT;
      if (images[normalized]) return;

      const image = new Image();
      images[normalized] = image;
      image.onload = () => {
        if (cancelled) return;
        if (normalized === KV_NEUTRAL_FRAME || drawnFrame < 0) {
          resizeCanvas();
          drawFrame(normalized);
        }
      };
      image.onerror = () => {
        images[normalized] = undefined;
      };
      image.src = kvFrameSrc(normalized);
    };

    const preloadFrames = () => {
      loadFrame(KV_NEUTRAL_FRAME);
      for (let distance = 1; distance < KV_FRAME_COUNT; distance += 1) {
        loadFrame(KV_NEUTRAL_FRAME + distance);
      }
    };

    const targetFrame = () => {
      const point = focusPointRef.current;
      const fixedFrame = focusFrameRef.current;
      if (motionReduced) return KV_NEUTRAL_FRAME;
      if (fixedFrame !== null) return fixedFrame;
      if (!point) return KV_NEUTRAL_FRAME;

      const bounds = canvas.getBoundingClientRect();
      const content = portraitRect(bounds.width, bounds.height);
      const anchor = {
        x: bounds.left + content.x + content.width * KV_HEAD_ANCHOR.x,
        y: bounds.top + content.y + content.height * KV_HEAD_ANCHOR.y,
      };

      return frameForPointerAngle(pointerAngle(point, anchor));
    };

    const tick = () => {
      if (cancelled) return;

      if (visible) {
        drawFrame(targetFrame());
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      visible = document.visibilityState === "visible";
    };

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            resizeCanvas();
            drawFrame(drawnFrame < 0 ? KV_NEUTRAL_FRAME : drawnFrame);
          });

    observer?.observe(canvas);
    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", handleVisibility);
    resizeCanvas();
    preloadFrames();
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      for (const image of images) {
        if (!image) continue;
        image.onload = null;
        image.onerror = null;
      }
      observer?.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [motionReduced]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="Interactive CRT portrait"
    />
  );
}
