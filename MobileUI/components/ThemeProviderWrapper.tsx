import React from "react";
import { useColorScheme } from "react-native";

import { ThemeProvider } from "@/contexts/ThemeContext";

export function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const scheme = useColorScheme();
  return (
    <ThemeProvider systemIsDark={scheme === "dark"}>
      {children}
    </ThemeProvider>
  );
}
