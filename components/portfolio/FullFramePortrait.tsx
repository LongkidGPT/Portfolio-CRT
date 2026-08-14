"use client";

import { useEffect, useRef } from "react";

import { coverRect } from "@/lib/portfolio/kv";
import {
  KV_SYNC_FRAME_COUNT,
  KV_SYNC_HEAD_ANCHOR,
  KV_SYNC_HEIGHT,
  KV_SYNC_NEUTRAL_FRAME,
  KV_SYNC_PROJECT_FRAMES,
  KV_SYNC_WIDTH,
  angleForKvSyncPointer,
  frameForKvSyncPointer,
  kvSyncFrameSrc,
  stepKvSyncFrame,
} from "@/lib/portfolio/kv-sync-test";
import type { Point } from "@/lib/portfolio/sprite";
import { shortestFrameDelta } from "@/lib/portfolio/sprite";

export interface FrameDiagnostics {
  angle: number | null;
  frame: number;
  targetFrame: number;
  loaded: number;
  errors: number;
}

interface FullFramePortraitProps {
  fixedFrame?: number | null;
  motionReduced?: boolean;
  className?: string;
  ariaLabel?: string;
  onDiagnostics?: (value: FrameDiagnostics) => void;
}

export default function FullFramePortrait({
  fixedFrame = null,
  motionReduced = false,
  className,
  ariaLabel = "Interactive full-frame KV portrait",
  onDiagnostics,
}: FullFramePortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fixedFrameRef = useRef(fixedFrame);
  const motionReducedRef = useRef(motionReduced);
  const diagnosticsRef = useRef(onDiagnostics);
  const requestRenderRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    fixedFrameRef.current = fixedFrame;
    motionReducedRef.current = motionReduced;
    diagnosticsRef.current = onDiagnostics;
    requestRenderRef.current();
  }, [fixedFrame, motionReduced, onDiagnostics]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const images = new Array<HTMLImageElement | undefined>(KV_SYNC_FRAME_COUNT);
    let pointer: Point | null = null;
    let drawnFrame = -1;
    let displayFrame = KV_SYNC_NEUTRAL_FRAME;
    let loadedCount = 0;
    let errorCount = 0;
    let animationFrame = 0;
    let cancelled = false;
    let visible = document.visibilityState === "visible";
    let lastTimestamp = 0;
    let diagnostics: FrameDiagnostics = {
      angle: null,
      frame: KV_SYNC_NEUTRAL_FRAME,
      targetFrame: KV_SYNC_NEUTRAL_FRAME,
      loaded: 0,
      errors: 0,
    };

    const publishDiagnostics = (next: Partial<FrameDiagnostics>) => {
      const updated = { ...diagnostics, ...next };
      const changed =
        updated.angle !== diagnostics.angle ||
        updated.frame !== diagnostics.frame ||
        updated.targetFrame !== diagnostics.targetFrame ||
        updated.loaded !== diagnostics.loaded ||
        updated.errors !== diagnostics.errors;

      diagnostics = updated;
      canvas.dataset.frame = String(updated.frame);
      canvas.dataset.targetFrame = String(updated.targetFrame);
      canvas.dataset.loaded = String(updated.loaded);
      canvas.dataset.errors = String(updated.errors);
      if (changed) diagnosticsRef.current?.(updated);
    };

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.max(1, Math.round(bounds.width * dpr));
      const nextHeight = Math.max(1, Math.round(bounds.height * dpr));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
        drawnFrame = -1;
      }
    };

    const drawFrame = (frame: number, angle: number | null = null) => {
      const image = images[frame];
      if (!image?.complete || frame === drawnFrame) return false;

      const destination = coverRect(
        KV_SYNC_WIDTH,
        KV_SYNC_HEIGHT,
        canvas.width,
        canvas.height,
        KV_SYNC_HEAD_ANCHOR,
      );
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        0,
        0,
        KV_SYNC_WIDTH,
        KV_SYNC_HEIGHT,
        destination.x,
        destination.y,
        destination.width,
        destination.height,
      );
      drawnFrame = frame;
      publishDiagnostics({ angle, frame });
      return true;
    };

    const loadFrame = (frame: number) => {
      const normalized =
        ((Math.round(frame) % KV_SYNC_FRAME_COUNT) + KV_SYNC_FRAME_COUNT) %
        KV_SYNC_FRAME_COUNT;
      if (images[normalized]) return;

      const image = new Image();
      images[normalized] = image;
      image.onload = () => {
        if (cancelled) return;
        loadedCount += 1;
        publishDiagnostics({ loaded: loadedCount });
        if (normalized === KV_SYNC_NEUTRAL_FRAME || drawnFrame < 0) {
          resizeCanvas();
          drawFrame(normalized);
        }
      };
      image.onerror = () => {
        if (cancelled) return;
        errorCount += 1;
        publishDiagnostics({ errors: errorCount });
      };
      image.src = kvSyncFrameSrc(normalized);
    };

    const preloadPriorityFrames = () => {
      loadFrame(KV_SYNC_NEUTRAL_FRAME);
      for (const frame of Object.values(KV_SYNC_PROJECT_FRAMES)) loadFrame(frame);
    };

    const preloadPath = (from: number, target: number, lookAhead = 8) => {
      const delta = shortestFrameDelta(target, from, KV_SYNC_FRAME_COUNT);
      const direction = Math.sign(delta);
      const steps = Math.min(Math.ceil(Math.abs(delta)), lookAhead);
      loadFrame(target);
      for (let index = 0; index <= steps; index += 1) {
        loadFrame(from + direction * index);
      }
    };

    const pointerTarget = () => {
      if (fixedFrameRef.current !== null) {
        return { angle: null, frame: fixedFrameRef.current };
      }
      if (motionReducedRef.current || !pointer) {
        return { angle: null, frame: KV_SYNC_NEUTRAL_FRAME };
      }

      const bounds = canvas.getBoundingClientRect();
      const anchor = {
        x: bounds.left + bounds.width * KV_SYNC_HEAD_ANCHOR.x,
        y: bounds.top + bounds.height * KV_SYNC_HEAD_ANCHOR.y,
      };
      const normalizedX = (pointer.x - anchor.x) / bounds.width;
      const normalizedY = (pointer.y - anchor.y) / bounds.height;
      const angle = angleForKvSyncPointer(normalizedX, normalizedY);
      return {
        angle,
        frame: frameForKvSyncPointer(angle, normalizedX, normalizedY),
      };
    };

    const tick = (timestamp: number) => {
      if (cancelled) return;
      animationFrame = 0;
      let shouldContinue = false;
      if (visible) {
        const next = pointerTarget();
        const elapsed = lastTimestamp > 0 ? timestamp - lastTimestamp : 1000 / 60;
        displayFrame = motionReducedRef.current
          ? next.frame
          : stepKvSyncFrame(displayFrame, next.frame, elapsed);
        const roundedFrame = Math.round(displayFrame) % KV_SYNC_FRAME_COUNT;
        const roundedTarget = Math.round(next.frame) % KV_SYNC_FRAME_COUNT;
        preloadPath(roundedFrame, roundedTarget);
        publishDiagnostics({ angle: next.angle, targetFrame: roundedTarget });
        drawFrame(roundedFrame, next.angle);
        shouldContinue =
          Math.abs(
            shortestFrameDelta(next.frame, displayFrame, KV_SYNC_FRAME_COUNT),
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

    const handlePointer = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      scheduleTick();
    };
    const handleVisibility = () => {
      visible = document.visibilityState === "visible";
      lastTimestamp = 0;
      if (visible) scheduleTick();
    };
    const handleResize = () => {
      const previous =
        drawnFrame < 0
          ? KV_SYNC_NEUTRAL_FRAME
          : Math.round(displayFrame) % KV_SYNC_FRAME_COUNT;
      resizeCanvas();
      drawFrame(previous, diagnostics.angle);
    };
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleResize);
    const finePointer = window.matchMedia?.("(pointer: fine)").matches ?? true;

    observer?.observe(canvas);
    window.addEventListener("resize", handleResize);
    if (finePointer) window.addEventListener("pointermove", handlePointer);
    document.addEventListener("visibilitychange", handleVisibility);
    resizeCanvas();
    preloadPriorityFrames();
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
      window.removeEventListener("pointermove", handlePointer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label={ariaLabel}
      data-frame={KV_SYNC_NEUTRAL_FRAME}
      data-target-frame={KV_SYNC_NEUTRAL_FRAME}
      data-loaded="0"
      data-errors="0"
    />
  );
}
