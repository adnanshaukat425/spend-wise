import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/api";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Notifications"
        onBack={() => router.back()}
        rightAction={
          hasUnread ? (
            <TouchableOpacity onPress={() => markAllRead.mutate()} testID="mark-all-read-btn">
              <Text style={[styles.markAll, { color: colors.primary }]}>Mark all</Text>
            </TouchableOpacity>
          ) : null
        }
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {notifications.map((n) => (
          <TouchableOpacity
            key={n.id}
            activeOpacity={0.7}
            onPress={() => {
              if (!n.read) markRead.mutate(n.id);
            }}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                opacity: n.read ? 0.85 : 1,
              },
            ]}
            testID={`notification-row-${n.id}`}
          >
            {!n.read && (
              <View
                style={[styles.unreadDot, { backgroundColor: colors.primary }]}
              />
            )}
            <View style={[styles.icon, { backgroundColor: n.iconBg }]}>
              <Ionicons name={n.icon} size={20} color={n.iconColor} />
            </View>
            <View style={styles.body}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                {n.title}
              </Text>
              <Text style={[styles.message, { color: colors.mutedForeground }]}>
                {n.body}
              </Text>
              <Text style={[styles.time, { color: colors.mutedForeground }]}>
                {n.time}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  markAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  card: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    alignItems: "flex-start",
  },
  unreadDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
