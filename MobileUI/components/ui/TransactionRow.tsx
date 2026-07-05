import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Transaction } from "@/data/types";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
  showChevron?: boolean;
}

export const TransactionRow = memo(function TransactionRow({
  transaction,
  onPress,
  showChevron = false,
}: TransactionRowProps) {
  const colors = useColors();
  const isIncome = transaction.amount > 0;

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.name}, ${transaction.category}`}
      testID={`transaction-row-${transaction.id}`}
    >
      <View style={[styles.icon, { backgroundColor: transaction.iconBg }]}>
        <Ionicons
          name={transaction.icon}
          size={20}
          color={transaction.iconColor}
        />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>
          {transaction.name}
        </Text>
        <Text style={[styles.category, { color: colors.mutedForeground }]}>
          {transaction.category}
        </Text>
      </View>
      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            { color: isIncome ? colors.success : colors.foreground },
          ]}
        >
          {isIncome ? "+" : ""}
          {formatCurrency(Math.abs(transaction.amount))}
        </Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>
          {transaction.time}
        </Text>
      </View>
      {showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.mutedForeground}
          style={{ marginLeft: 4 }}
        />
      ) : null}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  name: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  right: { alignItems: "flex-end" },
  amount: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
