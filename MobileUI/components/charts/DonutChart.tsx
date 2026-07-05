import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

export interface DonutSegment {
  id: string;
  name: string;
  amount: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

const DEFAULT_SIZE = 160;
const DEFAULT_STROKE = 18;

export function DonutChart({
  segments,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = segments.reduce((s, c) => s + c.amount, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - strokeWidth) / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const GAP = 2;

  let offset = 0;

  return (
    <View
      style={[styles.wrapper, { width: size, height: size }]}
      accessibilityRole="image"
      accessibilityLabel={`Spending chart, total ${centerValue ?? total}`}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${cx}, ${cy}`}>
          {total > 0 ? (
            segments.map((seg, index) => {
              const pct = (seg.amount / total) * circumference;
              const dash = Math.max(pct - GAP, 0);
              const circle = (
                <Circle
                  key={seg.id ?? `segment-${index}`}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += pct;
              return circle;
            })
          ) : (
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
            />
          )}
        </G>
      </Svg>
      {(centerLabel || centerValue) && (
        <View style={styles.center}>
          {centerLabel ? (
            <Text style={styles.centerLabel}>{centerLabel}</Text>
          ) : null}
          {centerValue ? (
            <Text style={styles.centerValue}>{centerValue}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
  },
  centerLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 2,
  },
  centerValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
});
