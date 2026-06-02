import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

// ── Reusable row types ────────────────────────────────────────────
type RowBase = { id: string; label: string; icon: keyof typeof Ionicons.glyphMap };
type ChevronRow = RowBase & { kind: "chevron"; value?: string };
type ToggleRow = RowBase & { kind: "toggle"; stateKey: "notifications" | "darkMode" };
type MenuRow = ChevronRow | ToggleRow;

const PREFERENCES: MenuRow[] = [
  { id: "notif", kind: "toggle", label: "Notifications", icon: "notifications-outline", stateKey: "notifications" },
  { id: "dark", kind: "toggle", label: "Dark Mode", icon: "moon-outline", stateKey: "darkMode" },
  { id: "currency", kind: "chevron", label: "Currency", icon: "card-outline", value: "USD" },
];

const ACCOUNT: MenuRow[] = [
  { id: "accounts", kind: "chevron", label: "Manage Accounts", icon: "wallet-outline", value: "3" },
  { id: "subscription", kind: "chevron", label: "Subscription", icon: "ribbon-outline", value: "Free Plan" },
  { id: "security", kind: "chevron", label: "Security", icon: "shield-outline" },
  { id: "export", kind: "chevron", label: "Export Data", icon: "document-text-outline" },
];

const SUPPORT: MenuRow[] = [
  { id: "help", kind: "chevron", label: "Help Center", icon: "help-circle-outline" },
  { id: "share", kind: "chevron", label: "Share App", icon: "share-social-outline" },
  { id: "settings", kind: "chevron", label: "App Settings", icon: "settings-outline" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const toggleState = { notifications, darkMode };
  const setters = {
    notifications: setNotifications,
    darkMode: setDarkMode,
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["isLoggedIn", "hasOnboarded"]);
          router.replace("/login");
        },
      },
    ]);
  };

  function SettingsSection({ label, rows }: { label: string; rows: MenuRow[] }) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{label}</Text>
        <View style={styles.card}>
          {rows.map((row, idx) => (
            <View key={row.id}>
              <TouchableOpacity
                style={styles.row}
                activeOpacity={row.kind === "toggle" ? 1 : 0.7}
                onPress={() => {
                  if (row.kind !== "toggle") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <View style={styles.rowIcon}>
                  <Ionicons name={row.icon} size={18} color="#6B7280" />
                </View>
                <Text style={styles.rowLabel}>{row.label}</Text>

                {row.kind === "toggle" ? (
                  <Switch
                    value={toggleState[row.stateKey]}
                    onValueChange={(v) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setters[row.stateKey](v);
                    }}
                    trackColor={{ false: "#E5E7EB", true: colors.primary }}
                    thumbColor="#FFFFFF"
                    style={Platform.OS === "android" ? { transform: [{ scale: 0.9 }] } : undefined}
                  />
                ) : (
                  <View style={styles.rowRight}>
                    {row.value ? (
                      <Text style={styles.rowValue}>{row.value}</Text>
                    ) : null}
                    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                  </View>
                )}
              </TouchableOpacity>
              {idx < rows.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: topPad + 4, paddingBottom: botPad + 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* ── User card ── */}
      <TouchableOpacity style={styles.userCard} activeOpacity={0.7}>
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>JD</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@gmail.com</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>Free Plan</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      </TouchableOpacity>

      {/* ── Upgrade banner ── */}
      <TouchableOpacity
        style={[styles.upgradeBanner, { backgroundColor: colors.secondary }]}
        activeOpacity={0.85}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <View style={[styles.upgradeIconWrap, { backgroundColor: colors.primary + "25" }]}>
          <Text style={styles.upgradeIconEmoji}>👑</Text>
        </View>
        <View style={styles.upgradeInfo}>
          <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
          <Text style={styles.upgradeSub}>Unlock all AI features</Text>
        </View>
        <View style={[styles.upgradePriceBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.upgradePriceText}>$4.99/mo</Text>
        </View>
      </TouchableOpacity>

      {/* ── Stats row ── */}
      <View style={styles.statsRow}>
        {[
          { label: "Transactions", value: "156", color: "#111827" },
          { label: "Categories", value: "6", color: "#111827" },
          { label: "Saved", value: "$840", color: colors.primary },
        ].map((stat, i) => (
          <View
            key={stat.label}
            style={[
              styles.statCard,
              i === 1 && styles.statCardMiddle,
            ]}
          >
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Settings sections ── */}
      <SettingsSection label="PREFERENCES" rows={PREFERENCES} />
      <SettingsSection label="ACCOUNT" rows={ACCOUNT} />
      <SettingsSection label="SUPPORT" rows={SUPPORT} />

      {/* ── Sign Out ── */}
      <View style={styles.signOutWrap}>
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.version}>SpendWise v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F9",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  // User card
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
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
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  userInfo: { flex: 1, gap: 2 },
  userName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  userEmail: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 4,
  },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  planBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },

  // Upgrade banner
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
    flexShrink: 0,
  },
  upgradeIconEmoji: { fontSize: 20 },
  upgradeInfo: { flex: 1 },
  upgradeTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 2,
  },
  upgradeSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },
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

  // Stats row
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statCard: {
    flex: 1,
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
  },
  statCardMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#F3F4F6",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },

  // Settings sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#111827",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },

  // Sign out
  signOutWrap: {
    paddingHorizontal: 20,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 14,
  },
  signOutText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#EF4444",
  },
  version: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#C9CDD4",
    textAlign: "center",
    marginBottom: 8,
  },
});
