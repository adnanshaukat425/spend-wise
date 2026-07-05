import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { useColors } from "@/hooks/useColors";

export default function NotFoundScreen() {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Screen not found</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        The page you are looking for does not exist.
      </Text>
      <Link href="/" asChild>
        <Button accessibilityLabel="Go back home">Go Home</Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    marginBottom: 8,
  },
});
