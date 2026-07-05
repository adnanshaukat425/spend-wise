import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemePreference = "system" | "light" | "dark";

interface ThemeContextValue {
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
  toggleDarkMode: (enabled: boolean) => Promise<void>;
}

const THEME_KEY = "spendwise.theme.v1";
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  systemIsDark,
}: {
  children: React.ReactNode;
  systemIsDark?: boolean;
}) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "system" || stored === "light" || stored === "dark") {
        setPreferenceState(stored);
      }
    });
  }, []);

  const isDark =
    preference === "dark" ||
    (preference === "system" && (systemIsDark ?? systemScheme === "dark"));

  const setPreference = useCallback(async (nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    await AsyncStorage.setItem(THEME_KEY, nextPreference);
  }, []);

  const toggleDarkMode = useCallback(
    async (enabled: boolean) => {
      await setPreference(enabled ? "dark" : "light");
    },
    [setPreference],
  );

  const value = useMemo(
    () => ({
      isDark,
      preference,
      setPreference,
      toggleDarkMode,
    }),
    [isDark, preference, setPreference, toggleDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return value;
}

export const useThemePreference = useTheme;
