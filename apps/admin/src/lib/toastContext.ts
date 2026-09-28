import { createContext, use } from "react";

export interface ToastValue {
  /** Shows a short confirmation that is also announced to screen readers. */
  notify: (message: string, tone?: "success" | "error") => void;
}

export const ToastContext = createContext<ToastValue | null>(null);

export function useToast() {
  const value = use(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}
