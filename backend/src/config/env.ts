import dotenv from "dotenv";
import path from "path";

dotenv.config();

interface EnvConfig {
  nodeEnv: "development" | "production" | "test";
  port: number;
  geminiApiKey: string;
  geminiModel: string;
  dataDir: string;
  corsOrigin: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parsePort(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid PORT value: ${value}`);
  }
  return parsed;
}

const nodeEnv = (process.env.NODE_ENV as EnvConfig["nodeEnv"]) || "development";

export const env: EnvConfig = {
  nodeEnv,
  port: parsePort(process.env.PORT, 4000),
  geminiApiKey: requireEnv("GEMINI_API_KEY"),
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  dataDir: process.env.DATA_DIR || path.resolve(__dirname, "../data/sessions"),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};

export const isProduction = env.nodeEnv === "production";
export const isDevelopment = env.nodeEnv === "development";