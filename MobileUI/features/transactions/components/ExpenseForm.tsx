import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { LinkedAccount } from "@/data/types";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

import { AccountPicker } from "./AccountPicker";
import { CategoryPicker, type CategoryOption } from "./CategoryPicker";

const QUICK_TAGS = ["Lunch", "Groceries", "Gas", "Subscription", "Gift"];

interface ExpenseFormProps {
  transactionType: "expense" | "income";
  onTransactionTypeChange: (type: "expense" | "income") => void;
  amount: string;
  onAmountChange: (value: string) => void;
  amountError?: string;
  note: string;
  onNoteChange: (value: string) => void;
  selectedCategory: string;
  onCategorySelect: (id: string) => void;
  categories: CategoryOption[];
  selectedAccount?: LinkedAccount;
  onAccountPress: () => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  receiptUri?: string;
  onRemoveReceipt: () => void;
  isVoicePrefilled: boolean;
  isValid: boolean;
  saving: boolean;
  onSave: () => void;
}

export function ExpenseForm({
  transactionType,
  onTransactionTypeChange,
  amount,
  onAmountChange,
  amountError,
  note,
  onNoteChange,
  selectedCategory,
  onCategorySelect,
  categories,
  selectedAccount,
  onAccountPress,
  selectedTags,
  onToggleTag,
  receiptUri,
  onRemoveReceipt,
  isVoicePrefilled,
  isValid,
  saving,
  onSave,
}: ExpenseFormProps) {
  const colors = useColors();
  const insets = useScreenInsets();

  return (
    <>
      <View style={[styles.typeToggle, { backgroundColor: colors.muted }]}>
        {(["expense", "income"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            testID={`transaction-type-${type}`}
            style={[
              styles.typeBtn,
              transactionType === type && {
                backgroundColor: type === "income" ? colors.success : colors.destructive,
              },
            ]}
            onPress={() => {
              onTransactionTypeChange(type);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={type === "income" ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
              size={16}
              color={transactionType === type ? "#FFFFFF" : colors.mutedForeground}
            />
            <Text
              style={[
                styles.typeBtnText,
                { color: transactionType === type ? "#FFFFFF" : colors.mutedForeground },
              ]}
            >
              {type === "income" ? "Income" : "Expense"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={styles.scrollFlex}
      >
        {isVoicePrefilled && (
          <View
            style={[
              styles.voiceBanner,
              { backgroundColor: colors.secondary ?? colors.muted },
            ]}
          >
            <Ionicons
              name="mic"
              size={15}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.voiceBannerText, { color: colors.primary }]}>
              Pre-filled from voice — review and adjust as needed
            </Text>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          Amount
        </Text>
        <View style={[styles.amountField, { backgroundColor: colors.muted }]}>
          <Text style={[styles.currencySymbol, { color: colors.mutedForeground }]}>
            $
          </Text>
          <TextInput
            style={[styles.amountInput, { color: colors.foreground }]}
            value={amount}
            onChangeText={onAmountChange}
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            autoFocus={Platform.OS !== "web"}
            testID="amount-input"
          />
        </View>
        {amountError ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            {amountError}
          </Text>
        ) : null}

        {receiptUri ? (
          <View style={styles.receiptPreview}>
            <Image source={{ uri: receiptUri }} style={styles.receiptImage} />
            <TouchableOpacity
              onPress={onRemoveReceipt}
              style={styles.removeReceipt}
            >
              <Ionicons name="close-circle" size={24} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          Pay from
        </Text>
        <AccountPicker selectedAccount={selectedAccount} onPress={onAccountPress} />

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          Category
        </Text>
        <CategoryPicker
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={onCategorySelect}
        />

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          Note (optional)
        </Text>
        <TextInput
          style={[
            styles.noteInput,
            { backgroundColor: colors.muted, color: colors.foreground },
          ]}
          value={note}
          onChangeText={onNoteChange}
          placeholder="Add a note..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          testID="note-input"
        />

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          Quick Tags
        </Text>
        <View style={styles.tagsRow}>
          {QUICK_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagChip,
                  { backgroundColor: colors.muted },
                  isSelected && {
                    backgroundColor: colors.secondary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => onToggleTag(tag)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: colors.foreground },
                    isSelected && {
                      color: colors.primary,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 8, backgroundColor: colors.background },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.addBtn,
            {
              backgroundColor: colors.primary,
              opacity: isValid && !saving ? 1 : 0.5,
            },
          ]}
          onPress={onSave}
          activeOpacity={0.85}
          disabled={!isValid || saving}
          accessibilityRole="button"
          accessibilityLabel="Add expense"
          testID="add-expense-submit-btn"
        >
          <Text style={styles.addBtnText}>
            {saving ? "Saving..." : transactionType === "income" ? "Add Income" : "Add Expense"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  typeToggle: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 4,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  typeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  scrollFlex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 12 },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 10,
    marginTop: 20,
  },
  amountField: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  currencySymbol: { fontSize: 20, fontFamily: "Inter_400Regular" },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },
  receiptPreview: {
    marginTop: 12,
    position: "relative",
    alignSelf: "flex-start",
  },
  receiptImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeReceipt: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  noteInput: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 70,
    textAlignVertical: "top",
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tagText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  addBtn: {
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  voiceBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 8,
    marginBottom: 4,
  },
  voiceBannerText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
});
