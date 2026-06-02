import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const SPENDING_CATEGORIES = [
  { name: "Food", amount: 450, color: "#FF6B35" },
  { name: "Shopp...", amount: 680, color: "#8B5CF6" },
  { name: "Trans...", amount: 320, color: "#3B82F6" },
  { name: "Coffee", amount: 120, color: "#F59E0B" },
  { name: "Bills", amount: 580, color: "#EF4444" },
  { name: "Other", amount: 191, color: "#9CA3AF" },
];

const TRANSACTIONS = [
  {
    id: "1",
    name: "Starbucks",
    category: "Coffee",
    amount: -5.40,
    time: "2:30 PM",
    icon: "cafe-outline" as const,
    iconBg: "#FFF3CD",
    iconColor: "#F59E0B",
  },
  {
    id: "2",
    name: "Amazon",
    category: "Shopping",
    amount: -89.99,
    time: "11:15 AM",
    icon: "bag-outline" as const,
    iconBg: "#FDE8CC",
    iconColor: "#E07B39",
  },
  {
    id: "3",
    name: "Uber",
    category: "Transport",
    amount: -24.50,
    time: "9:45 AM",
    icon: "car-outline" as const,
    iconBg: "#DBEAFE",
    iconColor: "#3B82F6",
  },
  {
    id: "4",
    name: "Salary",
    category: "Income",
    amount: 4500.0,
    time: "Yesterday",
    icon: "trending-up-outline" as const,
    iconBg: "#D1FAE5",
    iconColor: "#10B981",
  },
  {
    id: "5",
    name: "Chipotle",
    category: "Food",
    amount: -15.25,
    time: "Yesterday",
    icon: "restaurant-outline" as const,
    iconBg: "#FFE4E1",
    iconColor: "#EF4444",
  },
];

const TOTAL_SPENT = SPENDING_CATEGORIES.reduce((s, c) => s + c.amount, 0);
const RADIUS = 56;
const STROKE = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function DonutChart() {
  let offset = 0;
  const total = SPENDING_CATEGORIES.reduce((s, c) => s + c.amount, 0);
  const GAP = 2;

  return (
    <Svg width={160} height={160} viewBox="0 0 160 160">
      <G rotation="-90" origin="80, 80">
        {SPENDING_CATEGORIES.map((cat) => {
          const pct = (cat.amount / total) * CIRCUMFERENCE;
          const dash = pct - GAP;
          const circle = (
            <Circle
              key={cat.name}
              cx="80"
              cy="80"
              r={RADIUS}
              fill="none"
              stroke={cat.color}
              strokeWidth={STROKE}
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += pct;
          return circle;
        })}
      </G>
    </Svg>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: "#F8F9FB" }]}
      contentContainerStyle={{ paddingBottom: botPad + 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Dark Hero Card */}
      <View style={[styles.heroCard, { paddingTop: topPad + 12 }]}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Good morning</Text>
              <Text style={styles.userName}>John Doe</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        {/* Balance */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceTopRow}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <View style={styles.changeBadge}>
              <Ionicons name="arrow-up" size={12} color="#22C55E" />
              <Text style={styles.changeText}>+12.5%</Text>
            </View>
          </View>
          <Text style={styles.balanceValue}>$12,458.50</Text>

          <TouchableOpacity style={styles.accountsRow} activeOpacity={0.7}>
            <Ionicons name="card-outline" size={16} color="rgba(255,255,255,0.6)" />
            <Text style={styles.accountsText}>3 Accounts Connected</Text>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.5)" style={{ marginLeft: "auto" }} />
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={styles.statIconRow}>
                <View style={[styles.statIcon, { backgroundColor: "rgba(34,197,94,0.2)" }]}>
                  <Ionicons name="arrow-down" size={12} color="#22C55E" />
                </View>
                <Text style={styles.statLabel}>Income</Text>
              </View>
              <Text style={styles.statValue}>$4,500</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxRight]}>
              <View style={styles.statIconRow}>
                <View style={[styles.statIcon, { backgroundColor: "rgba(239,68,68,0.2)" }]}>
                  <Ionicons name="arrow-up" size={12} color="#EF4444" />
                </View>
                <Text style={styles.statLabel}>Expenses</Text>
              </View>
              <Text style={styles.statValue}>$2,341</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Spending by Category */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: "#111827" }]}>Spending by Category</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={[styles.sectionLink, { color: colors.primary }]}>Details</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.chartCard, { backgroundColor: "#FFFFFF" }]}>
          <View style={styles.chartRow}>
            <View style={styles.donutWrapper}>
              <DonutChart />
              <View style={styles.donutCenter}>
                <Text style={styles.donutLabel}>Total</Text>
                <Text style={styles.donutValue}>${TOTAL_SPENT.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.legendGrid}>
              {SPENDING_CATEGORIES.map((cat) => (
                <View key={cat.name} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                  <View>
                    <Text style={styles.legendName}>{cat.name}</Text>
                    <Text style={styles.legendAmount}>${cat.amount}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: "#111827" }]}>Recent Transactions</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={[styles.sectionLink, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.listCard, { backgroundColor: "#FFFFFF" }]}>
          {TRANSACTIONS.map((tx, i) => (
            <View key={tx.id}>
              <TouchableOpacity style={styles.txRow} activeOpacity={0.7}>
                <View style={[styles.txIcon, { backgroundColor: tx.iconBg }]}>
                  <Ionicons name={tx.icon} size={20} color={tx.iconColor} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txName}>{tx.name}</Text>
                  <Text style={styles.txCategory}>{tx.category}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: tx.amount > 0 ? "#10B981" : "#111827" },
                    ]}
                  >
                    {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                  </Text>
                  <Text style={styles.txTime}>{tx.time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
              {i < TRANSACTIONS.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Monthly Budget */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: "#111827" }]}>Monthly Budget</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={[styles.sectionLink, { color: colors.primary }]}>Manage</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.budgetCard, { backgroundColor: "#FFFFFF" }]}>
          <View style={styles.budgetSpentRow}>
            <Text style={styles.budgetSpentLabel}>Spent</Text>
            <Text style={styles.budgetSpentValue}>$2,341 / $3,500</Text>
          </View>
          <View style={styles.budgetProgressBg}>
            <View style={[styles.budgetProgressFill, { width: "67%" }]} />
          </View>
          <View style={styles.budgetStatsRow}>
            <View style={[styles.budgetStatBox, { backgroundColor: "#F3F4F6" }]}>
              <Ionicons name="flash-outline" size={16} color="#F59E0B" />
              <Text style={styles.budgetStatLabel}>Daily limit</Text>
              <Text style={styles.budgetStatValue}>$38.50</Text>
            </View>
            <View style={[styles.budgetStatBox, { backgroundColor: "#F3F4F6" }]}>
              <Ionicons name="trending-up-outline" size={16} color="#10B981" />
              <Text style={styles.budgetStatLabel}>Days left</Text>
              <Text style={styles.budgetStatValue}>12 days</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const HERO_BG = "#15202B";
const HERO_CARD_BG = "#1C2B3A";

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroCard: {
    backgroundColor: HERO_BG,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2E7D52",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  greeting: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", marginBottom: 1 },
  userName: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: HERO_BG,
  },
  balanceSection: {},
  balanceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  balanceLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)" },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 3,
  },
  changeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#22C55E" },
  balanceValue: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  accountsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 16,
  },
  accountsText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.75)" },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: HERO_CARD_BG,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  statBoxRight: {},
  statIconRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statIcon: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)" },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sectionLink: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  chartRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  donutWrapper: { width: 140, height: 140, alignItems: "center", justifyContent: "center" },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
  },
  donutLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#6B7280", marginBottom: 2 },
  donutValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#111827" },
  legendGrid: { flex: 1, flexWrap: "wrap", flexDirection: "row", gap: 10 },
  legendItem: { width: "46%", flexDirection: "row", alignItems: "flex-start", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginTop: 3 },
  legendName: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#374151" },
  legendAmount: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B7280" },
  listCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: { flex: 1 },
  txName: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#111827", marginBottom: 2 },
  txCategory: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#9CA3AF" },
  txRight: { alignItems: "flex-end" },
  txAmount: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  txTime: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#9CA3AF" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 16 },
  budgetCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetSpentRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  budgetSpentLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#6B7280" },
  budgetSpentValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#111827" },
  budgetProgressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
    marginBottom: 14,
  },
  budgetProgressFill: { height: "100%", borderRadius: 4, backgroundColor: "#22C55E" },
  budgetStatsRow: { flexDirection: "row", gap: 12 },
  budgetStatBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  budgetStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#6B7280" },
  budgetStatValue: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#111827" },
});
