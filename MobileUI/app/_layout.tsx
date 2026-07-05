import { Stack } from "expo-router";
import React from "react";

import { AppProviders } from "@/components/layout/AppProviders";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="subscription" options={{ presentation: "modal" }} />
        <Stack.Screen name="add-expense" options={{ presentation: "modal" }} />
        <Stack.Screen name="expenses" />
        <Stack.Screen name="insights" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="accounts" />
        <Stack.Screen name="add-account" />
        <Stack.Screen name="transaction/[id]" />
        <Stack.Screen name="settings/[slug]" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AppProviders>
  );
}
