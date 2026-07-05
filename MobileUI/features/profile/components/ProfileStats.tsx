import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { UserProfile } from "@/data/types";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";

interface ProfileStatsProps {
  stats: UserProfile["stats"];
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const colors = useColors();

  const items = [
    { label: "Transactions", value: String(stats.transactions) },
    { label: "Categories", value: String(stats.categories) },
    {
      label: "Saved",
      value: formatCurrency(stats.saved, { compact: true }),
      highlight: true,
    },
  ];

  return (
    <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
      {items.map((stat, i) => (
        <View
          key={stat.label}
          style={[
            styles.statCard,
            i === 1 && {
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.statValue,
              {
                color: stat.highlight ? colors.primary : colors.foreground,
              },
            ]}
          >
            {stat.value}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statCard: {
    flex: 1,
    paddingVertical: 18,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
