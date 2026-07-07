import { isProduction } from "../config/env";

type LogLevel = "info" | "warn" | "error" | "debug";

function timestamp(): string {
  return new Date().toISOString();
}

function format(level: LogLevel, message: string, meta?: unknown): string {
  const base = `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
  if (meta === undefined) return base;
  try {
    return `${base} ${JSON.stringify(meta)}`;
  } catch {
    return `${base} [unserializable meta]`;
  }
}

export const logger = {
  info(message: string, meta?: unknown): void {
    console.log(format("info", message, meta));
  },
  warn(message: string, meta?: unknown): void {
    console.warn(format("warn", message, meta));
  },
  error(message: string, meta?: unknown): void {
    console.error(format("error", message, meta));
  },
  debug(message: string, meta?: unknown): void {
    if (isProduction) return;
    console.debug(format("debug", message, meta));
  },
};