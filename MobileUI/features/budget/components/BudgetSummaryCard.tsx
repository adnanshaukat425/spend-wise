import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { CircularProgress } from "@/components/charts/CircularProgress";
import type { BudgetSummary } from "@/data/types";
import {
  calculateBudgetMetrics,
  getBudgetStatusTone,
} from "@/domain/budget";
import { getCurrentMonthPeriod } from "@/domain/dates";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";

export interface BudgetSummaryCardProps {
  summary: BudgetSummary;
}

export function BudgetSummaryCard({ summary }: BudgetSummaryCardProps) {
  const colors = useColors();
  const metrics = calculateBudgetMetrics({
    totalBudget: summary.totalBudget,
    totalSpent: summary.totalSpent,
    daysRemaining: summary.daysRemaining,
  });
  const tone = getBudgetStatusTone(metrics);
  const progressColor =
    tone === "danger"
      ? colors.expense
      : tone === "warning"
        ? colors.warning
        : colors.primary;

  const daysInMonth = getCurrentMonthPeriod().endsAt.getDate();
  const daysElapsed = Math.max(1, daysInMonth - metrics.daysRemaining);
  const dailyAvg = summary.totalSpent / daysElapsed;

  return (
    <View style={[styles.heroCard, { backgroundColor: colors.secondary }]}>
      <View style={styles.heroTopRow}>
        <Text style={[styles.heroMonth, { color: colors.mutedForeground }]}>
          {summary.monthLabel}
        </Text>
        <View style={[styles.remainBadge, { backgroundColor: colors.card }]}>
          <Ionicons
            name="trending-down-outline"
            size={12}
            color={progressColor}
          />
          <Text style={[styles.remainText, { color: progressColor }]}>
            {formatCurrency(metrics.remaining)} left
          </Text>
        </View>
      </View>

      <Text
        style={[styles.heroSpent, { color: colors.foreground }]}
        testID="budget-total-spent"
      >
        {formatCurrency(summary.totalSpent)}
        <Text style={[styles.heroTotal, { color: colors.mutedForeground }]}>
          {" "}
          / {formatCurrency(summary.totalBudget)}
        </Text>
      </Text>

      <View style={styles.heroBody}>
        <CircularProgress
          percent={metrics.spentPercent}
          size={86}
          trackColor={colors.circleOuter}
          progressColor={progressColor}
          labelColor={progressColor}
        />
        <View style={styles.heroStats}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Daily Average
            </Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {formatCurrency(dailyAvg)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Days Remaining
            </Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {metrics.daysRemaining} days
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Safe to Spend
            </Text>
            <Text style={[styles.statValue, { color: progressColor }]}>
              {formatCurrency(metrics.dailyAllowance)}/day
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: { borderRadius: 20, padding: 20, marginBottom: 24 },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  heroMonth: { fontSize: 13, fontFamily: "Inter_400Regular" },
  remainBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  remainText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  heroSpent: { fontSize: 30, fontFamily: "Inter_700Bold", marginBottom: 18 },
  heroTotal: { fontSize: 18, fontFamily: "Inter_400Regular" },
  heroBody: { flexDirection: "row", alignItems: "center", gap: 20 },
  heroStats: { flex: 1, gap: 10 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
