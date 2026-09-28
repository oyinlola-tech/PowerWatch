import type { HealthReport } from "../lib/types";

// The public marketing site: linked from the footer so an admin can jump to what users see.
const PUBLIC_SITE = "https://powerwatch.oyinlola.site";

const LINKS = [
  { href: PUBLIC_SITE, label: "Public site" },
  { href: `${PUBLIC_SITE}/privacy/`, label: "Privacy policy" },
  { href: `${PUBLIC_SITE}/terms/`, label: "Terms" },
];

function ApiStatus({ health, loading }: { health: HealthReport | undefined; loading: boolean }) {
  if (!health && loading) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-muted" aria-hidden />
        Checking API…
      </span>
    );
  }
  if (!health) {
    return (
      <span className="flex items-center gap-1.5 text-off-ink">
        <span className="h-1.5 w-1.5 rounded-full bg-power-off" aria-hidden />
        API unreachable
      </span>
    );
  }
  const healthy = health.server.status === "healthy" && health.database.status === "healthy";
  return (
    <span className={`flex items-center gap-1.5 ${healthy ? "text-on-ink" : "text-off-ink"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${healthy ? "bg-power-on" : "bg-power-off"}`} aria-hidden />
      API {healthy ? "operational" : "degraded"}
    </span>
  );
}

interface FooterProps {
  /** Small variant for the sign-in page: brand, links and copyright only. */
  compact?: boolean;
  health?: HealthReport | undefined;
  healthLoading?: boolean;
}

/**
 * A compact "small type" footer (see footer.design) suited to an internal dashboard: one slim
 * row, no columns of marketing links. `health` is passed in rather than fetched here so this
 * component never starts its own polling loop against the API.
 */
export default function Footer({ compact = false, health, healthLoading = false }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line px-4 py-4 text-xs text-muted sm:px-6 lg:px-8">
      <div
        className={`mx-auto flex w-full flex-col items-center gap-3 text-center ${
          compact ? "max-w-md" : "max-w-[90rem] sm:flex-row sm:justify-between sm:text-left"
        }`}
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-semibold text-body">PowerWatch</span>
          <span aria-hidden>·</span>
          <span>© {year}</span>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded hover:text-ink hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {!compact && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 whitespace-nowrap">
            <ApiStatus health={health} loading={healthLoading} />
            <span>v{__APP_VERSION__}</span>
          </div>
        )}
      </div>
    </footer>
  );
}
