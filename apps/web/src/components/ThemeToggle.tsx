import Icon from "./Icon";
import { useTheme } from "../hooks/useTheme";

// Desktop icon button that switches between light and dark.
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
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
