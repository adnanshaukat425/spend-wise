import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Returns design tokens for the active color scheme.
 * Respects user theme preference from ThemeContext when set.
 */
export function useColors() {
  const { isDark } = useTheme();
  const systemScheme = useColorScheme();

  const useDark =
    isDark ?? (systemScheme === "dark" && "dark" in colors);

  const palette = useDark ? colors.dark : colors.light;

  return { ...palette, radius: colors.radius, isDark: !!useDark };
}
