import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../types/api.types";
import { env } from "../config/env";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set once requireApiKey succeeds; identifies which configured key was used. */
      clientKeyFingerprint?: string;
    }
  }
}

function fingerprint(key: string): string {
  // Never log/store the raw key — just enough of it to distinguish clients in logs.
  return key.length <= 4 ? "****" : `${key.slice(0, 2)}***${key.slice(-2)}`;
}

/**
 * Requires `Authorization: Bearer <key>` where <key> is one of the
 * configured API_KEYS. Rejects with 401 otherwise.
 *
 * This is deliberately simple (shared-secret, not per-user JWT/session auth):
 * it's meant to gate the API to known clients/services, not to model
 * individual candidate accounts. Layer real user auth on top of this if
 * candidate-level ownership of sessions is ever required.
 */
export function requireApiKey(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("authorization");

  if (!header || !header.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing Authorization: Bearer <api-key> header"));
    return;
  }

  const key = header.slice("Bearer ".length).trim();

  if (!key || !env.apiKeys.includes(key)) {
    next(new UnauthorizedError("Invalid API key"));
    return;
  }

  req.clientKeyFingerprint = fingerprint(key);
  next();
}