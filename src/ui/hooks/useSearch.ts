/**
 * Search functionality hook
 */

import { useCallback, useRef, useState } from "react";
import type { MessageEntry, SearchState } from "../types.js";

export interface UseSearchResult extends SearchState {
  queryRef: React.MutableRefObject<string>;
  setQuery: (query: string) => void;
  performSearch: (entries: MessageEntry[], query: string) => void;
  nextResult: () => void;
  prevResult: () => void;
  reset: () => void;
}

function getEntryText(entry: MessageEntry): string {
  switch (entry.kind) {
    case "user":
    case "assistant":
      return entry.content;
    case "tool_call":
      return `${entry.name} ${entry.description ?? ""} ${entry.result ?? ""}`;
    case "notice":
      return entry.content;
    case "separator":
      return entry.label;
  }
}

export function useSearch(): UseSearchResult {
  const [state, setState] = useState<SearchState>({
    query: "",
    results: [],
    currentIdx: 0,
  });
  const queryRef = useRef("");

  const setQuery = useCallback((query: string) => {
    queryRef.current = query;
    setState((prev) => ({ ...prev, query }));
  }, []);

  const performSearch = useCallback((entries: MessageEntry[], query: string) => {
    if (!query.trim()) {
      setState({ query, results: [], currentIdx: 0 });
      return;
    }

    const results: number[] = [];
    const lowerQuery = query.toLowerCase();

    entries.forEach((entry, idx) => {
      const text = getEntryText(entry);
      if (text.toLowerCase().includes(lowerQuery)) {
        results.push(idx);
      }
    });

    setState({
      query,
      results,
      currentIdx: results.length > 0 ? 0 : -1,
    });
  }, []);

  const nextResult = useCallback(() => {
    setState((prev) => {
      if (prev.results.length === 0) return prev;
      return {
        ...prev,
        currentIdx: (prev.currentIdx + 1) % prev.results.length,
      };
    });
  }, []);

  const prevResult = useCallback(() => {
    setState((prev) => {
      if (prev.results.length === 0) return prev;
      return {
        ...prev,
        currentIdx: (prev.currentIdx - 1 + prev.results.length) % prev.results.length,
      };
    });
  }, []);

  const reset = useCallback(() => {
    queryRef.current = "";
    setState({ query: "", results: [], currentIdx: 0 });
  }, []);

  return {
    ...state,
    queryRef,
    setQuery,
    performSearch,
    nextResult,
    prevResult,
    reset,
  };
}
