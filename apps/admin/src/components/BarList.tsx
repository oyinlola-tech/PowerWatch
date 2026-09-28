import { formatNumber } from "../lib/format";

interface Item {
  key: string | number;
  label: string;
  value: number;
  detail?: string;
}

/** Ranked horizontal bars. Values are printed as text, so the bars are decoration only. */
export function BarList({ items, tone = "accent", unit }: { items: Item[]; tone?: "accent" | "off" | "on"; unit?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const bar = { accent: "bg-accent/70", off: "bg-power-off/70", on: "bg-power-on/70" }[tone];
  return (
    <ol className="space-y-3">
      {items.map((item) => (
        <li key={item.key} className="min-w-0">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium text-ink" title={item.label}>
              {item.label}
            </span>
            <span className="flex-shrink-0 tabular-nums text-body">
              {formatNumber(item.value)}
              {unit ? ` ${unit}` : ""}
              {item.detail ? <span className="text-muted"> · {item.detail}</span> : null}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-soft" aria-hidden>
            <div className={`h-full rounded-full ${bar}`} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

/** ON versus OFF share as one split bar with a text legend. */
export function SplitBar({ on, off }: { on: number; off: number }) {
  const total = on + off;
  const onPct = total ? Math.round((on / total) * 1000) / 10 : 0;
  const offPct = total ? Math.round((100 - onPct) * 10) / 10 : 0;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-soft" aria-hidden>
        {total > 0 && (
          <>
            <div className="h-full bg-power-on" style={{ width: `${onPct}%` }} />
            <div className="h-full bg-power-off" style={{ width: `${offPct}%` }} />
          </>
        )}
      </div>
      <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm">
        <span className="text-on-ink">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-power-on" aria-hidden />
          ON {formatNumber(on)} ({onPct}%)
        </span>
        <span className="text-off-ink">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-power-off" aria-hidden />
          OFF {formatNumber(off)} ({offPct}%)
        </span>
      </div>
    </div>
  );
}
