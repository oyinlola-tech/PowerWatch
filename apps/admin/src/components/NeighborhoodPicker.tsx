import { useId, useState } from "react";
import { request } from "../lib/api";
import { neighborhoodArea, neighborhoodLabel } from "../lib/locationIndex";
import { useLocations } from "../lib/locationsContext";
import type { LocationSearchResult } from "../lib/types";
import { useApi, useDebounced } from "../lib/useApi";
import Icon from "./Icon";
import { Spinner, inputClass } from "./ui";

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
  label?: string;
}

/** Finds a neighborhood by name with GET /locations/search and returns its ID. */
export function NeighborhoodPicker({ value, onChange, label = "Neighborhood" }: Props) {
  const { index } = useLocations();
  const [text, setText] = useState("");
  const query = useDebounced(text.trim(), 300);
  const id = useId();

  const results = useApi(value === null && query.length >= 2 ? `nb-search:${query}` : null, (signal) =>
    request<LocationSearchResult[]>("/locations/search", { query: { q: query, limit: 12 }, signal }),
  );
  const neighborhoods = (results.data ?? []).filter((r) => r.type === "neighborhood" && r.neighborhoodId !== null);

  if (value !== null) {
    return (
      <div className="min-w-0">
        <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
        <div className="flex min-h-11 items-center gap-2 rounded-lg border border-line bg-card px-3">
          <span className="min-w-0 flex-1 truncate text-sm">
            <span className="font-medium text-ink">{neighborhoodLabel(index, value)}</span>
            <span className="text-muted"> · {neighborhoodArea(index, value) || `ID ${value}`}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setText("");
            }}
            className="-mr-1 flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-soft hover:text-ink"
          >
            <Icon name="close" size={16} label={`Clear ${label.toLowerCase()} filter`} />
          </button>
        </div>
      </div>
    );
  }

  const showList = query.length >= 2 && text.trim().length >= 2;

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
          placeholder="Search by name"
          autoComplete="off"
          aria-describedby={`${id}-hint`}
          className={`${inputClass} pr-9`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
          {results.loading ? <Spinner /> : <Icon name="search" size={16} />}
        </span>
      </div>
      <p id={`${id}-hint`} className="sr-only">
        Type at least two letters, then pick a neighborhood from the list below.
      </p>
      {showList && (
        <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-72 overflow-y-auto rounded-lg border border-line bg-card shadow-lg">
          {results.error ? (
            <p className="px-3 py-3 text-sm text-off-ink">{results.error.message}</p>
          ) : !results.loading && neighborhoods.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted">No neighborhoods match “{query}”.</p>
          ) : (
            <ul aria-label="Matching neighborhoods">
              {neighborhoods.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onChange(n.neighborhoodId)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-soft focus-visible:bg-soft"
                  >
                    <span className="font-medium text-ink">{n.neighborhood}</span>
                    <span className="text-muted">
                      {" "}
                      · {n.town}, {n.lga}, {n.state}
                    </span>
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
