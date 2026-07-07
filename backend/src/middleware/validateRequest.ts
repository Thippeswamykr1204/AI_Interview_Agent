import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../types/api.types";

/**
 * Middleware factory that validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (typed, defaulted) value.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new ValidationError("Request body failed validation", result.error.flatten())
      );
      return;
    }

    req.body = result.data;
    next();
  };
}

/**
 * Middleware factory that validates req.params against a Zod schema.
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      next(
        new ValidationError("Request params failed validation", result.error.flatten())
      );
      return;
    }

    req.params = result.data;
    next();
  };
}