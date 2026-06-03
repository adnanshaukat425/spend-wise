import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SplashGate } from "@/components/SplashGate";
import { ThemeProviderWrapper } from "@/components/ThemeProviderWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import { initApi } from "@/lib/api";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60_000,
    },
  },
});

function RootLayoutNav() {
  return (
    <SplashGate>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen
          name="add-expense"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="subscription"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="notifications"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="accounts"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="add-account"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="transaction/[id]"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="settings/[slug]"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
      </Stack>
    </SplashGate>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initApi();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleError = (error: Error, stackTrace: string) => {
    if (__DEV__) {
      console.error("Unhandled render error:", error, stackTrace);
    }
  };

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProviderWrapper>
        <ErrorBoundary onError={handleError}>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProviderWrapper>
    </SafeAreaProvider>
  );
}
