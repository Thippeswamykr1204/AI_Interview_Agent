import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

/**
 * Logs method, path, status code, and duration for every request.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    const client = req.clientKeyFingerprint ? ` client=${req.clientKeyFingerprint}` : "";
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms${client}`);
  });

  next();
}