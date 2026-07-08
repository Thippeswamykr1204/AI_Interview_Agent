import axios, { AxiosError, AxiosInstance } from "axios";
import { ApiErrorResponse } from "../types/interview.types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

// NOTE on this API_KEY approach: it authenticates the *client application*
// to the backend (server-to-server style shared secret), not an individual
// user. Because this is a browser bundle, the key is visible to anyone who
// opens devtools — it stops anonymous internet traffic from hitting the API,
// but it is NOT a substitute for real user authentication. If this app is
// ever deployed for the public (not just internal/trusted users), replace
// this with per-user login (session cookie or short-lived JWT issued by a
// /auth/login endpoint) so sessions can be tied to and scoped by user.
const API_KEY = import.meta.env.VITE_API_KEY || "dev-local-key";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
});

export class ApiRequestError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: unknown;

  constructor(message: string, code: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.data && !error.response.data.success) {
      const { code, message, details } = error.response.data.error;
      throw new ApiRequestError(message, code, error.response.status, details);
    }

    if (error.code === "ECONNABORTED") {
      throw new ApiRequestError("Request timed out. Please try again.", "TIMEOUT");
    }

    if (!error.response) {
      throw new ApiRequestError(
        "Unable to reach the server. Check your connection and try again.",
        "NETWORK_ERROR"
      );
    }

    throw new ApiRequestError("An unexpected error occurred", "UNKNOWN_ERROR", error.response.status);
  }
);