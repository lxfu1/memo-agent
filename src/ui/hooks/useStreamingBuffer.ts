/**
 * Streaming buffer hook — ref-based, no internal timer
 *
 * The 50 ms self-flush timer was the primary source of terminal flickering:
 * it fired independently of the 100 ms spinner tick, causing two separate
 * Ink re-draws per 100 ms window. The buffer is now a plain ref; React
 * re-renders that are already triggered by the spinner tick (every 100 ms
 * while streaming) read the latest buffer value through the getter.
 * The first delta also triggers a re-render via setIsWaiting(false) in App,
 * so latency to first visible character is not affected.
 */

import { useRef } from "react";

export interface UseStreamingBufferResult {
  buffer: string;
  append: (delta: string) => void;
  clear: () => void;
}

export function useStreamingBuffer(): UseStreamingBufferResult {
  const bufRef = useRef("");

  return {
    get buffer() {
      return bufRef.current;
    },
    append(delta: string) {
      bufRef.current += delta;
    },
    clear() {
      bufRef.current = "";
    },
  };
}
