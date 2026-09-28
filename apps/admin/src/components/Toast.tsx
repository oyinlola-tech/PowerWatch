import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext } from "../lib/toastContext";
import Icon from "./Icon";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "error";
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const notify = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, message, tone }]);
      setTimeout(() => dismiss(id), 6000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:left-auto sm:right-6 sm:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
              toast.tone === "success" ? "border-on-ink/30 bg-card text-ink" : "border-off-ink/40 bg-card text-ink"
            }`}
          >
            <span className={toast.tone === "success" ? "text-on-ink" : "text-off-ink"}>
              <Icon name={toast.tone === "success" ? "check" : "alert"} size={18} />
            </span>
            <p className="min-w-0 flex-1">{toast.message}</p>
            <button type="button" onClick={() => dismiss(toast.id)} className="-m-1 rounded p-1 text-muted hover:text-ink">
              <Icon name="close" size={16} label="Dismiss" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
