import React from "react";
import { StyleSheet, type StyleProp, View, type ViewStyle } from "react-native";

import { radii, spacing, shadows } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();

  return (
    <View style={[styles.root, shadows.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
