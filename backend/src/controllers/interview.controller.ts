import { Request, Response } from "express";
import { z } from "zod";
import { InterviewService } from "../services/interview.service";
import { getAIProvider } from "../ai/ai.factory";
import { ApiSuccessResponse } from "../types/api.types";
import { InterviewSession } from "../types/session.types";
import { SubmitAnswerResult } from "../services/interview.service";

const interviewService = new InterviewService(getAIProvider());

export const startSessionSchema = z.object({
  role: z.string().trim().min(2, "Role must be at least 2 characters").max(100),
  skills: z.array(z.string().trim().min(1)).max(20).optional().default([]),
  difficulty: z.enum(["junior", "mid", "senior"]).optional(),
  totalQuestions: z.number().int().min(5).max(10).optional(),
});

export const submitAnswerSchema = z.object({
  answer: z.string().max(8000).optional().default(""),
});

export const sessionIdParamSchema = z.object({
  sessionId: z.string().trim().min(1),
});

function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const response: ApiSuccessResponse<T> = { success: true, data };
  res.status(statusCode).json(response);
}

export async function startSession(req: Request, res: Response): Promise<void> {
  const session = await interviewService.startSession(req.body);
  sendSuccess<InterviewSession>(res, session, 201);
}

export async function getSession(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params;
  const session = await interviewService.getSession(sessionId);
  sendSuccess<InterviewSession>(res, session);
}

export async function submitAnswer(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params;
  const { answer } = req.body;
  const result = await interviewService.submitAnswer(sessionId, answer);
  sendSuccess<SubmitAnswerResult>(res, result);
}

export async function getSummary(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params;
  const session = await interviewService.getSummary(sessionId);
  sendSuccess<InterviewSession>(res, session);
}

export async function getTranscript(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params;
  const session = await interviewService.getTranscript(sessionId);
  sendSuccess<InterviewSession>(res, session);
}