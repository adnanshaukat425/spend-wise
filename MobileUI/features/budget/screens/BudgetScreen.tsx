import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { ErrorState } from "@/components/ui/ErrorState";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

import { AddBudgetCategoryModal } from "../components/AddBudgetCategoryModal";
import { BudgetCategoryRow } from "../components/BudgetCategoryRow";
import { BudgetQuickActions } from "../components/BudgetQuickActions";
import { BudgetSummaryCard } from "../components/BudgetSummaryCard";
import { EditBudgetModal } from "../components/EditBudgetModal";
import { SetTotalBudgetModal } from "../components/SetTotalBudgetModal";
import { useBudgetScreenActions } from "../hooks/useBudgetScreenActions";
import { useBudget } from "../api";

export default function BudgetScreen() {
  const colors = useColors();
  const insets = useScreenInsets();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useBudget();

  const budgetCategories = data?.budgetCategories ?? [];
  const budgetSummary = data?.budgetSummary ?? {
    totalBudget: 0,
    totalSpent: 0,
    daysRemaining: 0,
    monthLabel: "",
  };
  const rawLines = useMemo(
    () =>
      (data?.raw?.lines ?? []).map((l) => ({
        categoryId: l.categoryId,
        limitAmount: l.limitAmount ?? l.limit ?? 0,
      })),
    [data],
  );

  const existingCategorySlugs = useMemo(
    () =>
      (data?.raw?.lines ?? [])
        .map((l) => l.categorySlug ?? l.categoryId)
        .filter((slug): slug is string => Boolean(slug)),
    [data],
  );

  const {
    addCatVisible,
    adjustVisible,
    editCat,
    savingModal,
    setAddCatVisible,
    setAdjustVisible,
    setEditCat,
    handleAddCategoryConfirm,
    handleAdjustConfirm,
    handleEditCatConfirm,
  } = useBudgetScreenActions(rawLines);

  if (isLoading) return <ScreenLoading />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.iconBtn} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Budget
        </Text>
        <TouchableOpacity
          style={[styles.headerFab, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => router.push("/add-expense")}
          accessibilityRole="button"
          accessibilityLabel="Add expense"
        >
          <Ionicons name="add" size={22} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        <BudgetSummaryCard summary={budgetSummary} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Categories
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAddCatVisible(true);
            }}
          >
            <Text style={[styles.editLink, { color: colors.primary }]}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {budgetCategories.map((cat) => (
          <BudgetCategoryRow
            key={cat.id}
            category={cat}
            onEdit={(c) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setEditCat(c);
            }}
          />
        ))}

        <BudgetQuickActions
          onAdjustBudget={() => setAdjustVisible(true)}
          onAddCategory={() => setAddCatVisible(true)}
        />
      </ScrollView>

      <SetTotalBudgetModal
        visible={adjustVisible}
        totalBudget={budgetSummary.totalBudget}
        saving={savingModal}
        onConfirm={handleAdjustConfirm}
        onClose={() => setAdjustVisible(false)}
      />

      <EditBudgetModal
        category={editCat}
        saving={savingModal}
        onConfirm={handleEditCatConfirm}
        onClose={() => setEditCat(null)}
      />

      <AddBudgetCategoryModal
        visible={addCatVisible}
        existingCategorySlugs={existingCategorySlugs}
        rawLines={rawLines}
        saving={savingModal}
        onConfirm={handleAddCategoryConfirm}
        onClose={() => setAddCatVisible(false)}
      />
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
    paddingVertical: 14,
  },
  iconBtn: { width: 36, height: 36 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  headerFab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  editLink: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
