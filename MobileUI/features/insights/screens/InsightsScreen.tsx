import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BarChart } from "@/components/charts/BarChart";
import { ErrorState } from "@/components/ui/ErrorState";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { useDashboard, useInsights, useWeeklySpend } from "../api";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

export default function InsightsScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const { data: insights = [], isLoading: insightsLoading, isError: insightsError, error: insightsQueryError, refetch: refetchInsights } = useInsights();
  const { data: weeklySpend = [] } = useWeeklySpend();
  const { data: dashboard, isLoading: dashboardLoading, isError: dashboardError, error: dashboardQueryError, refetch: refetchDashboard } = useDashboard();

  const barData = useMemo(
    () => weeklySpend.map((d) => ({ label: d.day, value: d.amount })),
    [weeklySpend],
  );

  const topCategory = dashboard?.spendingByCategory?.[0];
  const monthlyIncome = dashboard?.monthlyIncome ?? 0;
  const monthlyExpenses = dashboard?.monthlyExpenses ?? 0;
  const savingsRate =
    monthlyIncome > 0
      ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
      : 0;
  const weeklyTotal = weeklySpend.reduce((s, d) => s + d.amount, 0);
  const avgDaily =
    weeklySpend.length > 0 ? weeklyTotal / weeklySpend.length : 0;

  const monthlySummary = [
    {
      label: "Avg Daily Spend",
      value: formatCurrency(avgDaily),
      icon: "calendar-outline" as const,
      color: "#8B5CF6",
    },
    {
      label: "Savings Rate",
      value: `${savingsRate}%`,
      icon: "pie-chart-outline" as const,
      color: "#10B981",
    },
    {
      label: "Top Category",
      value: topCategory?.name ?? "—",
      icon: "restaurant-outline" as const,
      color: "#F59E0B",
    },
  ];

  if (insightsLoading || dashboardLoading) {
    return <ScreenLoading />;
  }

  if (insightsError || dashboardError) {
    return (
      <ErrorState
        error={insightsQueryError ?? dashboardQueryError}
        onRetry={() => {
          void refetchInsights();
          void refetchDashboard();
        }}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Insights
        </Text>
        <View style={[styles.aiBadge, { backgroundColor: colors.secondary }]}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={[styles.aiBadgeText, { color: colors.primary }]}>
            AI
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {monthlySummary.map((stat) => (
          <View
            key={stat.label}
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View
              style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}
            >
              <Ionicons name={stat.icon} size={18} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Weekly Spending
        </Text>
        <View
          style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <BarChart
            data={barData}
            barColor={colors.primary}
            labelColor={colors.mutedForeground}
            valueColor={colors.mutedForeground}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          AI Recommendations
        </Text>

        {insights.map((insight) => (
          <TouchableOpacity
            key={insight.id}
            style={[
              styles.insightCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert(insight.title, insight.body, [{ text: "OK" }])
            }
          >
            <View style={styles.insightHeader}>
              <View
                style={[
                  styles.insightIconCircle,
                  { backgroundColor: insight.bgColor },
                ]}
              >
                <Ionicons
                  name={insight.icon}
                  size={20}
                  color={insight.iconColor}
                />
              </View>
              <View style={styles.insightMeta}>
                <Text style={[styles.insightTitle, { color: colors.foreground }]}>
                  {insight.title}
                </Text>
                <View
                  style={[
                    styles.insightTag,
                    { backgroundColor: insight.bgColor },
                  ]}
                >
                  <Text
                    style={[styles.insightTagText, { color: insight.iconColor }]}
                  >
                    {insight.tag}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.mutedForeground}
              />
            </View>
            <Text style={[styles.insightBody, { color: colors.mutedForeground }]}>
              {insight.body}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.aiLink, { backgroundColor: colors.secondary }]}
        onPress={() => router.push("/(tabs)/ai")}
        activeOpacity={0.8}
      >
        <Ionicons name="sparkles" size={18} color={colors.primary} />
        <Text style={[styles.aiLinkText, { color: colors.primary }]}>
          View AI Insights
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  aiBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  insightIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  insightMeta: { flex: 1, gap: 4 },
  insightTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  insightTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  insightTagText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  insightBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  aiLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  aiLinkText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
