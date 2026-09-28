import { useState } from "react";
import { BarList, SplitBar } from "../components/BarList";
import { DateRangePicker } from "../components/DateRange";
import { EmptyState, ResourceView } from "../components/DataState";
import { Table, Td, Th } from "../components/Table";
import { Badge, Card, PageHeader, StatCard } from "../components/ui";
import { request } from "../lib/api";
import { formatMinutes, formatNumber } from "../lib/format";
import { presetRange, rangeError, rangeQuery } from "../lib/range";
import type { AdminAnalytics, OutageStatistics, PowerStatistics, UserStatistics } from "../lib/types";
import { useApi } from "../lib/useApi";

const SourceBadge = ({ fromCache }: { fromCache: boolean }) =>
  fromCache ? <Badge tone="info">From stored summaries</Badge> : <Badge>Live count</Badge>;

export default function Analytics() {
  const [range, setRange] = useState(() => presetRange(30));
  const invalid = Boolean(rangeError(range));
  const query = rangeQuery(range);
  const key = invalid ? null : `${query.startDate ?? ""}|${query.endDate ?? ""}`;

  const summary = useApi(key && `admin-analytics:${key}`, (signal) => request<AdminAnalytics>("/admin/analytics", { query, signal }));
  const power = useApi(key && `power:${key}`, (signal) => request<PowerStatistics>("/analytics/power", { query, signal }));
  const outages = useApi(key && `outages:${key}`, (signal) => request<OutageStatistics>("/analytics/outages", { query, signal }));
  const users = useApi("user-stats", (signal) => request<UserStatistics>("/analytics/users", { signal }));

  return (
    <>
      <PageHeader title="Analytics" description="Reports and outages for a date range (Lagos calendar days). User figures are always all-time." />

      <Card className="mb-6">
        <DateRangePicker value={range} onChange={setRange} />
      </Card>

      {!invalid && (
        <>
          <ResourceView {...summary}>
            {(s) => (
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Reports in range" value={formatNumber(s.totalReports)} />
                <StatCard label="ON reports" value={formatNumber(s.onReports)} tone="on" />
                <StatCard label="OFF reports" value={formatNumber(s.offReports)} tone="off" />
                <StatCard label="ON to OFF ratio" value={s.onOffRatio} hint="ON reports per OFF report" />
              </div>
            )}
          </ResourceView>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card title="Power reports" actions={power.data && <SourceBadge fromCache={power.data.fromCache} />}>
              <ResourceView {...power}>
                {(p) => (
                  <div className="space-y-6">
                    <SplitBar on={p.onReports} off={p.offReports} />
                    <div>
                      <h3 className="mb-1 text-sm font-semibold text-ink">Most reported neighborhoods</h3>
                      <p className="mb-3 text-xs text-muted">
                        Within the selected range.
                      </p>
                      {p.topNeighborhoods.length ? (
                        <BarList items={p.topNeighborhoods.map((n) => ({ key: n.neighborhoodId, label: n.neighborhoodName, value: n.reportCount }))} unit="reports" />
                      ) : (
                        <EmptyState title="No reports yet" />
                      )}
                    </div>
                  </div>
                )}
              </ResourceView>
            </Card>

            <Card title="Outages" actions={outages.data && <SourceBadge fromCache={outages.data.fromCache} />}>
              <ResourceView {...outages}>
                {(o) => (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Mini label="Total" value={formatNumber(o.totalOutages)} />
                      <Mini label="Ongoing" value={formatNumber(o.activeOutages)} note="right now" />
                      <Mini label="Ended" value={formatNumber(o.completedOutages)} />
                      <Mini label="Average length" value={formatMinutes(o.averageDurationMinutes)} />
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-semibold text-ink">Neighborhoods with the most outages</h3>
                      <p className="mb-3 text-xs text-muted">
                        Within the selected range.
                      </p>
                      {o.topNeighborhoods.length ? (
                        <BarList
                          tone="off"
                          items={o.topNeighborhoods.map((n) => ({
                            key: n.neighborhoodId,
                            label: n.neighborhoodName,
                            value: n.outageCount,
                            detail: `avg ${formatMinutes(n.averageDurationMinutes)}`,
                          }))}
                          unit="outages"
                        />
                      ) : (
                        <EmptyState title="No outages yet" />
                      )}
                    </div>
                  </div>
                )}
              </ResourceView>
            </Card>
          </div>
        </>
      )}

      <h2 className="mb-3 mt-8 text-lg font-semibold text-ink">Users (all time)</h2>
      <ResourceView {...users}>
        {(u) => (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Accounts" value={formatNumber(u.totalUsers)} hint="Includes deleted and admin accounts" />
              <StatCard label="Email verified" value={formatNumber(u.verifiedUsers)} tone="on" hint={`${u.verificationRate}% of accounts`} />
              <StatCard label="Not verified" value={formatNumber(u.unverifiedUsers)} />
              <StatCard label="Admins" value={formatNumber(u.adminUsers)} tone="accent" />
            </div>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Card title="Users by home state" description="Top 10 states. “Unknown” means no home location set.">
                {u.usersByState.length ? (
                  <BarList items={u.usersByState.map((s) => ({ key: s.stateId ?? "none", label: s.stateName, value: s.userCount }))} unit="users" />
                ) : (
                  <EmptyState title="No users yet" />
                )}
              </Card>
              <Card title="Top reporters" description="Accounts with the most reports, all time.">
                {u.topReporters.length ? (
                  <Table caption="Top reporters" head={<><Th>Name</Th><Th>Email</Th><Th className="text-right">Reports</Th></>}>
                    {u.topReporters.map((r) => (
                      <tr key={r.userId}>
                        <Td className="font-medium">{r.name}</Td>
                        <Td className="break-all text-body">{r.email}</Td>
                        <Td className="text-right tabular-nums">{formatNumber(r.reportCount)}</Td>
                      </tr>
                    ))}
                  </Table>
                ) : (
                  <EmptyState title="No reports yet" />
                )}
              </Card>
            </div>
          </div>
        )}
      </ResourceView>
    </>
  );
}

const Mini = ({ label, value, note }: { label: string; value: string; note?: string }) => (
  <div className="rounded-xl bg-soft p-3">
    <p className="text-xs font-medium text-muted">{label}</p>
    <p className="mt-1 text-lg font-bold tabular-nums text-ink">{value}</p>
    {note && <p className="text-xs text-muted">{note}</p>}
  </div>
);
