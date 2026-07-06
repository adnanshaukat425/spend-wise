import { useRouter, type Href } from "expo-router";
import React from "react";
import { RefreshControl, StyleSheet, View } from "react-native";

import { QueryScreenBoundary } from "@/components/ui/QueryScreenBoundary";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { ScreenScrollView } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { spacing } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { defaultBudgetSummary, mapUserProfile } from "@/lib/mappers";
import { queryKeys } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/features/notifications/queries";
import { useAccounts } from "@/features/accounts/queries";

import { DashboardHero } from "../components/DashboardHero";
import { DashboardMetrics } from "../components/DashboardMetrics";
import { RecentTransactions } from "../components/RecentTransactions";
import { SpendingDonutCard } from "../components/SpendingDonutCard";
import { useDashboard } from "../queries";

export default function DashboardScreen() {
  const dashboardQuery = useDashboard();
  const { user: authUser } = useAuth();

  if (!authUser && !dashboardQuery.isLoading && !dashboardQuery.isError) {
    return <ScreenLoading label="Loading dashboard" />;
  }

  return (
    <QueryScreenBoundary loadingLabel="Loading dashboard" query={dashboardQuery}>
      {(data) => {
        if (!authUser) {
          return <ScreenLoading label="Loading dashboard" />;
        }

        return (
          <DashboardScreenBody authUser={authUser} dashboardQuery={dashboardQuery} data={data} />
        );
      }}
    </QueryScreenBoundary>
  );
}

function DashboardScreenBody({
  authUser,
  dashboardQuery,
  data,
}: {
  authUser: NonNullable<ReturnType<typeof useAuth>["user"]>;
  dashboardQuery: ReturnType<typeof useDashboard>;
  data: NonNullable<ReturnType<typeof useDashboard>["data"]>;
}) {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const qc = useQueryClient();
  const { data: notifications = [] } = useNotifications();
  const { data: accounts = [] } = useAccounts();

  const user = {
    ...mapUserProfile(authUser, data.raw),
    accountsConnected: accounts.length,
  };
  const spendingByCategory = data.spendingByCategory;
  const spendingByAccount = data.spendingByAccount;
  const recentTransactions = data.recentTransactions;
  const hasUnreadNotifications = notifications.some((notification) => !notification.read);
  const budgetSummary = data.budgetSummary ?? defaultBudgetSummary();
  const totalSpentByCategory = spendingByCategory.reduce((sum, category) => sum + category.amount, 0);
  const totalSpentByAccount = spendingByAccount.reduce((sum, account) => sum + account.amount, 0);
  const showAccountChart = accounts.length > 1;

  const handleRefresh = React.useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    qc.invalidateQueries({ queryKey: queryKeys.accounts });
    qc.invalidateQueries({ queryKey: queryKeys.notifications() });
  }, [qc]);

  return (
    <ScreenScrollView
      hero
      padded={false}
      refreshControl={
        <RefreshControl
          onRefresh={handleRefresh}
          refreshing={dashboardQuery.isFetching && !dashboardQuery.isLoading}
          tintColor={colors.primary}
        />
      }
      variant="tab"
    >
      <View style={[styles.heroShell, { backgroundColor: colors.heroBackground }]}>
        <DashboardHero
          budgetSummary={budgetSummary}
          hasUnreadNotifications={hasUnreadNotifications}
          onAccountsPress={() => router.push("/accounts" as Href)}
          onManageBudgetPress={() => router.push("/(tabs)/budget")}
          onNotificationsPress={() => router.push("/notifications" as Href)}
          topInset={insets.top}
          user={user}
        />
        <DashboardMetrics
          totalExpenses={data.monthlyExpenses}
          totalIncome={data.monthlyIncome}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader
          actionLabel="Details"
          actionTestID="insights-link"
          onAction={() => router.push("/insights")}
          title="Spending by Category"
        />

        <SpendingDonutCard segments={spendingByCategory} total={totalSpentByCategory} />
      </View>

      {showAccountChart ? (
        <View style={styles.section}>
          <SectionHeader title="Spending by Account" />
          <SpendingDonutCard segments={spendingByAccount} total={totalSpentByAccount} />
        </View>
      ) : null}

      <RecentTransactions transactions={recentTransactions} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  heroShell: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
});
