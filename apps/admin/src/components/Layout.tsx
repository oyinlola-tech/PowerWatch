import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { request } from "../lib/api";
import { useAuth } from "../lib/authContext";
import { TIME_ZONE_LABEL, fullName } from "../lib/format";
import type { HealthReport, SessionUser } from "../lib/types";
import { useApi } from "../lib/useApi";
import Footer from "./Footer";
import Icon, { type IconName } from "./Icon";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  /** Short line shown under the page title in the top bar. */
  context: string;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Monitor",
    items: [
      { to: "/", label: "Overview", icon: "overview", context: "Today's activity across PowerWatch" },
      { to: "/analytics", label: "Analytics", icon: "chart", context: "Reports, outages and users over time" },
      { to: "/neighborhood-stats", label: "Neighborhood stats", icon: "stats", context: "Activity by neighborhood" },
      { to: "/status", label: "Live status", icon: "status", context: "Power status by state and LGA" },
    ],
  },
  {
    label: "Moderate",
    items: [
      { to: "/users", label: "Users", icon: "users", context: "Suspend, unsuspend or delete accounts" },
      { to: "/reports", label: "Reports", icon: "report", context: "Power reports submitted by users" },
      { to: "/outages", label: "Outages", icon: "outage", context: "Tracked outages, active and resolved" },
    ],
  },
  {
    label: "Manage",
    items: [
      { to: "/locations", label: "Locations", icon: "locations", context: "The state-to-neighborhood hierarchy" },
      { to: "/broadcast", label: "Broadcast", icon: "broadcast", context: "Send a push notification to users" },
      { to: "/summaries", label: "Summaries", icon: "jobs", context: "Run daily, weekly and monthly rollups" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/health", label: "System health", icon: "health", context: "API, database and Firebase status" },
      { to: "/account", label: "Account", icon: "account", context: "Your profile and signed-in sessions" },
    ],
  },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-5">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  {...(onNavigate ? { onClick: onNavigate } : {})}
                  className={({ isActive }) =>
                    `flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                      isActive ? "bg-info-soft text-accent" : "text-body hover:bg-soft hover:text-ink"
                    }`
                  }
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <p className="border-t border-line px-6 py-4 text-xs text-muted">
      All times in {TIME_ZONE_LABEL}
    </p>
  );
}

export default function Layout() {
  const { user, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const main = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    const dialog = drawer.current;
    if (!dialog) return;
    if (drawerOpen && !dialog.open) dialog.showModal();
    if (!drawerOpen && dialog.open) dialog.close();
  }, [drawerOpen]);

  // Move focus to the new page's content after navigation, for keyboard and screen reader users.
  useEffect(() => {
    main.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {/* Fixed sidebar on large screens */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-line px-6">
          <Logo height={26} />
          <span className="rounded-md bg-info-soft px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">Admin</span>
        </div>
        <NavList />
        <SidebarFooter />
      </aside>

      {/* Drawer on smaller screens */}
      <dialog
        ref={drawer}
        aria-label="Navigation"
        onClose={() => setDrawerOpen(false)}
        className="m-0 h-dvh max-h-dvh w-[min(20rem,85vw)] max-w-none border-r border-line bg-card p-0 text-ink lg:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between gap-2 border-b border-line px-4">
            <div className="flex items-center gap-2">
              <Logo height={24} />
              <span className="rounded-md bg-info-soft px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">Admin</span>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink"
            >
              <Icon name="close" label="Close navigation" />
            </button>
          </div>
          <NavList onNavigate={() => setDrawerOpen(false)} />
          <SidebarFooter />
        </div>
      </dialog>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-card/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-soft lg:hidden"
          >
            <Icon name="menu" label="Open navigation" />
          </button>
          <div className="lg:hidden">
            <span className="text-base font-bold text-ink">PowerWatch</span>
            <span className="ml-1.5 text-xs font-bold uppercase text-accent">Admin</span>
          </div>
          <p className="hidden items-center gap-1.5 text-xs text-muted min-[420px]:flex">
            <Icon name="clock" size={14} />
            <span className="xl:hidden">Times in WAT</span>
            <span className="hidden xl:inline">Times in {TIME_ZONE_LABEL}</span>
          </p>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {user && (
              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate text-sm font-semibold text-ink">{fullName(user)}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            )}
            <ThemeToggle />
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex h-10 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line px-3 text-sm font-medium text-ink transition hover:border-off-ink hover:text-off-ink disabled:opacity-60"
            >
              <Icon name="logout" size={16} />
              <span className="hidden sm:inline">{signingOut ? "Signing out…" : "Sign out"}</span>
              <span className="sr-only sm:hidden">Sign out</span>
            </button>
          </div>
        </header>

        <main id="main" ref={main} tabIndex={-1} className="relative mx-auto w-full max-w-[90rem] px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
