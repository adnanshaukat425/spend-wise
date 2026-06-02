import { Ionicons } from "@expo/vector-icons";
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
    title: "Cut Food Spending",
    body: "You spent 32% more on dining out this month. Cooking at home 3 more times a week could save you $120/month.",
    icon: "restaurant-outline" as const,
    iconColor: "#F59E0B",
    bgColor: "#FEF3C7",
    tag: "Savings",
    tagColor: "#F59E0B",
  },
  {
    id: "2",
    title: "Bills Budget Alert",
    body: "You're at 95% of your Bills budget. Consider reviewing subscriptions — you may have unused services.",
    icon: "warning-outline" as const,
    iconColor: "#EF4444",
    bgColor: "#FEE2E2",
    tag: "Alert",
    tagColor: "#EF4444",
  },
  {
    id: "3",
    title: "Great Saving Streak!",
    body: "You saved $480 more than last month. You're on track to reach your emergency fund goal in 3 months.",
    icon: "trending-up-outline" as const,
    iconColor: "#10B981",
    bgColor: "#D1FAE5",
    tag: "Achievement",
    tagColor: "#10B981",
  },
  {
    id: "4",
    title: "Investment Opportunity",
    body: "Based on your savings rate, investing $200/month in an index fund could grow to $48,000 in 10 years.",
    icon: "analytics-outline" as const,
    iconColor: "#3B82F6",
    bgColor: "#DBEAFE",
    tag: "Growth",
    tagColor: "#3B82F6",
  },
];

export default function AIScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: "#F8F9FB" }]}
      contentContainerStyle={{ paddingBottom: botPad + 110 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={styles.title}>AI Insights</Text>
          <Text style={styles.subtitle}>Personalized for you</Text>
        </View>
        <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.proText}>PRO</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.statsRow}>
          {[
            { label: "Avg Daily Spend", value: "$41.20", icon: "calendar-outline" as const, color: "#8B5CF6" },
            { label: "Savings Rate", value: "22%", icon: "pie-chart-outline" as const, color: "#10B981" },
            { label: "Top Category", value: "Food", icon: "restaurant-outline" as const, color: "#F59E0B" },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}>
                <Ionicons name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {INSIGHTS.map((insight) => (
          <TouchableOpacity key={insight.id} style={styles.insightCard} activeOpacity={0.7}>
            <View style={styles.insightHeader}>
              <View style={[styles.insightIcon, { backgroundColor: insight.bgColor }]}>
                <Ionicons name={insight.icon} size={20} color={insight.iconColor} />
              </View>
              <View style={styles.insightMeta}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <View style={[styles.tag, { backgroundColor: insight.bgColor }]}>
                  <Text style={[styles.tagText, { color: insight.tagColor }]}>{insight.tag}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </View>
            <Text style={styles.insightBody}>{insight.body}</Text>
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
    paddingBottom: 20,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#111827" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6B7280", marginTop: 2 },
  proBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  proText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#111827" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#6B7280", textAlign: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 12 },
  insightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    gap: 10,
  },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  insightMeta: { flex: 1, gap: 4 },
  insightTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#111827" },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start" },
  tagText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  insightBody: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6B7280", lineHeight: 19 },
});
