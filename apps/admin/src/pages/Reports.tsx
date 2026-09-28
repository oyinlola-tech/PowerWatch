import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { DateRangePicker } from "../components/DateRange";
import { EmptyState, ErrorState, LoadingState, ResourceView } from "../components/DataState";
import { ConfirmDialog, Modal } from "../components/Modal";
import { NeighborhoodPicker } from "../components/NeighborhoodPicker";
import { Pagination } from "../components/Pagination";
import { Table, Td, Th } from "../components/Table";
import { Badge, Button, Card, Field, Kv, PageHeader, PowerBadge } from "../components/ui";
import { request } from "../lib/api";
import { formatDateTime, shortId } from "../lib/format";
import { neighborhoodArea, neighborhoodLabel } from "../lib/locationIndex";
import { useLocations } from "../lib/locationsContext";
import { rangeError, rangeQuery } from "../lib/range";
import { useToast } from "../lib/toastContext";
import type { Paged, PublicReport, ReportDetail } from "../lib/types";
import { useApi } from "../lib/useApi";

const DEVICE_LABEL = { ANDROID: "Android", IOS: "iPhone", WEB: "Web" } as const;

export default function Reports() {
  const { index } = useLocations();
  const { notify } = useToast();
  const [params, setParams] = useSearchParams();
  const neighborhood = Number(params.get("neighborhood")) || null;
  const type = params.get("type") ?? "";
  const range = { from: params.get("from") ?? "", to: params.get("to") ?? "" };
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Number(params.get("limit")) || 20;
  const viewId = params.get("view");
  const [toDelete, setToDelete] = useState<PublicReport | ReportDetail | null>(null);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  const invalidRange = Boolean(rangeError(range));
  const dates = rangeQuery(range);
  const reports = useApi(
    invalidRange ? null : `reports:${neighborhood}|${type}|${dates.startDate}|${dates.endDate}|${page}|${limit}`,
    (signal) =>
      request<Paged<PublicReport>>("/reports", {
        query: { neighborhoodId: neighborhood, reportType: type, ...dates, page, limit },
        signal,
      }),
  );

  const detail = useApi(viewId ? `report:${viewId}` : null, (signal) => request<ReportDetail>(`/reports/${viewId}`, { signal }));

  const deleteReport = async () => {
    if (!toDelete) return;
    await request(`/admin/reports/${toDelete.id}`, { method: "DELETE" });
    notify("The report was deleted.");
    if (viewId === toDelete.id) update({ view: null });
    reports.reload();
  };

  const hasFilters = Boolean(neighborhood || type || range.from || range.to);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Every ON/OFF report residents have sent, newest first. Delete reports that are spam or clearly wrong."
        actions={<Button tone="secondary" icon="refresh" onClick={reports.reload} busy={reports.loading}>Refresh</Button>}
      />

      <Card>
        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <NeighborhoodPicker value={neighborhood} onChange={(id) => update({ neighborhood: id ? String(id) : null, page: null })} />
            <Field label="Report type">
              {(p) => (
                <select id={p.id} value={type} onChange={(e) => update({ type: e.target.value, page: null })} className={p.className}>
                  <option value="">ON and OFF</option>
                  <option value="ON">Power ON</option>
                  <option value="OFF">Power OFF</option>
                </select>
              )}
            </Field>
          </div>
          <DateRangePicker value={range} onChange={(r) => update({ from: r.from, to: r.to, page: null })} />
          {hasFilters && (
            <Button tone="ghost" size="sm" icon="close" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Clear filters
            </Button>
          )}
        </div>

        {!invalidRange && (
          <ResourceView
            {...reports}
            isEmpty={(p) => p.data.length === 0}
            empty={<EmptyState title="No reports found">{hasFilters ? "No reports match these filters." : "No one has sent a report yet."}</EmptyState>}
          >
            {(p) => (
              <>
                <Table caption="Reports" head={<><Th>Time</Th><Th>Neighborhood</Th><Th>Status reported</Th><Th>Report ID</Th><Th className="text-right">Actions</Th></>}>
                  {p.data.map((r) => (
                    <tr key={r.id}>
                      <Td className="whitespace-nowrap">{formatDateTime(r.timestamp)}</Td>
                      <Td>
                        <p className="font-medium text-ink">{neighborhoodLabel(index, r.neighborhoodId)}</p>
                        <p className="text-xs text-muted">{neighborhoodArea(index, r.neighborhoodId)}</p>
                      </Td>
                      <Td><PowerBadge status={r.reportType} /></Td>
                      <Td><code className="text-xs text-muted" title={r.id}>{shortId(r.id)}</code></Td>
                      <Td>
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" tone="secondary" icon="eye" onClick={() => update({ view: r.id })}>
                            View<span className="sr-only"> report {shortId(r.id)}</span>
                          </Button>
                          <Button size="sm" tone="ghost" icon="trash" className="text-off-ink hover:text-off-ink" onClick={() => setToDelete(r)}>
                            Delete<span className="sr-only"> report {shortId(r.id)}</span>
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </Table>
                <Pagination pagination={p.pagination} onPage={(n) => update({ page: String(n) })} onLimit={(n) => update({ limit: String(n), page: null })} noun="reports" />
              </>
            )}
          </ResourceView>
        )}
      </Card>

      <Modal
        open={viewId !== null}
        title="Report details"
        wide
        onClose={() => update({ view: null })}
        footer={
          detail.data && (
            <Button tone="danger" icon="trash" onClick={() => detail.data && setToDelete(detail.data)}>
              Delete report
            </Button>
          )
        }
      >
        {detail.error ? (
          <ErrorState error={detail.error} onRetry={detail.reload} />
        ) : !detail.data || detail.loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <PowerBadge status={detail.data.reportType} />
              {detail.data.deviceType && <Badge>{DEVICE_LABEL[detail.data.deviceType]}</Badge>}
            </div>
            <Kv
              items={[
                ["Neighborhood", `${neighborhoodLabel(index, detail.data.neighborhoodId)} (ID ${detail.data.neighborhoodId})`],
                ["Area", neighborhoodArea(index, detail.data.neighborhoodId) || "—"],
                ["Reported at", formatDateTime(detail.data.timestamp)],
                ["Saved at", formatDateTime(detail.data.createdAt)],
                [
                  "GPS position",
                  detail.data.latitude !== null && detail.data.longitude !== null
                    ? `${detail.data.latitude.toFixed(5)}, ${detail.data.longitude.toFixed(5)}`
                    : "Not shared",
                ],
                ["GPS accuracy", detail.data.locationAccuracy !== null ? `± ${Math.round(detail.data.locationAccuracy)} m` : "—"],
                ["Reporter account ID", <code key="u" className="break-all text-xs">{detail.data.userId}</code>],
                ["Report ID", <code key="r" className="break-all text-xs">{detail.data.id}</code>],
              ]}
            />
            <p className="text-sm">
              <Link to={`/reports?neighborhood=${detail.data.neighborhoodId}`} className="font-semibold text-accent hover:underline">
                All reports for this neighborhood
              </Link>
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={deleteReport}
        title="Delete this report?"
        confirmLabel="Delete report"
      >
        {toDelete && (
          <>
            <p>
              The <strong className="text-ink">Power {toDelete.reportType}</strong> report for{" "}
              <strong className="text-ink">{neighborhoodLabel(index, toDelete.neighborhoodId)}</strong> sent at{" "}
              <strong className="text-ink">{formatDateTime(toDelete.timestamp)}</strong> (ID {shortId(toDelete.id)}) will be removed permanently.
            </p>
            <p>It is also unlinked from any outage it belongs to. The neighborhood's current status is not recalculated.</p>
          </>
        )}
      </ConfirmDialog>
    </>
  );
}
