import { Fragment, useState } from "react";
import { useSearchParams } from "react-router";
import { EmptyState, ResourceView } from "../components/DataState";
import Icon from "../components/Icon";
import { ConfirmDialog } from "../components/Modal";
import { Pagination } from "../components/Pagination";
import { Table, Td, Th } from "../components/Table";
import { Badge, Button, Card, Field, Notice, PageHeader } from "../components/ui";
import { request } from "../lib/api";
import { formatDateTime, formatNumber } from "../lib/format";
import { useProblems } from "../lib/problemsContext";
import { useToast } from "../lib/toastContext";
import type { SystemEvent, SystemEventsResponse } from "../lib/types";
import { useApi } from "../lib/useApi";

const SOURCES = ["email", "push", "job", "geocoding", "api", "startup"] as const;
const SOURCE_LABEL: Record<(typeof SOURCES)[number], string> = {
  email: "Email",
  push: "Push",
  job: "Background job",
  geocoding: "Geocoding",
  api: "API",
  startup: "Startup",
};

/** Hides likely-sensitive values (recipient addresses, one-time codes) from event detail objects. */
function maskDetailValue(key: string, value: unknown): string {
  const str = typeof value === "string" ? value : JSON.stringify(value);
  const k = key.toLowerCase();
  if (k.includes("email") || k === "to") {
    const match = /^(.)([^@]*)(@.+)$/.exec(str);
    return match ? `${match[1]}***${match[3]}` : "•••";
  }
  if (k.includes("code") || k.includes("otp") || k.includes("token")) {
    return "•".repeat(Math.min(Math.max(str.length, 4), 8));
  }
  return str;
}

function DetailRow({ colSpan, event }: { colSpan: number; event: SystemEvent }) {
  const entries = Object.entries(event.details ?? {});
  return (
    <tr>
      <td colSpan={colSpan} className="bg-soft px-4 py-4 sm:px-5">
        <p className="mb-3 text-xs text-muted">
          Repeated occurrences of the same problem are grouped into one row (see “Seen”). Email addresses, codes and tokens shown below are masked.
        </p>
        {entries.length === 0 ? (
          <p className="text-sm text-muted">No further details were recorded.</p>
        ) : (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {entries.map(([key, value]) => (
              <div key={key} className="min-w-0">
                <dt className="text-xs uppercase tracking-wide text-muted">{key}</dt>
                <dd className="mt-0.5 break-words font-mono text-xs text-ink">{maskDetailValue(key, value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </td>
    </tr>
  );
}

export default function SystemProblems() {
  const { notify } = useToast();
  const problems = useProblems();
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") as "open" | "resolved" | "all" | null) ?? "open";
  const level = params.get("level") ?? "";
  const source = params.get("source") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Number(params.get("limit")) || 20;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [resolving, setResolving] = useState<SystemEvent | null>(null);
  const [resolvingAll, setResolvingAll] = useState(false);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  const events = useApi(`system-events:${status}|${level}|${source}|${page}|${limit}`, (signal) =>
    request<SystemEventsResponse>("/admin/system-events", { query: { status, level, source, page, limit }, signal }),
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resolveOne = async () => {
    if (!resolving) return;
    await request(`/admin/system-events/${encodeURIComponent(resolving.id)}/resolve`, { method: "POST" });
    notify("Marked as resolved.");
    events.reload();
    problems.reload();
  };

  const resolveAll = async () => {
    await request("/admin/system-events/resolve-all", { method: "POST", body: source ? { source } : {} });
    notify(source ? `All open ${SOURCE_LABEL[source as (typeof SOURCES)[number]]} problems were resolved.` : "All open problems were resolved.");
    events.reload();
    problems.reload();
  };

  const hasFilters = Boolean(level || source) || status !== "open";
  const columnCount = 6;

  return (
    <>
      <PageHeader
        title="System problems"
        description="Errors and warnings raised by background jobs, email, push and geocoding — grouped so a repeated failure is one row, not hundreds."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button tone="secondary" icon="refresh" onClick={events.reload} busy={events.loading}>
              Refresh
            </Button>
            {status !== "resolved" && (
              <Button tone="danger" icon="check" onClick={() => setResolvingAll(true)}>
                Resolve all
              </Button>
            )}
          </div>
        }
      />

      {problems.open && (problems.open.errors > 0 || problems.open.warnings > 0) && (
        <div className="mb-6">
          <Notice tone={problems.open.errors > 0 ? "error" : "warn"}>
            {formatNumber(problems.open.errors)} open error{problems.open.errors === 1 ? "" : "s"} and {formatNumber(problems.open.warnings)} open warning
            {problems.open.warnings === 1 ? "" : "s"} across the system right now.
          </Notice>
        </div>
      )}

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Status">
            {(p) => (
              <select id={p.id} value={status} onChange={(e) => update({ status: e.target.value, page: null })} className={p.className}>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="all">All</option>
              </select>
            )}
          </Field>
          <Field label="Level">
            {(p) => (
              <select id={p.id} value={level} onChange={(e) => update({ level: e.target.value, page: null })} className={p.className}>
                <option value="">All levels</option>
                <option value="ERROR">Error</option>
                <option value="WARNING">Warning</option>
              </select>
            )}
          </Field>
          <Field label="Source">
            {(p) => (
              <select id={p.id} value={source} onChange={(e) => update({ source: e.target.value, page: null })} className={p.className}>
                <option value="">All sources</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {SOURCE_LABEL[s]}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
        {hasFilters && (
          <div className="mb-4">
            <Button tone="ghost" size="sm" icon="close" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Reset filters
            </Button>
          </div>
        )}

        <ResourceView
          {...events}
          isEmpty={(r) => r.data.length === 0}
          empty={<EmptyState title="Nothing here">{hasFilters ? "No events match these filters." : "No open problems — everything's healthy."}</EmptyState>}
        >
          {(r) => (
            <>
              <Table
                caption="System problems"
                head={
                  <>
                    <Th>Level</Th>
                    <Th>Source</Th>
                    <Th>Message</Th>
                    <Th>Seen</Th>
                    <Th>Last seen</Th>
                    <Th className="text-right">Actions</Th>
                  </>
                }
              >
                {r.data.map((event) => (
                  <Fragment key={event.id}>
                    <tr>
                      <Td>{event.level === "ERROR" ? <Badge tone="off">Error</Badge> : <Badge tone="warn">Warning</Badge>}</Td>
                      <Td className="whitespace-nowrap text-body">{SOURCE_LABEL[event.source]}</Td>
                      <Td className="max-w-[24rem]">
                        <p className="truncate font-medium text-ink" title={event.message}>
                          {event.message}
                        </p>
                        {event.resolvedAt && (
                          <p className="mt-0.5 text-xs text-on-ink">Resolved {formatDateTime(event.resolvedAt)}</p>
                        )}
                      </Td>
                      <Td className="tabular-nums text-body">
                        {formatNumber(event.count)}× since {formatDateTime(event.firstSeenAt)}
                      </Td>
                      <Td className="whitespace-nowrap text-body">{formatDateTime(event.lastSeenAt)}</Td>
                      <Td>
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" tone="secondary" onClick={() => toggle(event.id)}>
                            <Icon name="chevronRight" size={14} className={expanded.has(event.id) ? "rotate-90" : ""} />
                            <span className="sr-only sm:not-sr-only">Details</span>
                          </Button>
                          {!event.resolvedAt && (
                            <Button size="sm" tone="ghost" icon="check" onClick={() => setResolving(event)}>
                              Resolve<span className="sr-only"> {event.message}</span>
                            </Button>
                          )}
                        </div>
                      </Td>
                    </tr>
                    {expanded.has(event.id) && <DetailRow colSpan={columnCount} event={event} />}
                  </Fragment>
                ))}
              </Table>
              <Pagination pagination={r.pagination} onPage={(n) => update({ page: String(n) })} onLimit={(n) => update({ limit: String(n), page: null })} noun="events" />
            </>
          )}
        </ResourceView>
      </Card>

      <ConfirmDialog
        open={resolving !== null}
        onClose={() => setResolving(null)}
        onConfirm={resolveOne}
        title="Mark this problem as resolved?"
        confirmLabel="Resolve"
        tone="primary"
      >
        {resolving && (
          <p>
            <strong className="text-ink">{resolving.message}</strong> ({SOURCE_LABEL[resolving.source]}, seen {formatNumber(resolving.count)} time
            {resolving.count === 1 ? "" : "s"}) will be marked resolved. It reopens automatically if it happens again.
          </p>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={resolvingAll}
        onClose={() => setResolvingAll(false)}
        onConfirm={resolveAll}
        title="Resolve all open problems?"
        confirmLabel="Resolve all"
        tone="primary"
      >
        <p>
          Every currently open error and warning{source ? ` from ${SOURCE_LABEL[source as (typeof SOURCES)[number]]}` : ""} will be marked resolved. Any of
          them reopens automatically if it happens again.
        </p>
      </ConfirmDialog>
    </>
  );
}
