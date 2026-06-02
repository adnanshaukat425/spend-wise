import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Circle, Svg } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface Category {
  id: string;
  name: string;
  spent: number;
  limit: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
}

const CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food & Dining",
    spent: 420,
    limit: 600,
    icon: "restaurant-outline",
    iconBg: "#FFF0E8",
    iconColor: "#FF6B35",
  },
  {
    id: "transport",
    name: "Transportation",
    spent: 180,
    limit: 250,
    icon: "car-outline",
    iconBg: "#EFF6FF",
    iconColor: "#3B82F6",
  },
  {
    id: "shopping",
    name: "Shopping",
    spent: 95,
    limit: 200,
    icon: "bag-outline",
    iconBg: "#F3EEFF",
    iconColor: "#8B5CF6",
  },
  {
    id: "coffee",
    name: "Coffee & Drinks",
    spent: 85,
    limit: 100,
    icon: "cafe-outline",
    iconBg: "#FFF7E8",
    iconColor: "#F59E0B",
  },
  {
    id: "home",
    name: "Home & Rent",
    spent: 1200,
    limit: 1200,
    icon: "home-outline",
    iconBg: "#ECFDF5",
    iconColor: "#10B981",
  },
  {
    id: "utilities",
    name: "Utilities",
    spent: 106,
    limit: 150,
    icon: "flash-outline",
    iconBg: "#FEFCE8",
    iconColor: "#EAB308",
  },
];

const TOTAL_BUDGET = 2600;
const TOTAL_SPENT = 2341;
const DAYS_REMAINING = 12;

function CircularProgress({ pct, size = 86 }: { pct: number; size?: number }) {
  const colors = useColors();
  const stroke = 9;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - Math.min(pct, 100) / 100);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="#D1FAE5"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <Text style={[styles.circleLabel, { color: colors.primary }]}>{pct}%</Text>
    </View>
  );
}

function CategoryCard({ cat }: { cat: Category }) {
  const colors = useColors();
  const pct = Math.round((cat.spent / cat.limit) * 100);
  const isOver = pct >= 100;
  const barColor = isOver ? "#EF4444" : colors.primary;

  return (
    <View style={styles.catCard}>
      <View style={styles.catRow}>
        <View style={[styles.catIconWrap, { backgroundColor: cat.iconBg }]}>
          <Ionicons name={cat.icon} size={20} color={cat.iconColor} />
        </View>
        <View style={styles.catInfo}>
          <Text style={styles.catName}>{cat.name}</Text>
          <Text style={styles.catAmounts}>
            ${cat.spent.toLocaleString()} / ${cat.limit.toLocaleString()}
          </Text>
        </View>
        <Text style={[styles.catPct, isOver && { color: "#EF4444" }]}>
          {pct}%
        </Text>
      </View>
      {/* Progress bar */}
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(pct, 100)}%` as any, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const remaining = TOTAL_BUDGET - TOTAL_SPENT;
  const pct = Math.round((TOTAL_SPENT / TOTAL_BUDGET) * 100);
  const daysElapsed = 30 - DAYS_REMAINING;
  const dailyAvg = daysElapsed > 0 ? (TOTAL_SPENT / daysElapsed).toFixed(2) : "0.00";
  const safeToSpend = DAYS_REMAINING > 0 ? (remaining / DAYS_REMAINING).toFixed(2) : "0.00";

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget</Text>
        <TouchableOpacity
          style={[styles.headerFab, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: botPad + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero summary card */}
        <View style={[styles.heroCard, { backgroundColor: colors.secondary }]}>
          {/* Month + badge */}
          <View style={styles.heroTopRow}>
            <Text style={styles.heroMonth}>June 2024</Text>
            <View style={styles.remainBadge}>
              <Ionicons name="trending-down-outline" size={12} color={colors.primary} />
              <Text style={[styles.remainText, { color: colors.primary }]}>
                ${remaining.toLocaleString()} left
              </Text>
            </View>
          </View>

          {/* Spent / total */}
          <Text style={styles.heroSpent}>
            ${TOTAL_SPENT.toLocaleString()}
            <Text style={styles.heroTotal}> / ${TOTAL_BUDGET.toLocaleString()}</Text>
          </Text>

          {/* Circle + stats */}
          <View style={styles.heroBody}>
            <CircularProgress pct={pct} size={86} />
            <View style={styles.heroStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Daily Average</Text>
                <Text style={styles.statValue}>${dailyAvg}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Days Remaining</Text>
                <Text style={styles.statValue}>{DAYS_REMAINING} days</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Safe to Spend</Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  ${safeToSpend}/day
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categories header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Category list */}
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat.id} cat={cat} />
        ))}

        {/* Quick Actions */}
        <View style={styles.quickCard}>
          <Text style={styles.quickTitle}>Quick Actions</Text>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.adjustBtn}
              activeOpacity={0.8}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={styles.adjustText}>Adjust Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addCatBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <Text style={styles.addCatText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F9",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },
  headerFab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // Hero card
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  heroMonth: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },
  remainBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  remainText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  heroSpent: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 18,
  },
  heroTotal: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  heroBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  circleLabel: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  heroStats: {
    flex: 1,
    gap: 10,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },
  statValue: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  editLink: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },

  // Category card
  catCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  catIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  catInfo: { flex: 1 },
  catName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 3,
  },
  catAmounts: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  catPct: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  barBg: {
    height: 7,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: 7,
    borderRadius: 4,
  },

  // Quick actions
  quickCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 14,
  },
  quickRow: {
    flexDirection: "row",
    gap: 10,
  },
  adjustBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  adjustText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
  },
  addCatBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  addCatText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
