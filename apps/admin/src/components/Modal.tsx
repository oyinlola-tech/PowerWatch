import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { errorMessage } from "../lib/api";
import Icon from "./Icon";
import { Button, Notice } from "./ui";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Wider layout for detail views */
  wide?: boolean;
}

/**
 * Native <dialog> shown with showModal(): the browser traps focus, closes on Escape and
 * returns focus to the button that opened it.
 */
export function Modal({ open, title, onClose, children, footer, wide }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-line bg-card p-0 text-ink shadow-2xl ${wide ? "max-w-2xl" : "max-w-lg"}`}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="-m-2 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink"
            >
              <Icon name="close" label="Close" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  /** Names exactly what will be affected */
  children: ReactNode;
  confirmLabel: string;
  tone?: "danger" | "warning" | "primary";
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** Confirmation step for destructive actions. Shows the server's error inside the dialog if the action fails. */
export function ConfirmDialog({ open, title, children, confirmLabel, tone = "danger", onConfirm, onClose }: ConfirmProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (busy) return;
    setError(null);
    onClose();
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      setBusy(false);
      onClose();
    } catch (err) {
      setBusy(false);
      setError(errorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={close}
      footer={
        <>
          <Button tone="secondary" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button tone={tone} busy={busy} onClick={confirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm text-body">{children}</div>
      {error && (
        <div className="mt-4">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
    </Modal>
  );
}
