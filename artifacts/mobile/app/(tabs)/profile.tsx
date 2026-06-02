import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const MENU_ITEMS = [
  {
    section: "Account",
    items: [
      { id: "1", label: "Personal Information", icon: "person-outline" as const, chevron: true },
      { id: "2", label: "Connected Accounts", icon: "card-outline" as const, chevron: true },
      { id: "3", label: "Notifications", icon: "notifications-outline" as const, chevron: true },
    ],
  },
  {
    section: "Preferences",
    items: [
      { id: "4", label: "Currency & Language", icon: "globe-outline" as const, chevron: true },
      { id: "5", label: "Appearance", icon: "color-palette-outline" as const, chevron: true },
      { id: "6", label: "Privacy & Security", icon: "shield-checkmark-outline" as const, chevron: true },
    ],
  },
  {
    section: "Support",
    items: [
      { id: "7", label: "Help Center", icon: "help-circle-outline" as const, chevron: true },
      { id: "8", label: "Rate the App", icon: "star-outline" as const, chevron: true },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("isLoggedIn");
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: "#F8F9FB" }]}
      contentContainerStyle={{ paddingBottom: botPad + 110 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileEmail}>john.doe@example.com</Text>
        </View>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: colors.secondary }]}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.proBanner, { backgroundColor: colors.primary }]}>
        <View>
          <Text style={styles.proTitle}>Upgrade to Pro</Text>
          <Text style={styles.proSubtitle}>Unlock AI insights & advanced analytics</Text>
        </View>
        <TouchableOpacity style={styles.proBtn} activeOpacity={0.8}>
          <Text style={[styles.proBtnText, { color: colors.primary }]}>Upgrade</Text>
        </TouchableOpacity>
      </View>

      {MENU_ITEMS.map((group) => (
        <View key={group.section} style={styles.section}>
          <Text style={styles.sectionTitle}>{group.section}</Text>
          <View style={styles.menuCard}>
            {group.items.map((item, idx) => (
              <View key={item.id}>
                <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                  <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
                    <Ionicons name={item.icon} size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.chevron && (
                    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" style={{ marginLeft: "auto" }} />
                  )}
                </TouchableOpacity>
                {idx < group.items.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={{ paddingHorizontal: 20 }}>
        <TouchableOpacity
          style={[styles.signOutBtn, { borderColor: "#FEE2E2" }]}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.version}>SpendWise v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#111827" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#111827", marginBottom: 2 },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6B7280" },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  proBanner: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  proTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginBottom: 2 },
  proSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  proBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  proBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#111827" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 16 },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF5F5",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  signOutText: { fontSize: 15, fontFamily: "Inter_500Medium", color: "#EF4444" },
  version: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#D1D5DB",
    textAlign: "center",
    marginBottom: 8,
  },
});
