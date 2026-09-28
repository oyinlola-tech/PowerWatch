import { ErrorState, LoadingState, ResourceView } from "../components/DataState";
import { Badge, Button, Card, Kv, PageHeader } from "../components/ui";
import { request } from "../lib/api";
import { formatDateTime, formatSeconds } from "../lib/format";
import type { HealthPart, HealthReport } from "../lib/types";
import { useApi } from "../lib/useApi";

const StatusBadge = ({ part }: { part: HealthPart }) =>
  part.status === "healthy" ? <Badge tone="on">Healthy</Badge> : <Badge tone="off">Unhealthy</Badge>;

export default function Health() {
  // The full check answers 503 (with the same body) when the database is down.
  const all = useApi("health", (signal) => request<HealthReport>("/health", { signal, acceptStatus: [503] }));
  const db = useApi("health-db", (signal) => request<HealthPart>("/health/database", { signal }));
  const firebase = useApi("health-firebase", (signal) => request<HealthPart>("/health/firebase", { signal }));

  return (
    <>
      <PageHeader
        title="System health"
        description="Live checks of the API server, its database and Firebase (used for push notifications)."
        actions={
          <Button tone="secondary" icon="refresh" busy={all.loading} onClick={() => { all.reload(); db.reload(); firebase.reload(); }}>
            Check again
          </Button>
        }
      />
      <ResourceView {...all}>
        {(h) => (
          <Card title="API server" actions={<StatusBadge part={h.server} />} className="mb-6">
            <Kv items={[["Uptime", formatSeconds(h.server.uptime)], ["Checked at", formatDateTime(h.server.timestamp)]]} />
          </Card>
        )}
      </ResourceView>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Database" actions={db.data && <StatusBadge part={db.data} />}>
          {db.error ? (
            <ErrorState error={db.error} onRetry={db.reload} />
          ) : !db.data ? (
            <LoadingState />
          ) : (
            <Kv
              items={[
                ["Response time", db.data.latencyMs !== undefined ? `${db.data.latencyMs} ms` : "—"],
                ["Checked at", formatDateTime(db.data.timestamp)],
                ...(db.data.error ? ([["Error", db.data.error]] as [string, string][]) : []),
              ]}
            />
          )}
        </Card>
        <Card title="Firebase (push notifications)" actions={firebase.data && <StatusBadge part={firebase.data} />}>
          {firebase.error ? (
            <ErrorState error={firebase.error} onRetry={firebase.reload} />
          ) : !firebase.data ? (
            <LoadingState />
          ) : (
            <Kv
              items={[
                ["Project", firebase.data.projectId ?? "—"],
                ["Checked at", formatDateTime(firebase.data.timestamp)],
                ...(firebase.data.error || firebase.data.message
                  ? ([["Error", firebase.data.error ?? firebase.data.message ?? ""]] as [string, string][])
                  : []),
              ]}
            />
          )}
        </Card>
      </div>
    </>
  );
}
