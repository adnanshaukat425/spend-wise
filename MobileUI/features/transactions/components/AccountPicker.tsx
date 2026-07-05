import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { LinkedAccount } from "@/data/types";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";

interface AccountPickerProps {
  selectedAccount?: LinkedAccount;
  onPress: () => void;
}

export function AccountPicker({ selectedAccount, onPress }: AccountPickerProps) {
  const colors = useColors();

  if (!selectedAccount) {
    return (
      <Text style={{ color: colors.mutedForeground, marginBottom: 8 }}>
        No accounts linked yet.
      </Text>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.accountRow, { backgroundColor: colors.muted }]}
      activeOpacity={0.7}
      onPress={onPress}
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
  );
}

const styles = StyleSheet.create({
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
});
