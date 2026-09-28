import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { AndroidDownloadButton } from "./StoreButtons";
import { useTheme } from "../hooks/useTheme";

export type SiteHeaderVariant = "home" | "legal" | "error";

interface SiteHeaderProps {
  variant: SiteHeaderVariant;
  /** "error" only: short apology shown beside the logo on desktop. */
  note?: string;
}

const sections = [
  { id: "about", label: "About" },
  { id: "how-it-works", label: "How it works" },
  { id: "screens", label: "Screens" },
  { id: "faq", label: "FAQ" },
];

const iconButton =
  "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-line text-ink transition hover:border-accent hover:text-accent sm:h-12 sm:w-12";

const ThemeSwitchRow = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-base font-medium text-ink">Dark mode</span>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Dark mode"
        onClick={toggleTheme}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition ${isDark ? "bg-primary" : "bg-line"}`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            isDark ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
};

// Fixed header shared by the landing page, Privacy, Terms and the 404/error
// screen. Desktop keeps each page's existing look (full nav on the landing
// page, logo + toggle on Privacy/Terms, logo + note on the error screen).
// Below the desktop breakpoint every page collapses to the same header --
// logo left, menu button right -- and the theme toggle moves into the menu.
const SiteHeader = ({ variant, note }: SiteHeaderProps) => {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const home = variant === "home";
  const prefix = home ? "" : "/";
  const logoHref = home ? "#top" : "/";
  const downloadHref = `${prefix}#download`;

  const close = () => setOpen(false);

  // Close the menu if the viewport grows into the desktop layout while it's open.
  useEffect(() => {
    if (!open) return undefined;
    const desktop = matchMedia("(min-width: 768px)");
    const onResize = () => desktop.matches && close();
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, [open]);

  // Focus management, Escape-to-close, a lightweight focus trap, and a body
  // scroll lock while the menu is open.
  useEffect(() => {
    if (!open) return undefined;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Return focus to the menu button once the menu closes (but not on first mount).
  useEffect(() => {
    if (wasOpen.current && !open) menuButtonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const menuId = "site-menu";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line-light bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href={logoHref} aria-label="PowerWatch home" onClick={close}>
            <Logo />
          </a>

          {home && (
            <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
              {sections.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="text-sm font-medium text-ink/70 transition hover:text-accent"
                >
                  {label}
                </a>
              ))}
            </nav>
          )}

          {variant === "error" && note && (
            <p className="hidden max-w-xs flex-1 text-right text-sm font-medium leading-5 text-ink md:block">
              {note}
            </p>
          )}

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            {home && (
              <a
                href={downloadHref}
                className="flex h-12 items-center rounded-3xl bg-primary px-6 text-base font-semibold text-white transition hover:opacity-85"
              >
                Download
              </a>
            )}
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className={`${iconButton} md:hidden`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div
            id={menuId}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-x-0 top-full border-t border-line-light bg-card px-4 pb-6 pt-2 shadow-[0_16px_30px_rgba(0,0,0,0.08)] sm:px-6 md:hidden"
          >
            <ul>
              {sections.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`${prefix}#${id}`}
                    onClick={close}
                    className="flex items-center justify-between border-b border-line-light py-4 text-base font-medium text-ink transition hover:text-accent"
                  >
                    {label}
                    <span aria-hidden="true" className="text-muted">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {home ? (
              <div
                onClick={close}
                className="mt-6 [&>a]:w-full [&>a]:justify-center [&>span]:w-full [&>span]:justify-center"
              >
                <AndroidDownloadButton />
              </div>
            ) : (
              <a
                href={downloadHref}
                onClick={close}
                className="mt-6 flex h-14 items-center justify-center rounded-3xl bg-primary text-base font-semibold text-white transition hover:opacity-85"
              >
                Download the App
              </a>
            )}

            <div className="mt-2 border-t border-line-light">
              <ThemeSwitchRow />
            </div>
          </div>
        )}
      </header>

      {open && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={close}
          className="fixed inset-0 z-40 cursor-default bg-black/40 md:hidden"
        />
      )}
    </>
  );
};

export default SiteHeader;
