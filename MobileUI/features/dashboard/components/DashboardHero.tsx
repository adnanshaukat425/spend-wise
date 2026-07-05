import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ProgressBar } from "@/components/charts/ProgressBar";
import type { BudgetSummary, UserProfile } from "@/data/types";
import { calculateBudgetMetrics } from "@/domain/budget";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/lib/format";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardHero({
  budgetSummary,
  hasUnreadNotifications,
  onAccountsPress,
  onManageBudgetPress,
  onNotificationsPress,
  topInset,
  user,
}: {
  budgetSummary: BudgetSummary;
  hasUnreadNotifications: boolean;
  onAccountsPress: () => void;
  onManageBudgetPress: () => void;
  onNotificationsPress: () => void;
  topInset: number;
  user: UserProfile;
}) {
  const colors = useColors();
  const greeting = getGreeting();

  const budgetMetrics = useMemo(
    () =>
      calculateBudgetMetrics({
        daysRemaining: budgetSummary.daysRemaining,
        totalBudget: budgetSummary.totalBudget,
        totalSpent: budgetSummary.totalSpent,
      }),
    [budgetSummary],
  );

  return (
    <View style={[styles.heroContent, { paddingTop: topInset + 12 }]}>
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
          onPress={onNotificationsPress}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          testID="notifications-btn"
        >
          <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
          {hasUnreadNotifications ? (
            <View
              style={[styles.bellDot, { borderColor: colors.heroBackground }]}
            />
          ) : null}
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
          onPress={onAccountsPress}
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
            style={styles.accountsChevron}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.budgetSection}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetTitle}>Monthly Budget</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onManageBudgetPress}
            testID="manage-budget-btn"
          >
            <Text style={[styles.budgetLink, { color: colors.primary }]}>
              Manage
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.budgetCard,
            { backgroundColor: colors.heroCardBackground },
          ]}
        >
          <View style={styles.budgetSpentRow}>
            <Text style={styles.budgetSpentLabel}>Spent</Text>
            <Text style={styles.budgetSpentValue}>
              {formatCurrency(budgetSummary.totalSpent)} /{" "}
              {formatCurrency(budgetSummary.totalBudget)}
            </Text>
          </View>
          <ProgressBar
            percent={budgetMetrics.spentPercent}
            color={colors.success}
            trackColor="rgba(255,255,255,0.12)"
          />
          <View style={styles.budgetStatsRow}>
            <View style={styles.budgetStatBox}>
              <Ionicons name="flash-outline" size={16} color={colors.warning} />
              <Text style={styles.budgetStatLabel}>Daily limit</Text>
              <Text style={styles.budgetStatValue}>
                {formatCurrency(budgetMetrics.dailyAllowance)}
              </Text>
            </View>
            <View style={styles.budgetStatBox}>
              <Ionicons
                name="trending-up-outline"
                size={16}
                color={colors.success}
              />
              <Text style={styles.budgetStatLabel}>Days left</Text>
              <Text style={styles.budgetStatValue}>
                {budgetMetrics.daysRemaining} days
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContent: {
    paddingHorizontal: 20,
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
  },
  balanceSection: { marginBottom: 20 },
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
  },
  accountsChevron: { marginLeft: "auto" },
  accountsText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.75)",
  },
  budgetSection: { gap: 12, marginBottom: 16 },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  budgetLink: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  budgetCard: {
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  budgetSpentRow: { flexDirection: "row", justifyContent: "space-between" },
  budgetSpentLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
  },
  budgetSpentValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  budgetStatsRow: { flexDirection: "row", gap: 12 },
  budgetStatBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  budgetStatLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
  },
  budgetStatValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
});
