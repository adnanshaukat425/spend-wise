import React from "react";
import {
  ScrollView,
  StyleSheet,
  type RefreshControlProps,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";

import { spacing } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { useTabContentInsets } from "@/hooks/useTabContentInsets";

type ScreenVariant = "stack" | "tab";

export function Screen({
  children,
  padded = true,
  style,
  variant = "stack",
}: {
  children: React.ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: ScreenVariant;
}) {
  const colors = useColors();
  const insets = useScreenInsets();
  const isTab = variant === "tab";

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingBottom: isTab ? 0 : insets.bottom,
          paddingHorizontal: padded && !isTab ? spacing.xxl : 0,
          paddingTop: isTab ? 0 : insets.top,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ScreenScrollView({
  children,
  contentContainerStyle,
  refreshControl,
  hero = false,
  padded = true,
  variant = "stack",
}: {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  hero?: boolean;
  padded?: boolean;
  variant?: ScreenVariant;
}) {
  const colors = useColors();
  const insets = useScreenInsets();
  const tabInsets = useTabContentInsets();
  const isTab = variant === "tab";

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        padded ? styles.scrollContent : null,
        isTab
          ? {
              paddingBottom: tabInsets.paddingBottom,
              paddingTop: hero ? 0 : tabInsets.paddingTop,
            }
          : {
              paddingBottom: insets.contentBottom,
              paddingTop: hero ? 0 : insets.contentTop,
            },
        contentContainerStyle,
      ]}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
  },
});
