import { QuestionGenerator } from "../interview/questionGenerator";
import { SessionService } from "./session.service";
import { ScoringService } from "./scoring.service";
import { SessionRepository } from "../storage/sessionRepository";
import { AIProvider } from "../ai/provider.interface";
import { CreateSessionInput, InterviewSession } from "../types/session.types";
import { AppError } from "../types/api.types";

export interface SubmitAnswerResult {
  session: InterviewSession;
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
  isComplete: boolean;
}

const DEFAULT_QUESTION_COUNT = 5;

/**
 * Top-level orchestrator for the interview domain.
 * Coordinates question generation, session state transitions,
 * scoring, and persistence. Controllers depend only on this class.
 */
export class InterviewService {
  private readonly questionGenerator: QuestionGenerator;
  private readonly sessionService: SessionService;
  private readonly scoringService: ScoringService;
  private readonly sessionRepository: SessionRepository;

  constructor(
    aiProvider: AIProvider,
    sessionRepository: SessionRepository = new SessionRepository()
  ) {
    this.questionGenerator = new QuestionGenerator(aiProvider);
    this.sessionService = new SessionService();
    this.scoringService = new ScoringService(aiProvider);
    this.sessionRepository = sessionRepository;
  }

  async startSession(input: CreateSessionInput): Promise<InterviewSession> {
    if (!input.role || input.role.trim().length === 0) {
      throw new AppError("Role is required to start an interview", 400, "VALIDATION_ERROR");
    }

    const totalQuestions = input.totalQuestions ?? DEFAULT_QUESTION_COUNT;

    const generatedQuestions = await this.questionGenerator.generate({
      role: input.role,
      skills: input.skills ?? [],
      difficulty: input.difficulty ?? "mid",
      count: totalQuestions,
    });

    const session = this.sessionService.buildNewSession(input, generatedQuestions);
    return this.sessionRepository.create(session);
  }

  async getSession(sessionId: string): Promise<InterviewSession> {
    return this.sessionRepository.getByIdOrThrow(sessionId);
  }

  async submitAnswer(sessionId: string, answer: string): Promise<SubmitAnswerResult> {
    const session = await this.sessionRepository.getByIdOrThrow(sessionId);
    this.sessionService.assertInProgress(session);

    const currentQuestion = this.sessionService.getCurrentQuestion(session);

    const evaluation = await this.scoringService.scoreAnswer({
      role: session.role,
      difficulty: session.difficulty,
      question: currentQuestion.question,
      category: currentQuestion.category,
      answer,
    });

    const updatedSession = this.sessionService.recordAnswer(
      session,
      answer,
      evaluation.score,
      evaluation.feedback,
      evaluation.strengths,
      evaluation.gaps
    );

    await this.sessionRepository.update(updatedSession);

    return {
      session: updatedSession,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      gaps: evaluation.gaps,
      isComplete: updatedSession.status === "completed",
    };
  }

  async getSummary(sessionId: string): Promise<InterviewSession> {
    const session = await this.sessionRepository.getByIdOrThrow(sessionId);

    if (session.status !== "completed") {
      throw new AppError(
        "Cannot generate summary before the interview is completed",
        409,
        "SESSION_NOT_COMPLETE"
      );
    }

    if (!session.finalEvaluation) {
      session.finalEvaluation = await this.scoringService.scoreSession(session);
      await this.sessionRepository.update(session);
    }

    return session;
  }

  async getTranscript(sessionId: string): Promise<InterviewSession> {
    return this.sessionRepository.getByIdOrThrow(sessionId);
  }
}