import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const TODAY_INSIGHTS = [
  {
    id: "1",
    title: "Shopping Overspend Alert",
    body: "You've exceeded your shopping budget by $50 this month.",
    iconName: "warning-outline" as const,
    iconBg: "#FFF7E8",
    iconColor: "#F59E0B",
  },
  {
    id: "2",
    title: "Coffee Spending Pattern",
    body: "You spend ~$5.40 on coffee daily. That's $162/month!",
    iconName: "bulb-outline" as const,
    iconBg: "#EFF6FF",
    iconColor: "#3B82F6",
  },
];

const PRO_PERKS = [
  "Unlimited AI-powered insights",
  "Personalized savings recommendations",
  "Spending predictions & forecasts",
  "Smart budget optimization",
];

export default function AIScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: topPad + 4, paddingBottom: botPad + 110 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="sparkles" size={20} color={colors.primary} />
            <Text style={styles.headerTitle}>AI Insights</Text>
          </View>
          <Text style={styles.headerSub}>Powered by SpendWise AI</Text>
        </View>
        <TouchableOpacity
          style={styles.upgradeBtn}
          activeOpacity={0.85}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Text style={styles.upgradeCrown}>👑</Text>
          <Text style={styles.upgradeBtnText}>Upgrade</Text>
        </TouchableOpacity>
      </View>

      {/* ── Financial Health Card ── */}
      <View style={[styles.healthCard, { backgroundColor: colors.secondary }]}>
        <View style={styles.healthTop}>
          <View style={[styles.healthIconWrap, { backgroundColor: colors.primary + "22" }]}>
            <Ionicons name="sparkles" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.healthTitle}>Your Financial Health</Text>
            <Text style={styles.healthBody}>
              You're doing well! Your spending is 33% below your budget this month. Keep up the good work!
            </Text>
          </View>
        </View>
        <View style={styles.healthStatus}>
          <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.statusText, { color: colors.primary }]}>Good Standing</Text>
        </View>
      </View>

      {/* ── Today's Insights ── */}
      <Text style={styles.sectionTitle}>Today's Insights</Text>
      {TODAY_INSIGHTS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.insightCard}
          activeOpacity={0.7}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[styles.insightIcon, { backgroundColor: item.iconBg }]}>
            <Ionicons name={item.iconName} size={20} color={item.iconColor} />
          </View>
          <View style={styles.insightBody}>
            <Text style={styles.insightTitle}>{item.title}</Text>
            <Text style={styles.insightText}>{item.body}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
        </TouchableOpacity>
      ))}

      {/* ── Pro Insights ── */}
      <View style={styles.proHeaderRow}>
        <Text style={styles.sectionTitle}>Pro Insights</Text>
        <Text style={styles.crown}>👑</Text>
      </View>

      {/* Locked Pro cards */}
      {[1, 2, 3].map((n) => (
        <View key={n} style={styles.lockedCard}>
          {/* Blurred content hint */}
          <View style={styles.lockedContent}>
            <View style={styles.lockedIconPlaceholder} />
            <View style={styles.lockedLines}>
              <View style={[styles.lockedLine, { width: "60%" }]} />
              <View style={[styles.lockedLine, { width: "85%", marginTop: 6 }]} />
            </View>
          </View>
          {/* Lock badge */}
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={13} color="#6B7280" />
            <Text style={styles.lockBadgeText}>Pro Feature</Text>
          </View>
        </View>
      ))}

      {/* ── Upgrade to Pro Card ── */}
      <View style={styles.upgradeCard}>
        <View style={styles.upgradeCardHeader}>
          <Text style={styles.upgradeCardCrown}>👑</Text>
          <Text style={styles.upgradeCardTitle}>Upgrade to Pro</Text>
        </View>
        <Text style={styles.upgradeCardSub}>
          Unlock AI-powered insights and save more money every month.
        </Text>

        {/* Perk list */}
        <View style={styles.perks}>
          {PRO_PERKS.map((perk) => (
            <View key={perk} style={styles.perkRow}>
              <Ionicons name="checkmark" size={16} color={colors.primary} />
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>$4.99</Text>
          <Text style={styles.priceUnit}> /month</Text>
        </View>

        {/* CTA button */}
        <TouchableOpacity
          style={styles.trialBtn}
          activeOpacity={0.85}
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
        >
          <Text style={styles.trialBtnText}>Start 7-Day Free Trial</Text>
        </TouchableOpacity>

        <Text style={styles.trialFooter}>Cancel anytime • No credit card required</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F9",
  },
  scroll: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: { gap: 3 },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeCrown: {
    fontSize: 12,
    lineHeight: 14,
  },
  upgradeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },

  // Health card
  healthCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },
  healthTop: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  healthIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  healthTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 6,
  },
  healthBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    lineHeight: 19,
  },
  healthStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  // Section title
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 12,
  },
  proHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  crown: { fontSize: 16 },

  // Insight card
  insightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightBody: { flex: 1 },
  insightTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    lineHeight: 17,
  },

  // Locked pro cards
  lockedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    padding: 16,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 72,
  },
  lockedContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    opacity: 0.18,
  },
  lockedIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#9CA3AF",
  },
  lockedLines: { flex: 1 },
  lockedLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#9CA3AF",
  },
  lockBadge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  lockBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },

  // Upgrade card
  upgradeCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
  },
  upgradeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  upgradeCardCrown: {
    fontSize: 20,
  },
  upgradeCardTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  upgradeCardSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    lineHeight: 19,
    marginBottom: 16,
  },
  perks: { gap: 10, marginBottom: 20 },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  perkText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  price: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  priceUnit: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  trialBtn: {
    backgroundColor: "#F59E0B",
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  trialBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  trialFooter: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
  },
});
