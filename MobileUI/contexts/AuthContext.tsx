import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ApiError, authApi, initApi, setAuthTokenGetter } from "@/lib/api";
import type { AuthTokenResponse, UserProfileDto } from "@/lib/api/types";

const SESSION_KEY = "spendwise.session.v1";
const ONBOARDING_KEY = "spendwise.onboarding.v1";

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: UserProfileDto;
}

interface AuthContextValue {
  completeOnboarding: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasOnboarded: boolean;
  onboardingCompleted: boolean;
  signInWithApple: (identityToken: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: UserProfileDto | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toSession(response: AuthTokenResponse): AuthSession {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: response.user,
  };
}

async function persistSession(session: AuthSession | null) {
  if (!session) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return;
  }

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const sessionRef = useRef<AuthSession | null>(null);

  sessionRef.current = session;

  useEffect(() => {
    initApi();
    setAuthTokenGetter(() => sessionRef.current?.accessToken ?? null);
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession(stored: AuthSession): Promise<AuthSession | null> {
      sessionRef.current = stored;
      setSession(stored);

      try {
        await authApi.me();
        return stored;
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          throw error;
        }
      }

      try {
        const refreshed = await authApi.refresh(stored.refreshToken);
        const nextSession = toSession(refreshed);
        sessionRef.current = nextSession;
        setSession(nextSession);
        await persistSession(nextSession);
        return nextSession;
      } catch {
        sessionRef.current = null;
        setSession(null);
        await persistSession(null);
        return null;
      }
    }

    async function hydrate() {
      try {
        const [rawSession, rawOnboarding] = await Promise.all([
          AsyncStorage.getItem(SESSION_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
        ]);
        if (!active) return;

        if (rawSession) {
          await restoreSession(JSON.parse(rawSession) as AuthSession);
        }

        if (!active) return;
        setOnboardingCompleted(rawOnboarding === "1");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  const applySession = useCallback(async (response: AuthTokenResponse) => {
    const nextSession = toSession(response);
    sessionRef.current = nextSession;
    setSession(nextSession);
    await persistSession(nextSession);
  }, []);

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      await applySession(await authApi.google(idToken));
    },
    [applySession],
  );

  const signInWithApple = useCallback(
    async (identityToken: string) => {
      await applySession(await authApi.apple(identityToken));
    },
    [applySession],
  );

  const signOut = useCallback(async () => {
    const refreshToken = session?.refreshToken;
    sessionRef.current = null;
    setSession(null);
    await persistSession(null);
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Sign-out should not be blocked by a failed network logout.
      }
    }
  }, [session?.refreshToken]);

  const completeOnboarding = useCallback(async () => {
    setOnboardingCompleted(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, "1");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      completeOnboarding,
      hasOnboarded: onboardingCompleted,
      isAuthenticated: Boolean(session?.accessToken),
      isLoading,
      onboardingCompleted,
      signInWithApple,
      signInWithGoogle,
      signOut,
      user: session?.user ?? null,
    }),
    [
      completeOnboarding,
      isLoading,
      onboardingCompleted,
      session,
      signInWithApple,
      signInWithGoogle,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
