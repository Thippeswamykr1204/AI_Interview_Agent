import rateLimit, { Options } from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import { RateLimitError } from "../types/api.types";

/**
 * Key by the caller's API key fingerprint when available (set by requireApiKey,
 * which always runs before these limiters), falling back to IP. This means
 * one noisy client can't eat another client's quota, and one client can't
 * evade limits by rotating IPs while reusing the same key.
 */
function keyGenerator(req: Request): string {
  return req.clientKeyFingerprint ?? req.ip ?? "unknown";
}

function rateLimitHandler(req: Request, _res: Response, next: NextFunction, options: Options): void {
  next(
    new RateLimitError(`Too many requests — limit is ${options.max} per ${options.windowMs / 1000}s`, {
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    })
  );
}

/**
 * Global safety net applied to every /api request regardless of route,
 * keyed by IP. Generous — this exists to blunt broad abuse/DoS, not to
 * police normal usage (that's what the tiered limiters below do).
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip ?? "unknown",
  handler: rateLimitHandler,
  skip: (req) => req.path === "/health",
});

/**
 * Applied to endpoints that call the Gemini API (question generation,
 * answer scoring, final evaluation) — these cost real money and latency,
 * so the limit is tight per API key.
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
});

/**
 * Applied to plain reads from storage (fetch session, fetch transcript) —
 * no AI cost, so this is much looser, mainly to prevent scripted polling
 * abuse rather than to limit legitimate usage.
 */
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
});