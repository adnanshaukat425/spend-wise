import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ProgressBar } from "@/components/charts/ProgressBar";
import type { BudgetCategory } from "@/data/types";
import {
  calculateBudgetMetrics,
  getBudgetStatusTone,
} from "@/domain/budget";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";

export interface BudgetCategoryRowProps {
  category: BudgetCategory;
  onEdit: (category: BudgetCategory) => void;
}

export const BudgetCategoryRow = memo(function BudgetCategoryRow({
  category,
  onEdit,
}: BudgetCategoryRowProps) {
  const colors = useColors();
  const metrics = calculateBudgetMetrics({
    totalBudget: category.limit,
    totalSpent: category.spent,
    daysRemaining: 1,
  });
  const tone = getBudgetStatusTone(metrics);
  const barColor =
    tone === "danger"
      ? colors.expense
      : tone === "warning"
        ? colors.warning
        : colors.primary;

  return (
    <View style={[styles.catCard, { backgroundColor: colors.card }]}>
      <View style={styles.catRow}>
        <View
          style={[styles.catIconWrap, { backgroundColor: category.iconBg }]}
        >
          <Ionicons
            name={category.icon}
            size={20}
            color={category.iconColor}
          />
        </View>
        <View style={styles.catInfo}>
          <Text style={[styles.catName, { color: colors.foreground }]}>
            {category.name}
          </Text>
          <Text style={[styles.catAmounts, { color: colors.mutedForeground }]}>
            {formatCurrency(category.spent)} / {formatCurrency(category.limit)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onEdit(category)}
          activeOpacity={0.7}
          style={styles.editCatBtn}
          accessibilityLabel={`Edit ${category.name} budget`}
          testID={`edit-category-${category.id}-btn`}
        >
          <Text
            style={[
              styles.catPct,
              { color: colors.foreground },
              tone === "danger" && { color: colors.expense },
            ]}
          >
            {metrics.spentPercent}%
          </Text>
          <Ionicons
            name="pencil-outline"
            size={14}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>
      <ProgressBar
        percent={metrics.spentPercent}
        color={barColor}
        trackColor={colors.muted}
        height={7}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  catCard: {
    borderRadius: 16,
    elevation: 1,
    gap: 12,
    marginBottom: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  catRow: { alignItems: "center", flexDirection: "row" },
  catIconWrap: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    marginRight: 12,
    width: 44,
  },
  catInfo: { flex: 1 },
  catName: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 3 },
  catAmounts: { fontFamily: "Inter_400Regular", fontSize: 12 },
  editCatBtn: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  catPct: { fontFamily: "Inter_700Bold", fontSize: 16 },
});
