import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { QueryScreenBoundary } from "@/components/ui/QueryScreenBoundary";
import { ScreenScrollView } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PRO_FEATURES } from "@/constants/subscription";
import { shadows, spacing, typography } from "@/constants/theme";
import { getBudgetHealthSummary } from "@/domain/budget";
import { useColors } from "@/hooks/useColors";
import { useDashboard } from "@/features/dashboard/queries";

import { useInsights } from "../queries";

const PRO_PREVIEW_FEATURES = PRO_FEATURES.slice(0, 4);

export default function AIScreen() {
  const insightsQuery = useInsights();
  const dashboardQuery = useDashboard();

  return (
    <QueryScreenBoundary
      loadingLabel="Loading AI insights"
      queries={[insightsQuery, dashboardQuery]}
    >
      <AiScreenBody
        dashboard={dashboardQuery.data}
        insights={insightsQuery.data ?? []}
      />
    </QueryScreenBoundary>
  );
}

function AiScreenBody({
  dashboard,
  insights,
}: {
  dashboard: ReturnType<typeof useDashboard>["data"];
  insights: NonNullable<ReturnType<typeof useInsights>["data"]>;
}) {
  const router = useRouter();
  const colors = useColors();
  const todayInsights = insights.slice(0, 3);
  const budgetSummary = dashboard?.budgetSummary;
  const budgetHealth = getBudgetHealthSummary(
    budgetSummary?.totalBudget ?? 0,
    budgetSummary?.totalSpent ?? 0,
  );
  const healthStatusColor =
    budgetHealth.healthStatusTone === "danger"
      ? colors.destructive
      : budgetHealth.healthStatusTone === "warning"
        ? colors.warning
        : colors.primary;

  const goToSubscription = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/subscription");
  };

  return (
    <ScreenScrollView
      contentContainerStyle={styles.content}
      padded={false}
      variant="tab"
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleRow}>
            <Ionicons color={colors.primary} name="sparkles" size={20} />
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>AI Insights</Text>
          </View>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Powered by SpendWise AI
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={goToSubscription}
          style={[styles.upgradeBtn, { backgroundColor: colors.warning }]}
        >
          <Text style={styles.upgradeCrown}>👑</Text>
          <Text style={[styles.upgradeBtnText, { color: colors.primaryForeground }]}>
            Upgrade
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.healthCard, { backgroundColor: colors.secondary }]}>
        <View style={styles.healthTop}>
          <View style={[styles.healthIconWrap, { backgroundColor: colors.primary + "22" }]}>
            <Ionicons color={colors.primary} name="sparkles" size={22} />
          </View>
          <View style={styles.healthCopy}>
            <Text style={[styles.healthTitle, { color: colors.foreground }]}>
              Your Financial Health
            </Text>
            <Text style={[styles.healthBody, { color: colors.mutedForeground }]}>
              {budgetHealth.message}
            </Text>
          </View>
        </View>
        <View style={styles.healthStatus}>
          <View style={[styles.statusDot, { backgroundColor: healthStatusColor }]} />
          <Text style={[styles.statusText, { color: healthStatusColor }]}>
            {budgetHealth.healthStatus}
          </Text>
        </View>
      </View>

      <SectionHeader title="Today's Insights" />

      {todayInsights.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.7}
          onPress={() => Alert.alert(item.title, item.body, [{ text: "OK" }])}
          style={[styles.insightCard, { backgroundColor: colors.card }, shadows.card]}
        >
          <View style={[styles.insightIcon, { backgroundColor: item.bgColor }]}>
            <Ionicons color={item.iconColor} name={item.icon} size={20} />
          </View>
          <View style={styles.insightBody}>
            <Text style={[styles.insightTitle, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.insightText, { color: colors.mutedForeground }]}>{item.body}</Text>
          </View>
          <Ionicons color={colors.mutedForeground} name="chevron-forward" size={18} />
        </TouchableOpacity>
      ))}

      <View style={styles.proHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pro Insights</Text>
        <Text style={styles.crown}>👑</Text>
      </View>

      {[1, 2, 3].map((index) => (
        <View
          key={index}
          style={[styles.lockedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.lockedContent}>
            <View style={[styles.lockedIconPlaceholder, { backgroundColor: colors.mutedForeground }]} />
            <View style={styles.lockedLines}>
              <View style={[styles.lockedLine, { backgroundColor: colors.mutedForeground, width: "60%" }]} />
              <View
                style={[
                  styles.lockedLine,
                  { backgroundColor: colors.mutedForeground, marginTop: 6, width: "85%" },
                ]}
              />
            </View>
          </View>
          <View style={[styles.lockBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons color={colors.mutedForeground} name="lock-closed" size={13} />
            <Text style={[styles.lockBadgeText, { color: colors.mutedForeground }]}>Pro Feature</Text>
          </View>
        </View>
      ))}

      <View style={[styles.upgradeCard, { backgroundColor: colors.warningLight }]}>
        <View style={styles.upgradeCardHeader}>
          <Text style={styles.upgradeCardCrown}>👑</Text>
          <Text style={[styles.upgradeCardTitle, { color: colors.foreground }]}>Upgrade to Pro</Text>
        </View>
        <Text style={[styles.upgradeCardSub, { color: colors.mutedForeground }]}>
          Unlock AI-powered insights and save more money every month.
        </Text>

        <View style={styles.perks}>
          {PRO_PREVIEW_FEATURES.map((perk) => (
            <View key={perk} style={styles.perkRow}>
              <Ionicons color={colors.primary} name="checkmark" size={16} />
              <Text style={[styles.perkText, { color: colors.foreground }]}>{perk}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.foreground }]}>$4.99</Text>
          <Text style={[styles.priceUnit, { color: colors.mutedForeground }]}> /month</Text>
        </View>

        <Button onPress={goToSubscription} variant="pro">
          Start 7-Day Free Trial
        </Button>

        <Text style={[styles.trialFooter, { color: colors.mutedForeground }]}>
          Cancel anytime • No credit card required
        </Text>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 0,
  },
  crown: { fontSize: 16 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  headerLeft: { gap: 3 },
  headerSub: { ...typography.caption },
  headerTitle: { ...typography.title, fontSize: 20 },
  headerTitleRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  healthBody: { ...typography.caption, lineHeight: 19 },
  healthCard: { borderRadius: 18, marginBottom: spacing.xxl, padding: 18 },
  healthCopy: { flex: 1 },
  healthStatus: { alignItems: "center", flexDirection: "row", gap: 7 },
  healthTitle: { ...typography.bodySemibold, marginBottom: 6 },
  healthTop: { alignItems: "flex-start", flexDirection: "row", gap: 14, marginBottom: 14 },
  healthIconWrap: {
    alignItems: "center",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  insightBody: { flex: 1 },
  insightCard: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: 10,
    padding: spacing.lg,
  },
  insightIcon: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  insightText: { ...typography.caption, lineHeight: 17 },
  insightTitle: { ...typography.bodySemibold, fontSize: 14, marginBottom: 4 },
  lockBadge: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    position: "absolute",
  },
  lockBadgeText: { ...typography.bodyMedium, fontSize: 13 },
  lockedCard: {
    alignItems: "center",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1.5,
    justifyContent: "center",
    marginBottom: 10,
    minHeight: 72,
    padding: spacing.lg,
  },
  lockedContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    opacity: 0.18,
    width: "100%",
  },
  lockedIconPlaceholder: { borderRadius: 22, height: 44, width: 44 },
  lockedLine: { borderRadius: 5, height: 10 },
  lockedLines: { flex: 1 },
  perkRow: { alignItems: "center", flexDirection: "row", gap: 10 },
  perkText: { ...typography.caption, flex: 1 },
  perks: { gap: 10, marginBottom: spacing.xl },
  price: { ...typography.headline },
  priceRow: { alignItems: "baseline", flexDirection: "row", marginBottom: spacing.lg },
  priceUnit: { ...typography.body },
  proHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: { ...typography.bodySemibold, fontSize: 16 },
  statusDot: { borderRadius: 4, height: 8, width: 8 },
  statusText: { ...typography.bodySemibold, fontSize: 13 },
  trialFooter: { ...typography.caption, marginTop: spacing.sm, textAlign: "center" },
  upgradeBtn: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
  },
  upgradeBtnText: { ...typography.bodySemibold, fontSize: 13 },
  upgradeCard: { borderRadius: 20, marginTop: spacing.sm, padding: spacing.xl },
  upgradeCardCrown: { fontSize: 20 },
  upgradeCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  upgradeCardSub: { ...typography.caption, lineHeight: 19, marginBottom: spacing.lg },
  upgradeCardTitle: { ...typography.sectionTitle },
  upgradeCrown: { fontSize: 12, lineHeight: 14 },
});
