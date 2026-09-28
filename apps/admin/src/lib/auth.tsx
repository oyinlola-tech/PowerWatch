import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, request, refreshSession, setSessionExpiredHandler, tokens } from "./api";
import { AuthContext, NOT_ADMIN_MESSAGE, type AuthStatus, type AuthValue } from "./authContext";
import type { LoginResult, Profile, SessionUser } from "./types";

/** Revokes a refresh token on the server; failures are ignored because the local copy is dropped anyway. */
const revoke = async (refreshToken: string) => {
  try {
    await request("/auth/logout", { method: "POST", body: { refreshToken }, auth: false });
  } catch {
    // Already invalid or server unreachable: nothing more to do
  }
};

/**
 * Restores a session after a reload from the refresh token in sessionStorage.
 * Module-level so React's development double-mount can't spend the same refresh token twice.
 */
let restorePromise: Promise<SessionUser | null> | null = null;
const restoreSession = () => {
  restorePromise ??= (async () => {
    if (!tokens.getRefresh()) return null;
    if (!(await refreshSession())) return null;
    try {
      const me = await request<Profile>("/auth/me");
      if (me.role !== "ADMIN") {
        const refreshToken = tokens.getRefresh();
        tokens.clear();
        if (refreshToken) await revoke(refreshToken);
        return null;
      }
      return {
        id: me.id,
        firstName: me.firstName,
        lastName: me.lastName,
        email: me.email,
        role: me.role,
        emailVerified: me.emailVerified,
      };
    } catch {
      return null;
    }
  })();
  return restorePromise;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => (tokens.getRefresh() ? "checking" : "signedOut"));
  const [user, setUser] = useState<SessionUser | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const endLocalSession = useCallback((message?: string) => {
    tokens.clear();
    restorePromise = null;
    setUser(null);
    setStatus("signedOut");
    setNotice(message ?? null);
  }, []);

  useEffect(() => {
    let active = true;
    if (tokens.getRefresh()) {
      restoreSession().then((restored) => {
        if (!active) return;
        if (restored) {
          setUser(restored);
          setStatus("signedIn");
        } else {
          tokens.clear();
          setStatus("signedOut");
        }
      });
    }
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => endLocalSession("Your session has ended. Please sign in again."));
    return () => setSessionExpiredHandler(null);
  }, [endLocalSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await request<LoginResult>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    if (result.user.role !== "ADMIN") {
      // Never keep a non-admin's tokens: revoke the session that login just created.
      await revoke(result.refreshToken);
      throw new ApiError(403, NOT_ADMIN_MESSAGE);
    }
    tokens.save({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    restorePromise = null;
    setNotice(null);
    setUser(result.user);
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(async () => {
    const refreshToken = tokens.getRefresh();
    tokens.clear();
    restorePromise = null;
    if (refreshToken) await revoke(refreshToken);
    setUser(null);
    setStatus("signedOut");
    setNotice("You have signed out.");
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ status, user, notice, signIn, signOut, endLocalSession }),
    [status, user, notice, signIn, signOut, endLocalSession],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
