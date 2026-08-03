"use client";

import { useEffect, useRef } from "react";

import styles from "@/components/portfolio/kv-sync-test.module.css";
import { containRect } from "@/lib/portfolio/kv";
import {
  KV_SYNC_FRAME_COUNT,
  KV_SYNC_HEAD_ANCHOR,
  KV_SYNC_HEIGHT,
  KV_SYNC_NEUTRAL_FRAME,
  KV_SYNC_WIDTH,
  angleForKvSyncPointer,
  frameForKvSyncPointer,
  kvSyncFrameSrc,
  stepKvSyncFrame,
} from "@/lib/portfolio/kv-sync-test";
import type { Point } from "@/lib/portfolio/sprite";

export default function KvSyncTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLElement>(null);
  const loadedRef = useRef<HTMLElement>(null);
  const errorsRef = useRef<HTMLElement>(null);

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

    const updateDiagnostics = (angle: number | null, frame: number) => {
      canvas.dataset.frame = String(frame);
      canvas.dataset.loaded = String(loadedCount);
      canvas.dataset.errors = String(errorCount);
      if (angleRef.current) {
        angleRef.current.textContent =
          angle === null ? "neutral" : `${Math.round(angle)}°`;
      }
      if (frameRef.current) frameRef.current.textContent = String(frame);
      if (loadedRef.current) loadedRef.current.textContent = String(loadedCount);
      if (errorsRef.current) errorsRef.current.textContent = String(errorCount);
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

      const destination = containRect(
        KV_SYNC_WIDTH,
        KV_SYNC_HEIGHT,
        canvas.width,
        canvas.height,
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
      updateDiagnostics(angle, frame);
      return true;
    };

    const loadFrame = (frame: number) => {
      if (images[frame]) return;

      const image = new Image();
      images[frame] = image;
      image.onload = () => {
        if (cancelled) return;
        loadedCount += 1;
        canvas.dataset.loaded = String(loadedCount);
        if (loadedRef.current) loadedRef.current.textContent = String(loadedCount);
        if (frame === KV_SYNC_NEUTRAL_FRAME || drawnFrame < 0) {
          resizeCanvas();
          drawFrame(frame);
        }
      };
      image.onerror = () => {
        if (cancelled) return;
        errorCount += 1;
        canvas.dataset.errors = String(errorCount);
        if (errorsRef.current) errorsRef.current.textContent = String(errorCount);
      };
      image.src = kvSyncFrameSrc(frame);
    };

    const preloadFrames = () => {
      loadFrame(KV_SYNC_NEUTRAL_FRAME);
      for (let distance = 1; distance <= 96; distance += 1) {
        loadFrame(
          (KV_SYNC_NEUTRAL_FRAME + distance) % KV_SYNC_FRAME_COUNT,
        );
        loadFrame(
          (KV_SYNC_NEUTRAL_FRAME - distance + KV_SYNC_FRAME_COUNT) %
            KV_SYNC_FRAME_COUNT,
        );
      }
    };

    const target = () => {
      if (!pointer) {
        return { angle: null, frame: KV_SYNC_NEUTRAL_FRAME };
      }

      const bounds = canvas.getBoundingClientRect();
      const content = containRect(
        KV_SYNC_WIDTH,
        KV_SYNC_HEIGHT,
        bounds.width,
        bounds.height,
      );
      const anchor = {
        x: bounds.left + content.x + content.width * KV_SYNC_HEAD_ANCHOR.x,
        y: bounds.top + content.y + content.height * KV_SYNC_HEAD_ANCHOR.y,
      };
      const normalizedX = (pointer.x - anchor.x) / content.width;
      const normalizedY = (pointer.y - anchor.y) / content.height;
      const angle = angleForKvSyncPointer(normalizedX, normalizedY);
      return {
        angle,
        frame: frameForKvSyncPointer(angle, normalizedX, normalizedY),
      };
    };

    const tick = (timestamp: number) => {
      if (cancelled) return;
      if (visible) {
        const next = target();
        const elapsed = lastTimestamp > 0 ? timestamp - lastTimestamp : 1000 / 60;
        displayFrame = stepKvSyncFrame(displayFrame, next.frame, elapsed);
        const roundedFrame =
          Math.round(displayFrame) % KV_SYNC_FRAME_COUNT;
        canvas.dataset.targetFrame = String(
          Math.round(next.frame) % KV_SYNC_FRAME_COUNT,
        );
        drawFrame(roundedFrame, next.angle);
      }
      lastTimestamp = timestamp;
      animationFrame = window.requestAnimationFrame(tick);
    };

    const handlePointer = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
    };
    const handleVisibility = () => {
      visible = document.visibilityState === "visible";
      lastTimestamp = 0;
    };
    const handleResize = () => {
      const previous =
        drawnFrame < 0
          ? KV_SYNC_NEUTRAL_FRAME
          : Math.round(displayFrame) % KV_SYNC_FRAME_COUNT;
      resizeCanvas();
      drawFrame(previous);
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
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <main className={styles.stage}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label="Full-frame KV synchronization test"
        data-frame={KV_SYNC_NEUTRAL_FRAME}
        data-loaded="0"
        data-errors="0"
      />
      <aside className={styles.diagnostics} aria-label="KV test diagnostics">
        <span>FULL-FRAME SYNC</span>
        <span>
          ANGLE <b ref={angleRef}>neutral</b>
        </span>
        <span>
          FRAME <b ref={frameRef}>{KV_SYNC_NEUTRAL_FRAME}</b>/192
        </span>
        <span>
          LOADED <b ref={loadedRef}>0</b>/193
        </span>
        <span>
          ERRORS <b ref={errorsRef}>0</b>
        </span>
      </aside>
    </main>
  );
}
