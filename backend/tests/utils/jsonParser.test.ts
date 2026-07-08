import { parseJsonFromAiText } from "../../src/utils/jsonParser";
import { AIProviderError } from "../../src/types/api.types";

describe("parseJsonFromAiText", () => {
  it("parses a clean JSON object", () => {
    const result = parseJsonFromAiText<{ a: number }>('{"a": 1}');
    expect(result).toEqual({ a: 1 });
  });

  it("strips markdown code fences", () => {
    const raw = '```json\n{"score": 8, "feedback": "Good"}\n```';
    const result = parseJsonFromAiText<{ score: number; feedback: string }>(raw);
    expect(result).toEqual({ score: 8, feedback: "Good" });
  });

  it("extracts JSON embedded in surrounding prose", () => {
    const raw = 'Sure, here is the result:\n{"ok": true}\nLet me know if you need more.';
    const result = parseJsonFromAiText<{ ok: boolean }>(raw);
    expect(result).toEqual({ ok: true });
  });

  it("handles nested braces and braces inside string values", () => {
    const raw = '{"questions": [{"question": "What is {x} in scope?", "category": "technical"}]}';
    const result = parseJsonFromAiText<{ questions: Array<{ question: string; category: string }> }>(raw);
    expect(result.questions[0].question).toBe("What is {x} in scope?");
  });

  it("parses a top-level array", () => {
    const result = parseJsonFromAiText<number[]>("[1, 2, 3]");
    expect(result).toEqual([1, 2, 3]);
  });

  it("throws AIProviderError when no JSON is present", () => {
    expect(() => parseJsonFromAiText("no json here at all")).toThrow(AIProviderError);
  });

  it("throws AIProviderError on unbalanced JSON", () => {
    expect(() => parseJsonFromAiText('{"a": 1')).toThrow(AIProviderError);
  });

  it("throws AIProviderError on malformed JSON that still balances braces", () => {
    expect(() => parseJsonFromAiText("{a: 1,}")).toThrow(AIProviderError);
  });
});