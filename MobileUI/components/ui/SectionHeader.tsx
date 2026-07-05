import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { spacing, typography } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

export function SectionHeader({
  actionLabel,
  actionTestID,
  onAction,
  title,
}: {
  actionLabel?: string;
  actionTestID?: string;
  onAction?: () => void;
  title: string;
}) {
  const colors = useColors();

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          testID={actionTestID}
        >
          <Text style={[styles.action, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    ...typography.caption,
    fontFamily: "Inter_600SemiBold",
  },
  root: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.bodyMedium,
    fontFamily: "Inter_700Bold",
  },
});
