import { useEffect, useState } from "react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#about", label: "About" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#screens", label: "Screens" },
  { href: "#faq", label: "FAQ" },
];

const iconButton =
  "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-line text-ink transition hover:border-accent hover:text-accent sm:h-12 sm:w-12";

// Desktop: links in the middle and a Download button. Phones: theme toggle and a
// menu button that opens the links and Download in a panel under the bar.
const Navbar = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    // Close if the window grows to the desktop layout while the menu is open
    const desktop = matchMedia("(min-width: 768px)");
    const onResize = () => desktop.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line-light bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#top" aria-label="PowerWatch home" onClick={close}>
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-ink/70 transition hover:text-accent"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <a
            href="#download"
            className="hidden h-12 items-center rounded-3xl bg-primary px-6 text-base font-semibold text-white transition hover:opacity-85 md:flex"
          >
            Download
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
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
      </div>

      <nav
        id="mobile-menu"
        aria-label="Main"
        hidden={!open}
        className="border-t border-line-light bg-card px-4 pb-6 pt-2 shadow-[0_16px_30px_rgba(0,0,0,0.08)] sm:px-6 md:hidden"
      >
        <ul>
          {links.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
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
        <a
          href="#download"
          onClick={close}
          className="mt-6 flex h-14 items-center justify-center rounded-3xl bg-primary text-base font-semibold text-white transition hover:opacity-85"
        >
          Download the App
        </a>
      </nav>
    </header>
  );
};

export default Navbar;
