import React from "react";
import { View, StyleSheet } from "react-native";

interface ProgressBarProps {
  percent: number;
  color?: string;
  trackColor?: string;
  height?: number;
}

export function ProgressBar({
  percent,
  color = "#22C55E",
  trackColor = "#F3F4F6",
  height = 8,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <View
      style={[styles.track, { height, backgroundColor: trackColor }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 4,
  },
});
