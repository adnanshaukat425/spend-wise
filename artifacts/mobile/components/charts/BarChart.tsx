import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Rect } from "react-native-svg";

export interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  height?: number;
  barColor?: string;
  labelColor?: string;
  valueColor?: string;
}

const CHART_HEIGHT = 120;
const BAR_WIDTH = 28;
const GAP = 12;

export function BarChart({
  data,
  height = CHART_HEIGHT,
  barColor = "#2E7D52",
  labelColor = "#6B7280",
  valueColor = "#9CA3AF",
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const chartWidth = data.length * (BAR_WIDTH + GAP) + GAP;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Weekly spending bar chart"
    >
      <Svg width={chartWidth} height={height}>
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (height - 8);
          const x = GAP + i * (BAR_WIDTH + GAP);
          const y = height - barHeight;
          return (
            <Rect
              key={d.label}
              x={x}
              y={y}
              width={BAR_WIDTH}
              height={barHeight}
              rx={6}
              fill={barColor}
            />
          );
        })}
      </Svg>
      <View style={[styles.labels, { width: chartWidth }]}>
        {data.map((d) => (
          <View key={d.label} style={[styles.labelCol, { width: BAR_WIDTH + GAP }]}>
            <Text style={[styles.dayLabel, { color: labelColor }]}>{d.label}</Text>
            <Text style={[styles.valueLabel, { color: valueColor }]}>
              ${d.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: "row",
    paddingHorizontal: GAP / 2,
    marginTop: 8,
  },
  labelCol: {
    alignItems: "center",
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  valueLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
