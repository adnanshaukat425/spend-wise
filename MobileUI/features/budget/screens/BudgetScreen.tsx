import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { QueryScreenBoundary } from "@/components/ui/QueryScreenBoundary";
import { Screen, ScreenScrollView } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TabScreenHeader } from "@/components/ui/TabScreenHeader";
import type { BudgetCategory, BudgetSummary } from "@/data/types";
import { spacing } from "@/constants/theme";

import { AddBudgetCategoryModal } from "../components/AddBudgetCategoryModal";
import { BudgetCategoryRow } from "../components/BudgetCategoryRow";
import { BudgetQuickActions } from "../components/BudgetQuickActions";
import { BudgetSummaryCard } from "../components/BudgetSummaryCard";
import { EditBudgetModal } from "../components/EditBudgetModal";
import { SetTotalBudgetModal } from "../components/SetTotalBudgetModal";
import { useBudgetScreenActions } from "../hooks/useBudgetScreenActions";
import { useBudget } from "../queries";

interface BudgetQueryData {
  budgetCategories: BudgetCategory[];
  budgetSummary: BudgetSummary;
  raw?: {
    lines?: Array<{
      categoryId: string;
      categorySlug?: string;
      limit?: number;
      limitAmount?: number;
    }>;
  };
}

export default function BudgetScreen() {
  const router = useRouter();
  const budgetQuery = useBudget();

  return (
    <QueryScreenBoundary query={budgetQuery}>
      {(data) => <BudgetScreenBody data={data} onAddExpense={() => router.push("/add-expense")} />}
    </QueryScreenBoundary>
  );
}

function BudgetScreenBody({
  data,
  onAddExpense,
}: {
  data: BudgetQueryData;
  onAddExpense: () => void;
}) {
  const { budgetCategories, budgetSummary } = data;

  const rawLines = useMemo(
    () =>
      (data.raw?.lines ?? []).map((line) => ({
        categoryId: line.categoryId,
        limitAmount: line.limitAmount ?? line.limit ?? 0,
      })),
    [data.raw?.lines],
  );

  const existingCategorySlugs = useMemo(
    () =>
      (data.raw?.lines ?? [])
        .map((line) => line.categorySlug ?? line.categoryId)
        .filter((slug): slug is string => Boolean(slug)),
    [data.raw?.lines],
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

  const openAddCategory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddCatVisible(true);
  };

  return (
    <Screen padded={false} variant="tab">
      <TabScreenHeader
        actionAccessibilityLabel="Add expense"
        onActionPress={onAddExpense}
        title="Budget"
      />

      <ScreenScrollView
        contentContainerStyle={styles.scrollContent}
        padded={false}
        variant="tab"
      >
        <BudgetSummaryCard summary={budgetSummary} />

        <SectionHeader actionLabel="Edit" onAction={openAddCategory} title="Categories" />

        {budgetCategories.length === 0 ? (
          <EmptyState
            icon="pie-chart-outline"
            message="Add categories to track spending against your monthly budget."
            title="No budget categories"
          />
        ) : (
          budgetCategories.map((category) => (
            <BudgetCategoryRow
              key={category.id}
              category={category}
              onEdit={(selectedCategory) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEditCat(selectedCategory);
              }}
            />
          ))
        )}

        <BudgetQuickActions
          onAdjustBudget={() => setAdjustVisible(true)}
          onAddCategory={openAddCategory}
        />
      </ScreenScrollView>

      <SetTotalBudgetModal
        onClose={() => setAdjustVisible(false)}
        onConfirm={handleAdjustConfirm}
        saving={savingModal}
        totalBudget={budgetSummary.totalBudget}
        visible={adjustVisible}
      />

      <EditBudgetModal
        category={editCat}
        onClose={() => setEditCat(null)}
        onConfirm={handleEditCatConfirm}
        saving={savingModal}
      />

      <AddBudgetCategoryModal
        existingCategorySlugs={existingCategorySlugs}
        onClose={() => setAddCatVisible(false)}
        onConfirm={handleAddCategoryConfirm}
        rawLines={rawLines}
        saving={savingModal}
        visible={addCatVisible}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: 0,
  },
});
