import { Link } from "react-router";
import { ResourceView, EmptyState } from "../components/DataState";
import { Table, Td, Th } from "../components/Table";
import { Badge, Button, Card, Notice, PageHeader, StatCard } from "../components/ui";
import { request } from "../lib/api";
import { formatDateTime, formatNumber } from "../lib/format";
import type { Dashboard, HealthReport, Outage, Paged } from "../lib/types";
import { useApi } from "../lib/useApi";

export default function Overview() {
  const dashboard = useApi("dashboard", (signal) => request<Dashboard>("/admin/dashboard", { signal }));
  const outages = useApi("overview-outages", (signal) =>
    request<Paged<Outage>>("/reports/outages", { query: { activeOnly: true, limit: 8 }, signal }),
  );
  const health = useApi("overview-health", (signal) =>
    request<HealthReport>("/health", { signal, acceptStatus: [503] }),
  );

  const reloadAll = () => {
    dashboard.reload();
    outages.reload();
    health.reload();
  };

  return (
    <>
      <PageHeader
        title="Overview"
        description="Today's activity across PowerWatch. “Today” and “this week” follow the API server's calendar."
        actions={
          <Button tone="secondary" icon="refresh" onClick={reloadAll} busy={dashboard.loading}>
            Refresh
          </Button>
        }
      />

      <ResourceView {...dashboard}>
        {(d) => (
          <>
            {d.openSystemErrors > 0 && (
              <div className="mb-4">
                <Notice
                  tone="error"
                  title={`${formatNumber(d.openSystemErrors)} open system error${d.openSystemErrors === 1 ? "" : "s"}`}
                  action={
                    <Link to="/problems" className="whitespace-nowrap text-sm font-semibold text-off-ink hover:underline">
                      View system problems
                    </Link>
                  }
                >
                  Something in email, push, jobs or geocoding needs attention.
                </Notice>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Active outages" value={formatNumber(d.activeOutages)} tone={d.activeOutages ? "off" : "on"} hint={`${formatNumber(d.totalOutages)} outages recorded in total`} />
              <StatCard label="Reports today" value={formatNumber(d.reportsToday)} hint={`${formatNumber(d.reportsThisWeek)} this week · ${formatNumber(d.totalReports)} in total`} />
              <StatCard label="Users" value={formatNumber(d.totalUsers)} hint={`${formatNumber(d.newUsersToday)} joined today`} tone="accent" />
              <StatCard label="Neighborhoods covered" value={formatNumber(d.totalNeighborhoods)} />
            </div>
          </>
        )}
      </ResourceView>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Ongoing outages"
          description="Neighborhoods where the power is currently reported OFF, newest first."
          actions={
            <Link to="/outages?active=1" className="text-sm font-semibold text-accent hover:underline">
              View all outages
            </Link>
          }
        >
          <ResourceView
            {...outages}
            isEmpty={(p) => p.data.length === 0}
            empty={<EmptyState title="No ongoing outages">Every tracked neighborhood currently has power, or no one has reported an outage.</EmptyState>}
          >
            {(p) => (
              <Table caption="Ongoing outages" head={<><Th>Neighborhood</Th><Th>Started</Th><Th>Reports</Th><Th /></>}>
                {p.data.map((o) => (
                  <tr key={o.id}>
                    <Td className="font-medium">{o.neighborhood.name}</Td>
                    <Td className="whitespace-nowrap text-body">{formatDateTime(o.startTime)}</Td>
                    <Td className="tabular-nums">{formatNumber(o.reportCount)}</Td>
                    <Td className="text-right">
                      <Link to={`/outages?view=${o.id}`} className="text-sm font-semibold text-accent hover:underline">
                        Details<span className="sr-only"> for {o.neighborhood.name}</span>
                      </Link>
                    </Td>
                  </tr>
                ))}
              </Table>
            )}
          </ResourceView>
        </Card>

        <Card
          title="System health"
          actions={
            <Link to="/health" className="text-sm font-semibold text-accent hover:underline">
              Details
            </Link>
          }
        >
          <ResourceView {...health}>
            {(h) => (
              <ul className="space-y-3">
                {(
                  [
                    ["API server", h.server],
                    ["Database", h.database],
                    ["Firebase (push)", h.firebase],
                  ] as const
                ).map(([name, part]) => (
                  <li key={name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-ink">{name}</span>
                    <Badge tone={part.status === "healthy" ? "on" : "off"}>{part.status === "healthy" ? "Healthy" : "Unhealthy"}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </ResourceView>
        </Card>
      </div>
    </>
  );
}
