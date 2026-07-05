import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { TAB_CONTENT_TOP_OFFSET } from "@/constants/layout";
import { spacing, typography } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

import { FloatingActionButton } from "./FloatingActionButton";

interface TabScreenHeaderProps {
  onActionPress?: () => void;
  actionAccessibilityLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  actionTestID?: string;
  style?: StyleProp<ViewStyle>;
  title: string;
}

export function TabScreenHeader({
  actionAccessibilityLabel,
  actionIcon = "add",
  actionTestID,
  onActionPress,
  style,
  title,
}: TabScreenHeaderProps) {
  const colors = useColors();
  const insets = useScreenInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + TAB_CONTENT_TOP_OFFSET },
        style,
      ]}
    >
      <View style={styles.spacer} />
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {onActionPress ? (
        <FloatingActionButton
          accessibilityLabel={actionAccessibilityLabel ?? "Action"}
          icon={actionIcon}
          onPress={onActionPress}
          style={styles.action}
          testID={actionTestID}
        />
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    height: 36,
    width: 36,
  },
  root: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
  },
  spacer: {
    height: 36,
    width: 36,
  },
  title: {
    ...typography.bodySemibold,
    fontSize: 17,
  },
});
