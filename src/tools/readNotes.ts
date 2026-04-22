import type { Tool, ToolContext, ToolResult } from "../types/tool.js";
import { createNotesManager } from "../memory/notesManager.js";
import { registerTool } from "./registry.js";

const readNotesTool: Tool = {
  name: "ReadNotes",
  description: "Reads the current contents of the persistent NOTES.md memory file.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  maxResultChars: 20_000,

  isReadOnly(): boolean { return true; },
  isEnabled(): boolean { return true; },

  async call(_input: Record<string, unknown>, ctx: ToolContext): Promise<ToolResult> {
    const manager = createNotesManager(ctx.profileDir);
    const content = await manager.read();
    if (!content.trim()) {
      return { content: "NOTES.md is empty." };
    }
    return { content };
  },
};

registerTool(readNotesTool);
