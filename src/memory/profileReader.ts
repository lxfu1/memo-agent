/**
 * Read-only access to PROFILE.md — the user's personal context file.
 * This file is never modified by the agent; only the user edits it.
 * It typically contains background about the user's role, preferences,
 * and working style that should inform every conversation.
 */

import fs from "node:fs/promises";
import path from "node:path";

const PROFILE_FILENAME = "PROFILE.md";
const MEMORY_DIR = "memory";

/** Returns the contents of PROFILE.md, or null if the file does not exist */
export async function readProfile(profileDir: string): Promise<string | null> {
  const profilePath = path.join(profileDir, MEMORY_DIR, PROFILE_FILENAME);
  try {
    return await fs.readFile(profilePath, "utf-8");
  } catch {
    return null;
  }
}

/** Returns the absolute path to PROFILE.md for display purposes */
export function getProfilePath(profileDir: string): string {
  return path.join(profileDir, MEMORY_DIR, PROFILE_FILENAME);
}
