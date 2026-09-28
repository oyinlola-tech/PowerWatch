import { useMemo, useState } from "react";
import { Link } from "react-router";
import { EmptyState, ResourceView } from "../components/DataState";
import { Pagination } from "../components/Pagination";
import { paginate } from "../lib/paginate";
import { Table, Td, Th } from "../components/Table";
import { Button, Card, Field, PageHeader, StatCard } from "../components/ui";
import { request } from "../lib/api";
import { formatNumber } from "../lib/format";
import type { LocationStatistics, NeighborhoodStat } from "../lib/types";
import { useApi } from "../lib/useApi";

type SortKey = "reportCount" | "outageCount" | "userCount" | "name";

const SORTS: [SortKey, string][] = [
  ["reportCount", "Most reports"],
  ["outageCount", "Most outages"],
  ["userCount", "Most residents"],
  ["name", "Name (A–Z)"],
];

export default function NeighborhoodStats() {
  const stats = useApi("location-stats", (signal) => request<LocationStatistics>("/analytics/locations", { signal }));
  const [text, setText] = useState("");
  const [state, setState] = useState("");
  const [sort, setSort] = useState<SortKey>("reportCount");
  const [onlyActive, setOnlyActive] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const all = stats.data?.neighborhoods;
  const states = useMemo(() => [...new Set((all ?? []).map((n) => n.state))].sort(), [all]);

  const filtered = useMemo(() => {
    const needle = text.trim().toLowerCase();
    const rows = (all ?? []).filter(
      (n) =>
        (!state || n.state === state) &&
        (!onlyActive || n.reportCount + n.outageCount + n.userCount > 0) &&
        (!needle || [n.name, n.town, n.city, n.lga].some((v) => v.toLowerCase().includes(needle))),
    );
    return rows.sort((a: NeighborhoodStat, b: NeighborhoodStat) =>
      sort === "name" ? a.name.localeCompare(b.name) : b[sort] - a[sort] || a.name.localeCompare(b.name),
    );
  }, [all, text, state, sort, onlyActive]);

  const totals = useMemo(
    () =>
      (all ?? []).reduce(
        (acc, n) => ({
          reports: acc.reports + n.reportCount,
          outages: acc.outages + n.outageCount,
          users: acc.users + n.userCount,
          withActivity: acc.withActivity + (n.reportCount + n.outageCount + n.userCount > 0 ? 1 : 0),
        }),
        { reports: 0, outages: 0, users: 0, withActivity: 0 },
      ),
    [all],
  );

  const { rows, pagination } = paginate(filtered, page, limit);
  const resetPage = () => setPage(1);

  return (
    <>
      <PageHeader
        title="Neighborhood stats"
        description="Reports, outages and residents per neighborhood, all time. Figures can identify households in small areas, so keep them inside the team."
        actions={<Button tone="secondary" icon="refresh" onClick={stats.reload} busy={stats.loading}>Refresh</Button>}
      />
      <ResourceView {...stats}>
        {(s) => (
          <>
            <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Neighborhoods" value={formatNumber(s.totalNeighborhoods)} />
              <StatCard label="With any activity" value={formatNumber(totals.withActivity)} tone="accent" />
              <StatCard label="Reports" value={formatNumber(totals.reports)} />
              <StatCard label="Outages" value={formatNumber(totals.outages)} tone="off" />
            </div>
            <Card>
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Field label="Search">
                  {(p) => (
                    <input id={p.id} type="search" value={text} placeholder="Neighborhood, town, city or LGA" onChange={(e) => { setText(e.target.value); resetPage(); }} className={p.className} />
                  )}
                </Field>
                <Field label="State">
                  {(p) => (
                    <select id={p.id} value={state} onChange={(e) => { setState(e.target.value); resetPage(); }} className={p.className}>
                      <option value="">All states</option>
                      {states.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                  )}
                </Field>
                <Field label="Sort by">
                  {(p) => (
                    <select id={p.id} value={sort} onChange={(e) => { setSort(e.target.value as SortKey); resetPage(); }} className={p.className}>
                      {SORTS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  )}
                </Field>
                <label className="flex min-h-11 items-center gap-2 self-end text-sm text-ink">
                  <input type="checkbox" checked={onlyActive} onChange={(e) => { setOnlyActive(e.target.checked); resetPage(); }} className="h-4 w-4 accent-[var(--color-primary)]" />
                  Only neighborhoods with activity
                </label>
              </div>
              {filtered.length === 0 ? (
                <EmptyState title="No neighborhoods match">Try a different search or state.</EmptyState>
              ) : (
                <>
                  <Table
                    caption="Neighborhood statistics"
                    head={<><Th>Neighborhood</Th><Th>Area</Th><Th className="text-right">Reports</Th><Th className="text-right">Outages</Th><Th className="text-right">Residents</Th><Th /></>}
                  >
                    {rows.map((n) => (
                      <tr key={n.id}>
                        <Td className="font-medium">{n.name}</Td>
                        <Td className="text-body">{n.town}, {n.lga}, {n.state}</Td>
                        <Td className="text-right tabular-nums">{formatNumber(n.reportCount)}</Td>
                        <Td className="text-right tabular-nums">{formatNumber(n.outageCount)}</Td>
                        <Td className="text-right tabular-nums">{formatNumber(n.userCount)}</Td>
                        <Td className="whitespace-nowrap text-right">
                          <Link to={`/reports?neighborhood=${n.id}`} className="font-semibold text-accent hover:underline">
                            Reports<span className="sr-only"> for {n.name}</span>
                          </Link>
                          <span className="mx-2 text-line" aria-hidden>|</span>
                          <Link to={`/outages?neighborhood=${n.id}`} className="font-semibold text-accent hover:underline">
                            Outages<span className="sr-only"> for {n.name}</span>
                          </Link>
                        </Td>
                      </tr>
                    ))}
                  </Table>
                  <Pagination pagination={pagination} onPage={setPage} onLimit={(l) => { setLimit(l); resetPage(); }} noun="neighborhoods" />
                </>
              )}
            </Card>
          </>
        )}
      </ResourceView>
    </>
  );
}
