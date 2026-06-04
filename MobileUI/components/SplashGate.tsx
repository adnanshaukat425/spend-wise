import { useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export function SplashGate({ children }: { children: React.ReactNode }) {
  const { isLoading, hasOnboarded, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const colors = useColors();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup =
      segments[0] === "onboarding" || segments[0] === "login";

    if (!hasOnboarded && segments[0] !== "onboarding") {
      router.replace("/onboarding");
      return;
    }

    if (hasOnboarded && !isAuthenticated && !inAuthGroup) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isLoading, hasOnboarded, isAuthenticated, segments, router]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          SpendWise
        </Text>
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.spinner}
        />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});
