import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const FEATURES = [
  {
    id: "1",
    icon: "pencil-outline" as const,
    family: "Ionicons" as const,
    bg: "#FFF8E1",
    iconColor: "#F59E0B",
    title: "Easy Expense Tracking",
    subtitle: "Log expenses in seconds",
  },
  {
    id: "2",
    icon: "target" as const,
    family: "MaterialCommunityIcons" as const,
    bg: "#FCE4EC",
    iconColor: "#E91E63",
    title: "Smart Budgets",
    subtitle: "Set goals and stay on track",
  },
  {
    id: "3",
    icon: "sparkles" as const,
    family: "Ionicons" as const,
    bg: "#E3F2FD",
    iconColor: "#1976D2",
    title: "AI-Powered Insights",
    subtitle: "Personalized savings tips",
  },
];

function FeatureRow({ feature }: { feature: (typeof FEATURES)[number] }) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIconCircle, { backgroundColor: feature.bg }]}>
        {feature.family === "Ionicons" ? (
          <Ionicons name={feature.icon as any} size={22} color={feature.iconColor} />
        ) : (
          <MaterialCommunityIcons name={feature.icon as any} size={22} color={feature.iconColor} />
        )}
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.07, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleGetStarted = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem("hasOnboarded", "true");
    router.replace("/login");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: botPad + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={[styles.ring, styles.ringOuter, { backgroundColor: colors.circleOuter }]} />
        <View style={[styles.ring, styles.ringMid, { backgroundColor: colors.circleMid }]} />
        <View style={[styles.ring, styles.ringInner, { backgroundColor: colors.circleInner }]} />
        <Animated.View
          style={[
            styles.centerCircle,
            { backgroundColor: colors.primary },
            pulseStyle,
          ]}
        >
          <Ionicons name="cash-outline" size={34} color="#FFFFFF" />
        </Animated.View>

        <View style={[styles.badge, styles.badgeTopLeft, { backgroundColor: colors.circleBadgeYellow }]}>
          <Ionicons name="sparkles" size={18} color="#F59E0B" />
        </View>
        <View style={[styles.badge, styles.badgeBotLeft, { backgroundColor: colors.circleBadgeGreen }]}>
          <MaterialCommunityIcons name="cash" size={18} color="#2E7D52" />
        </View>
        <View style={[styles.badge, styles.badgeTopRight, { backgroundColor: colors.circleBadgePeach }]}>
          <Ionicons name="bar-chart" size={17} color="#E07B39" />
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Take Control of{"\n"}Your Finances
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Track expenses, manage budgets, and let AI help you save more money every month.
        </Text>
      </View>

      <View
        style={[
          styles.featuresCard,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        {FEATURES.map((f, i) => (
          <View key={f.id}>
            <FeatureRow feature={f} />
            {i < FEATURES.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.cta, { backgroundColor: colors.primary }]}
        onPress={handleGetStarted}
        activeOpacity={0.85}
      >
        <Text style={[styles.ctaText, { color: colors.primaryForeground }]}>
          Get Started
        </Text>
        <Ionicons name="arrow-forward" size={20} color={colors.primaryForeground} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, alignItems: "center" },
  hero: {
    width: 270,
    height: 270,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
  },
  ringOuter: { width: 270, height: 270, opacity: 0.45 },
  ringMid: { width: 200, height: 200, opacity: 0.6 },
  ringInner: { width: 132, height: 132, opacity: 0.75 },
  centerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2E7D52",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  badge: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeTopLeft: { top: 14, left: 16 },
  badgeBotLeft: { bottom: 28, left: 6 },
  badgeTopRight: { top: 22, right: 8 },
  textBlock: { alignItems: "center", marginBottom: 24 },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  featuresCard: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 4,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 14,
  },
  featureIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#1A2E21",
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B8070",
  },
  divider: { height: 1, marginHorizontal: 16 },
  cta: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#2E7D52",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
});
