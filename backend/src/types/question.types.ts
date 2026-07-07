export type QuestionCategory =
  | "technical"
  | "system-design"
  | "behavioral"
  | "problem-solving"
  | "role-specific";

export type DifficultyLevel = "junior" | "mid" | "senior";

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

export interface GeneratedQuestion {
  question: string;
  category: QuestionCategory;
}

export interface QuestionGenerationInput {
  role: string;
  skills: string[];
  difficulty: DifficultyLevel;
  count: number;
  excludeQuestions?: string[];
}

export interface AnswerEvaluationInput {
  role: string;
  difficulty: DifficultyLevel;
  question: string;
  category: QuestionCategory;
  answer: string;
}

export interface AnswerEvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
}