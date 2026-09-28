import { useMemo, type ReactNode } from "react";
import { request } from "./api";
import { ProblemsContext } from "./problemsContext";
import type { SystemEventsResponse } from "./types";
import { useApi } from "./useApi";

/**
 * The count of open system events (for the sidebar badge and the Overview alert), loaded once
 * per signed-in session — not polled — and reloaded on demand after resolving events.
 */
export function ProblemsProvider({ children }: { children: ReactNode }) {
  const { data, error, loading, reload } = useApi("system-events-summary", (signal) =>
    request<SystemEventsResponse>("/admin/system-events", { query: { status: "open", limit: 1 }, signal }),
  );
  const value = useMemo(() => ({ open: data?.open, error, loading, reload }), [data, error, loading, reload]);
  return <ProblemsContext value={value}>{children}</ProblemsContext>;
}
