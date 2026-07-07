export type QuestionCategory =
  | "technical"
  | "system-design"
  | "behavioral"
  | "problem-solving"
  | "role-specific";

export type DifficultyLevel = "junior" | "mid" | "senior";

export type SessionStatus = "in_progress" | "completed";

export interface InterviewQuestionEntry {
  index: number;
  question: string;
  category: QuestionCategory;
  answer?: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  gaps?: string[];
  answeredAt?: string;
}

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

export interface StartSessionRequest {
  role: string;
  skills: string[];
  difficulty?: DifficultyLevel;
  totalQuestions?: number;
}

export interface SubmitAnswerRequest {
  answer: string;
}

export interface SubmitAnswerResponse {
  session: InterviewSession;
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
  isComplete: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;