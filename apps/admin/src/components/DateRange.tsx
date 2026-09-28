import { lagosToday } from "../lib/format";
import { presetRange, rangeError, type Range } from "../lib/range";
import { Field } from "./ui";

const PRESETS: [string, number | null][] = [
  ["Today", 1],
  ["7 days", 7],
  ["30 days", 30],
  ["90 days", 90],
  ["All time", null],
];

export function DateRangePicker({ value, onChange }: { value: Range; onChange: (range: Range) => void }) {
  const error = rangeError(value);
  const active = PRESETS.find(([, days]) => {
    const p = presetRange(days);
    return p.from === value.from && p.to === value.to;
  })?.[0];
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick ranges">
        {PRESETS.map(([label, days]) => (
          <button
            key={label}
            type="button"
            aria-pressed={active === label}
            onClick={() => onChange(presetRange(days))}
            className={`min-h-9 rounded-full border px-3 text-sm font-medium transition ${
              active === label ? "border-accent bg-info-soft text-accent" : "border-line text-body hover:border-accent hover:text-accent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-3">
        <Field label="From" className="w-40" error={error}>
          {(p) => (
            <input id={p.id} type="date" value={value.from} max={lagosToday()} onChange={(e) => onChange({ ...value, from: e.target.value })} aria-invalid={p.invalid || undefined} aria-describedby={p.describedBy} className={p.className} />
          )}
        </Field>
        <Field label="To" className="w-40">
          {(p) => (
            <input id={p.id} type="date" value={value.to} onChange={(e) => onChange({ ...value, to: e.target.value })} className={p.className} />
          )}
        </Field>
      </div>
    </div>
  );
}
