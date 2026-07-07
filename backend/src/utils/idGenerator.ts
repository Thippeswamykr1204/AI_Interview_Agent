import { randomUUID } from "crypto";

export function generateSessionId(): string {
  return `session_${randomUUID()}`;
}