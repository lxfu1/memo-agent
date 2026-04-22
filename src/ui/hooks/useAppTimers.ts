/**
 * App-level timers hook
 * - Cursor blink (only when idle)
 * - Spinner animation (only when waiting)
 * - Buffer display tick (during streaming)
 */

import { useEffect, useState } from "react";
import type { AppState } from "../types.js";

export interface UseAppTimersResult {
  cursorVisible: boolean;
  spinnerFrame: number;
  bufferTick: number;
}

interface UseAppTimersOptions {
  appState: AppState;
  isWaiting: boolean;
}

export function useAppTimers({ appState, isWaiting }: UseAppTimersOptions): UseAppTimersResult {
  const [cursorVisible, setCursorVisible] = useState(true);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [, setBufferTick] = useState(0);

  const isActive = appState === "streaming" || appState === "tool_running" || isWaiting || appState === "searching";

  // Cursor blink — only when idle
  useEffect(() => {
    if (isActive) return;
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, [isActive]);

  // Spinner animation — only when waiting
  useEffect(() => {
    if (!isWaiting) return;
    const id = setInterval(() => setSpinnerFrame((f) => f + 1), 100);
    return () => clearInterval(id);
  }, [isWaiting]);

  // Buffer display tick — during streaming
  useEffect(() => {
    if (appState !== "streaming" || isWaiting) return;
    const id = setInterval(() => setBufferTick((n) => n + 1), 400);
    return () => clearInterval(id);
  }, [appState, isWaiting]);

  return {
    cursorVisible,
    spinnerFrame,
    bufferTick: 0, // Internal state, not needed externally
  };
}
