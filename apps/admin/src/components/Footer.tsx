import Icon from "./Icon";
import type { HealthReport } from "../lib/types";

// The public marketing site: linked from the footer so an admin can jump to what users see.
const PUBLIC_SITE = "https://powerwatch.oyinlola.site";
const SUPPORT_EMAIL = "help@telente.site";

const PRODUCT_LINKS = [
  { href: PUBLIC_SITE, label: "Public site" },
  { href: `${PUBLIC_SITE}/privacy/`, label: "Privacy policy" },
  { href: `${PUBLIC_SITE}/terms/`, label: "Terms" },
];

function ApiStatus({ health, loading }: { health: HealthReport | undefined; loading: boolean }) {
  if (!health && loading) {
    return (
      <span className="flex items-center gap-1.5 text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-muted" aria-hidden />
        Checking…
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
      {healthy ? "All systems normal" : "Degraded"}
    </span>
  );
}

interface FooterProps {
  /** Small single-row variant for the sign-in page: brand, links and copyright only. */
  compact?: boolean;
  health?: HealthReport | undefined;
  healthLoading?: boolean;
}

/**
 * A "grid" style footer (see footer.design, e.g. the SaaS-product footers under its Grid
 * category): a brand column plus a few short link columns, then a thin bottom bar with the
 * copyright line. Scaled down for an internal dashboard — three columns, not a marketing
 * mega-footer. `health` is passed in rather than fetched here so this component never starts
 * its own polling loop against the API.
 */
export default function Footer({ compact = false, health, healthLoading = false }: FooterProps) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="border-t border-line px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 text-center lg:max-w-3xl lg:flex-row lg:justify-between lg:gap-6 lg:text-left">
          <div className="flex items-center gap-2">
            <img src="/brand/favicon.png" alt="" width={28} height={28} className="h-6 w-6 flex-shrink-0 rounded-md" />
            <span className="text-sm font-bold text-ink">
              PowerWatch <span className="font-normal text-muted">Admin</span>
            </span>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-sm text-body">
            {PRODUCT_LINKS.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="rounded hover:text-ink hover:underline">
                {link.label}
              </a>
            ))}
          </nav>

          <p className="whitespace-nowrap text-xs text-muted">© {year} PowerWatch</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <img src="/brand/favicon.png" alt="" width={32} height={32} className="h-7 w-7 rounded-md" />
              <span className="text-sm font-bold text-ink">
                PowerWatch <span className="font-normal text-muted">Admin</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Real-time power outage tracking for Nigerian neighborhoods. This console is for PowerWatch administrators only.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Product</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-body hover:text-ink hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Support</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-1.5 text-body hover:text-ink hover:underline">
                  <Icon name="mail" size={14} className="flex-shrink-0" />
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">System</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <ApiStatus health={health} loading={healthLoading} />
              </li>
              <li className="text-body">Version {__APP_VERSION__}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} PowerWatch. All rights reserved.</p>
          <p>PowerWatch Admin · internal use only</p>
        </div>
      </div>
    </footer>
  );
}
