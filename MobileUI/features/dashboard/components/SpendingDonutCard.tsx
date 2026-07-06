import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { DonutChart } from "@/components/charts/DonutChart";
import { Card } from "@/components/ui/Card";
import { spacing, typography } from "@/constants/theme";
import type { SpendingSegment } from "@/data/types";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/lib/format";

interface SpendingDonutCardProps {
  segments: SpendingSegment[];
  total: number;
}

export function SpendingDonutCard({ segments, total }: SpendingDonutCardProps) {
  const colors = useColors();

  return (
    <Card style={styles.chartCard}>
      <View style={styles.chartRow}>
        <DonutChart
          centerLabel="Total"
          centerValue={formatCurrency(total, { compact: true })}
          segments={segments}
          size={140}
        />
        <View style={styles.legendGrid}>
          {segments.map((segment) => (
            <View key={segment.id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <View>
                <Text style={[styles.legendName, { color: colors.foreground }]}>
                  {segment.name}
                </Text>
                <Text style={[styles.legendAmount, { color: colors.mutedForeground }]}>
                  {formatCurrency(segment.amount, { compact: true })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    overflow: "hidden",
  },
  chartRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  legendAmount: {
    ...typography.caption,
  },
  legendDot: {
    borderRadius: 4,
    height: 8,
    marginTop: 3,
    width: 8,
  },
  legendGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  legendItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 6,
    width: "46%",
  },
  legendName: {
    ...typography.label,
  },
});
