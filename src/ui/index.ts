/**
 * UI 模块统一导出
 */

// Main component
export { App, type AppProps } from "./App.js";

// Components
export { MessageList, MessageEntryItem } from "./MessageList.js";
export { StatusBar } from "./StatusBar.js";
export { MarkdownRenderer } from "./MarkdownRenderer.js";
export { HighlightedCodeBlock, PlainCodeBlock } from "./CodeHighlighter.js";
export { SearchBar, SearchResultsPanel, getEntryDisplayText, getSnippet } from "./Search.js";
export { PermissionDialog, handlePermissionInput } from "./PermissionDialog.js";

// Hooks
export {
  useStreamingBuffer,
  useSearch,
  useAppTimers,
  useEntries,
} from "./hooks/index.js";

export { useInputState, MAX_INPUT_LINES, MAX_HISTORY } from "./useInputState.js";

// Types
export type {
  AppState,
  MessageEntry,
  MessageEntryData,
  SearchState,
  InputState,
  StatusBarProps,
  SearchBarProps,
  SearchResultsPanelProps,
} from "./types.js";
