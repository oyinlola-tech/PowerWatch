import { useMemo } from "react";
import { Link, useSearchParams } from "react-router";
import { EmptyState, ErrorState, LoadingState, ResourceView } from "../components/DataState";
import { Modal } from "../components/Modal";
import { Table, Td, Th } from "../components/Table";
import { Button, Card, Field, Kv, PageHeader, PowerBadge } from "../components/ui";
import { request } from "../lib/api";
import { formatDateTime, formatNumber } from "../lib/format";
import { useLocations } from "../lib/locationsContext";
import type { ActivityItem, LiveStatus as LiveStatusData, StatusMapByLga, StatusMapByState } from "../lib/types";
import { useApi } from "../lib/useApi";

export default function LiveStatus() {
  const { index, error: locationsError, reload: reloadLocations } = useLocations();
  const [params, setParams] = useSearchParams();
  const stateId = Number(params.get("state")) || null;
  const lgaId = Number(params.get("lga")) || null;
  const nbId = Number(params.get("nb")) || null;
  const statusFilter = params.get("show") ?? "";

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  const states = index?.tree.states ?? [];
  const lgas = useMemo(() => (index && stateId ? index.tree.lgas.filter((l) => l.stateId === stateId) : []), [index, stateId]);

  const byState = useApi(stateId && !lgaId ? `map-state:${stateId}` : null, (signal) =>
    request<StatusMapByState>("/locations/status-map", { query: { stateId }, signal }),
  );
  const byLga = useApi(lgaId ? `map-lga:${lgaId}` : null, (signal) =>
    request<StatusMapByLga>("/locations/status-map", { query: { lgaId }, signal }),
  );
  const live = useApi(nbId ? `live:${nbId}` : null, (signal) =>
    request<LiveStatusData>("/reports/status", { query: { neighborhoodId: nbId }, signal }),
  );
  const activity = useApi(nbId ? `activity:${nbId}` : null, (signal) =>
    request<ActivityItem[]>("/reports/activity", { query: { neighborhoodId: nbId, limit: 20 }, signal }),
  );

  const refresh = () => {
    byState.reload();
    byLga.reload();
  };

  return (
    <>
      <PageHeader
        title="Live status"
        description="Current power status by state, LGA and neighborhood, as residents report it."
        actions={(stateId || lgaId) && <Button tone="secondary" icon="refresh" onClick={refresh} busy={byState.loading || byLga.loading}>Refresh</Button>}
      />

      <Card className="mb-6">
        {locationsError ? (
          <ErrorState error={locationsError} onRetry={reloadLocations} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="State">
              {(p) => (
                <select id={p.id} value={stateId ?? ""} disabled={!index} onChange={(e) => update({ state: e.target.value, lga: null, show: null })} className={p.className}>
                  <option value="">{index ? "Choose a state" : "Loading states…"}</option>
                  {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
            </Field>
            <Field label="LGA">
              {(p) => (
                <select id={p.id} value={lgaId ?? ""} disabled={!stateId} onChange={(e) => update({ lga: e.target.value, show: null })} className={p.className}>
                  <option value="">{stateId ? "All LGAs in the state" : "Choose a state first"}</option>
                  {lgas.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              )}
            </Field>
          </div>
        )}
      </Card>

      {!stateId && !lgaId && (
        <Card>
          <EmptyState title="Choose a state">Pick a state to see which LGAs have outages, then an LGA to see each neighborhood.</EmptyState>
        </Card>
      )}

      {stateId && !lgaId && (
        <Card title={byState.data ? `LGAs in ${byState.data.state.name}` : "LGAs"} description="Neighborhoods with a known status only. Outage share = OFF neighborhoods out of those with a status.">
          <ResourceView {...byState} isEmpty={(d) => d.lgas.length === 0} empty={<EmptyState title="No LGAs found" />}>
            {(d) => (
              <Table caption="Power status by LGA" head={<><Th>LGA</Th><Th className="text-right">Neighborhoods</Th><Th className="text-right">ON</Th><Th className="text-right">OFF</Th><Th className="text-right">Outage share</Th><Th /></>}>
                {[...d.lgas]
                  .sort((a, b) => (b.outagePercent ?? -1) - (a.outagePercent ?? -1) || a.name.localeCompare(b.name))
                  .map((l) => (
                    <tr key={l.id}>
                      <Td className="font-medium">{l.name}</Td>
                      <Td className="text-right tabular-nums">{formatNumber(l.neighborhoods)}</Td>
                      <Td className="text-right tabular-nums text-on-ink">{formatNumber(l.neighborhoodsOn)}</Td>
                      <Td className="text-right tabular-nums text-off-ink">{formatNumber(l.neighborhoodsOff)}</Td>
                      <Td className="text-right tabular-nums">{l.outagePercent === null ? <span className="text-muted">No reports</span> : `${l.outagePercent}%`}</Td>
                      <Td className="text-right">
                        <Button size="sm" tone="secondary" onClick={() => update({ lga: String(l.id) })}>
                          Neighborhoods<span className="sr-only"> in {l.name}</span>
                        </Button>
                      </Td>
                    </tr>
                  ))}
              </Table>
            )}
          </ResourceView>
        </Card>
      )}

      {lgaId && (
        <Card
          title={byLga.data ? `Neighborhoods in ${byLga.data.lga.name}` : "Neighborhoods"}
          actions={
            <div role="group" aria-label="Show" className="flex flex-wrap gap-1.5">
              {[["", "All"], ["OFF", "OFF"], ["ON", "ON"], ["UNKNOWN", "Unknown"]].map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={statusFilter === value}
                  onClick={() => update({ show: value ?? null })}
                  className={`min-h-9 rounded-full border px-3 text-sm font-medium ${statusFilter === value ? "border-accent bg-info-soft text-accent" : "border-line text-body hover:border-accent hover:text-accent"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        >
          <ResourceView {...byLga} isEmpty={(d) => d.neighborhoods.length === 0} empty={<EmptyState title="No neighborhoods in this LGA" />}>
            {(d) => {
              const rows = d.neighborhoods.filter((n) => !statusFilter || n.status === statusFilter);
              const counts = d.neighborhoods.reduce((acc, n) => ({ ...acc, [n.status]: (acc[n.status] ?? 0) + 1 }), {} as Record<string, number>);
              return (
                <>
                  <p className="mb-3 text-sm text-body">
                    {formatNumber(counts.OFF ?? 0)} OFF · {formatNumber(counts.ON ?? 0)} ON · {formatNumber(counts.UNKNOWN ?? 0)} with no reports
                  </p>
                  {rows.length === 0 ? (
                    <EmptyState title="No neighborhoods with this status" />
                  ) : (
                    <Table caption="Power status by neighborhood" head={<><Th>Neighborhood</Th><Th>Town</Th><Th>Status</Th><Th>Outage since</Th><Th /></>}>
                      {rows.map((n) => (
                        <tr key={n.id}>
                          <Td className="font-medium">{n.name}</Td>
                          <Td className="text-body">{n.town}</Td>
                          <Td><PowerBadge status={n.status} /></Td>
                          <Td className="whitespace-nowrap text-body">{n.outageSince ? formatDateTime(n.outageSince) : "—"}</Td>
                          <Td className="text-right">
                            <Button size="sm" tone="secondary" icon="eye" onClick={() => update({ nb: String(n.id) })}>
                              Details<span className="sr-only"> for {n.name}</span>
                            </Button>
                          </Td>
                        </tr>
                      ))}
                    </Table>
                  )}
                </>
              );
            }}
          </ResourceView>
        </Card>
      )}

      <Modal open={nbId !== null} wide title={live.data ? `${live.data.neighborhood.name}, ${live.data.neighborhood.town}` : "Neighborhood status"} onClose={() => update({ nb: null })}>
        {live.error ? (
          <ErrorState error={live.error} onRetry={live.reload} />
        ) : !live.data ? (
          <LoadingState />
        ) : (
          <div className="space-y-5">
            <PowerBadge status={live.data.status} />
            <Kv
              items={[
                ["Since", formatDateTime(live.data.since)],
                ["Last report", formatDateTime(live.data.lastReportAt)],
                ["People confirming this status", formatNumber(live.data.confirmedBy)],
                ["Agreement among recent reporters", live.data.recentReporters ? `${live.data.confidence}% of ${formatNumber(live.data.recentReporters)}` : "No recent reports"],
              ]}
            />
            <div>
              <h3 className="mb-2 text-sm font-semibold text-ink">Recent changes in this LGA</h3>
              {activity.error ? (
                <ErrorState error={activity.error} onRetry={activity.reload} />
              ) : !activity.data ? (
                <LoadingState />
              ) : activity.data.length === 0 ? (
                <p className="text-sm text-muted">No status changes recorded nearby.</p>
              ) : (
                <ul className="divide-y divide-line-light rounded-xl border border-line">
                  {activity.data.map((a) => (
                    <li key={`${a.neighborhoodId}-${a.at}-${a.status}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                      <span className={a.isCurrentNeighborhood ? "font-semibold text-ink" : "text-ink"}>
                        {a.neighborhood}
                        <span className="font-normal text-muted">, {a.town}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-body">{a.status === "OFF" ? "Outage started" : "Power restored"}</span>
                        <span className="whitespace-nowrap text-muted">{formatDateTime(a.at)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="flex flex-wrap gap-4 text-sm">
              <Link to={`/reports?neighborhood=${nbId}`} className="font-semibold text-accent hover:underline">Reports</Link>
              <Link to={`/outages?neighborhood=${nbId}`} className="font-semibold text-accent hover:underline">Outages</Link>
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
