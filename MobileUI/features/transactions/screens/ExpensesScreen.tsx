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

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { SeparatedList } from "@/components/ui/List";
import { Screen, ScreenScrollView } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { spacing, typography } from "@/constants/theme";
import { useCategories, useTransactions } from "../api";
import { formatCurrency } from "@/lib/format";
import { queryKeys } from "@/lib/query";
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
  const { data, isFetching, isLoading, isError, error, refetch } = useTransactions({ categorySlug });

  const transactions = data?.items ?? [];
  const totalIncome = data?.totalIncome ?? 0;
  const totalExpenses = data?.totalExpenses ?? 0;

  const handleRefresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.transactions() });
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
        t.accountName?.toLowerCase().includes(q) ||
        t.note?.toLowerCase().includes(q),
    );
  }, [transactions, searchQuery]);

  if (isLoading) {
    return <ScreenLoading />;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  return (
    <Screen padded={false}>
      <View style={styles.headerWrap}>
        <ScreenHeader
          onBack={() => router.back()}
          rightAction={
            <FloatingActionButton
              accessibilityLabel="Add expense"
              icon="add"
              onPress={() => router.push("/add-expense")}
              style={styles.headerFab}
            />
          }
          title="Expenses"
        />
      </View>

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
        {searchQuery.length > 0 ? (
          <TouchableOpacity
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.successLight }]}>
          <Ionicons name="arrow-down-circle" size={20} color={colors.success} />
          <Text style={[styles.summaryLabel, { color: colors.success }]}>Income</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.expenseLight }]}>
          <Ionicons name="arrow-up-circle" size={20} color={colors.expense} />
          <Text style={[styles.summaryLabel, { color: colors.expense }]}>Expenses</Text>
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
            accessibilityLabel={`Filter by ${cat.label}`}
            accessibilityRole="button"
            activeOpacity={0.7}
            onPress={() => setSelectedCategory(cat.id)}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === cat.id ? colors.primary : colors.secondary,
              },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color:
                    selectedCategory === cat.id
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScreenScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingTop: 0 }}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={isFetching}
            tintColor={colors.primary}
          />
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            message={`No transactions found in the ${selectedCategory} category.`}
            title="No transactions"
          />
        ) : (
          <Card style={styles.listCard}>
            <SeparatedList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={(item) => (
                <TransactionRow
                  onPress={() => router.push(`/transaction/${item.id}` as Href)}
                  transaction={item}
                />
              )}
            />
          </Card>
        )}
      </ScreenScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  categories: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  categoriesScroll: { flexGrow: 0 },
  categoryChip: {
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  categoryText: { ...typography.bodyMedium, fontSize: 13 },
  headerFab: {
    height: 40,
    width: 40,
  },
  headerWrap: {
    paddingHorizontal: spacing.xxl,
  },
  listCard: {
    overflow: "hidden",
  },
  searchBar: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xxl,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    padding: 0,
  },
  summaryCard: {
    borderRadius: 14,
    flex: 1,
    gap: spacing.xs,
    padding: 14,
  },
  summaryLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  summaryValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
});
