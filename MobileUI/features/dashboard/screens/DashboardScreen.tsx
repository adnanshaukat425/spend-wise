import { useRouter, type Href } from "expo-router";
import React, { useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { DonutChart } from "@/components/charts/DonutChart";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard, useNotifications } from "../api";
import { DashboardHero } from "../components/DashboardHero";
import { DashboardMetrics } from "../components/DashboardMetrics";
import { RecentTransactions } from "../components/RecentTransactions";
import { useQueryClient } from "@tanstack/react-query";
import { defaultBudgetSummary, mapUserProfile } from "@/lib/mappers";
import { formatCurrency } from "@/lib/format";
import { queryKeys } from "@/lib/query";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

export default function DashboardScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const { user: authUser } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, isFetching, isError, error, refetch } = useDashboard();
  const { data: notifications = [] } = useNotifications();

  const handleRefresh = React.useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    qc.invalidateQueries({ queryKey: queryKeys.notifications() });
  }, [qc]);

  const user = authUser ? mapUserProfile(authUser, data?.raw) : null;
  const spendingByCategory = data?.spendingByCategory ?? [];
  const recentTransactions = data?.recentTransactions ?? [];
  const hasUnreadNotifications = notifications.some((n) => !n.read);
  const totalIncome = data?.monthlyIncome ?? 0;
  const totalExpenses = data?.monthlyExpenses ?? 0;
  const budgetSummary = data?.budgetSummary ?? defaultBudgetSummary();

  const totalSpent = useMemo(
    () => spendingByCategory.reduce((s, c) => s + c.amount, 0),
    [spendingByCategory],
  );

  if (isLoading || !user) {
    return <ScreenLoading />;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !isLoading}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View
        style={[
          styles.heroShell,
          { backgroundColor: colors.heroBackground },
        ]}
      >
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
          totalExpenses={totalExpenses}
          totalIncome={totalIncome}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Spending by Category
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/insights")}
            testID="insights-link"
          >
            <Text style={[styles.sectionLink, { color: colors.primary }]}>
              Details
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <View style={styles.chartRow}>
            <DonutChart
              segments={spendingByCategory}
              size={140}
              centerLabel="Total"
              centerValue={formatCurrency(totalSpent, { compact: true })}
            />
            <View style={styles.legendGrid}>
              {spendingByCategory.map((cat) => (
                <View key={cat.name} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: cat.color }]}
                  />
                  <View>
                    <Text
                      style={[styles.legendName, { color: colors.foreground }]}
                    >
                      {cat.name}
                    </Text>
                    <Text
                      style={[
                        styles.legendAmount,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {formatCurrency(cat.amount, { compact: true })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <RecentTransactions transactions={recentTransactions} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroShell: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sectionLink: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  chartRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  legendGrid: { flex: 1, flexWrap: "wrap", flexDirection: "row", gap: 10 },
  legendItem: {
    width: "46%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginTop: 3 },
  legendName: { fontSize: 12, fontFamily: "Inter_500Medium" },
  legendAmount: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
