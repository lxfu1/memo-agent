import {
  buildSystemPrompt,
  type PromptBuilderOptions,
} from "../../context/promptBuilder.js";

export class SystemPromptManager {
  private cached: string | null = null;
  private pendingWarnings: string[] = [];

  invalidate(): void {
    this.cached = null;
  }

  async get(opts: PromptBuilderOptions): Promise<string> {
    if (!this.cached) {
      const result = await buildSystemPrompt(opts);
      this.cached = result.prompt;
      this.pendingWarnings = result.injectionWarnings;
    }
    return this.cached;
  }

  drainWarnings(): string[] {
    const warnings = this.pendingWarnings;
    this.pendingWarnings = [];
    return warnings;
  }
}
