import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { EmptyState, ErrorState, LoadingState, ResourceView } from "../components/DataState";
import { ConfirmDialog, Modal } from "../components/Modal";
import { NeighborhoodPicker } from "../components/NeighborhoodPicker";
import { Pagination } from "../components/Pagination";
import { Table, Td, Th } from "../components/Table";
import { Badge, Button, Card, Kv, PageHeader, PowerBadge } from "../components/ui";
import { request } from "../lib/api";
import { formatDateTime, formatMinutes, formatNumber, shortId } from "../lib/format";
import { neighborhoodArea } from "../lib/locationIndex";
import { useLocations } from "../lib/locationsContext";
import { useToast } from "../lib/toastContext";
import type { Outage, OutageDetail, Paged, ReportType } from "../lib/types";
import { useApi } from "../lib/useApi";

/** Minutes since an ongoing outage started. */
const minutesSince = (iso: string, now: number) => Math.max(0, (now - new Date(iso).getTime()) / 60_000);

export default function Outages() {
  const { index } = useLocations();
  const { notify } = useToast();
  const [params, setParams] = useSearchParams();
  const neighborhood = Number(params.get("neighborhood")) || null;
  const activeOnly = params.get("active") === "1";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Number(params.get("limit")) || 20;
  const viewId = params.get("view");
  const [toDelete, setToDelete] = useState<{ id: string; reportType: ReportType; timestamp: string; neighborhood: string } | null>(null);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  const outages = useApi(`outages:${neighborhood}|${activeOnly}|${page}|${limit}`, (signal) =>
    request<Paged<Outage>>("/reports/outages", {
      query: { neighborhoodId: neighborhood, activeOnly: activeOnly || undefined, page, limit },
      signal,
    }).then((result) => ({ ...result, fetchedAt: Date.now() })),
  );
  const detail = useApi(viewId ? `outage:${viewId}` : null, (signal) => request<OutageDetail>(`/reports/outages/${encodeURIComponent(viewId!)}`, { signal }));

  const deleteReport = async () => {
    if (!toDelete) return;
    await request(`/admin/reports/${encodeURIComponent(toDelete.id)}`, { method: "DELETE" });
    notify("The report was deleted.");
    detail.reload();
    outages.reload();
  };

  return (
    <>
      <PageHeader
        title="Outages"
        description="Outages open when neighbors report the power OFF and close when it is reported back ON."
        actions={<Button tone="secondary" icon="refresh" onClick={outages.reload} busy={outages.loading}>Refresh</Button>}
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <NeighborhoodPicker value={neighborhood} onChange={(id) => update({ neighborhood: id ? String(id) : null, page: null })} />
          <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => update({ active: e.target.checked ? "1" : null, page: null })}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            Ongoing outages only
          </label>
        </div>

        <ResourceView
          {...outages}
          isEmpty={(p) => p.data.length === 0}
          empty={<EmptyState title={activeOnly ? "No ongoing outages" : "No outages found"}>{neighborhood ? "Nothing recorded for this neighborhood." : "No outages have been recorded yet."}</EmptyState>}
        >
          {(p) => (
            <>
              <Table caption="Outages" head={<><Th>Neighborhood</Th><Th>Started</Th><Th>Ended</Th><Th>Length</Th><Th className="text-right">Reports</Th><Th /></>}>
                {p.data.map((o) => (
                  <tr key={o.id}>
                    <Td>
                      <p className="font-medium text-ink">{o.neighborhood.name}</p>
                      <p className="text-xs text-muted">{neighborhoodArea(index, o.neighborhoodId)}</p>
                    </Td>
                    <Td className="whitespace-nowrap">{formatDateTime(o.startTime)}</Td>
                    <Td className="whitespace-nowrap">{o.endTime ? formatDateTime(o.endTime) : <PowerBadge status="OFF" />}</Td>
                    <Td className="whitespace-nowrap">
                      {o.endTime ? formatMinutes(o.duration) : <span className="text-body">{formatMinutes(minutesSince(o.startTime, p.fetchedAt))} so far</span>}
                    </Td>
                    <Td className="text-right tabular-nums">{formatNumber(o.reportCount)}</Td>
                    <Td className="text-right">
                      <Button size="sm" tone="secondary" icon="eye" onClick={() => update({ view: o.id })}>
                        View<span className="sr-only"> outage in {o.neighborhood.name}</span>
                      </Button>
                    </Td>
                  </tr>
                ))}
              </Table>
              <Pagination pagination={p.pagination} onPage={(n) => update({ page: String(n) })} onLimit={(n) => update({ limit: String(n), page: null })} noun="outages" />
            </>
          )}
        </ResourceView>
      </Card>

      <Modal open={viewId !== null} title="Outage details" wide onClose={() => update({ view: null })}>
        {detail.error ? (
          <ErrorState error={detail.error} onRetry={detail.reload} />
        ) : !detail.data ? (
          <LoadingState />
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              {detail.data.endTime ? <Badge tone="on">Ended</Badge> : <Badge tone="off">Ongoing</Badge>}
            </div>
            <Kv
              items={[
                ["Neighborhood", `${detail.data.neighborhood.name} (ID ${detail.data.neighborhoodId})`],
                ["Area", neighborhoodArea(index, detail.data.neighborhoodId) || "—"],
                ["Started", formatDateTime(detail.data.startTime)],
                ["Ended", detail.data.endTime ? formatDateTime(detail.data.endTime) : "Still ongoing"],
                ["Length", detail.data.endTime ? formatMinutes(detail.data.duration) : "—"],
                ["Reports counted", formatNumber(detail.data.reportCount)],
              ]}
            />
            <div>
              <h3 className="mb-2 text-sm font-semibold text-ink">Linked reports</h3>
              {detail.data.outageReports.length === 0 ? (
                <p className="text-sm text-muted">No reports are linked to this outage.</p>
              ) : (
                <ul className="divide-y divide-line-light rounded-xl border border-line">
                  {detail.data.outageReports.map(({ report }) => (
                    <li key={report.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                      <span className="flex flex-wrap items-center gap-2">
                        <PowerBadge status={report.reportType} />
                        <span className="text-body">{formatDateTime(report.timestamp)}</span>
                        <code className="text-xs text-muted">{shortId(report.id)}</code>
                      </span>
                      <span className="flex gap-1.5">
                        <Link to={`/reports?view=${report.id}`} className="inline-flex min-h-9 items-center px-2 text-sm font-semibold text-accent hover:underline">
                          Open<span className="sr-only"> report {shortId(report.id)}</span>
                        </Link>
                        <Button
                          size="sm"
                          tone="ghost"
                          icon="trash"
                          className="text-off-ink hover:text-off-ink"
                          onClick={() => detail.data && setToDelete({ ...report, neighborhood: detail.data.neighborhood.name })}
                        >
                          Delete<span className="sr-only"> report {shortId(report.id)}</span>
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-sm">
              <Link to={`/reports?neighborhood=${detail.data.neighborhoodId}`} className="font-semibold text-accent hover:underline">
                All reports for {detail.data.neighborhood.name}
              </Link>
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={toDelete !== null} onClose={() => setToDelete(null)} onConfirm={deleteReport} title="Delete this report?" confirmLabel="Delete report">
        {toDelete && (
          <>
            <p>
              The <strong className="text-ink">Power {toDelete.reportType}</strong> report for{" "}
              <strong className="text-ink">{toDelete.neighborhood}</strong> sent at{" "}
              <strong className="text-ink">{formatDateTime(toDelete.timestamp)}</strong> (ID {shortId(toDelete.id)}) will be removed permanently and unlinked from this outage.
            </p>
            <p>The outage itself stays open or closed as it is; its report count is not recalculated.</p>
          </>
        )}
      </ConfirmDialog>
    </>
  );
}
