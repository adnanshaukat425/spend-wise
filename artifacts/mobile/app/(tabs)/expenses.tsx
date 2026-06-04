import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { useCategories, useTransactions } from "@/hooks/api";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { useQueryClient } from "@tanstack/react-query";

export default function ExpensesScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const qc = useQueryClient();
  const { data: categoriesData } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categorySlug =
    selectedCategory === "all" ? undefined : selectedCategory;
  const { data, isFetching } = useTransactions({ categorySlug });

  const transactions = data?.items ?? [];
  const totalIncome = data?.totalIncome ?? 0;
  const totalExpenses = data?.totalExpenses ?? 0;

  const handleRefresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["transactions"] });
  }, [qc]);

  const filterOptions = useMemo(() => {
    const cats = categoriesData ?? [];
    return [
      { id: "all", label: "All" },
      ...cats.map((c) => ({ id: c.id, label: c.label })),
    ];
  }, [categoriesData]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.note?.toLowerCase().includes(q),
    );
  }, [transactions, searchQuery]);

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

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
        <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
        <TextInput
          testID="transaction-search-input"
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.mutedForeground}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
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
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
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
