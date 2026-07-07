/**
 * Provider-agnostic AI text generation interface.
 * Any LLM provider (Gemini, OpenAI, Claude) implements this contract,
 * keeping business logic (interview/*) fully decoupled from vendor SDKs.
 */
export interface AIProvider {
  /**
   * Sends a prompt to the underlying model and returns raw text output.
   * @param prompt Fully composed prompt string.
   * @param options Optional generation controls.
   */
  generateText(prompt: string, options?: AIGenerationOptions): Promise<string>;
}

export interface AIGenerationOptions {
  temperature?: number;
  maxOutputTokens?: number;
}