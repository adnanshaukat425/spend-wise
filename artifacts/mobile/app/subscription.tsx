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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Plan = "monthly" | "yearly" | "lifetime";

const PLANS: {
  id: Plan;
  label: string;
  price: string;
  period: string;
  badge?: string;
  tag?: string;
  tagColor?: string;
  popular?: boolean;
}[] = [
  {
    id: "monthly",
    label: "Monthly",
    price: "$4.99",
    period: "/month",
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "$39.99",
    period: "/year",
    badge: "MOST POPULAR",
    tag: "33% off",
    tagColor: "#2E7D52",
    popular: true,
  },
  {
    id: "lifetime",
    label: "Lifetime",
    price: "$99.99",
    period: "/one-time",
    tag: "Best value",
    tagColor: "#2E7D52",
  },
];

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

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [selected, setSelected] = useState<Plan>("yearly");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.closeBtn}>
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
        {/* ── Crown hero ── */}
        <View style={styles.heroSection}>
          <View style={styles.crownWrap}>
            <Text style={styles.crownEmoji}>👑</Text>
          </View>
          <Text style={styles.heroTitle}>Unlock Your Full{"\n"}Financial Potential</Text>
          <Text style={styles.heroSub}>
            Get personalized AI insights and save more money every month.
          </Text>
        </View>

        {/* ── Plan cards ── */}
        <View style={styles.plansSection}>
          {PLANS.map((plan) => {
            const isSelected = selected === plan.id;
            return (
              <View key={plan.id} style={styles.planOuter}>
                {plan.badge && (
                  <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.popularBadgeText}>{plan.badge}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    isSelected && {
                      backgroundColor: colors.secondary,
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                    !isSelected && { backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", borderWidth: 1.5 },
                  ]}
                  onPress={() => {
                    setSelected(plan.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.planLeft}>
                    <Text style={styles.planLabel}>{plan.label}</Text>
                    <View style={styles.planPriceRow}>
                      <Text style={styles.planPrice}>{plan.price}</Text>
                      <Text style={styles.planPeriod}> {plan.period}</Text>
                    </View>
                    {plan.tag && (
                      <Text style={[styles.planTag, { color: plan.tagColor }]}>{plan.tag}</Text>
                    )}
                  </View>
                  {/* Radio / check */}
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
        <View style={[styles.featuresCard, { backgroundColor: "#F5F6F9" }]}>
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
      <View style={[styles.ctaWrap, { paddingBottom: botPad + 16 }]}>
        <TouchableOpacity
          style={styles.trialBtn}
          activeOpacity={0.85}
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
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
