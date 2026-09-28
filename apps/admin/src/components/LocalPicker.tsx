import { useId, useState } from "react";
import Icon from "./Icon";

export interface LocalOption {
  id: number;
  label: string;
  sublabel?: string;
}

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
  options: LocalOption[];
  label: string;
  placeholder?: string;
}

/**
 * Searches an already-loaded list of options client-side (the state/LGA hierarchy is loaded
 * once per session by LocationsProvider), so picking one never costs an extra API call.
 */
export function LocalPicker({ value, onChange, options, label, placeholder = "Search by name" }: Props) {
  const [text, setText] = useState("");
  const id = useId();
  const selected = options.find((o) => o.id === value);

  if (selected) {
    return (
      <div className="min-w-0">
        <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
        <div className="flex min-h-11 items-center gap-2 rounded-lg border border-line bg-card px-3">
          <span className="min-w-0 flex-1 truncate text-sm">
            <span className="font-medium text-ink">{selected.label}</span>
            {selected.sublabel && <span className="text-muted"> · {selected.sublabel}</span>}
          </span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setText("");
            }}
            className="-mr-1 flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-soft hover:text-ink"
          >
            <Icon name="close" size={16} label={`Clear ${label.toLowerCase()}`} />
          </button>
        </div>
      </div>
    );
  }

  const q = text.trim().toLowerCase();
  const matches = q.length >= 1 ? options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 20) : [];
  const showList = q.length >= 1;

  return (
    <div className="relative min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="block w-full min-h-11 rounded-lg border border-line bg-card px-3 py-2 pr-9 text-sm text-ink placeholder:text-muted transition focus-visible:border-accent"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
          <Icon name="search" size={16} />
        </span>
      </div>
      {showList && (
        <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-72 overflow-y-auto rounded-lg border border-line bg-card shadow-lg">
          {matches.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted">No match for “{text.trim()}”.</p>
          ) : (
            <ul aria-label={`Matching ${label.toLowerCase()}s`}>
              {matches.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.id);
                      setText("");
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-soft focus-visible:bg-soft"
                  >
                    <span className="font-medium text-ink">{o.label}</span>
                    {o.sublabel && <span className="text-muted"> · {o.sublabel}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
