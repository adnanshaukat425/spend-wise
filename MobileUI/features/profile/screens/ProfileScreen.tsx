import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ErrorState } from "@/components/ui/ErrorState";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAccounts,
  useDashboard,
  usePreferences,
  useUpdatePreferences,
} from "../api";
import { useTheme } from "@/contexts/ThemeContext";
import { mapUserProfile } from "@/lib/mappers";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

import { ProfileHeader } from "../components/ProfileHeader";
import {
  ProfileMenuSection,
  type ChevronRow,
  type MenuRow,
} from "../components/ProfileMenuSection";
import { ProfileStats } from "../components/ProfileStats";

export default function ProfileScreen() {
  const insets = useScreenInsets();
  const colors = useColors();
  const router = useRouter();
  const { signOut, user: authUser } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const { data: preferences } = usePreferences();
  const updatePreferencesMutation = useUpdatePreferences();
  const { data: accounts = [] } = useAccounts();
  const { data: dashboard, isError: dashboardError, error: dashboardQueryError, refetch: refetchDashboard } = useDashboard();

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

  if (dashboardError) {
    return <ErrorState error={dashboardQueryError} onRetry={() => void refetchDashboard()} />;
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
      <ProfileHeader displayUser={displayUser} />
      <ProfileStats stats={displayUser.stats} />

      <ProfileMenuSection
        label="PREFERENCES"
        rows={preferencesRows}
        isDark={isDark}
        notificationsEnabled={prefs.notifications}
        onChevronPress={handleRowPress}
        onDarkModeChange={toggleDarkMode}
        onNotificationsChange={(v) =>
          updatePreferencesMutation.mutate({ notificationsEnabled: v })
        }
      />
      <ProfileMenuSection
        label="ACCOUNT"
        rows={accountRows}
        isDark={isDark}
        notificationsEnabled={prefs.notifications}
        onChevronPress={handleRowPress}
        onDarkModeChange={toggleDarkMode}
        onNotificationsChange={(v) =>
          updatePreferencesMutation.mutate({ notificationsEnabled: v })
        }
      />
      <ProfileMenuSection
        label="SUPPORT"
        rows={supportRows}
        isDark={isDark}
        notificationsEnabled={prefs.notifications}
        onChevronPress={handleRowPress}
        onDarkModeChange={toggleDarkMode}
        onNotificationsChange={(v) =>
          updatePreferencesMutation.mutate({ notificationsEnabled: v })
        }
      />

      <View style={styles.signOutWrap}>
        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: colors.signOutBackground }]}
          onPress={handleSignOut}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          testID="sign-out-btn"
        >
          <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
          <Text style={[styles.signOutText, { color: colors.destructive }]}>
            Sign Out
          </Text>
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
  },
  version: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 8,
  },
});
