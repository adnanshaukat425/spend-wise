import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useTransaction } from "@/hooks/api";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const { data: tx, isLoading } = useTransaction(id);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Transaction" onBack={() => router.back()} />
        <View style={styles.notFound}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!tx) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Transaction" />
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
            Transaction not found
          </Text>
        </View>
      </View>
    );
  }

  const isIncome = tx.amount > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Transaction" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View
            style={[styles.iconWrap, { backgroundColor: tx.iconBg }]}
          >
            <Ionicons name={tx.icon} size={28} color={tx.iconColor} />
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {tx.name}
          </Text>
          <Text
            style={[
              styles.amount,
              { color: isIncome ? colors.success : colors.expense },
            ]}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(Math.abs(tx.amount))}
          </Text>
          <Text style={[styles.category, { color: colors.mutedForeground }]}>
            {tx.category}
          </Text>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          <DetailRow label="Date" value={tx.date} colors={colors} />
          <DetailRow label="Time" value={tx.time} colors={colors} />
          {tx.note ? (
            <DetailRow label="Note" value={tx.note} colors={colors} />
          ) : null}
          <DetailRow
            label="Type"
            value={isIncome ? "Income" : "Expense"}
            colors={colors}
          />
        </View>

        {tx.receiptUri ? (
          <View style={[styles.receiptCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.receiptLabel, { color: colors.foreground }]}>
              Receipt
            </Text>
            <Image
              source={{ uri: tx.receiptUri }}
              style={styles.receiptImage}
              resizeMode="cover"
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function DetailRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  detailsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  receiptCard: {
    borderRadius: 16,
    padding: 16,
  },
  receiptLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  receiptImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
});
