import { useCallback, useState } from "react";
import { ApiRequestError } from "../api/client";

interface UseApiState {
  isLoading: boolean;
  error: string | null;
}

interface UseApiResult<TArgs extends unknown[], TResult> extends UseApiState {
  execute: (...args: TArgs) => Promise<TResult | undefined>;
  clearError: () => void;
}

/**
 * Wraps an async API call with loading/error state management.
 * Keeps components free of repetitive try/catch/loading boilerplate.
 */
export function useApi<TArgs extends unknown[], TResult>(
  apiFn: (...args: TArgs) => Promise<TResult>
): UseApiResult<TArgs, TResult> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        return result;
      } catch (err) {
        const message =
          err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.";
        setError(message);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFn]
  );

  const clearError = useCallback(() => setError(null), []);

  return { isLoading, error, execute, clearError };
}