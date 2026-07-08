import dotenv from "dotenv";
import path from "path";

dotenv.config();

interface EnvConfig {
  nodeEnv: "development" | "production" | "test";
  port: number;
  geminiApiKey: string;
  geminiModel: string;
  dataDir: string;
  dbPath: string;
  corsOrigin: string;
  apiKeys: string[];
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

function parseApiKeys(nodeEnv: EnvConfig["nodeEnv"]): string[] {
  const raw = process.env.API_KEYS;
  const keys = (raw ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  if (keys.length === 0) {
    if (nodeEnv === "production") {
      throw new Error(
        "Missing required environment variable: API_KEYS (comma-separated list of allowed API keys)"
      );
    }
    // eslint-disable-next-line no-console
    console.warn(
      "[env] API_KEYS not set — falling back to a single insecure dev key ('dev-local-key'). " +
        "Do NOT do this in production; API_KEYS is required there."
    );
    return ["dev-local-key"];
  }

  return keys;
}

const nodeEnv = (process.env.NODE_ENV as EnvConfig["nodeEnv"]) || "development";

export const env: EnvConfig = {
  nodeEnv,
  port: parsePort(process.env.PORT, 4000),
  geminiApiKey: requireEnv("GEMINI_API_KEY"),
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  dataDir: process.env.DATA_DIR || path.resolve(__dirname, "../data/sessions"),
  dbPath: process.env.DB_PATH || path.resolve(__dirname, "../data/interview.db"),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  apiKeys: parseApiKeys(nodeEnv),
};

export const isProduction = env.nodeEnv === "production";
export const isDevelopment = env.nodeEnv === "development";