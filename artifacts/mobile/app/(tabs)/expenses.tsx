import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { useCategories, useTransactions } from "@/hooks/api";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

export default function ExpensesScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const { data: categoriesData } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categorySlug =
    selectedCategory === "all" ? undefined : selectedCategory;
  const { data } = useTransactions({ categorySlug });

  const transactions = data?.items ?? [];
  const totalIncome = data?.totalIncome ?? 0;
  const totalExpenses = data?.totalExpenses ?? 0;

  const filterOptions = useMemo(() => {
    const cats = categoriesData ?? [];
    return [
      { id: "all", label: "All" },
      ...cats.map((c) => ({ id: c.id, label: c.label })),
    ];
  }, [categoriesData]);

  const filtered = transactions;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Expenses
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => router.push("/add-expense")}
          accessibilityRole="button"
          accessibilityLabel="Add expense"
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View
          style={[styles.summaryCard, { backgroundColor: colors.successLight }]}
        >
          <Ionicons name="arrow-down-circle" size={20} color={colors.success} />
          <Text style={[styles.summaryLabel, { color: colors.success }]}>
            Income
          </Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#FEE2E2" }]}>
          <Ionicons name="arrow-up-circle" size={20} color={colors.expense} />
          <Text style={[styles.summaryLabel, { color: colors.expense }]}>
            Expenses
          </Text>
          <Text style={[styles.summaryValue, { color: colors.expense }]}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        style={styles.categoriesScroll}
      >
        {filterOptions.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === cat.id ? colors.primary : colors.secondary,
              },
            ]}
            onPress={() => setSelectedCategory(cat.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color:
                    selectedCategory === cat.id
                      ? "#FFFFFF"
                      : colors.mutedForeground,
                },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="No transactions"
            message={`No transactions found in the ${selectedCategory} category.`}
            icon="receipt-outline"
          />
        ) : (
          <View
            style={[
              styles.listCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {filtered.map((item, index) => (
              <View key={item.id}>
                <TransactionRow
                  transaction={item}
                  onPress={() => router.push(`/transaction/${item.id}` as Href)}
                />
                {index < filtered.length - 1 && (
                  <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                  />
                )}
              </View>
            ))}
          </View>
        )}
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
  divider: { height: 1, marginHorizontal: 16 },
});
