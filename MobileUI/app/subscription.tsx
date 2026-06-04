import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStartTrial, useSubscriptionPlans } from "@/hooks/api";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";

const PRO_FEATURES = [
  "Unlimited AI-powered insights",
  "Personalized savings recommendations",
  "Spending predictions & forecasts",
  "Smart budget optimization",
  "Detailed monthly reports",
  "Receipt scanning & auto-categorization",
  "Export data to CSV/PDF",
  "Priority customer support",
  "Custom budget categories",
  "Bill reminders & alerts",
];

function formatPlanPeriod(billingPeriod: string): string {
  if (billingPeriod === "month") return "/month";
  if (billingPeriod === "year") return "/year";
  if (billingPeriod === "lifetime") return "/one-time";
  return billingPeriod ? `/${billingPeriod}` : "";
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: plans = [] } = useSubscriptionPlans();
  const startTrial = useStartTrial();
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (plans.length && !selected) {
      const popular = plans.find((p) => p.isPopular);
      setSelected(popular?.slug ?? plans[0].slug);
    }
  }, [plans, selected]);

  const topPad = insets.top;
  const botPad = insets.bottom;

  const handleStartTrial = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await startTrial.mutateAsync();
      Alert.alert("Trial Started", "Your free trial has started.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start trial";
      Alert.alert("Error", message);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad, backgroundColor: colors.background }]}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.closeBtn} testID="screen-back-btn">
          <Ionicons name="close" size={22} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={[styles.restoreText, { color: "#6B7280" }]}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.crownWrap}>
            <Text style={styles.crownEmoji}>👑</Text>
          </View>
          <Text style={styles.heroTitle}>Unlock Your Full{"\n"}Financial Potential</Text>
          <Text style={styles.heroSub}>
            Get personalized AI insights and save more money every month.
          </Text>
        </View>

        <View style={styles.plansSection}>
          {plans.map((plan) => {
            const isSelected = selected === plan.slug;
            return (
              <View key={plan.slug} style={styles.planOuter}>
                {plan.badge ? (
                  <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.popularBadgeText}>{plan.badge}</Text>
                  </View>
                ) : null}
                <TouchableOpacity
                  testID={`subscription-plan-${plan.slug}`}
                  style={[
                    styles.planCard,
                    isSelected && {
                      backgroundColor: colors.secondary,
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                    !isSelected && { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1.5 },
                  ]}
                  onPress={() => {
                    setSelected(plan.slug);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.planLeft}>
                    <Text style={styles.planLabel}>{plan.name}</Text>
                    <View style={styles.planPriceRow}>
                      <Text style={styles.planPrice}>{formatCurrency(plan.price)}</Text>
                      <Text style={styles.planPeriod}>{formatPlanPeriod(plan.billingPeriod)}</Text>
                    </View>
                    {plan.tag ? (
                      <Text style={[styles.planTag, { color: "#2E7D52" }]}>{plan.tag}</Text>
                    ) : null}
                  </View>
                  {isSelected ? (
                    <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={styles.emptyCircle} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
{/* ── Pro Features card ── */}
        <View style={[styles.featuresCard, { backgroundColor: colors.muted }]}>
          <View style={styles.featuresHeader}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
            <Text style={styles.featuresTitle}>Pro Features</Text>
          </View>
          <View style={styles.featuresList}>
            {PRO_FEATURES.map((feat) => (
              <View key={feat} style={styles.featureRow}>
                <View style={[styles.featureCheck, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="checkmark" size={11} color={colors.primary} />
                </View>
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Testimonial ── */}
        <View style={[styles.testimonialCard, { backgroundColor: colors.secondary }]}>
          <Text style={styles.testimonialQuote}>
            "SpendWise Pro helped me save $2,400 last year. The AI insights are incredibly accurate!"
          </Text>
          <Text style={styles.testimonialAuthor}>— Sarah M., Premium Member</Text>
        </View>
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View style={[styles.ctaWrap, { paddingBottom: botPad + 16, backgroundColor: colors.background }]}>
        <TouchableOpacity
          testID="subscription-start-trial-btn"
          style={styles.trialBtn}
          activeOpacity={0.85}
          onPress={handleStartTrial}
        >
          <Text style={styles.trialBtnText}>Start 7-Day Free Trial</Text>
        </TouchableOpacity>
        <Text style={styles.ctaFooter}>
          Cancel anytime during trial. Subscription auto-renews after trial ends.{"\n"}
          By subscribing you agree to our Terms of Service.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F9",
  },

  // Navbar
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  restoreText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },

  scroll: {
    paddingHorizontal: 20,
  },

  // Hero
  heroSection: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  crownWrap: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  crownEmoji: { fontSize: 38 },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    textAlign: "center",
    lineHeight: 34,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },

  // Plans
  plansSection: {
    gap: 12,
    marginBottom: 20,
  },
  planOuter: {
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    left: 16,
    zIndex: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popularBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginTop: 6,
  },
  planLeft: { flex: 1 },
  planLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 4,
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPrice: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  planPeriod: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  planTag: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },

  // Pro Features
  featuresCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  featuresHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  featuresList: { gap: 12 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    flex: 1,
    lineHeight: 18,
  },

  // Testimonial
  testimonialCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
    gap: 10,
  },
  testimonialQuote: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    lineHeight: 20,
    fontStyle: "italic",
  },
  testimonialAuthor: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
  },

  // CTA footer
  ctaWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#F5F6F9",
  },
  trialBtn: {
    backgroundColor: "#F59E0B",
    height: 54,
    borderRadius: 27,
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
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  ctaFooter: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 17,
  },
});
