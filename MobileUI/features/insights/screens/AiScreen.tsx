import { useDashboard, useInsights } from "../api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { PRO_FEATURES } from "@/constants/subscription";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

const PRO_PREVIEW_FEATURES = PRO_FEATURES.slice(0, 4);

export default function AIScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const { data: insights = [] } = useInsights();
  const { data: dashboard } = useDashboard();
  const todayInsights = insights.slice(0, 3);

  const budgetPct = dashboard?.budgetSummary
    ? Math.round((dashboard.budgetSummary.totalSpent / dashboard.budgetSummary.totalBudget) * 100)
    : null;
  const budgetHealthText =
    budgetPct === null
      ? "Connect your accounts and set a budget to see personalized health insights."
      : budgetPct >= 90
        ? `You've used ${budgetPct}% of your monthly budget. Consider reviewing your spending.`
        : budgetPct >= 70
          ? `You've used ${budgetPct}% of your monthly budget this month — keep an eye on it.`
          : `Your spending is ${100 - budgetPct}% below your monthly budget. Great work!`;
  const healthStatus =
    budgetPct === null || budgetPct < 70
      ? "Good Standing"
      : budgetPct < 90
        ? "On Track"
        : "Over Budget";
  const healthStatusColor =
    budgetPct === null || budgetPct < 70
      ? colors.primary
      : budgetPct < 90
        ? colors.warning
        : colors.destructive;

  const goToSubscription = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/subscription");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + 4,
        paddingBottom: insets.bottom + 110,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="sparkles" size={20} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              AI Insights
            </Text>
          </View>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Powered by SpendWise AI
          </Text>
        </View>
        <TouchableOpacity
          style={styles.upgradeBtn}
          activeOpacity={0.85}
          onPress={goToSubscription}
        >
          <Text style={styles.upgradeCrown}>👑</Text>
          <Text style={styles.upgradeBtnText}>Upgrade</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.healthCard, { backgroundColor: colors.secondary }]}>
        <View style={styles.healthTop}>
          <View
            style={[
              styles.healthIconWrap,
              { backgroundColor: colors.primary + "22" },
            ]}
          >
            <Ionicons name="sparkles" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.healthTitle, { color: colors.foreground }]}>
              Your Financial Health
            </Text>
            <Text style={[styles.healthBody, { color: colors.mutedForeground }]}>
              {budgetHealthText}
            </Text>
          </View>
        </View>
        <View style={styles.healthStatus}>
          <View
            style={[styles.statusDot, { backgroundColor: healthStatusColor }]}
          />
          <Text style={[styles.statusText, { color: healthStatusColor }]}>
            {healthStatus}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Today's Insights
      </Text>
      {todayInsights.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.insightCard, { backgroundColor: colors.card }]}
          activeOpacity={0.7}
          onPress={() => Alert.alert(item.title, item.body, [{ text: "OK" }])}
        >
          <View style={[styles.insightIcon, { backgroundColor: item.bgColor }]}>
            <Ionicons name={item.icon} size={20} color={item.iconColor} />
          </View>
          <View style={styles.insightBody}>
            <Text style={[styles.insightTitle, { color: colors.foreground }]}>
              {item.title}
            </Text>
            <Text style={[styles.insightText, { color: colors.mutedForeground }]}>
              {item.body}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
      ))}

      <View style={styles.proHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Pro Insights
        </Text>
        <Text style={styles.crown}>👑</Text>
      </View>

      {[1, 2, 3].map((n) => (
        <View
          key={n}
          style={[styles.lockedCard, { borderColor: colors.border }]}
        >
          <View style={styles.lockedContent}>
            <View style={styles.lockedIconPlaceholder} />
            <View style={styles.lockedLines}>
              <View style={[styles.lockedLine, { width: "60%" }]} />
              <View
                style={[styles.lockedLine, { width: "85%", marginTop: 6 }]}
              />
            </View>
          </View>
          <View style={[styles.lockBadge, { backgroundColor: colors.muted }]}>
            <Ionicons name="lock-closed" size={13} color={colors.mutedForeground} />
            <Text style={[styles.lockBadgeText, { color: colors.mutedForeground }]}>
              Pro Feature
            </Text>
          </View>
        </View>
      ))}

      <View style={[styles.upgradeCard, { backgroundColor: colors.warningLight }]}>
        <View style={styles.upgradeCardHeader}>
          <Text style={styles.upgradeCardCrown}>👑</Text>
          <Text style={[styles.upgradeCardTitle, { color: colors.foreground }]}>
            Upgrade to Pro
          </Text>
        </View>
        <Text style={[styles.upgradeCardSub, { color: colors.mutedForeground }]}>
          Unlock AI-powered insights and save more money every month.
        </Text>

        <View style={styles.perks}>
          {PRO_PREVIEW_FEATURES.map((perk) => (
            <View key={perk} style={styles.perkRow}>
              <Ionicons name="checkmark" size={16} color={colors.primary} />
              <Text style={[styles.perkText, { color: colors.foreground }]}>
                {perk}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.foreground }]}>$4.99</Text>
          <Text style={[styles.priceUnit, { color: colors.mutedForeground }]}>
            {" "}
            /month
          </Text>
        </View>

        <TouchableOpacity
          style={styles.trialBtn}
          activeOpacity={0.85}
          onPress={goToSubscription}
        >
          <Text style={styles.trialBtnText}>Start 7-Day Free Trial</Text>
        </TouchableOpacity>

        <Text style={[styles.trialFooter, { color: colors.mutedForeground }]}>
          Cancel anytime • No credit card required
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: { gap: 3 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeCrown: { fontSize: 12, lineHeight: 14 },
  upgradeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  healthCard: { borderRadius: 18, padding: 18, marginBottom: 24 },
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
    marginBottom: 6,
  },
  healthBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  healthStatus: { flexDirection: "row", alignItems: "center", gap: 7 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
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
  insightCard: {
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
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  lockedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  lockBadgeText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  upgradeCard: { borderRadius: 20, padding: 20, marginTop: 8 },
  upgradeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  upgradeCardCrown: { fontSize: 20 },
  upgradeCardTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  upgradeCardSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
    marginBottom: 16,
  },
  perks: { gap: 10, marginBottom: 20 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  perkText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 16 },
  price: { fontSize: 34, fontFamily: "Inter_700Bold" },
  priceUnit: { fontSize: 15, fontFamily: "Inter_400Regular" },
  trialBtn: {
    backgroundColor: "#F59E0B",
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  trialBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  trialFooter: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
