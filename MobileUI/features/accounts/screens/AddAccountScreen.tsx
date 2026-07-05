import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

import { Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { spacing } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

import { useCreateAccount } from "../api";

const ACCOUNT_TYPES = [
  { id: "checking", label: "Checking", icon: "wallet-outline" as const },
  { id: "savings", label: "Savings", icon: "save-outline" as const },
  { id: "credit", label: "Credit", icon: "card-outline" as const },
  { id: "investment", label: "Investment", icon: "trending-up-outline" as const },
] as const;

const ICON_COLORS = [
  { color: "#3B82F6", label: "Blue" },
  { color: "#10B981", label: "Green" },
  { color: "#F59E0B", label: "Amber" },
  { color: "#EF4444", label: "Red" },
  { color: "#8B5CF6", label: "Purple" },
  { color: "#EC4899", label: "Pink" },
  { color: "#14B8A6", label: "Teal" },
  { color: "#F97316", label: "Orange" },
];

const ICON_KEY_BY_TYPE: Record<string, string> = {
  checking: "wallet",
  savings: "save",
  credit: "card",
  investment: "trending-up",
};

const schema = z.object({
  name: z.string().min(1, "Account name is required"),
  accountType: z.string().min(1, "Select an account type"),
  balance: z
    .string()
    .refine((v) => !Number.isNaN(parseFloat(v)) || v === "" || v === "0", {
      message: "Enter a valid balance",
    }),
  lastFourDigits: z
    .string()
    .max(4, "Max 4 digits")
    .regex(/^\d{0,4}$/, "Digits only"),
});

export default function AddAccountScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const createAccount = useCreateAccount();

  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<string>("checking");
  const [balance, setBalance] = useState("0");
  const [lastFour, setLastFour] = useState("");
  const [iconColor, setIconColor] = useState(ICON_COLORS[0].color);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsed = schema.safeParse({ name, accountType, balance, lastFourDigits: lastFour });
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
      await createAccount.mutateAsync({
        name: name.trim(),
        accountType,
        balance: balance === "" ? 0 : parseFloat(balance),
        lastFourDigits: lastFour.padStart(4, "0"),
        iconKey: ICON_KEY_BY_TYPE[accountType] ?? "wallet",
        iconColor,
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

  const isValid = name.trim().length > 0 && accountType.length > 0;

  return (
    <Screen padded={false}>
      <View style={styles.headerWrap}>
        <ScreenHeader onBack={() => router.back()} title="Add Account" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "height" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.label, { color: colors.foreground }]}>Account Name</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.muted, color: colors.foreground },
              errors.name ? { borderColor: colors.destructive, borderWidth: 1.5 } : {},
            ]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Chase Checking"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="words"
            testID="account-name-input"
          />
          {errors.name ? (
            <Text style={[styles.errorText, { color: colors.destructive }]}>{errors.name}</Text>
          ) : null}

          <Text style={[styles.label, { color: colors.foreground }]}>Account Type</Text>
          <View style={styles.typeGrid}>
            {ACCOUNT_TYPES.map((type) => {
              const isSelected = accountType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    { backgroundColor: colors.muted },
                    isSelected && {
                      backgroundColor: colors.card,
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => {
                    setAccountType(type.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                  testID={`account-type-${type.id}`}
                >
                  <Ionicons
                    name={type.icon}
                    size={22}
                    color={isSelected ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      { color: colors.mutedForeground },
                      isSelected && { color: colors.primary, fontFamily: "Inter_600SemiBold" },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>Opening Balance</Text>
          <View style={[styles.amountField, { backgroundColor: colors.muted }]}>
            <Text style={[styles.currencySymbol, { color: colors.mutedForeground }]}>$</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.foreground }]}
              value={balance}
              onChangeText={setBalance}
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              testID="account-balance-input"
            />
          </View>
          {errors.balance ? (
            <Text style={[styles.errorText, { color: colors.destructive }]}>{errors.balance}</Text>
          ) : null}

          <Text style={[styles.label, { color: colors.foreground }]}>Last 4 Digits (optional)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.muted, color: colors.foreground },
              errors.lastFourDigits
                ? { borderColor: colors.destructive, borderWidth: 1.5 }
                : {},
            ]}
            value={lastFour}
            onChangeText={(v) => setLastFour(v.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            maxLength={4}
          />
          {errors.lastFourDigits ? (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {errors.lastFourDigits}
            </Text>
          ) : null}

          <Text style={[styles.label, { color: colors.foreground }]}>Icon Color</Text>
          <View style={styles.colorRow}>
            {ICON_COLORS.map((c) => (
              <TouchableOpacity
                key={c.color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c.color },
                  iconColor === c.color && styles.colorSwatchSelected,
                ]}
                onPress={() => {
                  setIconColor(c.color);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.8}
                accessibilityLabel={c.label}
              >
                {iconColor === c.color ? (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom + spacing.lg,
              backgroundColor: colors.background,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.saveBtn,
              {
                backgroundColor: colors.primary,
                opacity: isValid && !saving ? 1 : 0.5,
              },
            ]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!isValid || saving}
            accessibilityRole="button"
            accessibilityLabel="Save account"
            testID="save-account-btn"
          >
            <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Add Account"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  amountField: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  amountInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    padding: 0,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorSwatch: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  colorSwatchSelected: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    transform: [{ scale: 1.15 }],
  },
  currencySymbol: { fontFamily: "Inter_400Regular", fontSize: 18 },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 6,
  },
  flex: { flex: 1 },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  headerWrap: {
    paddingHorizontal: spacing.xxl,
  },
  input: {
    borderRadius: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 10,
    marginTop: spacing.xl,
  },
  saveBtn: {
    alignItems: "center",
    borderRadius: 27,
    height: 54,
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  scroll: { paddingHorizontal: spacing.xxl },
  typeCard: {
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: 14,
    flexGrow: 1,
    gap: 6,
    justifyContent: "center",
    maxWidth: "24%",
    paddingVertical: 10,
    width: "22%",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
  },
});
