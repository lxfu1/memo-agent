/**
 * Shared path-safety utilities for file-access tools.
 *
 * isPathSafe enforces a directory boundary: the resolved path must be
 * at or under one of the supplied allowed roots. Both roots are always
 * checked so tools that need to access profile memory (NOTES.md) as
 * well as project files can do so with a single call.
 */

import path from "node:path";

/**
 * Returns true if resolvedPath is at or under at least one of the given roots.
 * Roots are normalised to include a trailing separator so that
 * "/home/user/project-other" does not match root "/home/user/project".
 */
export function isPathSafe(resolvedPath: string, ...roots: string[]): boolean {
  for (const root of roots) {
    const normalised = path.resolve(root);
    const withSep = normalised.endsWith(path.sep) ? normalised : normalised + path.sep;
    if (resolvedPath === normalised || resolvedPath.startsWith(withSep)) {
      return true;
    }
  }
  return false;
}
