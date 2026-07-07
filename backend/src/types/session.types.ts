import { DifficultyLevel, InterviewQuestionEntry } from "./question.types";

export type SessionStatus = "in_progress" | "completed";

export interface FinalEvaluation {
  overallScore: number;
  averageScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  generatedAt: string;
}

export interface InterviewSession {
  id: string;
  role: string;
  skills: string[];
  difficulty: DifficultyLevel;
  status: SessionStatus;
  questions: InterviewQuestionEntry[];
  currentQuestionIndex: number;
  totalQuestions: number;
  createdAt: string;
  completedAt?: string;
  finalEvaluation?: FinalEvaluation;
}

export interface CreateSessionInput {
  role: string;
  skills: string[];
  difficulty?: DifficultyLevel;
  totalQuestions?: number;
}