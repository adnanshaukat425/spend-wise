import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { QueryScreenBoundary } from "@/components/ui/QueryScreenBoundary";
import { Screen, ScreenScrollView } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { spacing } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { queryKeys } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../queries";

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useColors();
  const qc = useQueryClient();
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleRefresh = React.useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.notifications() });
  }, [qc]);

  return (
    <QueryScreenBoundary
      empty={
        <Screen padded={false}>
          <View style={styles.headerWrap} testID="notifications-screen">
            <ScreenHeader onBack={() => router.back()} title="Notifications" />
          </View>
          <EmptyState
            icon="notifications-outline"
            message="You're all caught up. New alerts will appear here."
            title="No notifications"
          />
        </Screen>
      }
      isEmpty={(data) => data.length === 0}
      query={notificationsQuery}
    >
      {(notifications) => {
        const hasUnread = notifications.some((notification) => !notification.read);

        return (
          <Screen padded={false}>
            <View style={styles.headerWrap} testID="notifications-screen">
              <ScreenHeader
                onBack={() => router.back()}
                rightAction={
                  hasUnread ? (
                    <TouchableOpacity
                      onPress={() => markAllRead.mutate()}
                      testID="mark-all-read-btn"
                    >
                      <Text style={[styles.markAll, { color: colors.primary }]}>Mark all</Text>
                    </TouchableOpacity>
                  ) : null
                }
                title="Notifications"
              />
            </View>

            <ScreenScrollView
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  onRefresh={handleRefresh}
                  refreshing={notificationsQuery.isFetching}
                  tintColor={colors.primary}
                />
              }
            >
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!notification.read) markRead.mutate(notification.id);
                  }}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      opacity: notification.read ? 0.85 : 1,
                    },
                  ]}
                  testID={`notification-row-${notification.id}`}
                >
                  {!notification.read ? (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  ) : null}
                  <View style={[styles.icon, { backgroundColor: notification.iconBg }]}>
                    <Ionicons name={notification.icon} size={20} color={notification.iconColor} />
                  </View>
                  <View style={styles.body}>
                    <Text style={[styles.title, { color: colors.foreground }]}>
                      {notification.title}
                    </Text>
                    <Text style={[styles.message, { color: colors.mutedForeground }]}>
                      {notification.body}
                    </Text>
                    <Text style={[styles.time, { color: colors.mutedForeground }]}>
                      {notification.time}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScreenScrollView>
          </Screen>
        );
      }}
    </QueryScreenBoundary>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  card: {
    alignItems: "flex-start",
    borderRadius: 14,
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: 10,
    padding: 14,
  },
  headerWrap: {
    paddingHorizontal: spacing.xxl,
  },
  icon: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  markAll: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  message: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingTop: 0,
  },
  time: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  unreadDot: {
    borderRadius: 4,
    height: 8,
    position: "absolute",
    right: 14,
    top: 14,
    width: 8,
  },
});
