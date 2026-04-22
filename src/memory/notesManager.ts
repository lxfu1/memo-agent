/**
 * Manages the NOTES.md persistent memory file.
 * This file is the agent's writable working memory — project context,
 * task notes, and anything worth remembering across sessions.
 *
 * PROFILE.md is the read-only counterpart (see profileReader.ts).
 */

import fs from "node:fs/promises";
import path from "node:path";

const NOTES_FILENAME = "NOTES.md";
const MEMORY_DIR = "memory";

export interface NotesManager {
  /** Reads the full contents of NOTES.md, or empty string if absent */
  read(): Promise<string>;
  /** Replaces the entire content of NOTES.md */
  write(content: string): Promise<void>;
  /** Appends a new section with a timestamp separator */
  append(section: string): Promise<void>;
  /** Deletes all content from NOTES.md */
  clear(): Promise<void>;
  /** Returns the absolute path to NOTES.md */
  getPath(): string;
}

export function createNotesManager(profileDir: string): NotesManager {
  const notesPath = path.join(profileDir, MEMORY_DIR, NOTES_FILENAME);

  return {
    getPath(): string {
      return notesPath;
    },

    async read(): Promise<string> {
      try {
        return await fs.readFile(notesPath, "utf-8");
      } catch {
        return "";
      }
    },

    async write(content: string): Promise<void> {
      await ensureMemoryDir(profileDir);
      await fs.writeFile(notesPath, content, "utf-8");
    },

    async append(section: string): Promise<void> {
      await ensureMemoryDir(profileDir);
      const existing = await this.read();
      const separator = existing.trim() ? "\n\n---\n\n" : "";
      const timestamp = new Date().toISOString().slice(0, 10);
      const newContent = `${existing}${separator}*${timestamp}*\n\n${section.trim()}\n`;
      await fs.writeFile(notesPath, newContent, "utf-8");
    },

    async clear(): Promise<void> {
      await ensureMemoryDir(profileDir);
      await fs.writeFile(notesPath, "", "utf-8");
    },
  };
}

async function ensureMemoryDir(profileDir: string): Promise<void> {
  await fs.mkdir(path.join(profileDir, MEMORY_DIR), { recursive: true });
}
