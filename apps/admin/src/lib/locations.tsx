import { useMemo, type ReactNode } from "react";
import { request } from "./api";
import { buildIndex } from "./locationIndex";
import { LocationsContext } from "./locationsContext";
import type { LocationTree } from "./types";
import { useApi } from "./useApi";

/**
 * The full location hierarchy (GET /admin/locations), loaded once per signed-in session and
 * reloaded after a rename. Used to turn neighborhood IDs into names and to browse the hierarchy.
 */
export function LocationsProvider({ children }: { children: ReactNode }) {
  const { data, error, loading, reload } = useApi("locations", (signal) =>
    request<LocationTree>("/admin/locations", { signal }),
  );
  const index = useMemo(() => (data ? buildIndex(data) : undefined), [data]);
  const value = useMemo(() => ({ index, error, loading, reload }), [index, error, loading, reload]);
  return <LocationsContext value={value}>{children}</LocationsContext>;
}
