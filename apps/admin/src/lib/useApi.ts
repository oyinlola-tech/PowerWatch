import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { ApiError } from "./api";

interface State<T> {
  key: string;
  data?: T;
  error?: ApiError;
}

export interface ApiResource<T> {
  /** Latest data. While a new request runs, the previous result stays visible. */
  data: T | undefined;
  error: ApiError | undefined;
  loading: boolean;
  /** Fetch again (after a mutation, or from a "Try again" button). */
  reload: () => void;
}

/**
 * Runs `fetcher` whenever `key` changes, or when `reload` is called. No caching: every call hits
 * the API, so moderation screens never show data from before an action.
 * Pass `key = null` to skip fetching.
 */
export function useApi<T>(key: string | null, fetcher: (signal: AbortSignal) => Promise<T>): ApiResource<T> {
  const [state, setState] = useState<State<T> | null>(null);
  const [nonce, setNonce] = useState(0);
  const requestKey = key === null ? null : `${key}#${nonce}`;

  const run = useEffectEvent((signal: AbortSignal) => fetcher(signal));

  useEffect(() => {
    if (requestKey === null) return;
    const controller = new AbortController();
    run(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ key: requestKey, data });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        const apiError =
          error instanceof ApiError ? error : new ApiError(0, "Something went wrong. Please try again.");
        setState((previous) => ({
          key: requestKey,
          error: apiError,
          ...(previous?.data !== undefined ? { data: previous.data } : {}),
        }));
      },
    );
    return () => controller.abort();
  }, [requestKey]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const current = state?.key === requestKey;
  return {
    data: state?.data,
    error: current ? state?.error : undefined,
    loading: requestKey !== null && !current,
    reload,
  };
}

/** A value that follows `value` after it has stopped changing for `delay` ms (for search boxes). */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
