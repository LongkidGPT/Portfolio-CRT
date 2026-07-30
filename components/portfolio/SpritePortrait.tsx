"use client";

import { useEffect, useRef } from "react";
import {
  frameForAngle,
  pointerAngle,
  shortestFrameDelta,
  type Point,
} from "@/lib/portfolio/sprite";

const FRAME_COUNT = 64;
const SHEET_COLUMNS = 8;
const SOURCE_CELL_SIZE = 640;

interface SpritePortraitProps {
  focusPoint: Point | null;
  motionReduced: boolean;
  className?: string;
}

export default function SpritePortrait({
  focusPoint,
  motionReduced,
  className,
}: SpritePortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusPointRef = useRef(focusPoint);

  useEffect(() => {
    focusPointRef.current = focusPoint;
  }, [focusPoint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    let animationFrame = 0;
    let currentFrame = 0;
    let drawnFrame = -1;
    let visible = document.visibilityState === "visible";
    let cancelled = false;

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.min(4096, Math.max(1, Math.round(bounds.width * dpr)));
      const nextHeight = Math.min(4096, Math.max(1, Math.round(bounds.height * dpr)));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        drawnFrame = -1;
      }
    };

    const drawFrame = (frame: number) => {
      const rounded = ((Math.round(frame) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;
      if (rounded === drawnFrame || !image.complete) return;

      const sourceX = (rounded % SHEET_COLUMNS) * SOURCE_CELL_SIZE;
      const sourceY = Math.floor(rounded / SHEET_COLUMNS) * SOURCE_CELL_SIZE;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        sourceX,
        sourceY,
        SOURCE_CELL_SIZE,
        SOURCE_CELL_SIZE,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      drawnFrame = rounded;
    };

    const tick = () => {
      if (cancelled) return;

      if (visible) {
        const point = focusPointRef.current;
        const targetFrame =
          motionReduced || !point
            ? 0
            : frameForAngle(pointerAngle(point, canvas.getBoundingClientRect()));

        if (motionReduced) {
          currentFrame = 0;
        } else {
          currentFrame +=
            shortestFrameDelta(targetFrame, currentFrame, FRAME_COUNT) * 0.16;
        }

        drawFrame(currentFrame);
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      visible = document.visibilityState === "visible";
    };

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(resizeCanvas);

    image.onload = () => {
      if (cancelled) return;
      resizeCanvas();
      drawFrame(0);
    };
    image.src = "/sprite/robot.webp";
    observer?.observe(canvas);
    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", handleVisibility);
    resizeCanvas();
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      image.onload = null;
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
