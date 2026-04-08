import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser, LoginPayload, RegisterPayload } from "../types/auth";
import { getCurrentUser, login, logout, register } from "../services/api/auth.api";
import { clearTokens, getAccessToken } from "../services/storage/token";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const nextUser = await getCurrentUser();
      setUser(nextUser);
    } catch {
      setUser(null);
      await clearTokens();
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const signIn = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const response = await login(payload);
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      await register(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await logout();
    } catch {
      await clearTokens();
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [loading, refreshUser, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
