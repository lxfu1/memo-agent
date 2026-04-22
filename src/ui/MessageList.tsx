/**
 * Message list component.
 *
 * Sub-components:
 *   UserMessage      — user input, dashed bottom border
 *   AssistantMessage — streaming or complete model response
 *   ToolCallCard     — tool name + status; result shown only for errors or
 *                      short success messages (≤120 chars)
 *   SystemNotice     — command output, errors, notices
 *   Separator        — context-compression / session markers
 *
 * Streaming buffer hook:
 *   useStreamingBuffer — accumulates deltas in a ref, triggers a re-render
 *   every 50 ms so the display updates without thrashing React state.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box, Text } from 'ink';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Payload shape (no id) — used when calling addEntry in App */
export type MessageEntryData =
  | { kind: 'user'; content: string }
  | { kind: 'assistant'; content: string; isStreaming?: boolean }
  | {
      kind: 'tool_call';
      name: string;
      toolId: string;
      status: 'running' | 'done' | 'error';
      result?: string;
    }
  | {
      kind: 'notice';
      content: string;
      level: 'info' | 'error' | 'help' | 'success';
    }
  | { kind: 'separator'; label: string };

/** Full entry with a stable id for React key */
export type MessageEntry = MessageEntryData & { id: string };

// ---------------------------------------------------------------------------
// MessageList
// ---------------------------------------------------------------------------

interface MessageListProps {
  entries: MessageEntry[];
  streamingBuffer?: string;
}

export function MessageList({
  entries,
  streamingBuffer
}: MessageListProps): React.ReactElement {
  return (
    <Box flexDirection='column' gap={0}>
      {entries.map((entry) => (
        <MessageEntryItem key={entry.id} entry={entry} />
      ))}
      {streamingBuffer && (
        <Box paddingX={1}>
          <Text color='white'>{streamingBuffer}</Text>
          <Text color='cyan'>▊</Text>
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Single-entry renderer — exported for use in App's Static section
// ---------------------------------------------------------------------------

export function MessageEntryItem({
  entry
}: {
  entry: MessageEntry;
}): React.ReactElement {
  switch (entry.kind) {
    case 'user':
      return <UserMessage content={entry.content} />;
    case 'assistant':
      return (
        <AssistantMessage
          content={entry.content}
          isStreaming={entry.isStreaming as boolean}
        />
      );
    case 'tool_call':
      return (
        <ToolCallCard
          name={entry.name}
          status={entry.status as 'running' | 'done' | 'error'}
          result={entry.result as string}
        />
      );
    case 'notice':
      return <SystemNotice content={entry.content} level={entry.level} />;
    case 'separator':
      return <Separator label={entry.label} />;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function UserMessage({ content }: { content: string }): React.ReactElement {
  return (
    <Box
      marginY={0}
      paddingX={1}
      borderStyle='classic'
      borderBottom
      borderTop={false}
      borderLeft={false}
      borderRight={false}
      borderColor='gray'
      flexDirection='column'
    >
      <Text color='white'>{content}</Text>
    </Box>
  );
}

function AssistantMessage({
  content,
  isStreaming
}: {
  content: string;
  isStreaming?: boolean;
}): React.ReactElement {
  return (
    <Box marginY={0} paddingX={1} flexDirection='column'>
      <Text color='cyan' dimColor>
        assistant{isStreaming ? ' ●' : ''}
      </Text>
      <Text color='white'>{content}</Text>
    </Box>
  );
}

function ToolCallCard({
  name,
  status,
  result
}: {
  name: string;
  status: 'running' | 'done' | 'error';
  result?: string;
}): React.ReactElement {
  const icon = status === 'running' ? '⟳' : status === 'done' ? '✓' : '✗';
  const color =
    status === 'running' ? 'yellow' : status === 'done' ? 'green' : 'red';

  // Show result for errors (up to 500 chars) or very short success messages
  // (≤120 chars). For long successful results (e.g. ReadFile content) we
  // only show the tool name — the model already has the data.
  const showResult =
    result !== undefined &&
    status !== 'running' &&
    (status === 'error' || result.length <= 120);

  const displayResult = showResult
    ? result!.slice(0, status === 'error' ? 500 : 120) +
      (result!.length > 500 ? '…' : '')
    : undefined;

  return (
    <Box
      marginY={0}
      paddingX={1}
      borderStyle='single'
      borderColor='gray'
      flexDirection='column'
    >
      <Box gap={1}>
        <Text color={color}>{icon}</Text>
        <Text color='gray'>{name}</Text>
      </Box>
      {displayResult && (
        <Text
          color={status === 'error' ? 'red' : 'gray'}
          dimColor={status !== 'error'}
        >
          {displayResult}
        </Text>
      )}
    </Box>
  );
}

function SystemNotice({
  content,
  level
}: {
  content: string;
  level: 'info' | 'error' | 'help' | 'success';
}): React.ReactElement {
  const color =
    level === 'error'
      ? 'red'
      : level === 'success'
        ? 'green'
        : level === 'help'
          ? 'cyan'
          : 'gray';

  return (
    <Box marginY={0} paddingX={1} borderStyle='single' borderColor={color}>
      <Text color={color}>{content}</Text>
    </Box>
  );
}

function Separator({ label }: { label: string }): React.ReactElement {
  return (
    <Box marginY={0} paddingX={1}>
      <Text color='gray' dimColor>
        ── {label} ──
      </Text>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Hook: streaming buffer with 50 ms flush interval
// ---------------------------------------------------------------------------

interface UseStreamingBufferResult {
  buffer: string;
  append: (delta: string) => void;
  clear: () => void;
}

export function useStreamingBuffer(): UseStreamingBufferResult {
  const bufRef = useRef('');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (bufRef.current) {
        forceUpdate((n) => n + 1);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return {
    get buffer() {
      return bufRef.current;
    },
    append(delta: string) {
      bufRef.current += delta;
    },
    clear() {
      bufRef.current = '';
    }
  };
}
