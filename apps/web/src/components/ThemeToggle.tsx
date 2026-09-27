import { useEffect, useState } from "react";
import Icon from "./Icon";

type Theme = "light" | "dark";

const systemQuery = "(prefers-color-scheme: dark)";

const readSaved = (): Theme | null => {
  try {
    const saved = localStorage.getItem("theme");
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
};

const apply = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
};

// Switches between light and dark. Until the visitor picks one, the site follows the system setting.
const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    const media = matchMedia(systemQuery);
    const onChange = () => {
      if (readSaved()) return;
      const next: Theme = media.matches ? "dark" : "light";
      apply(next);
      setTheme(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    apply(next);
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked; the choice then lasts for this page view only
    }
  };

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 flex-shrink-0 items-center sm:h-12 sm:w-12 justify-center rounded-full border border-line text-ink transition hover:border-accent hover:text-accent"
    >
      {theme === "dark" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <path
            d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <Icon name="moon" color="currentColor" width={18} />
      )}
    </button>
  );
};

export default ThemeToggle;
