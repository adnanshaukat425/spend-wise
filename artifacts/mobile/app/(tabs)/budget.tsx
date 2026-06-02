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

const BUDGETS = [
  { id: "1", name: "Food & Dining", icon: "restaurant-outline" as const, iconFamily: "Ionicons", color: "#F59E0B", spent: 340, total: 500 },
  { id: "2", name: "Transport", icon: "car-outline" as const, iconFamily: "Ionicons", color: "#3B82F6", spent: 120, total: 200 },
  { id: "3", name: "Entertainment", icon: "film-outline" as const, iconFamily: "Ionicons", color: "#EC4899", spent: 85, total: 150 },
  { id: "4", name: "Shopping", icon: "bag-outline" as const, iconFamily: "Ionicons", color: "#8B5CF6", spent: 200, total: 300 },
  { id: "5", name: "Bills", icon: "flash-outline" as const, iconFamily: "Ionicons", color: "#EF4444", spent: 380, total: 400 },
  { id: "6", name: "Health", icon: "fitness-outline" as const, iconFamily: "Ionicons", color: "#10B981", spent: 60, total: 150 },
];

function BudgetBar({ spent, total, color }: { spent: number; total: number; color: string }) {
  const pct = Math.min((spent / total) * 100, 100);
  const overBudget = spent > total;
  const colors = useColors();
  return (
    <View style={[styles.progressBg, { backgroundColor: colors.secondary }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${pct}%` as any, backgroundColor: overBudget ? colors.expense : color },
        ]}
      />
    </View>
  );
}

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const totalBudget = BUDGETS.reduce((sum, b) => sum + b.total, 0);
  const totalSpent = BUDGETS.reduce((sum, b) => sum + b.spent, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Budget</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: botPad + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.overviewCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.overviewLabel}>Monthly Budget</Text>
          <Text style={styles.overviewValue}>${totalBudget.toLocaleString()}</Text>
          <View style={styles.overviewRow}>
            <Text style={styles.overviewSub}>Spent ${totalSpent.toLocaleString()}</Text>
            <Text style={styles.overviewSub}>Remaining ${(totalBudget - totalSpent).toLocaleString()}</Text>
          </View>
          <View style={styles.overviewProgressBg}>
            <View
              style={[
                styles.overviewProgressFill,
                { width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` as any },
              ]}
            />
          </View>
          <Text style={styles.overviewPct}>
            {Math.round((totalSpent / totalBudget) * 100)}% used
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Categories</Text>

        {BUDGETS.map((b) => {
          const pct = Math.round((b.spent / b.total) * 100);
          const over = b.spent > b.total;
          return (
            <TouchableOpacity
              key={b.id}
              style={[styles.budgetCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.budgetTop}>
                <View style={[styles.budgetIcon, { backgroundColor: b.color + "20" }]}>
                  <Ionicons name={b.icon} size={20} color={b.color} />
                </View>
                <View style={styles.budgetInfo}>
                  <Text style={[styles.budgetName, { color: colors.foreground }]}>{b.name}</Text>
                  <Text style={[styles.budgetAmounts, { color: colors.mutedForeground }]}>
                    ${b.spent} of ${b.total}
                  </Text>
                </View>
                <View style={styles.budgetRight}>
                  <Text
                    style={[
                      styles.budgetPct,
                      { color: over ? colors.expense : pct >= 80 ? colors.warning : colors.primary },
                    ]}
                  >
                    {pct}%
                  </Text>
                  {over && (
                    <Text style={[styles.overBudgetLabel, { color: colors.expense }]}>Over</Text>
                  )}
                </View>
              </View>
              <BudgetBar spent={b.spent} total={b.total} color={b.color} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  overviewCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    shadowColor: "#2E7D52",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  overviewLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  overviewSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  overviewProgressBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    marginBottom: 8,
  },
  overviewProgressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  overviewPct: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.75)",
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  budgetCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  budgetTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  budgetIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  budgetInfo: { flex: 1 },
  budgetName: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 2 },
  budgetAmounts: { fontSize: 12, fontFamily: "Inter_400Regular" },
  budgetRight: { alignItems: "flex-end" },
  budgetPct: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  overBudgetLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  progressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
});
