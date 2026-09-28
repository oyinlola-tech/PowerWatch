import { createContext, use } from "react";
import type { ApiError } from "./api";

export interface ProblemsValue {
  open: { errors: number; warnings: number } | undefined;
  error: ApiError | undefined;
  loading: boolean;
  /** Re-fetch the open count, e.g. after resolving an event on the System problems screen. */
  reload: () => void;
}

export const ProblemsContext = createContext<ProblemsValue | null>(null);

export function useProblems() {
  const value = use(ProblemsContext);
  if (!value) throw new Error("useProblems must be used inside ProblemsProvider");
  return value;
}
