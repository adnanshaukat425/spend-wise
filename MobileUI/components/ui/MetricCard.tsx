import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "./Card";
import { spacing, typography } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

export function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const colors = useColors();

  return (
    <Card style={styles.root}>
      <View>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  root: {
    flex: 1,
  },
  value: {
    ...typography.title,
  },
});
