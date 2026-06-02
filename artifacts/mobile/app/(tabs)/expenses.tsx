import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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

const CATEGORIES = ["All", "Food", "Transport", "Shopping", "Bills", "Income"];

const TRANSACTIONS = [
  { id: "1", name: "Grocery Store", category: "Food", amount: -85.40, icon: "cart-outline" as const, date: "Today, 9:30 AM" },
  { id: "2", name: "Salary", category: "Income", amount: 3200.00, icon: "briefcase-outline" as const, date: "Yesterday, 12:00 PM" },
  { id: "3", name: "Netflix", category: "Bills", amount: -15.99, icon: "tv-outline" as const, date: "Jun 1, 8:00 PM" },
  { id: "4", name: "Coffee Shop", category: "Food", amount: -6.50, icon: "cafe-outline" as const, date: "Jun 1, 7:45 AM" },
  { id: "5", name: "Uber", category: "Transport", amount: -12.30, icon: "car-outline" as const, date: "May 31, 6:00 PM" },
  { id: "6", name: "Amazon", category: "Shopping", amount: -49.99, icon: "bag-outline" as const, date: "May 30, 2:00 PM" },
  { id: "7", name: "Freelance Work", category: "Income", amount: 850.00, icon: "laptop-outline" as const, date: "May 30, 10:00 AM" },
];

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = selectedCategory === "All"
    ? TRANSACTIONS
    : TRANSACTIONS.filter((t) => t.category === selectedCategory);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Expenses</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryRow]}>
        <View style={[styles.summaryCard, { backgroundColor: colors.successLight }]}>
          <Ionicons name="arrow-down-circle" size={20} color={colors.success} />
          <Text style={[styles.summaryLabel, { color: colors.success }]}>Income</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>$4,050.00</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#FEE2E2" }]}>
          <Ionicons name="arrow-up-circle" size={20} color={colors.expense} />
          <Text style={[styles.summaryLabel, { color: colors.expense }]}>Expenses</Text>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>$1,170.18</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        style={styles.categoriesScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === cat ? colors.primary : colors.secondary,
              },
            ]}
            onPress={() => setSelectedCategory(cat)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                { color: selectedCategory === cat ? "#FFFFFF" : colors.mutedForeground },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: botPad + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {filtered.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity style={styles.transactionRow} activeOpacity={0.7}>
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: item.amount > 0 ? colors.successLight : colors.secondary },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.amount > 0 ? colors.success : colors.primary}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionName, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.transactionDate, { color: colors.mutedForeground }]}>{item.date}</Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: item.amount > 0 ? colors.success : colors.expense },
                  ]}
                >
                  {item.amount > 0 ? "+" : ""}${Math.abs(item.amount).toFixed(2)}
                </Text>
              </TouchableOpacity>
              {index < filtered.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>
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
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  summaryValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  categoriesScroll: { flexGrow: 0 },
  categories: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  list: { flex: 1, paddingHorizontal: 20 },
  listCard: {
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
  transactionDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  transactionAmount: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginHorizontal: 16 },
});
