import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useCategories } from "../api";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";

function getCurrencyPrefix(): string {
  return formatCurrency(0).replace(/[\d.,\s]/g, "");
}

export interface AddBudgetCategoryModalProps {
  visible: boolean;
  existingCategorySlugs: string[];
  rawLines: { categoryId: string; limitAmount: number }[];
  saving: boolean;
  onConfirm: (lines: { categoryId: string; limitAmount: number }[]) => void;
  onClose: () => void;
}

export function AddBudgetCategoryModal({
  visible,
  existingCategorySlugs,
  rawLines,
  saving,
  onConfirm,
  onClose,
}: AddBudgetCategoryModalProps) {
  const colors = useColors();
  const { data: allCategories = [] } = useCategories("expense");
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [limit, setLimit] = useState("100");

  const available = useMemo(
    () => allCategories.filter((c) => !existingCategorySlugs.includes(c.id)),
    [allCategories, existingCategorySlugs],
  );

  useEffect(() => {
    if (visible) {
      setSelectedSlug(available[0]?.id ?? "");
      setLimit("100");
    }
  }, [visible, available]);

  const selectedCat = useMemo(
    () => available.find((c) => c.id === selectedSlug),
    [available, selectedSlug],
  );

  const isValid =
    selectedSlug !== "" &&
    limit.trim() !== "" &&
    !Number.isNaN(parseFloat(limit)) &&
    parseFloat(limit) > 0 &&
    selectedCat !== undefined;

  const handleConfirm = () => {
    if (!isValid || !selectedCat) return;
    const newLines = [
      ...rawLines,
      { categoryId: selectedCat.categoryId, limitAmount: parseFloat(limit) },
    ];
    onConfirm(newLines);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <Text
            style={[styles.modalTitle, { color: colors.foreground }]}
            testID="add-category-modal-title"
          >
            Add Budget Category
          </Text>

          {available.length === 0 ? (
            <Text
              style={[styles.modalSubtitle, { color: colors.mutedForeground }]}
            >
              All expense categories are already in your budget.
            </Text>
          ) : (
            <>
              <Text
                style={[styles.modalSubtitle, { color: colors.mutedForeground }]}
              >
                Select a category
              </Text>
              <ScrollView
                style={styles.catPickerList}
                showsVerticalScrollIndicator={false}
              >
                {available.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catPickerRow,
                      {
                        backgroundColor:
                          selectedSlug === cat.id
                            ? colors.secondary
                            : "transparent",
                      },
                    ]}
                    onPress={() => {
                      setSelectedSlug(cat.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={18}
                      color={
                        selectedSlug === cat.id
                          ? colors.primary
                          : colors.mutedForeground
                      }
                    />
                    <Text
                      style={[
                        styles.catPickerLabel,
                        {
                          color:
                            selectedSlug === cat.id
                              ? colors.primary
                              : colors.foreground,
                          fontFamily:
                            selectedSlug === cat.id
                              ? "Inter_600SemiBold"
                              : "Inter_400Regular",
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                    {selectedSlug === cat.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={colors.primary}
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text
                style={[
                  styles.modalSubtitle,
                  { color: colors.mutedForeground, marginTop: 12 },
                ]}
              >
                Monthly limit
              </Text>
              <View
                style={[
                  styles.modalAmountField,
                  { backgroundColor: colors.muted },
                ]}
              >
                <Text
                  style={[
                    styles.modalCurrency,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {getCurrencyPrefix()}
                </Text>
                <TextInput
                  style={[
                    styles.modalAmountInput,
                    { color: colors.foreground },
                  ]}
                  value={limit}
                  onChangeText={setLimit}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                  placeholderTextColor={colors.mutedForeground}
                  placeholder="0.00"
                />
              </View>
            </>
          )}

          <View style={styles.modalBtns}>
            <TouchableOpacity
              style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.7}
              testID="add-category-cancel-btn"
            >
              <Text
                style={[styles.modalCancelText, { color: colors.foreground }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            {available.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: isValid && !saving ? 1 : 0.5,
                  },
                ]}
                onPress={handleConfirm}
                activeOpacity={0.85}
                disabled={!isValid || saving}
              >
                <Text
                  style={[
                    styles.modalConfirmText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  {saving ? "Saving…" : "Add"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  modalAmountField: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    marginBottom: 20,
  },
  modalCurrency: { fontSize: 18, fontFamily: "Inter_400Regular" },
  modalAmountInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  modalCancelText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  modalConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  catPickerList: {
    maxHeight: 180,
    marginBottom: 4,
  },
  catPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  catPickerLabel: {
    fontSize: 14,
  },
  checkIcon: {
    marginLeft: "auto",
  },
});
