import { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { GITHUB_RELEASES_URL } from "../config/links";

// Only GitHub Releases URLs for this repo are trusted for download/release
// links coming from the API. Anything else (a compromised or misconfigured
// API response) falls back to the known-safe GitHub releases page.
const TRUSTED_RELEASE_URL_PREFIX = "https://github.com/oyinlola-tech/PowerWatch/releases/";

const sanitizeReleaseUrl = (url: unknown): string | undefined =>
  typeof url === "string" && url.startsWith(TRUSTED_RELEASE_URL_PREFIX) ? url : undefined;

export interface LatestRelease {
  platform: "android";
  version: string;
  downloadUrl: string;
  fileName: string;
  sizeBytes: number;
  publishedAt: string;
  notes?: string | null;
  releasePage?: string | null;
  minimumVersion?: string | null;
}

export type ReleaseState =
  | { status: "loading" }
  | { status: "ready"; release: LatestRelease }
  // No release published yet (404), or the response didn't look like a release
  | { status: "none" }
  | { status: "error" };

// Module-level cache so every component sharing this hook triggers a single
// fetch of GET /api/v1/app/latest, however many of them mount.
let state: ReleaseState = { status: "loading" };
let started = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const load = async () => {
  try {
    const response = await fetch(`${API_URL}/api/v1/app/latest`);
    if (response.status === 404) {
      state = { status: "none" };
      notify();
      return;
    }
    if (!response.ok) {
      state = { status: "error" };
      notify();
      return;
    }
    const body = await response.json();
    if (body?.success && body?.data?.platform === "android" && body.data.downloadUrl) {
      const data = body.data as LatestRelease;
      // Never trust the API's downloadUrl/releasePage blindly: only allow
      // links into this repo's GitHub releases, otherwise fall back to the
      // known-safe releases page.
      const downloadUrl = sanitizeReleaseUrl(data.downloadUrl) ?? GITHUB_RELEASES_URL;
      const releasePage = data.releasePage
        ? (sanitizeReleaseUrl(data.releasePage) ?? GITHUB_RELEASES_URL)
        : data.releasePage;
      state = { status: "ready", release: { ...data, downloadUrl, releasePage } };
    } else {
      state = { status: "none" };
    }
  } catch {
    state = { status: "error" };
  }
  notify();
};

// Fetches the latest published Android release once, cached for the page's
// lifetime (the API itself caches for 5 minutes), and shares the result across
// every component that renders a download control.
export const useLatestRelease = (): ReleaseState => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!started) {
      started = true;
      load();
    }
    const listener = () => setTick((tick) => tick + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
};
