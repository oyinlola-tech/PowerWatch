import { useEffect, useState } from "react";
import { API_URL } from "../config/api";

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
      state = { status: "ready", release: body.data as LatestRelease };
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
