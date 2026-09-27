import { APP_STORE_URL, PLAY_STORE_URL } from "../config/links";

const explore = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#screens", label: "Screens" },
  { href: "#faq", label: "FAQ" },
];

const stores = [
  { href: APP_STORE_URL, label: "App Store" },
  { href: PLAY_STORE_URL, label: "Google Play" },
];

const columnTitle = "text-xs font-medium uppercase tracking-[0.6px] text-muted";
const link = "text-sm font-medium text-ink transition hover:text-primary";

// Link columns on top, the logo set very large underneath, legal line at the bottom
const Footer = () => (
  <footer
    className="overflow-hidden border-t border-line-light bg-white px-6 pt-14"
    style={{
      backgroundImage:
        "radial-gradient(60% 45% at 50% 100%, rgba(6, 99, 234, 0.16) 0%, rgba(252, 186, 0, 0.10) 45%, rgba(255, 255, 255, 0) 100%)",
    }}
  >
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <h3 className={columnTitle}>Explore</h3>
          <ul className="mt-4 space-y-3">
            {explore.map(({ href, label }) => (
              <li key={href}>
                <a href={href} className={link}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={columnTitle}>Get the app</h3>
          <ul className="mt-4 space-y-3">
            {stores.map(({ href, label }) => (
              <li key={label}>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={link}>
                    {label}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-ink">
                    {label} <span className="font-normal text-muted">(coming soon)</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className={columnTitle}>PowerWatch</h3>
          <p className="mt-4 max-w-sm text-sm leading-6 text-body">
            Join your community in tracking real-time power status and reporting outages in your
            neighborhood.
          </p>
        </div>
      </div>

      {/* Wordmark */}
      <img
        src="/brand/logo-horizontal.png"
        alt="PowerWatch"
        width={1526}
        height={334}
        loading="lazy"
        className="mt-16 h-auto w-full"
      />

      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line-light py-6 text-xs text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} PowerWatch. All rights reserved.</p>
        <p>Monitoring your energy in real-time</p>
      </div>
    </div>
  </footer>
);

export default Footer;
