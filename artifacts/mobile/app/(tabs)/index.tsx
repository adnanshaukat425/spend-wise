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

const QUICK_STATS = [
  { label: "Total Balance", value: "$12,480.00", change: "+2.4%", positive: true },
  { label: "This Month", value: "-$1,240.50", change: "Spending", positive: false },
];

const RECENT_EXPENSES = [
  { id: "1", name: "Grocery Store", category: "Food", amount: -85.40, icon: "cart-outline" as const, date: "Today" },
  { id: "2", name: "Salary", category: "Income", amount: 3200.00, icon: "briefcase-outline" as const, date: "Yesterday" },
  { id: "3", name: "Netflix", category: "Entertainment", amount: -15.99, icon: "tv-outline" as const, date: "Jun 1" },
  { id: "4", name: "Coffee Shop", category: "Food", amount: -6.50, icon: "cafe-outline" as const, date: "Jun 1" },
];

export default function HomeScreen() {
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
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good morning</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>Dashboard</Text>
        </View>
        <TouchableOpacity
          style={[styles.avatarBtn, { backgroundColor: colors.secondary }]}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>$12,480.00</Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceStat}>
            <Ionicons name="arrow-down-circle-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.balanceStatText}>Income $3,200</Text>
          </View>
          <View style={[styles.balanceDivider]} />
          <View style={styles.balanceStat}>
            <Ionicons name="arrow-up-circle-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.balanceStatText}>Spent $1,240</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
        <View style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {RECENT_EXPENSES.map((item, index) => (
            <View key={item.id}>
              <View style={styles.transactionRow}>
                <View style={[styles.transactionIcon, { backgroundColor: item.amount > 0 ? colors.successLight : colors.secondary }]}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.amount > 0 ? colors.success : colors.primary}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionName, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.transactionCategory, { color: colors.mutedForeground }]}>{item.category} · {item.date}</Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: item.amount > 0 ? colors.success : colors.expense },
                  ]}
                >
                  {item.amount > 0 ? "+" : ""}
                  {item.amount.toFixed(2)}
                </Text>
              </View>
              {index < RECENT_EXPENSES.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Budget Overview</Text>
        {[
          { name: "Food & Dining", spent: 340, total: 500, color: "#F59E0B" },
          { name: "Transport", spent: 120, total: 200, color: "#3B82F6" },
          { name: "Entertainment", spent: 85, total: 150, color: "#EC4899" },
        ].map((budget) => (
          <View
            key={budget.name}
            style={[styles.budgetItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.budgetHeader}>
              <Text style={[styles.budgetName, { color: colors.foreground }]}>{budget.name}</Text>
              <Text style={[styles.budgetAmount, { color: colors.mutedForeground }]}>
                ${budget.spent} / ${budget.total}
              </Text>
            </View>
            <View style={[styles.progressBg, { backgroundColor: colors.secondary }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: budget.color,
                    width: `${(budget.spent / budget.total) * 100}%` as any,
                  },
                ]}
              />
            </View>
          </View>
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
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 2 },
  name: { fontSize: 24, fontFamily: "Inter_700Bold" },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#2E7D52",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  balanceRow: { flexDirection: "row", alignItems: "center" },
  balanceStat: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  balanceStatText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
  },
  balanceDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 16,
  },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  transactionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionInfo: { flex: 1 },
  transactionName: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 2 },
  transactionCategory: { fontSize: 12, fontFamily: "Inter_400Regular" },
  transactionAmount: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginHorizontal: 16 },
  budgetItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  budgetName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  budgetAmount: { fontSize: 13, fontFamily: "Inter_400Regular" },
  progressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
});
