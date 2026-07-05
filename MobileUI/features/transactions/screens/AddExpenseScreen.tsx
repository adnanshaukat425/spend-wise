import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { z } from "zod";

import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { spacing } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

import { ExpenseForm } from "../components/ExpenseForm";
import {
  useAccounts,
  useCategories,
  useCreateTransaction,
} from "../api";

const expenseSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !Number.isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Enter a valid amount greater than 0",
    }),
  categorySlug: z.string().min(1, "Select a category"),
  accountId: z.string().min(1, "Select an account"),
  note: z.string().optional(),
});

export default function AddExpenseScreen() {
  const router = useRouter();
  const colors = useColors();
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const { data: categories = [] } = useCategories(transactionType);
  const { data: accounts = [] } = useAccounts();
  const createTransaction = useCreateTransaction();

  const {
    prefillAmount,
    prefillCategory,
    prefillNote,
  } = useLocalSearchParams<{
    prefillAmount?: string;
    prefillCategory?: string;
    prefillNote?: string;
  }>();

  const [amount, setAmount] = useState(prefillAmount ?? "");
  const [note, setNote] = useState(prefillNote ?? "");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [receiptUri, setReceiptUri] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!categories.length) return;
    if (prefillCategory) {
      const match = categories.find(
        (c) => c.id === prefillCategory || c.slug === prefillCategory,
      );
      if (match) {
        setSelectedCategory(match.id);
        return;
      }
    }
    if (!selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, prefillCategory, selectedCategory]);

  useEffect(() => {
    if (accounts.length && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  const displayNote = useMemo(() => {
    const tagPart = selectedTags.length > 0 ? selectedTags.join(", ") : "";
    if (note && tagPart) return `${note} (${tagPart})`;
    return note || tagPart || undefined;
  }, [note, selectedTags]);

  const toggleTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handlePickReceipt = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Camera permission",
        "Allow camera access to attach a receipt photo.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSave = async () => {
    const parsed = expenseSchema.safeParse({
      amount,
      categorySlug: selectedCategory,
      accountId: selectedAccountId,
      note: displayNote,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const category = categories.find((c) => c.id === selectedCategory);
      const signedAmount = transactionType === "income"
        ? Math.abs(parseFloat(amount))
        : -Math.abs(parseFloat(amount));
      await createTransaction.mutateAsync({
        accountId: selectedAccountId,
        categorySlug: selectedCategory,
        name: category?.label ?? (transactionType === "income" ? "Income" : "Expense"),
        amount: signedAmount,
        note: displayNote,
        receiptUrl: receiptUri ?? null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      Alert.alert(
        "Could not save",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  const isValid =
    amount.trim() !== "" &&
    parseFloat(amount) > 0 &&
    Boolean(selectedCategory) &&
    Boolean(selectedAccountId);

  const isVoicePrefilled =
    Boolean(prefillAmount) || Boolean(prefillCategory) || Boolean(prefillNote);

  return (
    <Screen padded={false} style={styles.container}>
      <View style={styles.headerWrap}>
        <ScreenHeader
          variant="close"
          title={transactionType === "income" ? "Add Income" : "Add Expense"}
          onBack={() => router.back()}
          rightAction={
            <Pressable
              onPress={handlePickReceipt}
              style={styles.headerBtn}
              accessibilityRole="button"
              accessibilityLabel="Attach receipt photo"
            >
              <Ionicons name="camera-outline" size={22} color={colors.foreground} />
            </Pressable>
          }
        />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ExpenseForm
          transactionType={transactionType}
          onTransactionTypeChange={(type) => {
            setTransactionType(type);
            setSelectedCategory("");
          }}
          amount={amount}
          onAmountChange={setAmount}
          amountError={errors.amount}
          note={note}
          onNoteChange={setNote}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          categories={categories}
          selectedAccount={selectedAccount}
          onAccountPress={() => router.push("/accounts" as Href)}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          receiptUri={receiptUri}
          onRemoveReceipt={() => setReceiptUri(undefined)}
          isVoicePrefilled={isVoicePrefilled}
          isValid={isValid}
          saving={saving}
          onSave={handleSave}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  headerWrap: {
    paddingHorizontal: spacing.xxl,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
