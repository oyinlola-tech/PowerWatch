import { createContext, use } from "react";
import type { ApiError } from "./api";
import type { LocationIndex } from "./locationIndex";

export interface LocationsValue {
  index: LocationIndex | undefined;
  error: ApiError | undefined;
  loading: boolean;
  reload: () => void;
}

export const LocationsContext = createContext<LocationsValue | null>(null);

export function useLocations() {
  const value = use(LocationsContext);
  if (!value) throw new Error("useLocations must be used inside LocationsProvider");
  return value;
}
