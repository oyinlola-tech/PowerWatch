import { API_PREFIX, API_URL } from "./config";
import { tokenStore } from "./storage";

const TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  /** HTTP status; 0 when the server could not be reached */
  readonly status: number;
  /** Field-level validation messages keyed by field name */
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  /** Send the access token (default true) */
  auth?: boolean;
}

let onSessionExpired: (() => void) | null = null;

/** Called when the session can't be refreshed, so the app can return to login. */
export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};

const buildUrl = (path: string, query?: RequestOptions["query"]) => {
  const params = Object.entries(query ?? {})
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
  return `${API_URL}${API_PREFIX}${path}${params ? `?${params}` : ""}`;
};

const send = async (url: string, init: RequestInit) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    throw new ApiError(0, "Can't reach PowerWatch. Check your internet connection and try again.");
  } finally {
    clearTimeout(timer);
  }
};

const parse = async (response: Response) => {
  try {
    return (await response.json()) as {
      success?: boolean;
      message?: string;
      data?: unknown;
      errors?: { field?: string; message: string }[];
    };
  } catch {
    return {};
  }
};

// One refresh at a time: parallel 401s all wait for the same attempt.
let refreshInFlight: Promise<boolean> | null = null;

const refreshSession = () => {
  refreshInFlight ??= (async () => {
    const refreshToken = await tokenStore.getRefresh();
    if (!refreshToken) return false;
    try {
      const response = await send(buildUrl("/auth/refresh-token"), {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) {
        // Only a definite rejection ends the session; server errors may be temporary.
        if (response.status === 401 || response.status === 403) await tokenStore.clear();
        return false;
      }
      const body = await parse(response);
      const tokens = body.data as { accessToken: string; refreshToken: string } | undefined;
      if (!tokens?.accessToken) return false;
      await tokenStore.save(tokens);
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
  const { method = "GET", body, query, auth = true } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = await tokenStore.getAccess();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await send(buildUrl(path, query), {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 401 && auth) {
    if (!isRetry && (await refreshSession())) return request<T>(path, options, true);
    if (!(await tokenStore.getRefresh())) onSessionExpired?.();
  }

  const payload = await parse(response);

  if (!response.ok) {
    const fieldErrors: Record<string, string> = {};
    for (const error of payload.errors ?? []) {
      if (error.field && !fieldErrors[error.field]) fieldErrors[error.field] = error.message;
    }
    const fallback =
      response.status >= 500 ? "Something went wrong on our side. Please try again." : "Request failed.";
    throw new ApiError(response.status, payload.message || fallback, fieldErrors);
  }

  return payload.data as T;
}
