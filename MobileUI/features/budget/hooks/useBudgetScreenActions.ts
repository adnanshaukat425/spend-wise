import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Alert } from "react-native";

import type { BudgetCategory } from "@/data/types";

import { useUpdateBudgetLines, useUpdateBudgetTotal } from "../api";

interface BudgetLine {
  categoryId: string;
  limitAmount: number;
}

export function useBudgetScreenActions(rawLines: BudgetLine[]) {
  const updateTotal = useUpdateBudgetTotal();
  const updateLines = useUpdateBudgetLines();

  const [adjustVisible, setAdjustVisible] = useState(false);
  const [editCat, setEditCat] = useState<BudgetCategory | null>(null);
  const [addCatVisible, setAddCatVisible] = useState(false);
  const [savingModal, setSavingModal] = useState(false);

  const handleAdjustConfirm = async (value: string) => {
    setSavingModal(true);
    try {
      await updateTotal.mutateAsync(parseFloat(value));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAdjustVisible(false);
    } catch (err) {
      Alert.alert(
        "Could not update budget",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSavingModal(false);
    }
  };

  const handleEditCatConfirm = async (value: string) => {
    if (!editCat) return;
    setSavingModal(true);
    try {
      const newLines = rawLines.map((l) =>
        l.categoryId === editCat.id
          ? { ...l, limitAmount: parseFloat(value) }
          : l,
      );
      await updateLines.mutateAsync(newLines);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditCat(null);
    } catch (err) {
      Alert.alert(
        "Could not update category",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSavingModal(false);
    }
  };

  const handleAddCategoryConfirm = async (newLines: BudgetLine[]) => {
    setSavingModal(true);
    try {
      await updateLines.mutateAsync(newLines);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAddCatVisible(false);
    } catch (err) {
      Alert.alert(
        "Could not add category",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSavingModal(false);
    }
  };

  return {
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
  };
}
