export const INTERVIEW_DEFAULTS = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 10,
  DEFAULT_QUESTIONS: 5,
  DEFAULT_DIFFICULTY: "mid" as const,
} as const;

export const SCORE_BOUNDS = {
  QUESTION_MIN: 0,
  QUESTION_MAX: 10,
  OVERALL_MIN: 0,
  OVERALL_MAX: 100,
} as const;

export const AI_GENERATION_DEFAULTS = {
  QUESTION_GENERATION_TEMPERATURE: 0.8,
  ANSWER_SCORING_TEMPERATURE: 0.3,
  FINAL_SUMMARY_TEMPERATURE: 0.4,
  MAX_OUTPUT_TOKENS: 1024,
} as const;

export const QUESTION_CATEGORIES = [
  "technical",
  "system-design",
  "behavioral",
  "problem-solving",
  "role-specific",
] as const;

export const DIFFICULTY_LEVELS = ["junior", "mid", "senior"] as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
} as const;