import { AnswerEvaluator } from "../interview/answerEvaluator";
import { FinalEvaluator } from "../interview/finalEvaluator";
import { AIProvider } from "../ai/provider.interface";
import { AnswerEvaluationInput, AnswerEvaluationResult } from "../types/question.types";
import { InterviewSession, FinalEvaluation } from "../types/session.types";

/**
 * Facade over answer-level and session-level evaluation logic.
 * Services depend on this instead of instantiating evaluators directly,
 * keeping AI-provider wiring in one place.
 */
export class ScoringService {
  private readonly answerEvaluator: AnswerEvaluator;
  private readonly finalEvaluator: FinalEvaluator;

  constructor(aiProvider: AIProvider) {
    this.answerEvaluator = new AnswerEvaluator(aiProvider);
    this.finalEvaluator = new FinalEvaluator(aiProvider);
  }

  async scoreAnswer(input: AnswerEvaluationInput): Promise<AnswerEvaluationResult> {
    return this.answerEvaluator.evaluate(input);
  }

  async scoreSession(session: InterviewSession): Promise<FinalEvaluation> {
    return this.finalEvaluator.generateSummary(session);
  }
}