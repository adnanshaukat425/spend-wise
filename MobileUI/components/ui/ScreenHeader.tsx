import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({
  title,
  showBack = true,
  rightAction,
  onBack,
}: ScreenHeaderProps) {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
      {showBack ? (
        <TouchableOpacity
          onPress={onBack ?? (() => router.back())}
          activeOpacity={0.7}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="screen-back-btn"
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconBtn} />
      )}
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <View style={[styles.iconBtn, rightAction ? styles.iconBtnRight : null]}>{rightAction}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnRight: {
    width: "auto",
    minWidth: 36,
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});
