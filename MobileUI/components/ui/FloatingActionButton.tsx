import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { shadows } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

export function FloatingActionButton({
  accessibilityLabel,
  icon,
  onPress,
  style,
  testID,
  tone = "primary",
}: {
  accessibilityLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  tone?: "primary" | "card";
}) {
  const colors = useColors();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.root,
        shadows.floating,
        { backgroundColor: tone === "primary" ? colors.primary : colors.card },
        style,
      ]}
      testID={testID}
    >
      <Ionicons
        name={icon}
        size={26}
        color={tone === "primary" ? colors.primaryForeground : colors.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
});
