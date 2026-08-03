"use client";

import { useState } from "react";

import FullFramePortrait, {
  type FrameDiagnostics,
} from "@/components/portfolio/FullFramePortrait";
import styles from "@/components/portfolio/kv-sync-test.module.css";
import { KV_SYNC_NEUTRAL_FRAME } from "@/lib/portfolio/kv-sync-test";

const INITIAL_DIAGNOSTICS: FrameDiagnostics = {
  angle: null,
  frame: KV_SYNC_NEUTRAL_FRAME,
  targetFrame: KV_SYNC_NEUTRAL_FRAME,
  loaded: 0,
  errors: 0,
};

export default function KvSyncTest() {
  const [diagnostics, setDiagnostics] =
    useState<FrameDiagnostics>(INITIAL_DIAGNOSTICS);

  return (
    <main className={styles.stage}>
      <FullFramePortrait
        className={styles.canvas}
        ariaLabel="Full-frame KV synchronization test"
        onDiagnostics={setDiagnostics}
      />
      <aside className={styles.diagnostics} aria-label="KV test diagnostics">
        <span>FULL-FRAME SYNC</span>
        <span>
          ANGLE <b>{diagnostics.angle === null ? "neutral" : `${Math.round(diagnostics.angle)}°`}</b>
        </span>
        <span>
          FRAME <b>{diagnostics.frame}</b>/192
        </span>
        <span>
          LOADED <b>{diagnostics.loaded}</b>/193
        </span>
        <span>
          ERRORS <b>{diagnostics.errors}</b>
        </span>
      </aside>
    </main>
  );
}
