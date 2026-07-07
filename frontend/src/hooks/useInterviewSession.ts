import { useCallback } from "react";
import { useInterviewContext } from "../context/InterviewContext";
import { useApi } from "./useApi";
import {
  startInterviewSession,
  submitInterviewAnswer,
  getInterviewSummary,
  getInterviewSession,
} from "../api/interview.api";
import { StartSessionRequest } from "../types/interview.types";

/**
 * Composes the InterviewContext with the API layer to provide a single
 * cohesive interface for pages: start, answer, and summary retrieval,
 * each with their own isolated loading/error state.
 */
export function useInterviewSession() {
  const { session, setSession, lastFeedback, setLastFeedback, reset } = useInterviewContext();

  const startApi = useApi(startInterviewSession);
  const answerApi = useApi(submitInterviewAnswer);
  const summaryApi = useApi(getInterviewSummary);
  const fetchApi = useApi(getInterviewSession);

  const start = useCallback(
    async (payload: StartSessionRequest) => {
      const result = await startApi.execute(payload);
      if (result) {
        setSession(result);
        setLastFeedback(null);
      }
      return result;
    },
    [startApi, setSession, setLastFeedback]
  );

  const submitAnswer = useCallback(
    async (sessionId: string, answer: string) => {
      const result = await answerApi.execute(sessionId, { answer });
      if (result) {
        setSession(result.session);
        setLastFeedback({
          score: result.score,
          feedback: result.feedback,
          strengths: result.strengths,
          gaps: result.gaps,
        });
      }
      return result;
    },
    [answerApi, setSession, setLastFeedback]
  );

  const fetchSummary = useCallback(
    async (sessionId: string) => {
      const result = await summaryApi.execute(sessionId);
      if (result) {
        setSession(result);
      }
      return result;
    },
    [summaryApi, setSession]
  );

  const fetchSession = useCallback(
    async (sessionId: string) => {
      const result = await fetchApi.execute(sessionId);
      if (result) {
        setSession(result);
      }
      return result;
    },
    [fetchApi, setSession]
  );

  return {
    session,
    lastFeedback,
    reset,
    start,
    isStarting: startApi.isLoading,
    startError: startApi.error,
    submitAnswer,
    isSubmitting: answerApi.isLoading,
    submitError: answerApi.error,
    fetchSummary,
    isFetchingSummary: summaryApi.isLoading,
    summaryError: summaryApi.error,
    fetchSession,
    isFetchingSession: fetchApi.isLoading,
    fetchSessionError: fetchApi.error,
  };
}