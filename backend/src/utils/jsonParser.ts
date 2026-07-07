import { AIProviderError } from "../types/api.types";

/**
 * Extracts and parses a JSON object/array from a raw AI text response.
 * Handles responses wrapped in markdown code fences or with surrounding prose.
 */
export function parseJsonFromAiText<T>(rawText: string): T {
  const cleaned = stripCodeFences(rawText).trim();

  const candidate = extractJsonSpan(cleaned);

  try {
    return JSON.parse(candidate) as T;
  } catch (error) {
    throw new AIProviderError("Failed to parse JSON from AI response", {
      rawText,
      parseError: error instanceof Error ? error.message : String(error),
    });
  }
}

function stripCodeFences(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fenceMatch ? fenceMatch[1] : text;
}

function extractJsonSpan(text: string): string {
  const firstObjectStart = text.indexOf("{");
  const firstArrayStart = text.indexOf("[");

  let start = -1;
  let openChar = "{";
  let closeChar = "}";

  if (firstObjectStart === -1 && firstArrayStart === -1) {
    throw new AIProviderError("No JSON object or array found in AI response", { rawText: text });
  }

  if (firstObjectStart === -1) {
    start = firstArrayStart;
    openChar = "[";
    closeChar = "]";
  } else if (firstArrayStart === -1) {
    start = firstObjectStart;
  } else {
    start = Math.min(firstObjectStart, firstArrayStart);
    openChar = start === firstObjectStart ? "{" : "[";
    closeChar = start === firstObjectStart ? "}" : "]";
  }

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === "\\") {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === openChar) depth++;
    if (char === closeChar) depth--;
    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }

  throw new AIProviderError("Unbalanced JSON structure in AI response", { rawText: text });
}