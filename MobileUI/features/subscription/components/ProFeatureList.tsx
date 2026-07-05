import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing, typography } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

export function ProFeatureList({ features }: { features: string[] }) {
  const colors = useColors();

  return (
    <View style={styles.list}>
      {features.map((feature) => (
        <View key={feature} style={styles.row}>
          <View style={[styles.check, { backgroundColor: colors.secondary }]}>
            <Ionicons name="checkmark" size={11} color={colors.primary} />
          </View>
          <Text style={[styles.text, { color: colors.foreground }]}>{feature}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  check: {
    alignItems: "center",
    borderRadius: 10,
    flexShrink: 0,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  text: {
    ...typography.caption,
    flex: 1,
    lineHeight: 18,
  },
});
