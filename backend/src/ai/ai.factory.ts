import { AIProvider } from "./provider.interface";
import { GeminiProvider } from "./gemini.provider";

export type AIProviderName = "gemini";

let cachedProvider: AIProvider | null = null;

/**
 * Returns a singleton AIProvider instance.
 * Swapping providers (e.g. to OpenAI) means adding a case here —
 * no other file in the codebase needs to change.
 */
export function getAIProvider(providerName: AIProviderName = "gemini"): AIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  switch (providerName) {
    case "gemini":
      cachedProvider = new GeminiProvider();
      break;
    default:
      throw new Error(`Unsupported AI provider: ${providerName}`);
  }

  return cachedProvider;
}