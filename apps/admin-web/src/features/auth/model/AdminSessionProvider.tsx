import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ApiRequestError, isMissingSessionError } from "../../../shared/api/client";
import {
  logoutAdmin,
  restoreAdminSession,
  type AdminProfile,
} from "../api/admin-auth-api";

export type AdminSessionState = "restoring" | "signed_out" | "signed_in" | "error";

interface AdminSessionContextValue {
  profile: AdminProfile | null;
  state: AdminSessionState;
  error: string;
  restore: () => Promise<void>;
  acceptAuthenticated: (profile: AdminProfile) => void;
  expire: () => void;
  logout: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

function sessionErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return "حدث خطأ غير متوقع. أعد المحاولة، وإذا استمر الخطأ راجع سجل التشغيل.";
}

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [state, setState] = useState<AdminSessionState>("restoring");
  const [error, setError] = useState("");

  const expire = useCallback(() => {
    setProfile(null);
    setError("");
    setState("signed_out");
  }, []);

  const acceptAuthenticated = useCallback((nextProfile: AdminProfile) => {
    setProfile(nextProfile);
    setError("");
    setState("signed_in");
  }, []);

  const restore = useCallback(async () => {
    setState("restoring");
    setError("");

    try {
      acceptAuthenticated(await restoreAdminSession());
    } catch (restoreError) {
      setProfile(null);
      if (isMissingSessionError(restoreError)) {
        setState("signed_out");
        return;
      }

      setError(sessionErrorMessage(restoreError));
      setState("error");
    }
  }, [acceptAuthenticated]);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
      expire();
    } catch (logoutError) {
      setError(sessionErrorMessage(logoutError));
      setState("error");
    }
  }, [expire]);

  useEffect(() => {
    void restore();
  }, [restore]);

  const value = useMemo<AdminSessionContextValue>(
    () => ({
      profile,
      state,
      error,
      restore,
      acceptAuthenticated,
      expire,
      logout,
    }),
    [acceptAuthenticated, error, expire, logout, profile, restore, state],
  );

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession(): AdminSessionContextValue {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error("useAdminSession must be used inside AdminSessionProvider");
  }
  return context;
}
