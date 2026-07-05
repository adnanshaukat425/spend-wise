import { useRouter, type Href } from "expo-router";
import React from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";

import { DonutChart } from "@/components/charts/DonutChart";
import { Card } from "@/components/ui/Card";
import { QueryScreenBoundary } from "@/components/ui/QueryScreenBoundary";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { ScreenScrollView } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { spacing, typography } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { formatCurrency } from "@/lib/format";
import { defaultBudgetSummary, mapUserProfile } from "@/lib/mappers";
import { queryKeys } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/features/notifications/queries";

import { DashboardHero } from "../components/DashboardHero";
import { DashboardMetrics } from "../components/DashboardMetrics";
import { RecentTransactions } from "../components/RecentTransactions";
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

  const user = mapUserProfile(authUser, data.raw);
  const spendingByCategory = data.spendingByCategory;
  const recentTransactions = data.recentTransactions;
  const hasUnreadNotifications = notifications.some((notification) => !notification.read);
  const budgetSummary = data.budgetSummary ?? defaultBudgetSummary();
  const totalSpent = spendingByCategory.reduce((sum, category) => sum + category.amount, 0);

  const handleRefresh = React.useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.dashboard });
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

        <Card style={styles.chartCard}>
          <View style={styles.chartRow}>
            <DonutChart
              centerLabel="Total"
              centerValue={formatCurrency(totalSpent, { compact: true })}
              segments={spendingByCategory}
              size={140}
            />
            <View style={styles.legendGrid}>
              {spendingByCategory.map((category) => (
                <View key={category.id} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: category.color }]} />
                  <View>
                    <Text style={[styles.legendName, { color: colors.foreground }]}>
                      {category.name}
                    </Text>
                    <Text style={[styles.legendAmount, { color: colors.mutedForeground }]}>
                      {formatCurrency(category.amount, { compact: true })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Card>
      </View>

      <RecentTransactions transactions={recentTransactions} />
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    overflow: "hidden",
  },
  chartRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  heroShell: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: spacing.xl,
  },
  legendAmount: {
    ...typography.caption,
  },
  legendDot: {
    borderRadius: 4,
    height: 8,
    marginTop: 3,
    width: 8,
  },
  legendGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  legendItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 6,
    width: "46%",
  },
  legendName: {
    ...typography.label,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
});
