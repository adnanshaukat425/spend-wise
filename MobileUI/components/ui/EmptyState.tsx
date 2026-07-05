import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "./Button";
import type { IconName } from "@/domain/types";
import { spacing, typography } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

export function EmptyState({
  actionLabel,
  body,
  icon,
  message,
  onAction,
  title,
}: {
  actionLabel?: string;
  body?: string;
  icon?: IconName;
  message?: string;
  onAction?: () => void;
  title: string;
}) {
  const colors = useColors();

  return (
    <View style={styles.root}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
          <Ionicons color={colors.mutedForeground} name={icon} size={28} />
        </View>
      ) : null}
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>{body ?? message}</Text>
      {actionLabel && onAction ? <Button onPress={onAction}>{actionLabel}</Button> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 999,
    height: 56,
    justifyContent: "center",
    marginBottom: spacing.lg,
    width: 56,
  },
  root: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
});
