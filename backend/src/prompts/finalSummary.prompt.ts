import { InterviewSession } from "../types/session.types";

/**
 * Builds the prompt used to generate the final interview evaluation summary.
 * Instructs the model to return strict JSON so finalEvaluator.ts
 * can parse it deterministically.
 */
export function buildFinalSummaryPrompt(session: InterviewSession): string {
  const { role, difficulty, skills, questions } = session;

  const transcriptBlock = questions
    .map((q, i) => {
      const answer = q.answer && q.answer.trim().length > 0 ? q.answer.trim() : "(no answer given)";
      return `Q${i + 1} [${q.category}] (score: ${q.score ?? "N/A"}/10): ${q.question}
Answer: ${answer}`;
    })
    .join("\n\n");

  return `You are an expert technical interviewer producing a final hiring evaluation.

Role: ${role}
Difficulty level: ${difficulty}
Relevant skills: ${skills.join(", ") || "general role competencies"}

Full interview transcript with per-question scores:

${transcriptBlock}

Based on the entire transcript, produce an overall evaluation of the candidate.

Respond with ONLY valid JSON, no markdown fences, no commentary, in this exact shape:
{
  "overallScore": 0,
  "strengths": ["string"],
  "gaps": ["string"],
  "recommendation": "string, 2-4 sentences summarizing hiring signal and reasoning"
}

Rules:
- "overallScore" is an integer from 0 to 100, reflecting overall performance across all questions (not just an average).
- "strengths" and "gaps" should synthesize patterns across the whole interview, not repeat single-question feedback verbatim.
- "recommendation" must be honest and specific — do not default to generic positivity.`;
}