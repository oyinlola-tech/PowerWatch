import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

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

// Shared by the header's desktop icon toggle and the mobile menu's "Dark
// mode" row, so both stay in sync and save the same way. Until the visitor
// picks a theme, the site follows the system setting.
export const useTheme = () => {
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

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    apply(next);
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked; the choice then lasts for this page view only
    }
  };

  return { theme, toggleTheme };
};
