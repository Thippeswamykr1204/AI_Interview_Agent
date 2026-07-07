import { InterviewSession, CreateSessionInput } from "../types/session.types";
import { GeneratedQuestion, InterviewQuestionEntry } from "../types/question.types";
import { generateSessionId } from "../utils/idGenerator";
import { AppError } from "../types/api.types";

const DEFAULT_TOTAL_QUESTIONS = 5;
const MIN_TOTAL_QUESTIONS = 5;
const MAX_TOTAL_QUESTIONS = 10;

/**
 * Pure state-transition logic for InterviewSession objects.
 * No I/O (storage/AI) happens here — this keeps session lifecycle
 * rules independently testable and reusable.
 */
export class SessionService {
  buildNewSession(input: CreateSessionInput, initialQuestions: GeneratedQuestion[]): InterviewSession {
    const totalQuestions = this.resolveTotalQuestions(input.totalQuestions);

    if (initialQuestions.length < totalQuestions) {
      throw new AppError(
        `Expected at least ${totalQuestions} generated questions, received ${initialQuestions.length}`,
        500,
        "INSUFFICIENT_QUESTIONS"
      );
    }

    const questions: InterviewQuestionEntry[] = initialQuestions
      .slice(0, totalQuestions)
      .map((q, index) => ({
        index,
        question: q.question,
        category: q.category,
      }));

    return {
      id: generateSessionId(),
      role: input.role.trim(),
      skills: input.skills.map((s) => s.trim()).filter(Boolean),
      difficulty: input.difficulty ?? "mid",
      status: "in_progress",
      questions,
      currentQuestionIndex: 0,
      totalQuestions,
      createdAt: new Date().toISOString(),
    };
  }

  getCurrentQuestion(session: InterviewSession): InterviewQuestionEntry {
    const current = session.questions[session.currentQuestionIndex];
    if (!current) {
      throw new AppError("No current question available for this session", 409, "SESSION_COMPLETE");
    }
    return current;
  }

  assertInProgress(session: InterviewSession): void {
    if (session.status !== "in_progress") {
      throw new AppError("Interview session is already completed", 409, "SESSION_COMPLETE");
    }
  }

  recordAnswer(
    session: InterviewSession,
    answer: string,
    score: number,
    feedback: string,
    strengths: string[],
    gaps: string[]
  ): InterviewSession {
    const currentIndex = session.currentQuestionIndex;
    const currentQuestion = session.questions[currentIndex];

    if (!currentQuestion) {
      throw new AppError("No current question to answer", 409, "SESSION_COMPLETE");
    }

    currentQuestion.answer = answer;
    currentQuestion.score = score;
    currentQuestion.feedback = feedback;
    currentQuestion.strengths = strengths;
    currentQuestion.gaps = gaps;
    currentQuestion.answeredAt = new Date().toISOString();

    const isLastQuestion = currentIndex === session.totalQuestions - 1;

    if (isLastQuestion) {
      session.status = "completed";
      session.completedAt = new Date().toISOString();
    } else {
      session.currentQuestionIndex = currentIndex + 1;
    }

    return session;
  }

  private resolveTotalQuestions(requested?: number): number {
    if (!requested) return DEFAULT_TOTAL_QUESTIONS;
    return Math.max(MIN_TOTAL_QUESTIONS, Math.min(MAX_TOTAL_QUESTIONS, Math.round(requested)));
  }
}