import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { spacing, typography } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

export function ScreenLoading({ label = "Loading" }: { label?: string }) {
  const colors = useColors();

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  root: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
