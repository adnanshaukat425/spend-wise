import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/lib/format";

export function DashboardMetrics({
  totalExpenses,
  totalIncome,
}: {
  totalExpenses: number;
  totalIncome: number;
}) {
  const colors = useColors();

  return (
    <View style={styles.metricsRow}>
      <View
        style={[
          styles.statBox,
          { backgroundColor: colors.heroCardBackground },
        ]}
      >
        <View style={styles.statIconRow}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: "rgba(34,197,94,0.2)" },
            ]}
          >
            <Ionicons name="arrow-down" size={12} color="#22C55E" />
          </View>
          <Text style={styles.statLabel}>Income</Text>
        </View>
        <Text style={styles.statValue}>
          {formatCurrency(totalIncome, { compact: true })}
        </Text>
      </View>
      <View
        style={[
          styles.statBox,
          { backgroundColor: colors.heroCardBackground },
        ]}
      >
        <View style={styles.statIconRow}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: "rgba(239,68,68,0.2)" },
            ]}
          >
            <Ionicons name="arrow-up" size={12} color="#EF4444" />
          </View>
          <Text style={styles.statLabel}>Expenses</Text>
        </View>
        <Text style={styles.statValue}>
          {formatCurrency(totalExpenses, { compact: true })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  statIconRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
});
