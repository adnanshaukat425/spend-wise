import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { UserProfile } from "@/data/types";
import { useColors } from "@/hooks/useColors";

interface ProfileHeaderProps {
  displayUser: UserProfile;
}

export function ProfileHeader({ displayUser }: ProfileHeaderProps) {
  const colors = useColors();
  const router = useRouter();

  return (
    <>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} testID="profile-header-title">
          Profile
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.userCard, { backgroundColor: colors.card }]}
        activeOpacity={0.7}
        onPress={() => router.push("/settings/profile" as never)}
      >
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {displayUser.initials}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {displayUser.name}
          </Text>
          <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
            {displayUser.email}
          </Text>
          <View style={[styles.planBadge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.planBadgeText, { color: colors.mutedForeground }]}>
              {displayUser.plan}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.upgradeBanner, { backgroundColor: colors.secondary }]}
        activeOpacity={0.85}
        onPress={() => router.push("/subscription")}
        testID="upgrade-to-pro-btn"
      >
        <View
          style={[styles.upgradeIconWrap, { backgroundColor: colors.primary + "25" }]}
        >
          <Text style={styles.upgradeIconEmoji}>👑</Text>
        </View>
        <View style={styles.upgradeInfo}>
          <Text style={[styles.upgradeTitle, { color: colors.foreground }]}>
            Upgrade to Pro
          </Text>
          <Text style={[styles.upgradeSub, { color: colors.mutedForeground }]}>
            Unlock all AI features
          </Text>
        </View>
        <View style={[styles.upgradePriceBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.upgradePriceText}>$4.99/mo</Text>
        </View>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 14 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  userEmail: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  planBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  planBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  upgradeBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  upgradeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeIconEmoji: { fontSize: 20 },
  upgradeInfo: { flex: 1 },
  upgradeTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 2 },
  upgradeSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  upgradePriceBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradePriceText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
