import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { radii, spacing, typography } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

type ButtonVariant = "primary" | "secondary" | "outline" | "pro";

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
}

export function Button({ children, disabled, loading, style, variant = "primary", ...props }: ButtonProps) {
  const colors = useColors();
  const isDisabled = disabled || loading;
  const backgroundColor =
    variant === "primary"
      ? colors.primary
      : variant === "pro"
        ? colors.warning
        : variant === "secondary"
          ? colors.secondary
          : colors.card;
  const textColor =
    variant === "primary" || variant === "pro" ? colors.primaryForeground : colors.foreground;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={[
        styles.root,
        {
          backgroundColor,
          borderColor: variant === "outline" ? colors.border : backgroundColor,
          opacity: isDisabled ? 0.65 : 1,
        },
        style,
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator color={textColor} /> : null}
      {!loading && (typeof children === "string" || typeof children === "number") ? (
        <Text style={[styles.text, { color: textColor }]}>{children}</Text>
      ) : null}
      {!loading && typeof children !== "string" && typeof children !== "number" ? children : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    height: 54,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  text: {
    ...typography.bodyMedium,
  },
});
