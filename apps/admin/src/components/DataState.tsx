import type { ReactNode } from "react";
import type { ApiError } from "../lib/api";
import Icon from "./Icon";
import { Button, Spinner } from "./ui";

export const LoadingState = ({ label = "Loading…" }: { label?: string }) => (
  <div role="status" className="flex items-center justify-center gap-3 px-4 py-12 text-sm text-muted">
    <Spinner />
    {label}
  </div>
);

export const EmptyState = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-soft text-muted">
      <Icon name="search" />
    </div>
    <p className="font-semibold text-ink">{title}</p>
    {children && <div className="mt-1 max-w-md text-sm text-muted">{children}</div>}
  </div>
);

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  const title =
    error.status === 0
      ? "Can't reach the API"
      : error.status === 403
        ? "Not allowed"
        : error.status === 429
          ? "Too many requests"
          : "Couldn't load this";
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-off-soft text-off-ink">
        <Icon name="alert" />
      </div>
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-md text-sm text-body">{error.message}</p>
      {onRetry && (
        <Button tone="secondary" icon="refresh" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

interface ResourceViewProps<T> {
  data: T | undefined;
  error: ApiError | undefined;
  loading: boolean;
  reload: () => void;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  loadingLabel?: string;
  children: (data: T) => ReactNode;
}

/** Shows the loading, error or empty state, or the content once data is in. */
export function ResourceView<T>({ data, error, loading, reload, isEmpty, empty, loadingLabel, children }: ResourceViewProps<T>) {
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (data === undefined) return <LoadingState {...(loadingLabel ? { label: loadingLabel } : {})} />;
  if (isEmpty?.(data)) {
    if (loading) return <LoadingState {...(loadingLabel ? { label: loadingLabel } : {})} />;
    return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;
  }
  return (
    <div className={`transition-opacity ${loading ? "opacity-60" : ""}`} aria-busy={loading || undefined}>
      {children(data)}
    </div>
  );
}
