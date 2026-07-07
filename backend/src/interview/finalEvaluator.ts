import { AIProvider } from "../ai/provider.interface";
import { buildFinalSummaryPrompt } from "../prompts/finalSummary.prompt";
import { parseJsonFromAiText } from "../utils/jsonParser";
import { InterviewSession, FinalEvaluation } from "../types/session.types";
import { AIProviderError } from "../types/api.types";

interface RawFinalSummaryResponse {
  overallScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

/**
 * Generates the final evaluation summary for a completed interview session.
 * Combines the AI-generated overall assessment with a deterministically
 * computed average score (so the numeric average is never hallucinated).
 */
export class FinalEvaluator {
  private readonly aiProvider: AIProvider;

  constructor(aiProvider: AIProvider) {
    this.aiProvider = aiProvider;
  }

  async generateSummary(session: InterviewSession): Promise<FinalEvaluation> {
    const averageScore = this.computeAverageScore(session);

    const prompt = buildFinalSummaryPrompt(session);
    const rawText = await this.aiProvider.generateText(prompt, { temperature: 0.4 });
    const parsed = parseJsonFromAiText<RawFinalSummaryResponse>(rawText);

    return this.normalize(parsed, averageScore, rawText);
  }

  private computeAverageScore(session: InterviewSession): number {
    const scored = session.questions.filter((q) => typeof q.score === "number");
    if (scored.length === 0) return 0;

    const total = scored.reduce((sum, q) => sum + (q.score ?? 0), 0);
    return Math.round((total / scored.length) * 100) / 100;
  }

  private normalize(
    raw: RawFinalSummaryResponse,
    averageScore: number,
    rawText: string
  ): FinalEvaluation {
    if (typeof raw.overallScore !== "number" || Number.isNaN(raw.overallScore)) {
      throw new AIProviderError("AI response missing valid overallScore", { rawText });
    }

    if (typeof raw.recommendation !== "string" || raw.recommendation.trim().length === 0) {
      throw new AIProviderError("AI response missing recommendation text", { rawText });
    }

    const overallScore = Math.max(0, Math.min(100, Math.round(raw.overallScore)));

    return {
      overallScore,
      averageScore,
      strengths: Array.isArray(raw.strengths) ? raw.strengths.filter((s) => typeof s === "string") : [],
      gaps: Array.isArray(raw.gaps) ? raw.gaps.filter((g) => typeof g === "string") : [],
      recommendation: raw.recommendation.trim(),
      generatedAt: new Date().toISOString(),
    };
  }
}