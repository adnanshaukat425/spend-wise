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

export function Screen({
  children,
  padded = true,
  style,
}: {
  children: React.ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const insets = useScreenInsets();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingBottom: insets.bottom,
          paddingHorizontal: padded ? spacing.xxl : 0,
          paddingTop: insets.top,
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
}: {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}) {
  const colors = useColors();
  const insets = useScreenInsets();

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: insets.contentBottom,
          paddingTop: insets.contentTop,
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
