import { useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

type Tone = "primary" | "secondary" | "danger" | "warning" | "ghost";

const toneClass: Record<Tone, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover disabled:bg-primary/60",
  secondary: "border border-line bg-card text-ink hover:border-accent hover:text-accent",
  danger: "bg-off-ink text-white hover:opacity-90 dark:text-[#1a0506]",
  warning: "border border-warn-ink/40 bg-warn-soft text-warn-ink hover:border-warn-ink",
  ghost: "text-body hover:bg-soft hover:text-ink",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  size?: "sm" | "md";
  icon?: IconName;
  busy?: boolean;
}

export function Button({ tone = "primary", size = "md", icon, busy, children, className = "", disabled, ...rest }: ButtonProps) {
  const sizing = size === "sm" ? "min-h-9 px-3 text-sm gap-1.5" : "min-h-11 px-4 text-sm gap-2";
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${sizing} ${toneClass[tone]} ${className}`}
    >
      {busy ? <Spinner /> : icon ? <Icon name={icon} size={size === "sm" ? 16 : 18} /> : null}
      {children}
    </button>
  );
}

export const Spinner = ({ label }: { label?: string }) => (
  <span
    className="inline-block h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
    {...(label ? { role: "status", "aria-label": label } : { "aria-hidden": true })}
  />
);

export function Card({ title, actions, children, className = "", description }: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 rounded-2xl border border-line bg-card p-4 sm:p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-body">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, tone = "default" }: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "on" | "off" | "accent";
}) {
  const valueTone = {
    default: "text-ink",
    on: "text-on-ink",
    off: "text-off-ink",
    accent: "text-accent",
  }[tone];
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-card p-4">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-bold tabular-nums sm:text-3xl ${valueTone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

type BadgeTone = "on" | "off" | "neutral" | "info" | "warn";

const badgeClass: Record<BadgeTone, string> = {
  on: "bg-on-soft text-on-ink",
  off: "bg-off-soft text-off-ink",
  neutral: "bg-soft text-body",
  info: "bg-info-soft text-accent",
  warn: "bg-warn-soft text-warn-ink",
};

export const Badge = ({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) => (
  <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass[tone]}`}>
    {children}
  </span>
);

export const PowerBadge = ({ status }: { status: "ON" | "OFF" | "UNKNOWN" }) =>
  status === "ON" ? (
    <Badge tone="on">
      <span className="h-1.5 w-1.5 rounded-full bg-power-on" aria-hidden /> Power ON
    </Badge>
  ) : status === "OFF" ? (
    <Badge tone="off">
      <span className="h-1.5 w-1.5 rounded-full bg-power-off" aria-hidden /> Power OFF
    </Badge>
  ) : (
    <Badge>Unknown</Badge>
  );

export function Notice({ tone = "info", title, children, action }: {
  tone?: "info" | "error" | "success" | "warn";
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const styles = {
    info: "border-accent/30 bg-info-soft text-ink",
    error: "border-off-ink/30 bg-off-soft text-off-ink",
    success: "border-on-ink/30 bg-on-soft text-on-ink",
    warn: "border-warn-ink/30 bg-warn-soft text-warn-ink",
  }[tone];
  const icon: IconName = tone === "success" ? "check" : tone === "info" ? "clock" : "alert";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`}>
      <Icon name={icon} size={18} className="mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : ""}>{children}</div>}
      </div>
      {action}
    </div>
  );
}

const fieldClass =
  "block w-full min-h-11 rounded-lg border bg-card px-3 py-2 text-sm text-ink placeholder:text-muted transition focus-visible:border-accent";

interface FieldShellProps {
  label: string;
  error?: string | undefined;
  hint?: ReactNode;
  className?: string;
  children: (props: { id: string; describedBy: string | undefined; invalid: boolean; className: string }) => ReactNode;
}

/** Label, control, hint and error message wired together for screen readers. */
export function Field({ label, error, hint, className = "", children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children({
        id,
        describedBy,
        invalid: Boolean(error),
        className: `${fieldClass} ${error ? "border-off-ink" : "border-line"}`,
      })}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs font-medium text-off-ink">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass = `${fieldClass} border-line`;

export const Kv = ({ items }: { items: [string, ReactNode][] }) => (
  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
    {items.map(([k, v]) => (
      <div key={k} className="min-w-0">
        <dt className="text-muted">{k}</dt>
        <dd className="mt-0.5 break-words font-medium text-ink">{v}</dd>
      </div>
    ))}
  </dl>
);
