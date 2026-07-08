import { SessionService } from "../../src/services/session.service";
import { AppError } from "../../src/types/api.types";
import { CreateSessionInput } from "../../src/types/session.types";
import { GeneratedQuestion } from "../../src/types/question.types";

function generatedQuestions(n: number): GeneratedQuestion[] {
  return Array.from({ length: n }, (_, i) => ({
    question: `Q${i}`,
    category: "technical",
  }));
}

function baseInput(overrides: Partial<CreateSessionInput> = {}): CreateSessionInput {
  return { role: "Backend Engineer", skills: ["Node.js"], ...overrides };
}

describe("SessionService", () => {
  const service = new SessionService();

  it("builds a new session with 5 questions by default", () => {
    const session = service.buildNewSession(baseInput(), generatedQuestions(5));
    expect(session.totalQuestions).toBe(5);
    expect(session.questions).toHaveLength(5);
    expect(session.status).toBe("in_progress");
    expect(session.currentQuestionIndex).toBe(0);
  });

  it("clamps totalQuestions below the minimum of 5 up to 5", () => {
    const session = service.buildNewSession(baseInput({ totalQuestions: 2 }), generatedQuestions(5));
    expect(session.totalQuestions).toBe(5);
  });

  it("clamps totalQuestions above the maximum of 10 down to 10", () => {
    const session = service.buildNewSession(baseInput({ totalQuestions: 20 }), generatedQuestions(10));
    expect(session.totalQuestions).toBe(10);
  });

  it("throws if fewer generated questions were supplied than required", () => {
    expect(() => service.buildNewSession(baseInput({ totalQuestions: 5 }), generatedQuestions(3))).toThrow(
      AppError
    );
  });

  it("advances currentQuestionIndex after recording a non-final answer", () => {
    const session = service.buildNewSession(baseInput(), generatedQuestions(5));
    const updated = service.recordAnswer(session, "my answer", 7, "feedback", ["s1"], ["g1"]);

    expect(updated.currentQuestionIndex).toBe(1);
    expect(updated.status).toBe("in_progress");
    expect(updated.questions[0].score).toBe(7);
    expect(updated.questions[0].answer).toBe("my answer");
  });

  it("marks the session completed after the last question is answered", () => {
    let session = service.buildNewSession(baseInput(), generatedQuestions(5));
    for (let i = 0; i < 5; i++) {
      session = service.recordAnswer(session, `answer ${i}`, 5, "feedback", [], []);
    }
    expect(session.status).toBe("completed");
    expect(session.completedAt).toBeDefined();
  });

  it("assertInProgress throws once the session is completed", () => {
    let session = service.buildNewSession(baseInput(), generatedQuestions(5));
    for (let i = 0; i < 5; i++) {
      session = service.recordAnswer(session, `answer ${i}`, 5, "feedback", [], []);
    }
    expect(() => service.assertInProgress(session)).toThrow(AppError);
  });

  it("getCurrentQuestion still resolves the last answered question after completion (index isn't advanced past it)", () => {
    // recordAnswer intentionally leaves currentQuestionIndex pointing at the final
    // question once the session completes — callers must guard with assertInProgress
    // before calling getCurrentQuestion, which is exactly what submitAnswer does.
    let session = service.buildNewSession(baseInput(), generatedQuestions(5));
    for (let i = 0; i < 5; i++) {
      session = service.recordAnswer(session, `answer ${i}`, 5, "feedback", [], []);
    }
    expect(session.status).toBe("completed");
    expect(() => service.getCurrentQuestion(session)).not.toThrow();
  });
});