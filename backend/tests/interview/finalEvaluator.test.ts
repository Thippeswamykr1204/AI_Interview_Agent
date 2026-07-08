import { FinalEvaluator } from "../../src/interview/finalEvaluator";
import { AIProvider } from "../../src/ai/provider.interface";
import { AIProviderError } from "../../src/types/api.types";
import { InterviewSession } from "../../src/types/session.types";

function makeSession(scores: Array<number | undefined>): InterviewSession {
  return {
    id: "session_test",
    role: "Backend Engineer",
    skills: ["Node.js"],
    difficulty: "mid",
    status: "completed",
    currentQuestionIndex: scores.length - 1,
    totalQuestions: scores.length,
    createdAt: new Date().toISOString(),
    questions: scores.map((score, index) => ({
      index,
      question: `Question ${index}`,
      category: "technical",
      answer: score === undefined ? undefined : "some answer",
      score,
    })),
  };
}

function mockProvider(responseText: string): AIProvider {
  return { generateText: jest.fn().mockResolvedValue(responseText) };
}

describe("FinalEvaluator", () => {
  it("computes the deterministic average score independently of the AI's overall score", async () => {
    const provider = mockProvider(
      JSON.stringify({
        overallScore: 72,
        strengths: ["Clear communication"],
        gaps: ["Limited system design depth"],
        recommendation: "Lean hire",
      })
    );
    const evaluator = new FinalEvaluator(provider);

    const session = makeSession([8, 6, 10, 4, 7]); // avg = 7
    const result = await evaluator.generateSummary(session);

    expect(result.averageScore).toBe(7);
    expect(result.overallScore).toBe(72);
    expect(result.recommendation).toBe("Lean hire");
  });

  it("returns averageScore 0 when no questions have been scored yet", async () => {
    const provider = mockProvider(
      JSON.stringify({ overallScore: 0, strengths: [], gaps: [], recommendation: "Incomplete" })
    );
    const evaluator = new FinalEvaluator(provider);

    const session = makeSession([undefined, undefined]);
    const result = await evaluator.generateSummary(session);

    expect(result.averageScore).toBe(0);
  });

  it("clamps overallScore into the 0-100 range", async () => {
    const provider = mockProvider(
      JSON.stringify({ overallScore: 150, strengths: [], gaps: [], recommendation: "Strong hire" })
    );
    const evaluator = new FinalEvaluator(provider);

    const result = await evaluator.generateSummary(makeSession([9, 9]));
    expect(result.overallScore).toBe(100);
  });

  it("throws AIProviderError when recommendation text is missing", async () => {
    const provider = mockProvider(JSON.stringify({ overallScore: 50, strengths: [], gaps: [] }));
    const evaluator = new FinalEvaluator(provider);

    await expect(evaluator.generateSummary(makeSession([5, 5]))).rejects.toThrow(AIProviderError);
  });

  it("stamps a generatedAt ISO timestamp", async () => {
    const provider = mockProvider(
      JSON.stringify({ overallScore: 80, strengths: [], gaps: [], recommendation: "Hire" })
    );
    const evaluator = new FinalEvaluator(provider);

    const result = await evaluator.generateSummary(makeSession([8, 8]));
    expect(() => new Date(result.generatedAt).toISOString()).not.toThrow();
  });
});