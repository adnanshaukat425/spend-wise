import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { spacing, typography } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

export function ScreenHeader({
  onBack,
  right,
  rightAction,
  showBack = true,
  title,
  variant = "back",
}: {
  onBack?: () => void;
  right?: React.ReactNode;
  rightAction?: React.ReactNode;
  showBack?: boolean;
  title?: string;
  variant?: "back" | "close";
}) {
  const colors = useColors();
  const iconName = variant === "close" ? "close" : "chevron-back";

  return (
    <View style={styles.root}>
      {showBack && onBack ? (
        <Pressable
          accessibilityLabel={variant === "close" ? "Close screen" : "Go back"}
          accessibilityRole="button"
          onPress={onBack}
          style={styles.iconButton}
          testID="screen-back-btn"
        >
          <Ionicons name={iconName} size={22} color={colors.foreground} />
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}
      {title ? <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text> : <View />}
      <View style={styles.right}>{right ?? rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  right: {
    alignItems: "flex-end",
    minWidth: 40,
  },
  root: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.bodyMedium,
    fontFamily: "Inter_700Bold",
  },
});
