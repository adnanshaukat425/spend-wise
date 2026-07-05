import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BarChart } from "@/components/charts/BarChart";
import { QueryScreenBoundary } from "@/components/ui/QueryScreenBoundary";
import { Screen, ScreenScrollView } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { spacing, typography } from "@/constants/theme";
import { calculateSavingsRate } from "@/domain/budget";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/lib/format";
import { useDashboard } from "@/features/dashboard/queries";

import { useInsights, useWeeklySpend } from "../queries";

export default function InsightsScreen() {
  const insightsQuery = useInsights();
  const dashboardQuery = useDashboard();
  const weeklySpendQuery = useWeeklySpend();

  return (
    <QueryScreenBoundary
      loadingLabel="Loading insights"
      queries={[insightsQuery, dashboardQuery, weeklySpendQuery]}
    >
      <InsightsScreenBody
        dashboard={dashboardQuery.data}
        insights={insightsQuery.data ?? []}
        weeklySpend={weeklySpendQuery.data ?? []}
      />
    </QueryScreenBoundary>
  );
}

function InsightsScreenBody({
  dashboard,
  insights,
  weeklySpend,
}: {
  dashboard: ReturnType<typeof useDashboard>["data"];
  insights: NonNullable<ReturnType<typeof useInsights>["data"]>;
  weeklySpend: NonNullable<ReturnType<typeof useWeeklySpend>["data"]>;
}) {
  const router = useRouter();
  const colors = useColors();

  const barData = useMemo(
    () => weeklySpend.map((entry) => ({ label: entry.day, value: entry.amount })),
    [weeklySpend],
  );

  const topCategory = dashboard?.spendingByCategory?.[0];
  const monthlyIncome = dashboard?.monthlyIncome ?? 0;
  const monthlyExpenses = dashboard?.monthlyExpenses ?? 0;
  const savingsRate = calculateSavingsRate(monthlyIncome, monthlyExpenses);
  const weeklyTotal = weeklySpend.reduce((sum, entry) => sum + entry.amount, 0);
  const avgDaily = weeklySpend.length > 0 ? weeklyTotal / weeklySpend.length : 0;

  const monthlySummary = [
    {
      color: colors.primary,
      icon: "calendar-outline" as const,
      label: "Avg Daily Spend",
      value: formatCurrency(avgDaily),
    },
    {
      color: colors.success,
      icon: "pie-chart-outline" as const,
      label: "Savings Rate",
      value: `${savingsRate}%`,
    },
    {
      color: colors.warning,
      icon: "restaurant-outline" as const,
      label: "Top Category",
      value: topCategory?.name ?? "—",
    },
  ];

  return (
    <Screen padded={false}>
      <View style={styles.headerWrap}>
        <ScreenHeader onBack={() => router.back()} title="Insights" />
      </View>

      <ScreenScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <View style={[styles.aiBadge, { backgroundColor: colors.secondary }]}>
            <Ionicons color={colors.primary} name="sparkles" size={14} />
            <Text style={[styles.aiBadgeText, { color: colors.primary }]}>AI</Text>
          </View>
        </View>

      <View style={styles.statsRow}>
        {monthlySummary.map((stat) => (
          <View
            key={stat.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}>
              <Ionicons color={stat.color} name={stat.icon} size={18} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Weekly Spending" />
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <BarChart
            barColor={colors.primary}
            data={barData}
            labelColor={colors.mutedForeground}
            valueColor={colors.mutedForeground}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="AI Recommendations" />

        {insights.map((insight) => (
          <TouchableOpacity
            key={insight.id}
            activeOpacity={0.7}
            onPress={() => Alert.alert(insight.title, insight.body, [{ text: "OK" }])}
            style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.insightHeader}>
              <View style={[styles.insightIconCircle, { backgroundColor: insight.bgColor }]}>
                <Ionicons color={insight.iconColor} name={insight.icon} size={20} />
              </View>
              <View style={styles.insightMeta}>
                <Text style={[styles.insightTitle, { color: colors.foreground }]}>
                  {insight.title}
                </Text>
                <View style={[styles.insightTag, { backgroundColor: insight.bgColor }]}>
                  <Text style={[styles.insightTagText, { color: insight.iconColor }]}>
                    {insight.tag}
                  </Text>
                </View>
              </View>
              <Ionicons color={colors.mutedForeground} name="chevron-forward" size={18} />
            </View>
            <Text style={[styles.insightBody, { color: colors.mutedForeground }]}>
              {insight.body}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/(tabs)/ai")}
        style={[styles.aiLink, { backgroundColor: colors.secondary }]}
      >
        <Ionicons color={colors.primary} name="sparkles" size={18} />
        <Text style={[styles.aiLinkText, { color: colors.primary }]}>View AI Insights</Text>
      </TouchableOpacity>
      </ScreenScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  aiBadge: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  aiBadgeText: { ...typography.caption, fontFamily: "Inter_600SemiBold" },
  aiLink: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginBottom: spacing.xl,
    paddingVertical: 14,
  },
  aiLinkText: { ...typography.bodySemibold, fontSize: 14 },
  chartCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
  },
  content: {
    paddingTop: 0,
  },
  headerWrap: {
    paddingHorizontal: spacing.xxl,
  },
  titleRow: {
    alignItems: "flex-end",
    marginBottom: spacing.lg,
  },
  insightBody: { ...typography.caption, lineHeight: 19 },
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  insightHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  insightIconCircle: {
    alignItems: "center",
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  insightMeta: { flex: 1, gap: 4 },
  insightTag: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  insightTagText: { fontFamily: "Inter_500Medium", fontSize: 10 },
  insightTitle: { ...typography.bodySemibold, fontSize: 14 },
  section: {
    marginBottom: spacing.xl,
  },
  statCard: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    padding: spacing.md,
  },
  statIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    textAlign: "center",
  },
  statValue: { ...typography.bodySemibold, fontSize: 16 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: spacing.xxl,
  },
});
