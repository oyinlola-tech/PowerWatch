import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Platform } from "react-native";
import { ApiError, authApi, setSessionExpiredHandler } from "../services/api";
import type { User } from "../services/api";
import { tokenStore, userCache } from "../services/api/storage";
import { unregisterPushNotifications } from "../services/notifications";

type Status = "loading" | "signedOut" | "signedIn";

interface AuthContextValue {
  status: Status;
  user: User | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ user: User; verificationEmailSent: boolean }>;
  signOut: () => Promise<void>;
  /** Re-fetch the profile (after changing location, name, preferences...) */
  refreshUser: () => Promise<User | null>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const deviceType = Platform.OS === "ios" ? "IOS" : Platform.OS === "android" ? "ANDROID" : "WEB";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUserState] = useState<User | null>(null);

  const setUser = useCallback((next: User) => {
    setUserState(next);
    void userCache.set(next);
  }, []);

  const endSession = useCallback(async () => {
    await tokenStore.clear();
    setUserState(null);
    setStatus("signedOut");
  }, []);

  // Restore the previous session on launch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const refreshToken = await tokenStore.getRefresh();
      if (!refreshToken) {
        if (!cancelled) setStatus("signedOut");
        return;
      }
      try {
        const me = await authApi.me();
        if (cancelled) return;
        setUser(me);
        setStatus("signedIn");
      } catch (error) {
        if (cancelled) return;
        // Offline or server trouble: open with the cached profile rather than signing out
        const cached = await userCache.get<User>();
        if (error instanceof ApiError && (error.isNetworkError || error.status >= 500) && cached) {
          setUserState(cached);
          setStatus("signedIn");
        } else {
          await endSession();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [endSession, setUser]);

  useEffect(() => {
    setSessionExpiredHandler(() => void endSession());
    return () => setSessionExpiredHandler(null);
  }, [endSession]);

  const startSession = useCallback(
    async (tokens: { accessToken: string; refreshToken: string }) => {
      await tokenStore.save(tokens);
      const me = await authApi.me();
      setUser(me);
      setStatus("signedIn");
      return me;
    },
    [setUser],
  );

  const signIn = useCallback(
    async (email: string, password: string) => startSession(await authApi.login(email, password)),
    [startSession],
  );

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      const result = await authApi.register({ fullName, email, password, deviceType });
      const me = await startSession(result);
      return { user: me, verificationEmailSent: result.verificationEmailSent !== false };
    },
    [startSession],
  );

  const signOut = useCallback(async () => {
    // Best effort: stop this phone's alerts and revoke the session server-side
    await unregisterPushNotifications().catch(() => {});
    const refreshToken = await tokenStore.getRefresh();
    if (refreshToken) await authApi.logout(refreshToken).catch(() => {});
    await endSession();
  }, [endSession]);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      return me;
    } catch {
      return null;
    }
  }, [setUser]);

  const value = useMemo(
    () => ({ status, user, signIn, signUp, signOut, refreshUser, setUser }),
    [status, user, signIn, signUp, signOut, refreshUser, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

/** The signed-in user; only use on screens behind the signed-in guard. */
export const useUser = () => {
  const { user } = useAuth();
  if (!user) throw new Error("useUser needs a signed-in user");
  return user;
};
