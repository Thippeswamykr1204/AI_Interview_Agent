import { AnswerEvaluationInput } from "../types/question.types";

/**
 * Builds the prompt used to score a single candidate answer.
 * Instructs the model to return strict JSON so answerEvaluator.ts
 * can parse it deterministically.
 */
export function buildAnswerScoringPrompt(input: AnswerEvaluationInput): string {
  const { role, difficulty, question, category, answer } = input;

  const trimmedAnswer = answer.trim();
  const answerBlock =
    trimmedAnswer.length > 0 ? trimmedAnswer : "(The candidate did not provide an answer.)";

  return `You are an expert technical interviewer evaluating a candidate's answer.

Role: ${role}
Difficulty level: ${difficulty}
Question category: ${category}
Question asked: "${question}"

Candidate's answer:
"""
${answerBlock}
"""

Evaluate the answer on correctness, depth, clarity, and relevance to the question and role. Be fair but rigorous — a vague or generic answer should score low even if confidently written. An empty or non-answer must score 0.

Respond with ONLY valid JSON, no markdown fences, no commentary, in this exact shape:
{
  "score": 0,
  "feedback": "string, 1-3 sentences, direct and specific to this answer",
  "strengths": ["string"],
  "gaps": ["string"]
}

Rules:
- "score" is an integer from 0 to 10.
- "strengths" and "gaps" are short phrases (can be empty arrays, but not both empty unless the answer is truly empty).
- Do not restate the question in the feedback.`;
}