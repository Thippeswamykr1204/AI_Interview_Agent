import { AIProvider } from "../ai/provider.interface";
import { buildQuestionGenerationPrompt } from "../prompts/questionGeneration.prompt";
import { parseJsonFromAiText } from "../utils/jsonParser";
import { GeneratedQuestion, QuestionGenerationInput, QuestionCategory } from "../types/question.types";
import { AIProviderError } from "../types/api.types";

interface RawQuestionGenerationResponse {
  questions: Array<{ question: string; category: string }>;
}

const VALID_CATEGORIES: QuestionCategory[] = [
  "technical",
  "system-design",
  "behavioral",
  "problem-solving",
  "role-specific",
];

/**
 * Generates a batch of role-relevant interview questions using the AI provider.
 * Pure orchestration: prompt building -> AI call -> parsing -> validation.
 */
export class QuestionGenerator {
  private readonly aiProvider: AIProvider;

  constructor(aiProvider: AIProvider) {
    this.aiProvider = aiProvider;
  }

  async generate(input: QuestionGenerationInput): Promise<GeneratedQuestion[]> {
    const prompt = buildQuestionGenerationPrompt(input);
    const rawText = await this.aiProvider.generateText(prompt, { temperature: 0.8, maxOutputTokens: 2048 });
    const parsed = parseJsonFromAiText<RawQuestionGenerationResponse>(rawText);

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new AIProviderError("AI response contained no questions", { rawText });
    }

    const questions = parsed.questions.map((q) => this.normalize(q, rawText));

    if (questions.length < input.count) {
      throw new AIProviderError(
        `AI generated ${questions.length} questions but ${input.count} were requested`,
        { rawText }
      );
    }

    return questions.slice(0, input.count);
  }

  private normalize(
    raw: { question: string; category: string },
    rawText: string
  ): GeneratedQuestion {
    if (typeof raw.question !== "string" || raw.question.trim().length === 0) {
      throw new AIProviderError("AI returned a question with empty text", { rawText });
    }

    const category = VALID_CATEGORIES.includes(raw.category as QuestionCategory)
      ? (raw.category as QuestionCategory)
      : "role-specific";

    return {
      question: raw.question.trim(),
      category,
    };
  }
}