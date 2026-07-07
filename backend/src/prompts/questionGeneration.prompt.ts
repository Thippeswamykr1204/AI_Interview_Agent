import { QuestionGenerationInput } from "../types/question.types";

/**
 * Builds the prompt used to generate a batch of interview questions.
 * Instructs the model to return strict JSON so questionGenerator.ts
 * can parse it deterministically.
 */
export function buildQuestionGenerationPrompt(input: QuestionGenerationInput): string {
  const { role, skills, difficulty, count, excludeQuestions } = input;

  const skillsList = skills.length > 0 ? skills.join(", ") : "general role competencies";
  const exclusionBlock =
    excludeQuestions && excludeQuestions.length > 0
      ? `\nDo NOT repeat or closely paraphrase any of these already-asked questions:\n${excludeQuestions
          .map((q) => `- ${q}`)
          .join("\n")}`
      : "";

  return `You are an expert technical interviewer creating interview questions.

Role being interviewed for: ${role}
Relevant skills/technologies: ${skillsList}
Difficulty level: ${difficulty}
Number of questions to generate: ${count}
${exclusionBlock}

Generate ${count} distinct, role-relevant interview questions. Mix categories across:
- "technical" (concrete knowledge of the role's tools/languages/frameworks)
- "system-design" (architecture/design tradeoffs, only if appropriate for the difficulty)
- "behavioral" (past experience, teamwork, decision-making)
- "problem-solving" (reasoning through a scenario)
- "role-specific" (specific to the stated role's day-to-day responsibilities)

Each question must be answerable in 2-5 minutes of spoken/typed response, specific enough to evaluate real competence, and free of yes/no phrasing.

Respond with ONLY valid JSON, no markdown fences, no commentary, in this exact shape:
{
  "questions": [
    { "question": "string", "category": "technical" }
  ]
}

The "category" field must be one of: "technical", "system-design", "behavioral", "problem-solving", "role-specific".`;
}