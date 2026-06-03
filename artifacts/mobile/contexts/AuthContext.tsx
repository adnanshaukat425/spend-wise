import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { authApi } from "@/lib/api";
import type { UserProfileDto } from "@/lib/api/types";
import { initApi, isApiConfigured, registerAuthTokenGetter } from "@/lib/api";
import {
  clearAuth,
  getStoredAuth,
  isTokenExpired,
  saveAuth,
  type StoredAuth,
} from "@/lib/auth-storage";
import { StorageKeys, getString, setString } from "@/lib/storage";

interface AuthContextValue {
  isLoading: boolean;
  hasOnboarded: boolean;
  isAuthenticated: boolean;
  user: UserProfileDto | null;
  accessToken: string | null;
  completeOnboarding: () => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithApple: (identityToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const authRef = useRef<StoredAuth | null>(null);

  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  useEffect(() => {
    registerAuthTokenGetter(() => authRef.current?.accessToken ?? null);
    initApi();
  }, []);

  const applyAuth = useCallback(async (next: StoredAuth) => {
    await saveAuth(next);
    setAuth(next);
    authRef.current = next;
  }, []);

  const clearSession = useCallback(async () => {
    const refresh = authRef.current?.refreshToken;
    if (refresh && isApiConfigured()) {
      try {
        await authApi.logout(refresh);
      } catch {
        // ignore logout errors
      }
    }
    await clearAuth();
    setAuth(null);
    authRef.current = null;
  }, []);

  const establishSession = useCallback(
    async (response: {
      accessToken: string;
      refreshToken: string;
      expiresAt: string;
      user: UserProfileDto;
    }) => {
      await applyAuth({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: response.expiresAt,
        user: response.user,
      });
    },
    [applyAuth],
  );

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    const stored = authRef.current ?? (await getStoredAuth());
    if (!stored?.refreshToken || !isApiConfigured()) {
      return false;
    }

    try {
      const response = await authApi.refresh(stored.refreshToken);
      await establishSession(response);
      return true;
    } catch {
      await clearSession();
      return false;
    }
  }, [clearSession, establishSession]);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const onboarded = await getString(StorageKeys.hasOnboarded);
      if (!mounted) return;
      setHasOnboarded(onboarded === "true");

      if (!isApiConfigured()) {
        setIsLoading(false);
        return;
      }

      const stored = await getStoredAuth();
      if (!stored) {
        setIsLoading(false);
        return;
      }

      authRef.current = stored;
      setAuth(stored);

      if (isTokenExpired(stored.expiresAt)) {
        const ok = await refreshTokens();
        if (!mounted) return;
        if (!ok) {
          setAuth(null);
          authRef.current = null;
        }
      }

      setIsLoading(false);
    }

    hydrate();
    return () => {
      mounted = false;
    };
  }, [refreshTokens]);

  const completeOnboarding = useCallback(async () => {
    await setString(StorageKeys.hasOnboarded, "true");
    setHasOnboarded(true);
  }, []);

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      if (!isApiConfigured()) {
        throw new Error("API is not configured. Set EXPO_PUBLIC_API_URL.");
      }
      const response = await authApi.google(idToken);
      await establishSession(response);
    },
    [establishSession],
  );

  const signInWithApple = useCallback(
    async (identityToken: string) => {
      if (!isApiConfigured()) {
        throw new Error("API is not configured. Set EXPO_PUBLIC_API_URL.");
      }
      const response = await authApi.apple(identityToken);
      await establishSession(response);
    },
    [establishSession],
  );

  const signOut = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    if (!authRef.current?.accessToken || !isApiConfigured()) return;
    try {
      const user = await authApi.me();
      const next = { ...authRef.current, user };
      await applyAuth(next);
    } catch {
      await refreshTokens();
    }
  }, [applyAuth, refreshTokens]);

  const value = useMemo(
    () => ({
      isLoading,
      hasOnboarded,
      isAuthenticated: Boolean(auth?.accessToken),
      user: auth?.user ?? null,
      accessToken: auth?.accessToken ?? null,
      completeOnboarding,
      signInWithGoogle,
      signInWithApple,
      signOut,
      refreshUser,
    }),
    [
      isLoading,
      hasOnboarded,
      auth,
      completeOnboarding,
      signInWithGoogle,
      signInWithApple,
      signOut,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function devGoogleToken(
  sub = "mobile-dev",
  email = "dev@gmail.com",
): string {
  return `dev-google:${sub}:${email}`;
}

export function devAppleToken(
  sub = "mobile-dev",
  email = "dev@icloud.com",
): string {
  return `dev-apple:${sub}:${email}`;
}
