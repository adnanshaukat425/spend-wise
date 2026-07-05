import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ErrorState } from "@/components/ui/ErrorState";
import { Screen, ScreenScrollView } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { spacing } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { queryKeys } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../api";

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const qc = useQueryClient();
  const { data: notifications = [], isFetching, isLoading, isError, error, refetch } =
    useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const hasUnread = notifications.some((n) => !n.read);

  const handleRefresh = React.useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.notifications() });
  }, [qc]);

  if (isLoading) {
    return <ScreenLoading />;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  return (
    <Screen padded={false}>
      <View style={styles.headerWrap} testID="notifications-screen">
        <ScreenHeader
          onBack={() => router.back()}
          rightAction={
            hasUnread ? (
              <TouchableOpacity onPress={() => markAllRead.mutate()} testID="mark-all-read-btn">
                <Text style={[styles.markAll, { color: colors.primary }]}>Mark all</Text>
              </TouchableOpacity>
            ) : null
          }
          title="Notifications"
        />
      </View>

      <ScreenScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl, paddingTop: 0 }}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={isFetching}
            tintColor={colors.primary}
          />
        }
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
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            )}
            <View style={[styles.icon, { backgroundColor: n.iconBg }]}>
              <Ionicons name={n.icon} size={20} color={n.iconColor} />
            </View>
            <View style={styles.body}>
              <Text style={[styles.title, { color: colors.foreground }]}>{n.title}</Text>
              <Text style={[styles.message, { color: colors.mutedForeground }]}>{n.body}</Text>
              <Text style={[styles.time, { color: colors.mutedForeground }]}>{n.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScreenScrollView>
    </Screen>
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
