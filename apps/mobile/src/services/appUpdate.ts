// In-app "a new APK is out" prompt. Android only — the App Store and web builds update
// through their own stores, so this never runs there. See docs/figma-spec.md... (no Figma
// frame; the modal follows the app's existing dialog style, see GoogleTermsModal).
import { useCallback, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Application from "expo-application";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { appApi } from "./api";
import type { LatestRelease } from "./api";

const LAST_CHECK_KEY = "pw.update.lastCheckedAt";
const DISMISSED_KEY = "pw.update.dismissed"; // "<version>|<isoTimestamp>"

// "at most once every few hours"
const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000;
// "until the next app start after 24h" — re-offer a dismissed version once a day
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** a.b.c -> [a, b, c]; missing/non-numeric parts count as 0, "v" prefixes are ignored. */
const parseVersion = (v: string) =>
  v
    .trim()
    .replace(/^v/i, "")
    .split(".")
    .map((part) => parseInt(part, 10) || 0);

/** -1 if a < b, 0 if equal, 1 if a > b */
export const compareVersions = (a: string, b: string) => {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
};

const readDismissed = async (): Promise<{ version: string; at: number } | null> => {
  try {
    const raw = await AsyncStorage.getItem(DISMISSED_KEY);
    if (!raw) return null;
    const [version, at] = raw.split("|");
    const timestamp = Number(at);
    if (!version || !Number.isFinite(timestamp)) return null;
    return { version, at: timestamp };
  } catch {
    return null;
  }
};

const dismissVersion = async (version: string) => {
  await AsyncStorage.setItem(DISMISSED_KEY, `${version}|${Date.now()}`).catch(() => {});
};

const shouldCheckNow = async (force: boolean) => {
  if (force) return true;
  try {
    const raw = await AsyncStorage.getItem(LAST_CHECK_KEY);
    const last = raw ? Number(raw) : 0;
    return !Number.isFinite(last) || Date.now() - last >= CHECK_INTERVAL_MS;
  } catch {
    return true;
  }
};

const recordChecked = async () => {
  await AsyncStorage.setItem(LAST_CHECK_KEY, String(Date.now())).catch(() => {});
};

export interface UpdateCheckResult {
  release: LatestRelease;
  /** True when the installed version is below `release.minimumVersion` — can't be dismissed. */
  mandatory: boolean;
}

/**
 * Checks GET /app/latest and decides whether to show the update prompt. Returns null when
 * there's nothing to show: not Android, too soon since the last check, no release published
 * yet (404), a network/server error (treated the same as "no update"), the installed build
 * is already current, or the person already dismissed this exact version within 24h (unless
 * it's now mandatory).
 */
export const checkForUpdate = async ({ force = false } = {}): Promise<UpdateCheckResult | null> => {
  if (Platform.OS !== "android") return null;
  if (!(await shouldCheckNow(force))) return null;

  let release: LatestRelease;
  try {
    release = await appApi.latestRelease();
  } catch {
    // 404 (no release yet), network errors, 5xx: silently no update
    await recordChecked();
    return null;
  }
  await recordChecked();

  const installed = Application.nativeApplicationVersion;
  if (!installed) return null;

  const mandatory = release.minimumVersion !== null && compareVersions(installed, release.minimumVersion) < 0;
  if (compareVersions(release.version, installed) <= 0) return null;

  if (!mandatory) {
    const dismissed = await readDismissed();
    if (dismissed && dismissed.version === release.version && Date.now() - dismissed.at < DISMISS_COOLDOWN_MS) {
      return null;
    }
  }

  return { release, mandatory };
};

/** Runs the check on mount and whenever the app returns to the foreground. Android only. */
export const useAppUpdateCheck = () => {
  const [state, setState] = useState<{ release: LatestRelease | null; visible: boolean; mandatory: boolean }>({
    release: null,
    visible: false,
    mandatory: false,
  });

  const runCheck = useCallback(async (options?: { force?: boolean }) => {
    const result = await checkForUpdate(options).catch(() => null);
    if (result) setState({ release: result.release, visible: true, mandatory: result.mandatory });
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    // Deferred so the request (and its eventual setState) isn't fired synchronously
    // from the effect body — same as how the AppState listener below triggers it.
    const timer = setTimeout(() => void runCheck(), 0);
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") void runCheck();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [runCheck]);

  const dismiss = useCallback(() => {
    setState((current) => {
      if (current.mandatory || !current.release) return current;
      void dismissVersion(current.release.version);
      return { ...current, visible: false };
    });
  }, []);

  return { ...state, dismiss };
};
