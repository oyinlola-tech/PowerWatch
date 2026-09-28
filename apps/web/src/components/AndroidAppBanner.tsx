import { useState } from "react";
import { isAndroidBrowser } from "../utils/device";
import { track } from "../services/mixpanel";

const DISMISS_KEY = "pw_hide_app_banner_until";
const DISMISS_DAYS = 7;

// Opens the installed app if present, otherwise falls back to the download section.
const OPEN_APP_INTENT_URL =
  "intent://powerwatch.oyinlola.site/open#Intent;scheme=https;package=com.powerwatch.app;S.browser_fallback_url=https%3A%2F%2Fpowerwatch.oyinlola.site%2F%23download;end";

const readDismissed = (): boolean => {
  try {
    const until = localStorage.getItem(DISMISS_KEY);
    return until ? Date.now() < Number(until) : false;
  } catch {
    return false;
  }
};

const rememberDismissal = () => {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000));
  } catch {
    // Storage can be blocked (private browsing, etc.); the banner simply
    // returns on the next visit instead of staying dismissed.
  }
};

// Slim "open in app" banner for Android visitors only, in the vein of an iOS
// Smart App Banner. Sits above the (sticky) navbar in normal flow, so it never
// covers page content and scrolls away like any other block. Dismissal is
// remembered for a week.
const AndroidAppBanner = () => {
  // No SSR here, so it's safe to read navigator/localStorage on first render
  // instead of deferring to an effect.
  const [visible, setVisible] = useState(() => isAndroidBrowser() && !readDismissed());

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    rememberDismissal();
  };

  return (
    <div
      role="region"
      aria-label="Get the PowerWatch app"
      aria-live="polite"
      className="flex items-center gap-2 border-b border-line-light bg-card px-3 py-2 sm:gap-3 sm:px-6"
    >
      <img
        src="/brand/favicon.png"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 flex-shrink-0 rounded-lg"
      />
      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">PowerWatch</p>
      <a
        href={OPEN_APP_INTENT_URL}
        onClick={() => track("app_banner_open_clicked")}
        className="flex h-9 flex-shrink-0 items-center rounded-full border border-line px-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent sm:px-4"
      >
        Open
      </a>
      <a
        href="/#download"
        onClick={() => track("app_banner_get_app_clicked")}
        className="flex h-9 flex-shrink-0 items-center rounded-full bg-primary px-3 text-sm font-semibold text-white transition hover:opacity-85 sm:px-4"
      >
        Get app
      </a>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-muted transition hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default AndroidAppBanner;
