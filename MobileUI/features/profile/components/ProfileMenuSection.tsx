import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type RowBase = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type ChevronRow = RowBase & {
  kind: "chevron";
  value?: string;
  route?: string;
  settingsSlug?: string;
};

export type ToggleRow = RowBase & {
  kind: "toggle";
  stateKey: "notifications" | "darkMode";
};

export type MenuRow = ChevronRow | ToggleRow;

interface ProfileMenuSectionProps {
  label: string;
  rows: MenuRow[];
  isDark: boolean;
  notificationsEnabled: boolean;
  onChevronPress: (row: ChevronRow) => void;
  onDarkModeChange: (value: boolean) => void | Promise<void>;
  onNotificationsChange: (value: boolean) => void;
}

export function ProfileMenuSection({
  label,
  rows,
  isDark,
  notificationsEnabled,
  onChevronPress,
  onDarkModeChange,
  onNotificationsChange,
}: ProfileMenuSectionProps) {
  const colors = useColors();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {rows.map((row, idx) => (
          <View key={row.id}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              testID={`profile-row-${row.id}`}
              onPress={async () => {
                if (row.kind === "chevron") {
                  onChevronPress(row);
                } else if (row.kind === "toggle") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (row.stateKey === "darkMode") {
                    await onDarkModeChange(!isDark);
                  } else {
                    onNotificationsChange(!notificationsEnabled);
                  }
                }
              }}
            >
              <View
                style={[styles.rowIcon, { backgroundColor: colors.muted }]}
              >
                <Ionicons name={row.icon} size={18} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>
                {row.label}
              </Text>

              {row.kind === "toggle" ? (
                <Switch
                  value={
                    row.stateKey === "darkMode"
                      ? isDark
                      : notificationsEnabled
                  }
                  onValueChange={async (v) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (row.stateKey === "darkMode") {
                      await onDarkModeChange(v);
                    } else {
                      onNotificationsChange(v);
                    }
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  style={
                    Platform.OS === "android"
                      ? { transform: [{ scale: 0.9 }] }
                      : undefined
                  }
                  testID={row.stateKey === "darkMode" ? "dark-mode-toggle" : "notifications-toggle"}
                  accessibilityLabel={row.stateKey === "darkMode" ? "Dark Mode" : "Notifications"}
                />
              ) : (
                <View style={styles.rowRight}>
                  {row.value ? (
                    <Text
                      style={[styles.rowValue, { color: colors.mutedForeground }]}
                    >
                      {row.value}
                    </Text>
                  ) : null}
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.mutedForeground}
                  />
                </View>
              )}
            </TouchableOpacity>
            {idx < rows.length - 1 && (
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: { fontSize: 13, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginHorizontal: 16 },
});
