import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { StorageKeys, getJson, setJson } from "@/lib/storage";

export type ThemePreference = "system" | "light" | "dark";

interface ThemeContextValue {
  preference: ThemePreference;
  isDark: boolean;
  setPreference: (pref: ThemePreference) => Promise<void>;
  toggleDarkMode: (enabled: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  systemIsDark,
}: {
  children: React.ReactNode;
  systemIsDark: boolean;
}) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    getJson<ThemePreference>(StorageKeys.themePreference).then((stored) => {
      if (stored) setPreferenceState(stored);
    });
  }, []);

  const isDark = useMemo(() => {
    if (preference === "dark") return true;
    if (preference === "light") return false;
    return systemIsDark;
  }, [preference, systemIsDark]);

  const setPreference = useCallback(async (pref: ThemePreference) => {
    await setJson(StorageKeys.themePreference, pref);
    setPreferenceState(pref);
  }, []);

  const toggleDarkMode = useCallback(
    async (enabled: boolean) => {
      await setPreference(enabled ? "dark" : "light");
    },
    [setPreference],
  );

  const value = useMemo(
    () => ({
      preference,
      isDark,
      setPreference,
      toggleDarkMode,
    }),
    [preference, isDark, setPreference, toggleDarkMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
