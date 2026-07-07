import { NextFunction, Request, Response } from "express";
import { AppError, ApiErrorResponse } from "../types/api.types";
import { logger } from "../utils/logger";

/**
 * Centralized error handler. Converts known AppError instances (and
 * unknown errors) into a consistent ApiErrorResponse shape.
 * Must be registered last, after all routes.
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error(`${req.method} ${req.path} -> ${error.message}`, error.details);
    } else {
      logger.warn(`${req.method} ${req.path} -> ${error.message}`, error.details);
    }

    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };

    res.status(error.statusCode).json(response);
    return;
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  logger.error(`${req.method} ${req.path} -> Unhandled error: ${message}`, error);

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  };

  res.status(500).json(response);
}

/**
 * Catches requests to undefined routes. Registered after all routes,
 * before errorHandler.
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.path}`,
    },
  };
  res.status(404).json(response);
}