import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, AIGenerationOptions } from "./provider.interface";
import { AIProviderError } from "../types/api.types";
import { env } from "../config/env";
import { logger } from "../utils/logger";

/**
 * Gemini implementation of the AIProvider contract.
 * All Google-SDK-specific logic is isolated here.
 */
export class GeminiProvider implements AIProvider {
  private readonly client: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(apiKey: string = env.geminiApiKey, modelName: string = env.geminiModel) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  async generateText(prompt: string, options?: AIGenerationOptions): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: options?.temperature ?? 0.6,
          maxOutputTokens: options?.maxOutputTokens ?? 1024,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text || text.trim() === "") {
        throw new AIProviderError("Gemini returned an empty response");
      }

      return text;
    } catch (error) {
      if (error instanceof AIProviderError) {
        throw error;
      }
      logger.error("Gemini API request failed", error);
      throw new AIProviderError("Gemini API request failed", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}