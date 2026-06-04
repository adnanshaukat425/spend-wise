import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { usePreferences, useUpdatePreferences } from "@/hooks/api";
import { SETTINGS_SCREENS } from "@/lib/settings";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

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
  const { data: prefs } = usePreferences();
  const updatePrefs = useUpdatePreferences();
  const [saving, setSaving] = useState(false);

  const config = slug ? SETTINGS_SCREENS[slug] : undefined;

  if (!config) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Settings" onBack={() => router.back()} />
        <View style={styles.center}>
          <Text style={{ color: colors.mutedForeground }}>Page not found</Text>
        </View>
      </View>
    );
  }

  // Currency picker screen
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Currency" onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 24,
          }}
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
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={config.title} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 16,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  currencySymbolBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  currencySymbol: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  currencyInfo: { flex: 1 },
  currencyCode: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  currencyLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  checkDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  divider: { height: 1, marginHorizontal: 16 },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    padding: 20,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
