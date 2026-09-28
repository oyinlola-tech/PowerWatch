// HTTP client for the PowerWatch API.
//
// Token handling (see README "Sessions and token storage"):
// - The access token lives only in this module's memory, so no script-readable storage ever holds it.
// - The refresh token lives in sessionStorage, so it survives a page reload but is dropped when
//   the browser tab or window is closed.
// - A 401 triggers one refresh at a time (parallel requests wait for the same attempt); if the
//   refresh is rejected the session ends and the app returns to the sign-in screen.

const PRODUCTION_API_URL = "https://api-powerwatch.telente.site";
const DEVELOPMENT_API_URL = "http://localhost:3000";

export const API_URL = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? DEVELOPMENT_API_URL : PRODUCTION_API_URL)
).replace(/\/+$/, "");

const API_PREFIX = "/api/v1";
const TIMEOUT_MS = 20_000;
const REFRESH_KEY = "powerwatch-admin.refresh";

export class ApiError extends Error {
  /** HTTP status; 0 when the server could not be reached */
  readonly status: number;
  /** Validation messages from the server keyed by field name */
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: { field?: string; message: string }[];
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  /** Send the access token (default true) */
  auth?: boolean;
  signal?: AbortSignal;
  /** Non-2xx statuses whose body should still be returned (the health check answers 503 with data) */
  acceptStatus?: number[];
}

// ---------- token store ----------

let accessToken: string | null = null;

export const tokens = {
  getAccess: () => accessToken,
  getRefresh: (): string | null => {
    try {
      return sessionStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  save(next: { accessToken: string; refreshToken: string }) {
    accessToken = next.accessToken;
    try {
      sessionStorage.setItem(REFRESH_KEY, next.refreshToken);
    } catch {
      // Storage blocked: the session then lasts until this page is reloaded
    }
  },
  clear() {
    accessToken = null;
    try {
      sessionStorage.removeItem(REFRESH_KEY);
    } catch {
      // Nothing stored
    }
  },
};

let onSessionExpired: (() => void) | null = null;

/** Called when the session can no longer be refreshed, so the app can return to sign-in. */
export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};

// ---------- transport ----------

export const buildUrl = (path: string, query?: Query) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return `${API_URL}${API_PREFIX}${path}${qs ? `?${qs}` : ""}`;
};

const send = async (url: string, init: RequestInit, signal?: AbortSignal) => {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  try {
    return await fetch(url, { ...init, signal: combined, credentials: "omit", cache: "no-store" });
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timeout.aborted) throw new ApiError(0, "The server took too long to answer. Please try again.");
    throw new ApiError(0, "Can't reach the PowerWatch API. Check your connection and try again.");
  }
};

const parse = async <T>(response: Response): Promise<Envelope<T>> => {
  try {
    return (await response.json()) as Envelope<T>;
  } catch {
    return {};
  }
};

const toError = (status: number, payload: Envelope<unknown>) => {
  const fieldErrors: Record<string, string> = {};
  for (const error of payload.errors ?? []) {
    if (error.field && !fieldErrors[error.field]) fieldErrors[error.field] = error.message;
  }
  const fallback =
    status >= 500
      ? "Something went wrong on the server. Please try again."
      : status === 429
        ? "Too many requests. Please wait a moment and try again."
        : "The request failed.";
  return new ApiError(status, payload.message || fallback, fieldErrors);
};

// One refresh at a time: parallel 401s all wait for the same attempt.
let refreshInFlight: Promise<boolean> | null = null;

export const refreshSession = () => {
  refreshInFlight ??= (async () => {
    const refreshToken = tokens.getRefresh();
    if (!refreshToken) return false;
    try {
      const response = await send(buildUrl("/auth/refresh-token"), {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) {
        // Only a definite rejection ends the session; a server error may be temporary.
        if (response.status === 401 || response.status === 403) tokens.clear();
        return false;
      }
      const payload = await parse<{ accessToken: string; refreshToken: string }>(response);
      if (!payload.data?.accessToken || !payload.data.refreshToken) return false;
      tokens.save(payload.data);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

export async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { method = "GET", body, query, auth = true, signal, acceptStatus = [] } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  // Fastify rejects an empty body sent as JSON, so only set the type when there is a body.
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    // A reload leaves only the refresh token; get a fresh access token before the first call.
    if (!tokens.getAccess() && tokens.getRefresh()) await refreshSession();
    const token = tokens.getAccess();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await send(
    buildUrl(path, query),
    { method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) },
    signal,
  );

  if (response.status === 401 && auth) {
    if (!isRetry && (await refreshSession())) return request<T>(path, options, true);
    if (!tokens.getRefresh()) {
      tokens.clear();
      onSessionExpired?.();
    }
  }

  const payload = await parse<T>(response);

  if (!response.ok && !acceptStatus.includes(response.status)) {
    throw toError(response.status, payload);
  }

  return payload.data as T;
}

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";
