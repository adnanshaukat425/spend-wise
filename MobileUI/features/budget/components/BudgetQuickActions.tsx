import * as Haptics from "expo-haptics";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export interface BudgetQuickActionsProps {
  onAdjustBudget: () => void;
  onAddCategory: () => void;
}

export function BudgetQuickActions({
  onAdjustBudget,
  onAddCategory,
}: BudgetQuickActionsProps) {
  const colors = useColors();

  return (
    <View style={[styles.quickCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.quickTitle, { color: colors.foreground }]}>
        Quick Actions
      </Text>
      <View style={styles.quickRow}>
        <TouchableOpacity
          style={[styles.adjustBtn, { borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAdjustBudget();
          }}
          testID="adjust-budget-btn"
        >
          <Text style={[styles.adjustText, { color: colors.foreground }]}>
            Adjust Budget
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addCatBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAddCategory();
          }}
          testID="add-category-btn"
        >
          <Text
            style={[styles.addCatText, { color: colors.primaryForeground }]}
          >
            Add Category
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 14 },
  quickRow: { flexDirection: "row", gap: 10 },
  adjustBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  adjustText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  addCatBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  addCatText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
