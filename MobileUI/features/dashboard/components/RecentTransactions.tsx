import { useRouter, type Href } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { SeparatedList } from "@/components/ui/List";
import { TransactionRow } from "@/components/ui/TransactionRow";
import type { Transaction } from "@/data/types";
import { useColors } from "@/hooks/useColors";

export function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const router = useRouter();
  const colors = useColors();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Recent Transactions
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/expenses" as Href)}
          testID="see-all-transactions-btn"
        >
          <Text style={[styles.sectionLink, { color: colors.primary }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.listCard}>
        {transactions.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No transactions yet. Tap + to add one.
            </Text>
          </View>
        ) : (
          <SeparatedList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={(item) => (
              <TransactionRow
                onPress={() => router.push(`/transaction/${item.id}` as Href)}
                showChevron
                transaction={item}
              />
            )}
          />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sectionLink: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  listCard: { padding: 0, overflow: "hidden" },
  emptyRow: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
