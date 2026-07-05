import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { SubscriptionPlanDto } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";
import { formatPlanPeriod } from "@/constants/subscription";
import { radii, spacing, typography } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";

export function PlanCard({
  isSelected,
  onSelect,
  plan,
}: {
  isSelected: boolean;
  onSelect: () => void;
  plan: SubscriptionPlanDto;
}) {
  const colors = useColors();

  return (
    <View style={styles.outer}>
      {plan.badge ? (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={styles.badgeText}>{plan.badge}</Text>
        </View>
      ) : null}
      <Pressable
        accessibilityLabel={`Select ${plan.name} plan`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelect();
        }}
        style={[
          styles.card,
          {
            backgroundColor: isSelected ? colors.secondary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1.5,
          },
        ]}
        testID={`subscription-plan-${plan.slug}`}
      >
        <View style={styles.left}>
          <Text style={[styles.label, { color: colors.foreground }]}>{plan.name}</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.foreground }]}>
              {formatCurrency(plan.price)}
            </Text>
            <Text style={[styles.period, { color: colors.mutedForeground }]}>
              {formatPlanPeriod(plan.billingPeriod)}
            </Text>
          </View>
          {plan.tag ? <Text style={[styles.tag, { color: colors.primary }]}>{plan.tag}</Text> : null}
        </View>
        {isSelected ? (
          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          </View>
        ) : (
          <View style={[styles.emptyCircle, { borderColor: colors.border }]} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    position: "absolute",
    top: -10,
    zIndex: 10,
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  card: {
    alignItems: "center",
    borderRadius: radii.lg,
    flexDirection: "row",
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  checkCircle: {
    alignItems: "center",
    borderRadius: 13,
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  emptyCircle: {
    borderRadius: 13,
    borderWidth: 2,
    height: 26,
    width: 26,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 4,
  },
  left: {
    flex: 1,
  },
  outer: {
    position: "relative",
  },
  period: {
    ...typography.caption,
    fontSize: 13,
  },
  price: {
    ...typography.title,
    fontSize: 22,
  },
  priceRow: {
    alignItems: "baseline",
    flexDirection: "row",
  },
  tag: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
