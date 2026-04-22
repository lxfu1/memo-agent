/**
 * Token budget tracking and estimation.
 *
 * Provides fast token count estimation without a tokenizer dependency.
 * Calibrated to OpenAI tokenizer behavior: ~4 chars per token for natural
 * language, ~2 chars per token for dense JSON (tool arguments).
 */

import type { ChatMessage, TokenUsage } from "../types/messages.js";
import type { ContextConfig } from "../types/config.js";

/** Approximate characters per token for natural language text */
const TEXT_CHARS_PER_TOKEN = 4;
/** Approximate characters per token for dense JSON (tool args, structured data) */
const JSON_CHARS_PER_TOKEN = 2;
/** Overhead tokens per message (role header + separators) */
const MESSAGE_OVERHEAD_TOKENS = 4;
/** Overhead tokens per tool_call block */
const TOOL_CALL_OVERHEAD_TOKENS = 8;

/**
 * Known model context window sizes.
 * Models not in this table default to 128k.
 */
const CONTEXT_WINDOW_SIZES: Record<string, number> = {
  "gpt-4o": 128_000,
  "gpt-4o-mini": 128_000,
  "gpt-4-turbo": 128_000,
  "gpt-4": 8_192,
  "gpt-3.5-turbo": 16_385,
  "o1": 200_000,
  "o1-mini": 128_000,
  "o3-mini": 200_000,
  "claude-3-5-sonnet": 200_000,
  "claude-3-opus": 200_000,
};

const DEFAULT_CONTEXT_WINDOW = 128_000;

export function getContextWindowSize(modelName: string): number {
  // Exact match first
  if (CONTEXT_WINDOW_SIZES[modelName]) {
    return CONTEXT_WINDOW_SIZES[modelName]!;
  }
  // Prefix match for versioned model names (e.g. "gpt-4o-2024-11-20")
  for (const [key, size] of Object.entries(CONTEXT_WINDOW_SIZES)) {
    if (modelName.startsWith(key)) return size;
  }
  return DEFAULT_CONTEXT_WINDOW;
}

/** Estimates the token count of a string */
export function estimateStringTokens(text: string, isJson = false): number {
  const charsPerToken = isJson ? JSON_CHARS_PER_TOKEN : TEXT_CHARS_PER_TOKEN;
  return Math.ceil(text.length / charsPerToken);
}

/** Estimates the total token count of a message array plus system prompt */
export function estimateTokenCount(
  messages: ChatMessage[],
  systemPrompt: string
): number {
  let total = estimateStringTokens(systemPrompt);

  for (const msg of messages) {
    total += MESSAGE_OVERHEAD_TOKENS;

    if (msg.content) {
      total += estimateStringTokens(msg.content);
    }

    if (msg.tool_calls) {
      for (const tc of msg.tool_calls) {
        total += TOOL_CALL_OVERHEAD_TOKENS;
        total += estimateStringTokens(tc.function.name);
        total += estimateStringTokens(tc.function.arguments, true);
      }
    }
  }

  return total;
}

export interface TokenBudgetSnapshot {
  estimatedTotal: number;
  contextWindowSize: number;
  /** 0–1 ratio of estimated usage to context window */
  usageRatio: number;
  warnThreshold: number;
  compressThreshold: number;
  isAboveWarn: boolean;
  isAboveCompress: boolean;
}

export function computeBudgetSnapshot(
  messages: ChatMessage[],
  systemPrompt: string,
  config: ContextConfig,
  modelName: string
): TokenBudgetSnapshot {
  const contextWindowSize = getContextWindowSize(modelName);
  const estimatedTotal = estimateTokenCount(messages, systemPrompt);
  const usageRatio = estimatedTotal / contextWindowSize;

  return {
    estimatedTotal,
    contextWindowSize,
    usageRatio,
    warnThreshold: config.warnThreshold,
    compressThreshold: config.compressThreshold,
    isAboveWarn: usageRatio >= config.warnThreshold,
    isAboveCompress: usageRatio >= config.compressThreshold,
  };
}

/** Formats a TokenUsage object as a human-readable cost estimate */
export function estimateCostUsd(usage: TokenUsage, modelName: string): number {
  // Rough cost table (USD per 1M tokens, as of early 2025)
  const costs: Record<string, { input: number; output: number }> = {
    "gpt-4o": { input: 2.5, output: 10 },
    "gpt-4o-mini": { input: 0.15, output: 0.6 },
    "gpt-4-turbo": { input: 10, output: 30 },
    "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
  };

  const costKey = Object.keys(costs).find(k => modelName.startsWith(k));
  const rate = costKey ? costs[costKey]! : { input: 2.5, output: 10 };

  return (usage.promptTokens * rate.input + usage.completionTokens * rate.output) / 1_000_000;
}
