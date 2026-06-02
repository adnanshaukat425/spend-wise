import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const INSIGHTS = [
  {
    id: "1",
    type: "tip",
    title: "Cut Food Spending",
    body: "You spent 32% more on dining out this month. Cooking at home 3 more times a week could save you $120/month.",
    icon: "restaurant-outline" as const,
    iconColor: "#F59E0B",
    bgColor: "#FEF3C7",
    tag: "Savings",
  },
  {
    id: "2",
    type: "alert",
    title: "Bills Budget Alert",
    body: "You're at 95% of your Bills budget. Consider reviewing subscriptions — you may have unused services.",
    icon: "warning-outline" as const,
    iconColor: "#EF4444",
    bgColor: "#FEE2E2",
    tag: "Alert",
  },
  {
    id: "3",
    type: "positive",
    title: "Great Saving Streak!",
    body: "You saved $480 more than last month. Keep it up — you're on track to reach your emergency fund goal in 3 months.",
    icon: "trending-up-outline" as const,
    iconColor: "#10B981",
    bgColor: "#D1FAE5",
    tag: "Achievement",
  },
  {
    id: "4",
    type: "tip",
    title: "Investment Opportunity",
    body: "Based on your savings rate, investing $200/month in an index fund could grow to $48,000 in 10 years.",
    icon: "analytics-outline" as const,
    iconColor: "#3B82F6",
    bgColor: "#DBEAFE",
    tag: "Growth",
  },
];

const MONTHLY_SUMMARY = [
  { label: "Avg Daily Spend", value: "$41.20", icon: "calendar-outline" as const, color: "#8B5CF6" },
  { label: "Savings Rate", value: "22%", icon: "pie-chart-outline" as const, color: "#10B981" },
  { label: "Top Category", value: "Food", icon: "restaurant-outline" as const, color: "#F59E0B" },
];

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Insights</Text>
        <View style={[styles.aiBadge, { backgroundColor: colors.secondary }]}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={[styles.aiBadgeText, { color: colors.primary }]}>AI</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {MONTHLY_SUMMARY.map((stat) => (
          <View
            key={stat.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}>
              <Ionicons name={stat.icon} size={18} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          AI Recommendations
        </Text>

        {INSIGHTS.map((insight) => (
          <TouchableOpacity
            key={insight.id}
            style={[
              styles.insightCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.insightHeader}>
              <View style={[styles.insightIconCircle, { backgroundColor: insight.bgColor }]}>
                <Ionicons name={insight.icon} size={20} color={insight.iconColor} />
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
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.insightBody, { color: colors.mutedForeground }]}>
              {insight.body}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
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
});
