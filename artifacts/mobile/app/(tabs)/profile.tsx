import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
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

import { useAuth } from "@/contexts/AuthContext";
import {
  useAccounts,
  useDashboard,
  usePreferences,
  useUpdatePreferences,
} from "@/hooks/api";
import { useTheme } from "@/contexts/ThemeContext";
import { mapUserProfile } from "@/lib/mappers";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

type RowBase = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};
type ChevronRow = RowBase & {
  kind: "chevron";
  value?: string;
  route?: string;
  settingsSlug?: string;
};
type ToggleRow = RowBase & {
  kind: "toggle";
  stateKey: "notifications" | "darkMode";
};
type MenuRow = ChevronRow | ToggleRow;

export default function ProfileScreen() {
  const insets = useScreenInsets();
  const colors = useColors();
  const router = useRouter();
  const { signOut, user: authUser } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const { data: preferences } = usePreferences();
  const updatePreferencesMutation = useUpdatePreferences();
  const { data: accounts = [] } = useAccounts();
  const { data: dashboard } = useDashboard();

  const prefs = preferences ?? { notifications: true, currency: "USD" };
  const displayUser = useMemo(
    () =>
      authUser
        ? mapUserProfile(authUser, dashboard?.raw)
        : {
            name: "",
            email: "",
            initials: "?",
            plan: "Free Plan",
            balance: 0,
            balanceChangePct: 0,
            accountsConnected: 0,
            stats: { transactions: 0, categories: 0, saved: 0 },
          },
    [authUser, dashboard?.raw],
  );

  const preferencesRows: MenuRow[] = useMemo(
    () => [
      {
        id: "notif",
        kind: "toggle",
        label: "Notifications",
        icon: "notifications-outline",
        stateKey: "notifications",
      },
      {
        id: "dark",
        kind: "toggle",
        label: "Dark Mode",
        icon: "moon-outline",
        stateKey: "darkMode",
      },
      {
        id: "currency",
        kind: "chevron",
        label: "Currency",
        icon: "card-outline",
        value: prefs.currency,
        settingsSlug: "currency",
      },
    ],
    [prefs.currency],
  );

  const accountRows: MenuRow[] = useMemo(
    () => [
      {
        id: "accounts",
        kind: "chevron",
        label: "Manage Accounts",
        icon: "wallet-outline",
        value: String(accounts.length),
        route: "/accounts",
      },
      {
        id: "subscription",
        kind: "chevron",
        label: "Subscription",
        icon: "ribbon-outline",
        value: displayUser.plan,
        route: "/subscription",
      },
      {
        id: "security",
        kind: "chevron",
        label: "Security",
        icon: "shield-outline",
        settingsSlug: "security",
      },
      {
        id: "export",
        kind: "chevron",
        label: "Export Data",
        icon: "document-text-outline",
        settingsSlug: "export",
      },
    ],
    [accounts.length, displayUser.plan],
  );

  const supportRows: MenuRow[] = [
    {
      id: "help",
      kind: "chevron",
      label: "Help Center",
      icon: "help-circle-outline",
      settingsSlug: "help",
    },
    {
      id: "share",
      kind: "chevron",
      label: "Share App",
      icon: "share-social-outline",
      settingsSlug: "share",
    },
    {
      id: "settings",
      kind: "chevron",
      label: "App Settings",
      icon: "settings-outline",
      settingsSlug: "settings",
    },
  ];

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleRowPress = (row: ChevronRow) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (row.route) {
      router.push(row.route as never);
    } else if (row.settingsSlug) {
      router.push(`/settings/${row.settingsSlug}` as never);
    }
  };

  function SettingsSection({ label, rows }: { label: string; rows: MenuRow[] }) {
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
                activeOpacity={row.kind === "toggle" ? 1 : 0.7}
                onPress={() => {
                  if (row.kind === "chevron") handleRowPress(row);
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
                        : prefs.notifications
                    }
                    onValueChange={async (v) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (row.stateKey === "darkMode") {
                        await toggleDarkMode(v);
                      } else {
                        updatePreferencesMutation.mutate({
                          notificationsEnabled: v,
                        });
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + 4,
        paddingBottom: insets.bottom + 110,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
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

      <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
        {[
          { label: "Transactions", value: String(displayUser.stats.transactions) },
          { label: "Categories", value: String(displayUser.stats.categories) },
          {
            label: "Saved",
            value: formatCurrency(displayUser.stats.saved, { compact: true }),
            highlight: true,
          },
        ].map((stat, i) => (
          <View
            key={stat.label}
            style={[
              styles.statCard,
              i === 1 && {
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                {
                  color: stat.highlight ? colors.primary : colors.foreground,
                },
              ]}
            >
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <SettingsSection label="PREFERENCES" rows={preferencesRows} />
      <SettingsSection label="ACCOUNT" rows={accountRows} />
      <SettingsSection label="SUPPORT" rows={supportRows} />

      <View style={styles.signOutWrap}>
        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: "#FEF2F2" }]}
          onPress={handleSignOut}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          testID="sign-out-btn"
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={[styles.version, { color: colors.mutedForeground }]}>
          SpendWise v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
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
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
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
  signOutWrap: { paddingHorizontal: 20 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
    textAlign: "center",
    marginBottom: 8,
  },
});
