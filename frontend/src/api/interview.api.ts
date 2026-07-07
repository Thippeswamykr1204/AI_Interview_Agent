import { apiClient } from "./client";
import {
  ApiSuccessResponse,
  InterviewSession,
  StartSessionRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from "../types/interview.types";

export async function startInterviewSession(
  payload: StartSessionRequest
): Promise<InterviewSession> {
  const response = await apiClient.post<ApiSuccessResponse<InterviewSession>>(
    "/interview/start",
    payload
  );
  return response.data.data;
}

export async function getInterviewSession(sessionId: string): Promise<InterviewSession> {
  const response = await apiClient.get<ApiSuccessResponse<InterviewSession>>(
    `/interview/${sessionId}`
  );
  return response.data.data;
}

export async function submitInterviewAnswer(
  sessionId: string,
  payload: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> {
  const response = await apiClient.post<ApiSuccessResponse<SubmitAnswerResponse>>(
    `/interview/${sessionId}/answer`,
    payload
  );
  return response.data.data;
}

export async function getInterviewSummary(sessionId: string): Promise<InterviewSession> {
  const response = await apiClient.get<ApiSuccessResponse<InterviewSession>>(
    `/interview/${sessionId}/summary`
  );
  return response.data.data;
}

export async function getInterviewTranscript(sessionId: string): Promise<InterviewSession> {
  const response = await apiClient.get<ApiSuccessResponse<InterviewSession>>(
    `/interview/${sessionId}/transcript`
  );
  return response.data.data;
}