import { QuestionGenerator } from "../../src/interview/questionGenerator";
import { AIProvider } from "../../src/ai/provider.interface";
import { AIProviderError } from "../../src/types/api.types";
import { QuestionGenerationInput } from "../../src/types/question.types";

function makeInput(overrides: Partial<QuestionGenerationInput> = {}): QuestionGenerationInput {
  return {
    role: "Full Stack Developer",
    skills: ["React", "Node.js"],
    difficulty: "mid",
    count: 5,
    ...overrides,
  };
}

function mockProvider(responseText: string): AIProvider {
  return { generateText: jest.fn().mockResolvedValue(responseText) };
}

function questionBatch(n: number, category = "technical") {
  return JSON.stringify({
    questions: Array.from({ length: n }, (_, i) => ({
      question: `Question number ${i + 1}?`,
      category,
    })),
  });
}

describe("QuestionGenerator", () => {
  it("returns exactly `count` questions when the AI provides enough", async () => {
    const provider = mockProvider(questionBatch(7));
    const generator = new QuestionGenerator(provider);

    const questions = await generator.generate(makeInput({ count: 5 }));

    expect(questions).toHaveLength(5);
    expect(questions[0].question).toBe("Question number 1?");
  });

  it("falls back unknown categories to role-specific", async () => {
    const provider = mockProvider(questionBatch(5, "not-a-real-category"));
    const generator = new QuestionGenerator(provider);

    const questions = await generator.generate(makeInput());
    expect(questions.every((q) => q.category === "role-specific")).toBe(true);
  });

  it("throws when the AI returns fewer questions than requested", async () => {
    const provider = mockProvider(questionBatch(3));
    const generator = new QuestionGenerator(provider);

    await expect(generator.generate(makeInput({ count: 5 }))).rejects.toThrow(AIProviderError);
  });

  it("throws when the AI returns an empty questions array", async () => {
    const provider = mockProvider(JSON.stringify({ questions: [] }));
    const generator = new QuestionGenerator(provider);

    await expect(generator.generate(makeInput())).rejects.toThrow(AIProviderError);
  });

  it("throws when a question entry has empty text", async () => {
    const provider = mockProvider(
      JSON.stringify({ questions: [{ question: "   ", category: "technical" }] })
    );
    const generator = new QuestionGenerator(provider);

    await expect(generator.generate(makeInput({ count: 1 }))).rejects.toThrow(AIProviderError);
  });
});