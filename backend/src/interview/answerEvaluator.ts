import { AIProvider } from "../ai/provider.interface";
import { buildAnswerScoringPrompt } from "../prompts/answerScoring.prompt";
import { parseJsonFromAiText } from "../utils/jsonParser";
import { AnswerEvaluationInput, AnswerEvaluationResult } from "../types/question.types";
import { AIProviderError } from "../types/api.types";

interface RawAnswerEvaluationResponse {
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
}

/**
 * Evaluates a single candidate answer using the AI provider.
 * Handles the empty-answer case directly (no AI call needed) to
 * guarantee a deterministic 0 score with no wasted API cost.
 */
export class AnswerEvaluator {
  private readonly aiProvider: AIProvider;

  constructor(aiProvider: AIProvider) {
    this.aiProvider = aiProvider;
  }

  async evaluate(input: AnswerEvaluationInput): Promise<AnswerEvaluationResult> {
    if (input.answer.trim().length === 0) {
      return {
        score: 0,
        feedback: "No answer was provided for this question.",
        strengths: [],
        gaps: ["No response given"],
      };
    }

    const prompt = buildAnswerScoringPrompt(input);
    const rawText = await this.aiProvider.generateText(prompt, { temperature: 0.3 });
    const parsed = parseJsonFromAiText<RawAnswerEvaluationResponse>(rawText);

    return this.normalize(parsed, rawText);
  }

  private normalize(raw: RawAnswerEvaluationResponse, rawText: string): AnswerEvaluationResult {
    if (typeof raw.score !== "number" || Number.isNaN(raw.score)) {
      throw new AIProviderError("AI response missing valid score", { rawText });
    }

    const score = Math.max(0, Math.min(10, Math.round(raw.score)));

    if (typeof raw.feedback !== "string" || raw.feedback.trim().length === 0) {
      throw new AIProviderError("AI response missing feedback text", { rawText });
    }

    return {
      score,
      feedback: raw.feedback.trim(),
      strengths: Array.isArray(raw.strengths) ? raw.strengths.filter((s) => typeof s === "string") : [],
      gaps: Array.isArray(raw.gaps) ? raw.gaps.filter((g) => typeof g === "string") : [],
    };
  }
}