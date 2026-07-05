import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";

function getCurrencyPrefix(): string {
  return formatCurrency(0).replace(/[\d.,\s]/g, "");
}

export interface BudgetAmountModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  initialValue: string;
  saving: boolean;
  confirmLabel?: string;
  titleTestID?: string;
  cancelTestID?: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export function BudgetAmountModal({
  visible,
  title,
  subtitle,
  initialValue,
  saving,
  confirmLabel = "Save",
  titleTestID = "budget-modal-title",
  cancelTestID = "budget-modal-cancel-btn",
  onConfirm,
  onClose,
}: BudgetAmountModalProps) {
  const colors = useColors();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, visible]);

  const isValid =
    value.trim() !== "" &&
    !Number.isNaN(parseFloat(value)) &&
    parseFloat(value) >= 0;

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
            testID={titleTestID}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.modalSubtitle, { color: colors.mutedForeground }]}
            >
              {subtitle}
            </Text>
          ) : null}
          <View
            style={[styles.modalAmountField, { backgroundColor: colors.muted }]}
          >
            <Text
              style={[styles.modalCurrency, { color: colors.mutedForeground }]}
            >
              {getCurrencyPrefix()}
            </Text>
            <TextInput
              style={[styles.modalAmountInput, { color: colors.foreground }]}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
              placeholderTextColor={colors.mutedForeground}
              placeholder="0.00"
            />
          </View>
          <View style={styles.modalBtns}>
            <TouchableOpacity
              style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.7}
              testID={cancelTestID}
            >
              <Text
                style={[styles.modalCancelText, { color: colors.foreground }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalConfirmBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: isValid && !saving ? 1 : 0.5,
                },
              ]}
              onPress={() => isValid && !saving && onConfirm(value)}
              activeOpacity={0.85}
              disabled={!isValid || saving}
            >
              <Text
                style={[
                  styles.modalConfirmText,
                  { color: colors.primaryForeground },
                ]}
              >
                {saving ? "Saving…" : confirmLabel}
              </Text>
            </TouchableOpacity>
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
});
