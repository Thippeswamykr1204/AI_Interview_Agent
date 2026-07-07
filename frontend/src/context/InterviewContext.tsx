import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";
import { InterviewSession } from "../types/interview.types";

interface AnswerFeedback {
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
}

interface InterviewContextValue {
  session: InterviewSession | null;
  setSession: Dispatch<SetStateAction<InterviewSession | null>>;
  lastFeedback: AnswerFeedback | null;
  setLastFeedback: Dispatch<SetStateAction<AnswerFeedback | null>>;
  reset: () => void;
}

const InterviewContext = createContext<InterviewContextValue | undefined>(undefined);

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [lastFeedback, setLastFeedback] = useState<AnswerFeedback | null>(null);

  function reset() {
    setSession(null);
    setLastFeedback(null);
  }

  return (
    <InterviewContext.Provider value={{ session, setSession, lastFeedback, setLastFeedback, reset }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterviewContext(): InterviewContextValue {
  const ctx = useContext(InterviewContext);
  if (!ctx) {
    throw new Error("useInterviewContext must be used within an InterviewProvider");
  }
  return ctx;
}