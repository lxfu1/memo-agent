import { useCallback, useRef, useState } from "react";
import type { InputState } from "./types.js";

export const MAX_INPUT_LINES = 20;
export const MAX_HISTORY = 50;

export function useInputState(): InputState & { pushHistory: (text: string) => void } {
  const linesRef = useRef<string[]>([""]);
  const currentLineIdxRef = useRef(0);
  const cursorPosRef = useRef(0);

  const [linesDisplay, setLinesDisplay] = useState<string[]>([""]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);

  const inputHistoryRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);
  const savedInputRef = useRef<string[]>([""]);

  const getInputText = useCallback((): string => {
    return linesRef.current.join("\n");
  }, []);

  const setLines = useCallback((newLines: string[], newLineIdx?: number, newCursorPos?: number) => {
    linesRef.current = newLines;
    setLinesDisplay([...newLines]);
    if (newLineIdx !== undefined) {
      currentLineIdxRef.current = newLineIdx;
      setCurrentLineIdx(newLineIdx);
    }
    if (newCursorPos !== undefined) {
      cursorPosRef.current = newCursorPos;
      setCursorPos(newCursorPos);
    }
  }, []);

  const updateCursorInLine = useCallback((pos: number) => {
    cursorPosRef.current = pos;
    setCursorPos(pos);
  }, []);

  const updateCurrentLine = useCallback((idx: number) => {
    currentLineIdxRef.current = idx;
    setCurrentLineIdx(idx);
    const line = linesRef.current[idx] ?? "";
    if (cursorPosRef.current > line.length) {
      cursorPosRef.current = line.length;
      setCursorPos(line.length);
    }
  }, []);

  const setInputFromHistory = useCallback((text: string) => {
    const lines = text.split("\n");
    linesRef.current = lines;
    currentLineIdxRef.current = 0;
    cursorPosRef.current = lines[0]?.length ?? 0;
    setLinesDisplay([...lines]);
    setCurrentLineIdx(0);
    setCursorPos(cursorPosRef.current);
  }, []);

  const pushHistory = useCallback((text: string) => {
    inputHistoryRef.current.push(text);
    if (inputHistoryRef.current.length > MAX_HISTORY) inputHistoryRef.current.shift();
    historyIdxRef.current = -1;
  }, []);

  return {
    linesDisplay,
    currentLineIdx,
    cursorPos,
    linesRef,
    currentLineIdxRef,
    cursorPosRef,
    getInputText,
    setLines,
    updateCursorInLine,
    updateCurrentLine,
    setInputFromHistory,
    inputHistoryRef,
    historyIdxRef,
    savedInputRef,
    pushHistory,
  };
}
