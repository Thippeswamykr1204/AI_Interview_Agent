import { AnswerEvaluator } from "../../src/interview/answerEvaluator";
import { AIProvider } from "../../src/ai/provider.interface";
import { AIProviderError } from "../../src/types/api.types";
import { AnswerEvaluationInput } from "../../src/types/question.types";

function makeInput(overrides: Partial<AnswerEvaluationInput> = {}): AnswerEvaluationInput {
  return {
    role: "Backend Engineer",
    difficulty: "mid",
    question: "How do you handle database migrations?",
    category: "technical",
    answer: "I use versioned migration files and run them in CI before deploy.",
    ...overrides,
  };
}

function mockProvider(responseText: string): AIProvider {
  return { generateText: jest.fn().mockResolvedValue(responseText) };
}

describe("AnswerEvaluator", () => {
  it("returns a deterministic zero score for an empty answer without calling the AI provider", async () => {
    const provider = mockProvider('{"score": 9}');
    const evaluator = new AnswerEvaluator(provider);

    const result = await evaluator.evaluate(makeInput({ answer: "   " }));

    expect(result.score).toBe(0);
    expect(result.gaps).toContain("No response given");
    expect(provider.generateText).not.toHaveBeenCalled();
  });

  it("parses and normalizes a valid AI response", async () => {
    const provider = mockProvider(
      JSON.stringify({
        score: 7.6,
        feedback: "Solid answer, missed rollback strategy.",
        strengths: ["Mentioned CI integration"],
        gaps: ["No rollback plan"],
      })
    );
    const evaluator = new AnswerEvaluator(provider);

    const result = await evaluator.evaluate(makeInput());

    expect(result.score).toBe(8); // rounded
    expect(result.feedback).toBe("Solid answer, missed rollback strategy.");
    expect(result.strengths).toEqual(["Mentioned CI integration"]);
    expect(result.gaps).toEqual(["No rollback plan"]);
  });

  it("clamps out-of-range scores into the 0-10 band", async () => {
    const provider = mockProvider(JSON.stringify({ score: 15, feedback: "x" }));
    const evaluator = new AnswerEvaluator(provider);

    const result = await evaluator.evaluate(makeInput());
    expect(result.score).toBe(10);
  });

  it("clamps negative scores up to 0", async () => {
    const provider = mockProvider(JSON.stringify({ score: -3, feedback: "x" }));
    const evaluator = new AnswerEvaluator(provider);

    const result = await evaluator.evaluate(makeInput());
    expect(result.score).toBe(0);
  });

  it("throws AIProviderError when the AI response has no numeric score", async () => {
    const provider = mockProvider(JSON.stringify({ feedback: "no score field" }));
    const evaluator = new AnswerEvaluator(provider);

    await expect(evaluator.evaluate(makeInput())).rejects.toThrow(AIProviderError);
  });

  it("throws AIProviderError when the AI response has empty feedback", async () => {
    const provider = mockProvider(JSON.stringify({ score: 5, feedback: "   " }));
    const evaluator = new AnswerEvaluator(provider);

    await expect(evaluator.evaluate(makeInput())).rejects.toThrow(AIProviderError);
  });

  it("defaults strengths/gaps to empty arrays when missing or malformed", async () => {
    const provider = mockProvider(JSON.stringify({ score: 6, feedback: "ok", strengths: "not-an-array" }));
    const evaluator = new AnswerEvaluator(provider);

    const result = await evaluator.evaluate(makeInput());
    expect(result.strengths).toEqual([]);
    expect(result.gaps).toEqual([]);
  });
});