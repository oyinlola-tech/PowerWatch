import { useState } from "react";
import { Button, Card, Field, Notice, PageHeader } from "../components/ui";
import { errorMessage, request } from "../lib/api";
import { formatDateTime, formatNumber, isValidYmd, lagosToday } from "../lib/format";
import { useToast } from "../lib/toastContext";

type Job = "daily" | "weekly" | "monthly";

interface JobConfig {
  job: Job;
  title: string;
  description: string;
  param: "date" | "weekStart" | "monthStart";
  inputLabel: string;
  hint: string;
  inputType: "date" | "month";
}

const JOBS: JobConfig[] = [
  {
    job: "daily",
    title: "Daily report summaries",
    description: "Counts ON/OFF reports per neighborhood for one day. Analytics uses these for ranges shorter than 7 days.",
    param: "date",
    inputLabel: "Day",
    hint: "Leave empty for today.",
    inputType: "date",
  },
  {
    job: "weekly",
    title: "Weekly outage summaries",
    description: "Totals outages and their length per neighborhood for one week. Analytics uses these for outage ranges.",
    param: "weekStart",
    inputLabel: "Any day in the week",
    hint: "Leave empty for this week. The server starts weeks on Sunday.",
    inputType: "date",
  },
  {
    job: "monthly",
    title: "Monthly statistics",
    description: "Builds per-neighborhood statistics for one calendar month.",
    param: "monthStart",
    inputLabel: "Month",
    hint: "Leave empty for this month.",
    inputType: "month",
  },
];

interface RunResult {
  at: string;
  processed: number;
  target: string;
}

function JobCard({ config }: { config: JobConfig }) {
  const { notify } = useToast();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<RunResult | null>(null);

  const run = async () => {
    setError(null);
    const param = config.inputType === "month" && value ? `${value}-01` : value;
    if (param && !isValidYmd(param)) {
      setError("Enter a valid date.");
      return;
    }
    setBusy(true);
    try {
      const data = await request<{ neighborhoodsProcessed: number }>(`/admin/materialize/${encodeURIComponent(config.job)}`, {
        method: "POST",
        query: { [config.param]: param || undefined },
      });
      setLast({ at: new Date().toISOString(), processed: data.neighborhoodsProcessed, target: value || "current period" });
      notify(`${config.title} rebuilt for ${formatNumber(data.neighborhoodsProcessed)} neighborhoods.`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title={config.title} description={config.description}>
      <div className="flex flex-wrap items-end gap-3">
        <Field label={config.inputLabel} hint={config.hint} className="w-full sm:w-56">
          {(p) => (
            <input
              id={p.id}
              type={config.inputType}
              value={value}
              max={config.inputType === "month" ? lagosToday().slice(0, 7) : lagosToday()}
              onChange={(e) => setValue(e.target.value)}
              aria-describedby={p.describedBy}
              className={p.className}
            />
          )}
        </Field>
        <Button icon="refresh" busy={busy} onClick={run} className="mb-5">
          {busy ? "Running…" : "Run now"}
        </Button>
      </div>
      <div className="space-y-3" aria-live="polite">
        {error && <Notice tone="error">{error}</Notice>}
        {last && (
          <Notice tone="success" title={`Done: ${formatNumber(last.processed)} neighborhoods processed`}>
            For {last.target}, finished {formatDateTime(last.at)}.
          </Notice>
        )}
      </div>
    </Card>
  );
}

export default function Summaries() {
  return (
    <>
      <PageHeader
        title="Summaries"
        description="Rebuild the stored summaries that make analytics fast. Run one after deleting reports or to backfill a past period. Each job is limited to 5 runs a minute."
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {JOBS.map((config) => (
          <JobCard key={config.job} config={config} />
        ))}
      </div>
    </>
  );
}
