import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ApiError } from "../services/api";

interface ApiState<T> {
  data: T | undefined;
  error: ApiError | undefined;
  /** First load, nothing to show yet */
  loading: boolean;
  /** Pull-to-refresh in progress */
  refreshing: boolean;
}

const toApiError = (error: unknown) =>
  error instanceof ApiError ? error : new ApiError(0, "Something went wrong. Please try again.");

/**
 * Loads data when the screen gains focus (so it's fresh after navigating back)
 * and exposes pull-to-refresh. `key` re-runs the load when it changes.
 */
export function useApi<T>(fetcher: () => Promise<T>, key: string | number = "") {
  const [state, setState] = useState<ApiState<T>>({
    data: undefined,
    error: undefined,
    loading: true,
    refreshing: false,
  });
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async (mode: "focus" | "refresh") => {
    const id = ++requestId.current;
    setState((s) => ({
      ...s,
      loading: s.data === undefined,
      refreshing: mode === "refresh",
      error: mode === "refresh" ? undefined : s.error,
    }));
    try {
      const data = await fetcherRef.current();
      if (id === requestId.current) setState({ data, error: undefined, loading: false, refreshing: false });
    } catch (error) {
      if (id === requestId.current) {
        setState((s) => ({ ...s, error: toApiError(error), loading: false, refreshing: false }));
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load("focus");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load, key]),
  );

  const refresh = useCallback(() => load("refresh"), [load]);
  const mutate = useCallback((update: (data: T | undefined) => T | undefined) => {
    setState((s) => ({ ...s, data: update(s.data) }));
  }, []);

  return { ...state, refresh, mutate };
}
