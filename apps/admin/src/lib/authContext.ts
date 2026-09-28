import { createContext, use } from "react";
import type { SessionUser } from "./types";

export type AuthStatus = "checking" | "signedOut" | "signedIn";

export interface AuthValue {
  status: AuthStatus;
  user: SessionUser | null;
  /** Why the last session ended, shown on the sign-in screen */
  notice: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Clears the local session without calling the API (after "sign out everywhere"). */
  endLocalSession: (notice?: string) => void;
}

export const AuthContext = createContext<AuthValue | null>(null);

export const NOT_ADMIN_MESSAGE =
  "This account is not an administrator. Only PowerWatch admins can use this dashboard.";

export function useAuth() {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
