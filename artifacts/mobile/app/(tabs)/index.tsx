import { Ionicons } from "@expo/vector-icons";
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
import { ProgressBar } from "@/components/charts/ProgressBar";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard, useNotifications } from "@/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import type { BudgetSummary } from "@/data/types";
import { defaultBudgetSummary, mapUserProfile } from "@/lib/mappers";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const { user: authUser } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, isFetching } = useDashboard();
  const { data: notifications = [] } = useNotifications();

  const handleRefresh = React.useCallback(() => {
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }, [qc]);

  const user = authUser ? mapUserProfile(authUser, data?.raw) : null;
  const spendingByCategory = data?.spendingByCategory ?? [];
  const recentTransactions = data?.recentTransactions ?? [];
  const hasUnreadNotifications = notifications.some((n) => !n.read);
  const greeting = getGreeting();
  const totalIncome = data?.monthlyIncome ?? 0;
  const totalExpenses = data?.monthlyExpenses ?? 0;
  const budgetSummary: BudgetSummary =
    data?.budgetSummary ?? defaultBudgetSummary();

  const totalSpent = useMemo(
    () => spendingByCategory.reduce((s, c) => s + c.amount, 0),
    [spendingByCategory],
  );

  if (isLoading || !user) {
    return <ScreenLoading />;
  }

  const budgetPct = Math.round(
    (budgetSummary.totalSpent / budgetSummary.totalBudget) * 100,
  );
  const remaining = budgetSummary.totalBudget - budgetSummary.totalSpent;
  const dailyLimit =
    budgetSummary.daysRemaining > 0
      ? remaining / budgetSummary.daysRemaining
      : 0;

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
      <View style={[styles.heroCard, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{user.initials}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.7}
            onPress={() => router.push("/notifications" as Href)}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            testID="notifications-btn"
          >
            <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            {hasUnreadNotifications && <View style={styles.bellDot} />}
          </TouchableOpacity>
        </View>

        <View style={styles.balanceSection}>
          <View style={styles.balanceTopRow}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <View style={styles.changeBadge}>
              <Ionicons name="arrow-up" size={12} color="#22C55E" />
              <Text style={styles.changeText}>+{user.balanceChangePct}%</Text>
            </View>
          </View>
          <Text style={styles.balanceValue} testID="dashboard-balance">
            {formatCurrency(user.balance)}
          </Text>

          <TouchableOpacity
            style={styles.accountsRow}
            activeOpacity={0.7}
            onPress={() => router.push("/accounts" as Href)}
            testID="accounts-btn"
          >
            <Ionicons
              name="card-outline"
              size={16}
              color="rgba(255,255,255,0.6)"
            />
            <Text style={styles.accountsText}>
              {user.accountsConnected} Accounts Connected
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color="rgba(255,255,255,0.5)"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={styles.statIconRow}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: "rgba(34,197,94,0.2)" },
                  ]}
                >
                  <Ionicons name="arrow-down" size={12} color="#22C55E" />
                </View>
                <Text style={styles.statLabel}>Income</Text>
              </View>
              <Text style={styles.statValue}>
                {formatCurrency(totalIncome, { compact: true })}
              </Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statIconRow}>
                <View
                  style={[
                    styles.statIcon,
                    { backgroundColor: "rgba(239,68,68,0.2)" },
                  ]}
                >
                  <Ionicons name="arrow-up" size={12} color="#EF4444" />
                </View>
                <Text style={styles.statLabel}>Expenses</Text>
              </View>
              <Text style={styles.statValue}>
                {formatCurrency(totalExpenses, { compact: true })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Spending by Category
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/insights")}
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Recent Transactions
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/expenses")}
            testID="see-all-transactions-btn"
          >
            <Text style={[styles.sectionLink, { color: colors.primary }]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.listCard, { backgroundColor: colors.card }]}>
          {recentTransactions.length === 0 && (
            <View style={styles.emptyRow}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No transactions yet. Tap + to add one.
              </Text>
            </View>
          )}
          {recentTransactions.map((tx, i) => (
            <View key={tx.id}>
              <TransactionRow
                transaction={tx}
                showChevron
                onPress={() =>
                  router.push(`/transaction/${tx.id}` as Href)
                }
              />
              {i < recentTransactions.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Monthly Budget
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/budget")}
            testID="manage-budget-btn"
          >
            <Text style={[styles.sectionLink, { color: colors.primary }]}>
              Manage
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.budgetCard, { backgroundColor: colors.card }]}>
          <View style={styles.budgetSpentRow}>
            <Text
              style={[styles.budgetSpentLabel, { color: colors.mutedForeground }]}
            >
              Spent
            </Text>
            <Text style={[styles.budgetSpentValue, { color: colors.foreground }]}>
              {formatCurrency(budgetSummary.totalSpent)} /{" "}
              {formatCurrency(budgetSummary.totalBudget)}
            </Text>
          </View>
          <ProgressBar
            percent={budgetPct}
            color={colors.success}
            trackColor={colors.muted}
          />
          <View style={styles.budgetStatsRow}>
            <View
              style={[styles.budgetStatBox, { backgroundColor: colors.muted }]}
            >
              <Ionicons name="flash-outline" size={16} color={colors.warning} />
              <Text
                style={[
                  styles.budgetStatLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                Daily limit
              </Text>
              <Text style={[styles.budgetStatValue, { color: colors.foreground }]}>
                {formatCurrency(dailyLimit)}
              </Text>
            </View>
            <View
              style={[styles.budgetStatBox, { backgroundColor: colors.muted }]}
            >
              <Ionicons
                name="trending-up-outline"
                size={16}
                color={colors.success}
              />
              <Text
                style={[
                  styles.budgetStatLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                Days left
              </Text>
              <Text style={[styles.budgetStatValue, { color: colors.foreground }]}>
                {budgetSummary.daysRemaining} days
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const HERO_BG = "#15202B";
const HERO_CARD_BG = "#1C2B3A";

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroCard: {
    backgroundColor: HERO_BG,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  greeting: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    marginBottom: 1,
  },
  userName: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: HERO_BG,
  },
  balanceSection: { marginBottom: 0 },
  balanceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 3,
  },
  changeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#22C55E" },
  balanceValue: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  accountsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 16,
  },
  accountsText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.75)",
  },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: HERO_CARD_BG,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  statIconRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
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
  listCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: { height: 1, marginHorizontal: 16 },
  emptyRow: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  budgetCard: {
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetSpentRow: { flexDirection: "row", justifyContent: "space-between" },
  budgetSpentLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  budgetSpentValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  budgetStatsRow: { flexDirection: "row", gap: 12 },
  budgetStatBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  budgetStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  budgetStatValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
