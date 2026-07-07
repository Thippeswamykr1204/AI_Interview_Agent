import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody, validateParams } from "../middleware/validateRequest";
import {
  startSession,
  getSession,
  submitAnswer,
  getSummary,
  getTranscript,
  startSessionSchema,
  submitAnswerSchema,
  sessionIdParamSchema,
} from "../controllers/interview.controller";

const router = Router();

router.post("/start", validateBody(startSessionSchema), asyncHandler(startSession));

router.get("/:sessionId", validateParams(sessionIdParamSchema), asyncHandler(getSession));

router.post(
  "/:sessionId/answer",
  validateParams(sessionIdParamSchema),
  validateBody(submitAnswerSchema),
  asyncHandler(submitAnswer)
);

router.get("/:sessionId/summary", validateParams(sessionIdParamSchema), asyncHandler(getSummary));

router.get("/:sessionId/transcript", validateParams(sessionIdParamSchema), asyncHandler(getTranscript));

export const interviewRoutes = router;