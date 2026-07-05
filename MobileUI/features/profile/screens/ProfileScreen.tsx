import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { QueryScreenBoundary } from "@/components/ui/QueryScreenBoundary";
import { Screen, ScreenScrollView } from "@/components/ui/Screen";
import { spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { mapUserProfile } from "@/lib/mappers";
import { useDashboard } from "@/features/dashboard/queries";
import { useAccounts } from "@/features/accounts/queries";
import {
  usePreferences,
  useUpdatePreferences,
} from "@/features/settings/queries";

import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileMenuSection, type ChevronRow } from "../components/ProfileMenuSection";
import { ProfileStats } from "../components/ProfileStats";
import { useProfileMenuSections } from "../hooks/useProfileMenuSections";

export default function ProfileScreen() {
  const dashboardQuery = useDashboard();

  return (
    <QueryScreenBoundary loadingLabel="Loading profile" query={dashboardQuery}>
      {(dashboard) => <ProfileScreenBody dashboard={dashboard} />}
    </QueryScreenBoundary>
  );
}

function ProfileScreenBody({
  dashboard,
}: {
  dashboard: NonNullable<ReturnType<typeof useDashboard>["data"]>;
}) {
  const colors = useColors();
  const router = useRouter();
  const { signOut, user: authUser } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const { data: preferences } = usePreferences();
  const updatePreferencesMutation = useUpdatePreferences();
  const { data: accounts = [] } = useAccounts();

  const prefs = preferences ?? { notifications: true, currency: "USD" };
  const displayUser = useMemo(
    () =>
      authUser
        ? mapUserProfile(authUser, dashboard.raw)
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
    [authUser, dashboard.raw],
  );

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

  const handleNotificationsChange = (value: boolean) => {
    updatePreferencesMutation.mutate({ notificationsEnabled: value });
  };

  const sections = useProfileMenuSections({
    accountsCount: accounts.length,
    currency: prefs.currency,
    displayPlan: displayUser.plan,
    isDark,
    notificationsEnabled: prefs.notifications,
    onChevronPress: handleRowPress,
    onDarkModeChange: toggleDarkMode,
    onNotificationsChange: handleNotificationsChange,
  });

  return (
    <Screen padded={false} variant="tab">
      <ScreenScrollView contentContainerStyle={styles.scrollContent} padded={false} variant="tab">
        <ProfileHeader displayUser={displayUser} />
        <ProfileStats stats={displayUser.stats} />

        <ProfileMenuSection {...sections.preferencesSection} />
        <ProfileMenuSection {...sections.accountSection} />
        <ProfileMenuSection {...sections.supportSection} />

        <View style={styles.signOutWrap}>
          <TouchableOpacity
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={handleSignOut}
            style={[styles.signOutBtn, { backgroundColor: colors.signOutBackground }]}
            testID="sign-out-btn"
          >
            <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
            <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={[styles.version, { color: colors.mutedForeground }]}>
            SpendWise v1.0.0
          </Text>
        </View>
      </ScreenScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 0,
  },
  signOutBtn: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginBottom: 14,
    paddingVertical: spacing.lg,
  },
  signOutText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  signOutWrap: {
    paddingHorizontal: spacing.xl,
  },
  version: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
});
