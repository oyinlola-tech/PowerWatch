import type { Pagination as PaginationData } from "../lib/types";
import { formatNumber } from "../lib/format";
import { Button, inputClass } from "./ui";

interface Props {
  pagination: PaginationData;
  onPage: (page: number) => void;
  onLimit?: (limit: number) => void;
  noun: string;
}

const LIMITS = [10, 20, 50, 100];

export function Pagination({ pagination, onPage, onLimit, noun }: Props) {
  const { page, limit, total, totalPages } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <nav aria-label={`${noun} pages`} className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-body">
      <p aria-live="polite">
        {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)} {noun}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {onLimit && (
          <label className="flex items-center gap-2">
            <span className="text-muted">Per page</span>
            <select
              className={`${inputClass} !min-h-9 !w-auto !py-1`}
              value={limit}
              onChange={(e) => onLimit(Number(e.target.value))}
            >
              {LIMITS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
        <Button tone="secondary" size="sm" icon="chevronLeft" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <span className="tabular-nums">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <Button tone="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </nav>
  );
}
