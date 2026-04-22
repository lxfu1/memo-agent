/**
 * Data model types for SQLite-backed session storage.
 * These mirror the DB schema columns using camelCase naming.
 */

export interface SessionRow {
  id: string;
  title: string;
  model: string;
  /** Links to a prior session whose context was archived into this one */
  parentSessionId: string | null;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRow {
  id: number;
  sessionId: string;
  role: string;
  content: string | null;
  /** JSON-encoded OpenAIToolCall[] when role === "assistant" with tool calls */
  toolCallsJson: string | null;
  /** Present when role === "tool" */
  toolCallId: string | null;
  tokenCount: number;
  createdAt: string;
}

export interface SearchResultRow extends MessageRow {
  sessionTitle: string;
}
