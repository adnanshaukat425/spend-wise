import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ErrorState } from "@/components/ui/ErrorState";
import { Screen, ScreenScrollView } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { spacing } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { SETTINGS_SCREENS } from "@/lib/settings";

import { usePreferences, useUpdatePreferences } from "../api";

const CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "PKR", label: "Pakistani Rupee", symbol: "₨" },
  { code: "AED", label: "UAE Dirham", symbol: "د.إ" },
];

export default function SettingsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const { data: prefs, isLoading, isError, error, refetch } = usePreferences();
  const updatePrefs = useUpdatePreferences();
  const [saving, setSaving] = useState(false);

  const config = slug ? SETTINGS_SCREENS[slug] : undefined;

  if (isLoading) {
    return <ScreenLoading />;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  if (!config) {
    return (
      <Screen padded={false}>
        <View style={styles.headerWrap}>
          <ScreenHeader onBack={() => router.back()} title="Settings" />
        </View>
        <View style={styles.center}>
          <Text style={{ color: colors.mutedForeground }}>Page not found</Text>
        </View>
      </Screen>
    );
  }

  if (slug === "currency") {
    const currentCurrency = prefs?.currency ?? "USD";

    const handleSelect = async (code: string) => {
      if (code === currentCurrency || saving) return;
      setSaving(true);
      try {
        await updatePrefs.mutateAsync({ currencyCode: code });
        Alert.alert("Currency Updated", `Currency set to ${code}.`);
      } catch {
        Alert.alert("Error", "Could not update currency. Please try again.");
      } finally {
        setSaving(false);
      }
    };

    return (
      <Screen padded={false}>
        <View style={styles.headerWrap}>
          <ScreenHeader onBack={() => router.back()} title="Currency" />
        </View>
        <ScreenScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl, paddingTop: 0 }}
        >
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            SELECT YOUR CURRENCY
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {CURRENCIES.map((cur, idx) => {
              const isSelected = cur.code === currentCurrency;
              return (
                <View key={cur.code}>
                  <TouchableOpacity
                    testID={`currency-option-${cur.code}`}
                    style={styles.currencyRow}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(cur.code)}
                    disabled={saving}
                  >
                    <View style={[styles.currencySymbolBox, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.currencySymbol, { color: colors.foreground }]}>
                        {cur.symbol}
                      </Text>
                    </View>
                    <View style={styles.currencyInfo}>
                      <Text style={[styles.currencyCode, { color: colors.foreground }]}>
                        {cur.code}
                      </Text>
                      <Text style={[styles.currencyLabel, { color: colors.mutedForeground }]}>
                        {cur.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.checkDot, { backgroundColor: colors.primary }]} />
                    )}
                  </TouchableOpacity>
                  {idx < CURRENCIES.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              );
            })}
          </View>
        </ScreenScrollView>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.headerWrap}>
        <ScreenHeader onBack={() => router.back()} title={config.title} />
      </View>
      <ScreenScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl, paddingTop: 0 }}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {config.description}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              Coming in a future update
            </Text>
          </View>
        </View>
      </ScreenScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    marginBottom: spacing.xl,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  checkDot: {
    borderRadius: 10,
    height: 20,
    width: 20,
  },
  currencyCode: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  currencyInfo: { flex: 1 },
  currencyLabel: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  currencyRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  currencySymbol: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  currencySymbolBox: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    padding: spacing.xl,
  },
  divider: { height: 1, marginHorizontal: spacing.lg },
  headerWrap: {
    paddingHorizontal: spacing.xxl,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: spacing.lg,
    textTransform: "uppercase",
  },
});
