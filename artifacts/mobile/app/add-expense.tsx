import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

import {
  useAccounts,
  useCategories,
  useCreateTransaction,
} from "@/hooks/api";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

const QUICK_TAGS = ["Lunch", "Groceries", "Gas", "Subscription", "Gift"];

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
  const insets = useScreenInsets();
  const colors = useColors();
  const { data: categories = [] } = useCategories("expense");
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
      await createTransaction.mutateAsync({
        accountId: selectedAccountId,
        categorySlug: selectedCategory,
        name: category?.label ?? "Expense",
        amount: -Math.abs(parseFloat(amount)),
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
    !!selectedCategory &&
    !!selectedAccountId;

  const isVoicePrefilled = !!prefillAmount || !!prefillCategory || !!prefillNote;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Add Expense
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.headerBtn}
          onPress={handlePickReceipt}
          accessibilityRole="button"
          accessibilityLabel="Attach receipt photo"
        >
          <Ionicons name="camera-outline" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
        <View
          style={[styles.amountField, { backgroundColor: colors.muted }]}
        >
          <Text style={[styles.currencySymbol, { color: colors.mutedForeground }]}>
            $
          </Text>
          <TextInput
            style={[styles.amountInput, { color: colors.foreground }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            autoFocus={Platform.OS !== "web"}
            testID="amount-input"
          />
        </View>
        {errors.amount ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            {errors.amount}
          </Text>
        ) : null}

        {receiptUri ? (
          <View style={styles.receiptPreview}>
            <Image source={{ uri: receiptUri }} style={styles.receiptImage} />
            <TouchableOpacity
              onPress={() => setReceiptUri(undefined)}
              style={styles.removeReceipt}
            >
              <Ionicons name="close-circle" size={24} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          Pay from
        </Text>
        {selectedAccount ? (
          <TouchableOpacity
            style={[styles.accountRow, { backgroundColor: colors.muted }]}
            activeOpacity={0.7}
            onPress={() => router.push("/accounts" as Href)}
            testID="account-picker"
          >
            <View style={[styles.accountIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons
                name={selectedAccount.icon}
                size={20}
                color={selectedAccount.iconColor}
              />
            </View>
            <View style={styles.accountInfo}>
              <Text style={[styles.accountName, { color: colors.foreground }]}>
                {selectedAccount.name}
              </Text>
              <Text style={[styles.accountBalance, { color: colors.mutedForeground }]}>
                Balance: {formatCurrency(selectedAccount.balance)}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : (
          <Text style={{ color: colors.mutedForeground, marginBottom: 8 }}>
            No accounts linked yet.
          </Text>
        )}

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          Category
        </Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryItem,
                  { backgroundColor: colors.muted },
                  isSelected && {
                    backgroundColor: colors.card,
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon}
                  size={22}
                  color={isSelected ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: colors.mutedForeground },
                    isSelected && {
                      color: colors.primary,
                      fontFamily: "Inter_600SemiBold",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          Note (optional)
        </Text>
        <TextInput
          style={[
            styles.noteInput,
            { backgroundColor: colors.muted, color: colors.foreground },
          ]}
          value={note}
          onChangeText={setNote}
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
                onPress={() => toggleTag(tag)}
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
          { paddingBottom: insets.bottom + 16, backgroundColor: colors.background },
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
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={!isValid || saving}
          accessibilityRole="button"
          accessibilityLabel="Add expense"
          testID="add-expense-submit-btn"
        >
          <Text style={styles.addBtnText}>
            {saving ? "Saving..." : "Add Expense"}
          </Text>
        </TouchableOpacity>
      </View>
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
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  scroll: { paddingHorizontal: 20 },
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
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  accountInfo: { flex: 1 },
  accountName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  accountBalance: { fontSize: 12, fontFamily: "Inter_400Regular" },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryItem: {
    width: "18%",
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    flexGrow: 1,
    maxWidth: "19%",
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
